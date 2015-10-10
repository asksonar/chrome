function ResultStep(ajaxer, scenarioResultHashId, scenarioStepHashId) {
  this.ajaxer = ajaxer;
  this.scenarioResultHashId = scenarioResultHashId;
  this.scenarioStepHashId = scenarioStepHashId;

  this.init();
}

ResultStep.prototype.init = function() {
  this.feelings = [];
}

ResultStep.prototype.start = function(studyStart) {
  this.start = Date.now();
  this.offset = this.start - studyStart;

  this.speechRecognition = new SpeechRecognition(this.start);
  this.speechRecognition.start();
}

ResultStep.prototype.finish = function() {
  this.finish = Date.now();
  this.length = this.finish - this.start;

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
