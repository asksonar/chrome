function BackgroundController(eventBus, model) {
  this.eventBus = eventBus;

  this.init();
  this.initHandlers();
}

BackgroundController.prototype.init = function() {
  var listenerResponse = function(port) {
    console.assert(port.name == 'sonar');
    this.port = port;
    this.port.onMessage.addListener($.proxy(messageListener, this));
  }

  var messageListener = function(msg) {
    this.eventBus.trigger(msg.command, [msg]);
  }

  chrome.runtime.onConnect.addListener($.proxy(listenerResponse, this));
}

BackgroundController.prototype.initHandlers = function() {
  this.on('audioRecordingStarted', this.eventBus, this.onAudioRecordingStarted);
  this.on('audioRecordingStopped', this.eventBus, this.onAudioRecordingStopped);
  this.on('audioRecordingFailed', this.eventBus, this.onAudioRecordingFailed);
  this.on('videoRecordingStarted', this.eventBus, this.onVideoRecordingStarted);
  this.on('videoRecordingStopped', this.eventBus, this.onVideoRecordingStopped);
  this.on('videoRecordingFailed', this.eventBus, this.onVideoRecordingFailed);
  this.on('start', this.eventBus, this.onStarted);
  this.on('next', this.eventBus, this.onNexted);
  this.on('finish', this.eventBus, this.onFinished);
  this.on('abort', this.eventBus, this.onAborted);
}

BackgroundController.prototype.on = function(eventType, element, clickHandler) {
  element.on(eventType, $.proxy(clickHandler, this));
}

BackgroundController.prototype.onAudioRecordingStarted = function() {
  this.port.postMessage({
    'command': 'audioRecordingStarted'
  });
}

BackgroundController.prototype.onAudioRecordingStopped = function() {
  this.port.postMessage({
    'command': 'audioRecordingStopped'
  });
}

BackgroundController.prototype.onAudioRecordingFailed = function() {
  this.port.postMessage({
    'command': 'audioRecordingFailed'
  });
}

BackgroundController.prototype.onVideoRecordingStarted = function(event, stepIndex) {
  this.port.postMessage({
    'command': 'videoRecordingStarted'
  });
}

BackgroundController.prototype.onVideoRecordingStopped = function(event, stepIndex) {
  this.port.postMessage({
    'command': 'videoRecordingStopped'
  });
}

BackgroundController.prototype.onVideoRecordingFailed = function(event, stepIndex) {
  this.port.postMessage({
    'command': 'videoRecordingFailed'
  });
}

BackgroundController.prototype.onStarted = function(event, message) {
  this.eventBus.trigger('sendMessage', ['data.start', message]);
}

BackgroundController.prototype.onNexted = function(event, message) {
  this.eventBus.trigger('sendMessage', ['data.step', message]);
}

BackgroundController.prototype.onFinished = function(event, message) {
  this.eventBus.trigger('sendMessage', ['data.finish', message]);
}

BackgroundController.prototype.onAborted = function(event, message) {
  this.eventBus.trigger('sendMessage', ['data.abort', message]);
}
