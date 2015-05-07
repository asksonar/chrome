function RecorderController(eventBus, model, config) {
  this.eventBus = eventBus;
  this.model = model;

  this.fps = config.fps || 10;
  this.encoderUrl = config.encoderUrl;

  this.init();
  this.initHandlers();
}

RecorderController.prototype.init = function() {
  this.videoStream = null;
  this.audioStream = null;
  this.fs = new FileSystem();
}

RecorderController.prototype.initHandlers = function() {
  this.on('start', this.eventBus, this.startRecording);
  this.on('next', this.eventBus, this.saveVideoTime);
  this.on('finish', this.eventBus, this.stopRecording);
  this.on('abort', this.eventBus, this.stopRecording);

}

RecorderController.prototype.initEncoder = function() {
  this.encoder = new PnaclVideoEncoder(this.encoderUrl, false);
  // Handler for nacl module crashes, should not happen
  this.encoder.onCrash = $.proxy(this.onCrash, this);
  // Handler for error while recording (out of disk space, ...)
  this.encoder.onError = $.proxy(this.onError, this);
}

RecorderController.prototype.on = function(eventType, element, clickHandler) {
  element.on(eventType, $.proxy(clickHandler, this));
}

RecorderController.prototype.stopStreams = function() {
  if (this.videoStream) {
    this.videoStream.stop();
    this.videoStream = null;
  }
  if (this.audioStream) {
    this.audioStream.stop();
    this.audioStream = null;
  }
}

RecorderController.prototype.startRecording = function() {
  this.stopStreams();
  chrome.desktopCapture.chooseDesktopMedia(["screen"], $.proxy(this.gotAccess, this));
}

RecorderController.prototype.gotAccess = function(streamId) {
  if (!streamId) {
    this.eventBus.trigger('videoRecordingFailure');
    return;
  }
  var videoStreamPromise = new Promise($.proxy(
    function(resolve, reject) {
      navigator.webkitGetUserMedia({
          audio: false,
          video: {
              mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: streamId,
                "minWidth": screen.width,
                "minHeight": screen.height,
                "maxWidth": screen.width,
                "maxHeight": screen.height,
                maxFrameRate: this.fps
              }
          }
      }, resolve, reject);
    }
  , this));

  var audioStreamPromise = new Promise(function(resolve, reject) {
    navigator.webkitGetUserMedia({audio: true}, resolve, reject);
  });
  Promise.all([videoStreamPromise, audioStreamPromise])
    .then($.proxy(this.gotStreams, this));
}

RecorderController.prototype.gotStreams = function(streams) {
  this.videoStream = streams[0];
  this.audioStream = streams[1];
  this.videoStream.onended = $.proxy(this.onStreamEnded, this);

  this.initEncoder();
  var recorderCfg = {
    filename: '/html5_persistent/recording.webm',
    videoTrack: this.videoStream.getVideoTracks()[0],
    audioTrack: this.audioStream.getVideoTracks()[0]
  };
  this.encoder.start(recorderCfg)
  .then(function() {
    this.videoTime = new VideoTime();
    this.videoTime.start();
    this.eventBus.trigger('videoRecordingStarted');
  }.bind(this)).catch(function(err) {
    // You probably want to handle this somehow in the app.
    // Can happen if user has NaCl disabled or starting a stream is not
    // possible for some obscure reason.
    console.error('starting encoder failed', err);
    this.eventBus.trigger('videoRecordingFailure');
  }.bind(this));
}

RecorderController.prototype.gotStreamError = function(mediaStreamError) {
  console.log('oh god stream error: ' + mediaStreamError);
  this.eventBus.trigger('videoRecordingFailure');
}

RecorderController.prototype.saveVideoTime = function(event, params) {
  this.videoTime.save(params.scenarioResultHashId, params.step.hashid);
}

RecorderController.prototype.stopRecording = function(event, params) {
  if (this.encoder == null) {
    return;
  }

  this.saveVideoTime(event, params);

  this.encoder.stop().then(function() {
    this.encoder = null;
    this.stopStreams();
    console.log('recording stopped');

    this.fs.getFile('/recording.webm', $.proxy(function(file) {
      this.eventBus.trigger('sendMessage', [
        'video.finish',
        {
          'scenarioResultHashId': params.scenarioResultHashId,
          'steps': this.videoTime.getStepsJSON(params.scenarioResultHashId)
        },
        file
      ]);
    }, this));

  }.bind(this))
  .catch(function() {
    this.stopStreams();
    console.error('stopping recording failed');
  }.bind(this));
}

RecorderController.prototype.onStreamEnded = function() {
  // could be ended normally or ended by clicking the "stop recording" button
  this.stopRecording();
}


RecorderController.prototype.onCrash = function() {
  this.stopStreams();
  this.eventBus.trigger('videoRecordingFailure');
};

RecorderController.prototype.onError = function() {
  this.stopStreams();
  this.eventBus.trigger('videoRecordingFailure');
};
