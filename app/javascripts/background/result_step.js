function ResultStep(ajaxer, scenarioResultHashId, scenarioStepHashId) {
  this.ajaxer = ajaxer;
  this.scenarioResultHashId = scenarioResultHashId;
  this.scenarioStepHashId = scenarioStepHashId;

  this.init();
}

ResultStep.prototype.init = function() {
  this.feelings = [];
  this.notes = [];
  this.mute = [];
};

ResultStep.prototype.start = function(studyStart) {
  this.start = Date.now();
  this.length = 0;
  this.timingStart = this.start;
  this.offset = this.start - studyStart;

  this.speechRecognition = new SpeechRecognition(studyStart);
  this.speechRecognition.start();
};

ResultStep.prototype.calculateOffset = function() {
  if (this.paused !== true) {
    return Date.now() - this.timingStart + this.length;
  } else {
    return this.length;
  }
};

ResultStep.prototype.updateLength = function() {
  if (this.paused !== true) {
    this.length += Date.now() - this.timingStart;
  }
};

ResultStep.prototype.pause = function() {
  this.updateLength();
  this.paused = true;
  this.timingStart = null;
};

ResultStep.prototype.resume = function() {
  this.paused = false;
  this.timingStart = Date.now();
};

ResultStep.prototype.finish = function() {
  this.endMute();
  this.finish = Date.now();
  this.updateLength();

  this.speechRecognition.stop($.proxy(function() {
    this.ajaxer.notifyStep(this);
  },this));
};

ResultStep.prototype.addDelighted = function() {
  this.feelings.push({
    type: 'delighted',
    time: Date.now(),
    offset: this.calculateOffset()
  });
};

ResultStep.prototype.addConfused = function() {
  this.feelings.push({
    type: 'confused',
    time: Date.now(),
    offset: this.calculateOffset()
  });
};

ResultStep.prototype.addNote = function(note) {
  this.notes.push({
    time: Date.now(),
    offset: this.calculateOffset(),
    text: note
  });
};

ResultStep.prototype.startMute = function() {
  var lastMute = this.mute[this.mute.length - 1];
  if (!lastMute || (lastMute && lastMute.end)) {
    this.mute.push({
      start: this.calculateOffset()
    });
  }
};

ResultStep.prototype.endMute = function() {
  var lastMute = this.mute[this.mute.length - 1];
  if (lastMute && !lastMute.end) {
    lastMute.end = this.calculateOffset();
  }
};


