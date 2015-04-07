function AudioController(eventBus, model) {
  this.eventBus = eventBus;
  this.model = model;

  this.init();
  this.initHandlers();
}

AudioController.prototype.init = function() {
  this.recorder = null;
}

AudioController.prototype.initHandlers = function() {
  this.on('start', this.eventBus, this.startRecording);
  this.on('next', this.eventBus, this.saveAudio);
  this.on('finish', this.eventBus, this.stopAudio);
  this.on('abort', this.eventBus, this.stopAudio);
}

AudioController.prototype.on = function(eventType, element, clickHandler) {
  element.on(eventType, $.proxy(clickHandler, this));
}

AudioController.prototype.startRecording = function() {
  if (this.stream) {
    return;
  }

  navigator.webkitGetUserMedia({audio: true}, $.proxy(this.gotStream, this), $.proxy(this.gotStreamError, this));
}

AudioController.prototype.gotStream = function(stream) {
  this.stream = stream;
  this.stream.onended = $.proxy(this.onStreamEnded, this);

  var input = new AudioContext().createMediaStreamSource(stream);
  this.recorder = new Recorder(input, {'bufferLen': 16384});
  this.recorder.record();

  this.eventBus.trigger('audioRecordingStarted');

}

AudioController.prototype.gotStreamError = function(mediaStreamError) {
  console.log('oh god stream error: ' + mediaStreamError);
  debugger;
  this.eventBus.trigger('audioRecordingFailure');
}

AudioController.prototype.saveAudio = function(event, params) {
  if (!this.stream) {
    return;
  }

  var callback = function(arraybuffer) {
    this.eventBus.trigger('sendMessage', [
      'video.step',
      {
        'userScenarioUUID': params.userScenarioUUID,
        'currentStep': params.step.index
      },
      new Blob([arraybuffer], {type: 'audio/wav'})
    ]);
  }

  this.recorder.stop();
  this.recorder.exportWAV($.proxy(callback, this));
  this.recorder.clear();

  this.recorder.record();
}

AudioController.prototype.stopAudio = function(event, params) {
  if (!this.stream) {
    return;
  }
  this.saveAudio(event, params);
  this.recorder.stop();
  this.recorder.clear();
  this.recorder = null;
  this.stream.stop();
  this.stream = null;
}

AudioController.prototype.onStreamEnded = function() {
  // could be ended normally or ended by clicking the "stop recording" button
  this.stream = null;
}
