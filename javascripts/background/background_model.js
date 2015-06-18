function BackgroundModel(eventBus, ajaxer) {
  this.eventBus = eventBus;
  this.ajaxer = ajaxer;

  this.init();
}

BackgroundModel.prototype.init = function() {
  this.resultSteps = [];
}

BackgroundModel.prototype.getCurrentResultStep = function() {
  return this.resultSteps[this.resultSteps.length - 1];
}

BackgroundModel.prototype.getResultSteps = function() {
  return this.resultSteps;
}

BackgroundModel.prototype.newResultStep = function(scenarioResultHashId, scenarioStepHashId) {
  var resultStep = new ResultStep(this.ajaxer, scenarioResultHashId, scenarioStepHashId);
  resultStep.start();
  this.resultSteps.push(resultStep);
}

BackgroundModel.prototype.finishResultStep = function() {
  this.getCurrentResultStep().finish();
}

BackgroundModel.prototype.addDelighted = function() {
  this.getCurrentResultStep().addDelighted();
}

BackgroundModel.prototype.addConfused = function() {
  this.getCurrentResultStep().addConfused();
}
