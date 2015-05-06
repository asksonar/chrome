function RecorderController(eventBus, model, config) {
  this.eventBus = eventBus;
  this.model = model;

  this.fps = config.fps || 10;

  this.encoder = new PnaclVideoEncoder(config.encoderUrl, false);
  this.init();
  this.initHandlers();
}

RecorderController.prototype.init = function() {
  this.videoStream = null;
  this.audioStream = null;
}

RecorderController.prototype.initHandlers = function() {
  this.on('start', this.eventBus, this.startRecording);
  this.on('next', this.eventBus, this.saveVideo);
  this.on('finish', this.eventBus, this.stopRecording);
  this.on('abort', this.eventBus, this.stopRecording);
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
  var videoStreamPromise = new Promise(function(resolve, reject) {
    navigator.webkitGetUserMedia({
        audio: false,
        video: {
            mandatory: {
              chromeMediaSource: 'desktop',
              chromeMediaSourceId: streamId,
              "minWidth": screen.width,
              "minHeight": screen.height,
              "maxWidth": screen.width,
              "maxHeight": screen.height
              maxFrameRate: config.fps
            }
        }
    }, resolve, reject);
  });

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

  var recorderCfg = {
    filename: '/html5_persistent/recording.webm',
    videoTrack: this.videoStream.getVideoTracks()[0],
    audioTrack: this.audioStream.getVideoTracks()[0]
  };
  this.encoder.start(recorderCfg)
  .then(function() {
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
  debugger;
  this.eventBus.trigger('videoRecordingFailure');
}

RecorderController.prototype.saveVideo = function(event, params) {
  return; // TODO: clarify what to do
  if (!this.stream) {
    return;
  }
  var blob = this.encoder.compile();
  this.encoder = null;
  this.eventBus.trigger('sendMessage', [
    'video.step',
    {
      'scenarioResultHashId': params.scenarioResultHashId,
      'scenarioStepHashId': params.step.hashid
    },
    blob
  ]);
  console.log('Frame count: ' + this.frameCount);
  this.frameCount = 0;
}

RecorderController.prototype.stopRecording = function(event, params) {
  this.encoder.stop().then(function() {
    this.stopStreams();
    console.log('recording stopped');
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
