function PopupController(eventBus, model) {
  this.eventBus = eventBus;
  this.model = model;

  this.init();
  this.initHandlers();
}

PopupController.prototype.init = function() {
  this.port = chrome.runtime.connect({name: "sonar"});
  this.port.onMessage.addListener(function(msg) {
    this.eventBus.trigger(msg.command);
  });
}

PopupController.prototype.initHandlers = function() {
  this.on('scenarioStarted', this.eventBus, this.onScenarioStarted);
  this.on('scenarioNexted', this.eventBus, this.onScenarioNexted);
  this.on('scenarioFinished', this.eventBus, this.onScenarioFinished);
  this.on('scenarioAborted', this.eventBus, this.onScenarioAborted);
}

PopupController.prototype.on = function(eventType, element, clickHandler) {
  element.on(eventType, $.proxy(clickHandler, this));
}

PopupController.prototype.onScenarioStarted = function() {
  this.port.postMessage({
    'command': 'start',
    'scenarioResultHashId': this.model.getScenarioResultHashId()
  });
}

PopupController.prototype.onScenarioNexted = function(event, step) {
  this.port.postMessage({
    'command': 'next',
    'scenarioResultHashId': this.model.getScenarioResultHashId(),
    'step': step
  });
}

PopupController.prototype.onScenarioFinished = function(event, step) {
  this.port.postMessage({
    'command': 'finish',
    'scenarioResultHashId': this.model.getScenarioResultHashId(),
    'step': step
  });
}

PopupController.prototype.onScenarioAborted = function(event, step) {
  this.port.postMessage({
    'command': 'abort',
    'scenarioResultHashId': this.model.getScenarioResultHashId(),
    'step': step
  });
}

// PopupController.prototype.startAudio = function() {

//   this.recognition = new webkitSpeechRecognition();
//   this.recognition.continuous = true;
//   this.recognition.interimResults = false;
//   this.recognition.maxAlternatives = 1;
//   this.recognition.onaudioend = $.proxy(function() { console.log(this.currentAudioTime() + ': ' + 'onaudioend'); }, this);
//   this.recognition.onaudiostart = $.proxy(function() { console.log(this.currentAudioTime() + ': ' + 'onaudiostart'); }, this);
//   this.recognition.onend = $.proxy(function() {
//     console.log(this.currentAudioTime() + ': ' + 'onend');
//     this.recognition.start();
//   }, this);
//   this.recognition.onerror = $.proxy(function() { console.log(this.currentAudioTime() + ': ' + 'onerror'); }, this);
//   this.recognition.onnomatch = $.proxy(function() { console.log(this.currentAudioTime() + ': ' + 'onnomatch'); }, this);
//   this.recognition.onresult = $.proxy(function(recognitionEvent) {
//     console.log(this.currentAudioTime() + ': ' + 'onresult');
//     console.log('onresult timestamp: ' + (recognitionEvent.timeStamp - this.recognitionStartTime));
//     console.log('onresult text: ' + recognitionEvent.results[0][0].transcript);
//   }, this);
//   this.recognition.onsoundend = $.proxy(function() { console.log(this.currentAudioTime() + ': ' + 'onsoundend'); }, this);
//   this.recognition.onsoundstart = $.proxy(function() { console.log(this.currentAudioTime() + ': ' + 'onsoundstart'); }, this);
//   this.recognition.onspeechend = $.proxy(function() { console.log(this.currentAudioTime() + ': ' + 'onspeechend'); }, this);
//   this.recognition.onspeechstart = $.proxy(function() { console.log(this.currentAudioTime() + ': ' + 'onspeechstart'); }, this);
//   this.recognition.onstart = $.proxy(function() {
//     this.recognitionStartTime = new Date().getTime();
//     console.log(this.currentAudioTime() + ': ' + 'onstart');
//   }, this);
//   this.recognition.start();
// }

// PopupController.prototype.currentAudioTime = function() {
//   return new Date().getTime() - this.recognitionStartTime;
// }
