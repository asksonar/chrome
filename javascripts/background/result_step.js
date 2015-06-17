function ResultStep(ajaxer, scenarioResultHashId, resultStepHashId) {
  this.ajaxer = ajaxer;
  this.scenarioResultHashId = scenarioResultHashId;
  this.resultStepHashId = resultStepHashId;
  this.feelings = [];
}

ResultStep.prototype.start = function() {
  this.start = Date.now();
}

ResultStep.prototype.finish = function() {
  this.finish = Date.now();
  this.length = Date.now() - this.start;

  this.ajaxer.notifyStep(this);
}

ResultStep.prototype.addDelighted = function() {
  this.feelings.push({
    type: 'delighted',
    time: Date.now(),
    offset: Date.now() - this.start
  })
}

ResultStep.prototype.addConfused = function() {
  this.feelings.push({
    type: 'confused',
    time: Date.now(),
    offset: Date.now() - this.start
  })
}
