function VideoTime(scenarioResultHashId) {
  this.scenarios = {};
}

VideoTime.prototype.start = function() {
  this.start = Date.now();
}

VideoTime.prototype.save = function(scenarioResultHashId, scenarioStepHashId) {
  this.scenarios[scenarioResultHashId] = this.scenarios[scenarioResultHashId] || {};
  this.scenarios[scenarioResultHashId][scenarioStepHashId] = Date.now() - this.start;
}

VideoTime.prototype.getStepsJSON = function(scenarioResultHashId) {
  return this.scenarios[scenarioResultHashId];
}
