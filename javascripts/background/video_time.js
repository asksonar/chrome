function VideoTime(scenarioResultHashId) {
  this.scenarios = {};
}

VideoTime.prototype.start = function() {
  this.start = Date.now();
}

VideoTime.prototype.save = function(scenarioResultHashId, scenarioStepHashId) {
  // save all times as offsets, where t is t milliseconds past this.start
  var steps = this.scenarios[scenarioResultHashId] = this.scenarios[scenarioResultHashId] || [];
  var stepStart = steps.length == 0 ? 0 : steps[steps.length - 1].finish;
  steps.push({
    'scenarioStepHashId': scenarioStepHashId,
    'start': stepStart,
    'finish': Date.now() - this.start,
    'length': Date.now() - this.start - stepStart
  });
}

VideoTime.prototype.getStepsJSON = function(scenarioResultHashId) {
  return this.scenarios[scenarioResultHashId];
}
