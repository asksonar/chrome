function VideoController(eventBus, model, config) {
  this.eventBus = eventBus;
  this.model = model;

  this.canvas = config.canvas;
  this.video = config.video;
  this.fps = config.fps || 10;

  this.init();
  this.initHandlers();
}

VideoController.prototype.init = function() {
  this.stream = null;
  this.frameCount = 0;
}

VideoController.prototype.initHandlers = function() {
  this.on('start', this.eventBus, this.startRecording);
  this.on('next', this.eventBus, this.saveVideo);
  this.on('finish', this.eventBus, this.stopVideo);
  this.on('abort', this.eventBus, this.stopVideo);
}

VideoController.prototype.on = function(eventType, element, clickHandler) {
  element.on(eventType, $.proxy(clickHandler, this));
}

VideoController.prototype.startRecording = function() {
  if (this.stream) {
    return;
  }

  chrome.desktopCapture.chooseDesktopMedia(["screen"], $.proxy(this.gotAccess, this));
}

VideoController.prototype.gotAccess = function(streamId) {
  if (!streamId) {
    this.eventBus.trigger('videoRecordingFailure');
    return;
  }

  this.ctx = this.canvas.getContext("2d");

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
          }
      }
  }, $.proxy(this.gotStream, this), $.proxy(this.gotStreamError, this));
}

VideoController.prototype.gotStream = function(stream) {
  this.stream = stream;
  this.stream.onended = $.proxy(this.onStreamEnded, this);

  this.video.src = URL.createObjectURL(stream);
  this.video.onloadedmetadata = $.proxy(function() {
    this.screenWidth = this.video.videoWidth;
    this.screenHeight = this.video.videoHeight;
    this.canvas.width = this.screenWidth;
    this.canvas.height = this.screenHeight;
    this.video.width = this.screenWidth;
    this.video.height = this.screenHeight;

    this.gotFrameLoop = setInterval($.proxy(this.gotFrame, this), 1000 / this.fps);

    this.eventBus.trigger('videoRecordingStarted');
  }, this);

}

VideoController.prototype.gotStreamError = function(mediaStreamError) {
  console.log('oh god stream error: ' + mediaStreamError);
  debugger;
  this.eventBus.trigger('videoRecordingFailure');
}

VideoController.prototype.gotFrame = function() {
  this.ctx.drawImage(this.video, 0, 0, this.screenWidth, this.screenHeight);
  if (this.encoder == null) {
    this.encoder = new Whammy.Video();
    this.now = new Date();
  }
  var delta = Math.max(new Date() - this.now, 1000 / this.fps);
  this.now = new Date();
  this.encoder.add(this.canvas, delta);
  this.frameCount += 1;
}

VideoController.prototype.saveVideo = function(event, params) {
  if (!this.stream) {
    return;
  }
  var blob = this.encoder.compile();
  this.encoder = null;
  this.eventBus.trigger('sendMessage', [
    'video.step',
    {
      'scenarioResultHashId': params.hashid,
      'resultStepHashId': params.step.hashid
    },
    blob
  ]);
  console.log('Frame count: ' + this.frameCount);
  this.frameCount = 0;
}

VideoController.prototype.stopVideo = function(event, params) {
  if (!this.stream) {
    return;
  }
  this.saveVideo(event, params);
  this.stream.stop();
  this.stream = null;
}

VideoController.prototype.onStreamEnded = function() {
  // could be ended normally or ended by clicking the "stop recording" button
  clearInterval(this.gotFrameLoop);
  this.stream = null;

  /*
  var fr = new FileReader();
  fr.onloadend = function() {
    ws.send(JSON.stringify({
      'command': 'video.step',
      'params': {
        'userScenarioUUID': userScenarioUUID,
        'currentStep': currentStep
      },
      'data': fr.result
    }));
  }
  fr.readAsDataURL(blob);
  */
}
