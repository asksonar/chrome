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
    'userScenarioUUID': this.model.getUserScenarioUUID()
  });
}

PopupController.prototype.onScenarioNexted = function(event, step) {
  this.port.postMessage({
    'command': 'next',
    'userScenarioUUID': this.model.getUserScenarioUUID(),
    'step': step
  });
}

PopupController.prototype.onScenarioFinished = function(event, step) {
  this.port.postMessage({
    'command': 'finish',
    'userScenarioUUID': this.model.getUserScenarioUUID(),
    'step': step
  });
}

PopupController.prototype.onScenarioAborted = function(event, step) {
  this.port.postMessage({
    'command': 'abort',
    'userScenarioUUID': this.model.getUserScenarioUUID(),
    'step': step
  });
}
