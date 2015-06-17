function BackgroundController(eventBus, ajaxer, model) {
  this.eventBus = eventBus;
  this.ajaxer = ajaxer;
  this.model = model;

  this.init();
  this.initHandlers();
}

BackgroundController.prototype.init = function() {
  this.resultSteps = [];
}

BackgroundController.prototype.initHandlers = function() {
  this.eventBus.on('start', this.onStarted, this);
  this.eventBus.on('next', this.onNexted, this);
  this.eventBus.on('finish', this.onFinished, this);
  this.eventBus.on('abort', this.onAborted, this);
  this.eventBus.on('delighted', this.onDelighted, this);
  this.eventBus.on('confused', this.onConfused, this);
}

BackgroundController.prototype.onStarted = function(event, eventData) {
  this.model.newResultStep(eventData.scenarioResultHashId, eventData.resultStepHashId);

  this.ajaxer.notifyStart(eventData.scenarioResultHashId);
}

BackgroundController.prototype.onNexted = function(event, eventData) {
  this.model.finishResultStep();
  this.model.newResultStep();
}

BackgroundController.prototype.onFinished = function(event, eventData) {
  this.model.finishResultStep();

  this.ajaxer.notifyFinish(eventData.scenarioResultHashId);
}

BackgroundController.prototype.onAborted = function() {
  this.model.finishResultStep();

  this.ajaxer.notifyAbort(eventData.scenarioResultHashId);
}

BackgroundController.prototype.onDelighted = function() {
  this.model.addDelighted();
}

BackgroundController.prototype.onConfused = function() {
  this.model.addConfused();
}
