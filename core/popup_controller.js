function PopupController(eventBus, model) {
  this.eventBus = eventBus;

  this.init();
  this.initHandlers();
}

PopupController.prototype.init = function() {
  this.port = chrome.runtime.connect({name: "sonar"});
  port.onMessage.addListener(function(msg) {
    this.eventBus.trigger(msg.command);
  });
}

PopupController.prototype.initHandlers = function() {
  this.on('close', this.eventBus, this.onClosed);
  this.on('start', this.eventBus, this.onStarted);
  this.on('next', this.eventBus, this.onNexted);
  this.on('finish', this.eventBus, this.onFinished);
}

PopupView.prototype.on = function(eventType, element, clickHandler) {
  element.on(eventType, $.proxy(clickHandler, this));
}

PopupController.prototype.onClosed = function() {
  this.port.postMessage({
    'command': 'close',
    'userScenarioUUID': this.model.getUserScenarioUUID()
  });
}

PopupController.prototype.onStarted = function() {
  this.port.postMessage({
    'command': 'start',
    'userScenarioUUID': this.model.getUserScenarioUUID()
  });
}

PopupController.prototype.onNexted = function(event, stepIndex) {
  this.port.postMessage({
    'command', 'next',
    'userScenarioUUID': this.model.getUserScenarioUUID(),
    'step': this.model.getStepResult(stepIndex)
  });
}

PopupController.prototype.onFinished = function(event, stepIndex) {
  this.port.postMessage({
    'command', 'finish',
    'userScenarioUUID': this.model.getUserScenarioUUID(),
    'step': this.model.getStepResult(stepIndex)
  });
}
