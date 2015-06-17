function BackgroundModel(eventBus, ajaxer) {
  this.eventBus = eventBus;
  this.ajaxer = ajaxer;

  this.init();
  this.initHandlers();
}

BackgroundModel.prototype.init = function() {
  this.resultSteps = [];
}

BackgroundModel.prototype.initHandlers = function() {
  this.eventBus.on('start', this.onStarted, this);
  this.eventBus.on('next', this.onNexted, this);
  this.eventBus.on('finish', this.onFinished, this);
  this.eventBus.on('abort', this.onAborted, this);
  this.eventBus.on('delighted', this.onDelighted, this);
  this.eventBus.on('confused', this.onConfused, this);
}

BackgroundModel.prototype.getCurrentResultStep = function() {
  return this.resultSteps[this.resultSteps.length - 1];
}

BackgroundModel.prototype.getResultSteps = function() {
  return this.resultSteps;
}

BackgroundModel.prototype.onStarted = function(event, eventData) {
  var resultStep = new ResultStep(this.ajaxer, eventData.scenarioResultHashId, eventData.resultStepHashId);
  resultStep.start();
  this.resultSteps.push(resultStep);

  this.ajaxer.notifyStart(eventData.scenarioResultHashId);
}

BackgroundModel.prototype.onNexted = function(event, eventData) {
  this.getCurrentResultStep().finish();

  var resultStep = new ResultStep(this.ajaxer, eventData.scenarioResultHashId, eventData.resultStepHashId);
  resultStep.start();
  this.resultSteps.push(resultStep);
}

BackgroundModel.prototype.onFinished = function(event, eventData) {
  this.getCurrentResultStep().finish();

  this.ajaxer.notifyFinish(eventData.scenarioResultHashId);
}

BackgroundModel.prototype.onAborted = function() {
  this.getCurrentResultStep().finish();

  this.ajaxer.notifyAbort(eventData.scenarioResultHashId);
}

BackgroundModel.prototype.onDelighted = function() {
  this.getCurrentResultStep().addDelighted();
}

BackgroundModel.prototype.onConfused = function() {
  this.getCurrentResultStep().addConfused();
}
