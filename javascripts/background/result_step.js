function ResultStep(ajaxer, scenarioResultHashId, resultStepHashId) {
  this.ajaxer = ajaxer;
  this.scenarioResultHashId = scenarioResultHashId;
  this.resultStepHashId = resultStepHashId;

  this.init();
}

ResultStep.prototype.init = function() {
  this.feelings = [];
  this.speechRecognition = new SpeechRecognition();
}

ResultStep.prototype.start = function() {
  this.start = Date.now();
  this.speechRecognition.start();
}

ResultStep.prototype.finish = function() {
  this.finish = Date.now();
  this.length = Date.now() - this.start;

  this.speechRecognition.stop($.proxy(function() {
    this.ajaxer.notifyStep(this);
  },this));
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
