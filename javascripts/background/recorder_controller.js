function RecorderController(eventBus, ajaxer, model, config) {
  this.eventBus = eventBus;
  this.ajaxer = ajaxer;
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
  this.eventBus.on('requestRecording', this.startRecording, this);
  this.eventBus.on('finish', this.finishRecording, this);
  this.eventBus.on('abort', this.abortRecording, this);
}

RecorderController.prototype.initEncoder = function() {
  this.encoder = new PnaclVideoEncoder(this.encoderUrl, false);
  // Handler for nacl module crashes, should not happen
  this.encoder.onCrash = $.proxy(this.onCrash, this);
  // Handler for error while recording (out of disk space, ...)
  this.encoder.onError = $.proxy(this.onError, this);
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
    this.eventBus.trigger('recordingFailure');
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
    audioTrack: this.audioStream.getAudioTracks()[0]
  };
  this.encoder.start(recorderCfg)
  .then(function() {
    this.eventBus.trigger('recordingStarted');
  }.bind(this)).catch(function(err) {
    // You probably want to handle this somehow in the app.
    // Can happen if user has NaCl disabled or starting a stream is not
    // possible for some obscure reason.
    console.error('starting encoder failed', err);
    this.eventBus.trigger('recordingFailure');
  }.bind(this));
}

RecorderController.prototype.gotStreamError = function(mediaStreamError) {
  console.log('oh god stream error: ' + mediaStreamError);
  this.eventBus.trigger('recordingFailure');
}

RecorderController.prototype.finishRecording = function(event, params) {
  if (this.encoder == null) {
    return;
  }

  this.encoder.stop().then(function() {
    this.encoder = null;
    this.stopStreams();
    this.eventBus.trigger('recordingStopped');
    console.log('recording finished');

    if (this.model.getResultSteps().length > 0) {
      this.fs.getFile('/recording.webm',
        $.proxy(this.ajaxer.uploadVideo, this.ajaxer,
          params.scenarioResultHashId,
          this.model.getResultSteps()
        )
      );
    }

  }.bind(this))
  .catch(function() {
    this.stopStreams();
    console.error('stopping recording failed');
  }.bind(this));
}

RecorderController.prototype.abortRecording = function(event, params) {
  if (this.encoder == null) {
    return;
  }

  this.encoder.stop();
  this.encoder = null;
  this.stopStreams();
  this.eventBus.trigger('recordingFailure');
  console.log('recording aborted');
}

RecorderController.prototype.onStreamEnded = function() {
  // could be ended normally or ended by clicking the "stop recording" button
  this.abortRecording();
}

RecorderController.prototype.onCrash = function() {
  console.error('encoder crashed');
  this.stopStreams();
  this.eventBus.trigger('recordingFailure');
};

RecorderController.prototype.onError = function(err) {
  console.error('encoder error', err);
  this.stopStreams();
  this.eventBus.trigger('recordingFailure');
};
