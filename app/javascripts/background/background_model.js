function BackgroundModel(eventBus, ajaxer) {
  this.eventBus = eventBus;
  this.ajaxer = ajaxer;
}

BackgroundModel.prototype.init = function(scenarioResultHashId) {
  this.resultSteps = [];
  this.scenarioResultHashId = scenarioResultHashId;
  this.muteSections = [];
}

BackgroundModel.prototype.getCurrentResultStep = function() {
  return this.resultSteps[this.resultSteps.length - 1];
}

BackgroundModel.prototype.getResultSteps = function() {
  return this.resultSteps;
}

BackgroundModel.prototype.startStudy = function() {
  this.studyStart = Date.now();
}

BackgroundModel.prototype.newResultStep = function(scenarioResultHashId, scenarioStepHashId) {
  var resultStep = new ResultStep(this.ajaxer, scenarioResultHashId, scenarioStepHashId);
  resultStep.start(this.studyStart);
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

BackgroundModel.prototype.addNote = function(note) {
  this.getCurrentResultStep().addNote(note);
}

BackgroundModel.prototype.startMute = function() {
  this.getCurrentResultStep().startMute();
}

BackgroundModel.prototype.endMute = function() {
  this.getCurrentResultStep().endMute();
}

BackgroundModel.prototype.pause = function() {
  this.getCurrentResultStep().pause();
}

BackgroundModel.prototype.resume = function() {
  this.getCurrentResultStep().resume();
}
