function PopupModel(eventBus) {
  this.eventBus = eventBus;

  this.init();
  this.initHandlers();
}

PopupModel.prototype.init = function() {
  this.currentIndex = -1;
  this.userScenario = null;
};

PopupModel.prototype.initHandlers = function() {
  this.eventBus.on('scenarioLoad', this.onScenarioLoaded, this);
};

PopupModel.prototype.onScenarioLoaded = function(event, eventData) {
  this.userScenario = eventData.scenario;
  this.scenarioResultHashId = eventData.scenarioResultHashId;
};

PopupModel.prototype.startStep = function() {
  this.currentIndex = 0;
  this.eventBus.trigger('start', {
    'scenarioResultHashId': this.getScenarioResultHashId(),
    'scenarioStepHashId': this.getScenarioStepHashId()
  });
};

PopupModel.prototype.nextStep = function() {
  this.currentIndex += 1;
  this.eventBus.trigger('next', {
    'scenarioResultHashId': this.getScenarioResultHashId(),
    'scenarioStepHashId': this.getScenarioStepHashId()
  });
};

PopupModel.prototype.finishStep = function() {
  // this.currentIndex should equal this.userScenario.steps.length - 1
  this.eventBus.trigger('finish', {
    'scenarioResultHashId': this.getScenarioResultHashId()
  });
};

PopupModel.prototype.getUserScenario = function() {
  return this.userScenario;
};

PopupModel.prototype.getScenarioResultHashId = function() {
  return this.scenarioResultHashId;
};

PopupModel.prototype.getScenarioStepHashId = function() {
  return this.userScenario.steps[this.currentIndex].hashid;
};

PopupModel.prototype.isLastStep = function() {
  return this.currentIndex == this.userScenario.steps.length - 1;
};

PopupModel.prototype.getCurrentDescription = function() {
  return this.userScenario.steps[this.currentIndex].description;
};

PopupModel.prototype.getCurrentUrl = function() {
  return this.userScenario.steps[this.currentIndex].url;
};

PopupModel.prototype.getCurrentStepDisplay = function() {
  return this.currentIndex + 1;
};

PopupModel.prototype.getTotalStepDisplay = function() {
  return this.userScenario.steps.length;
};

PopupModel.prototype.isStarted = function() {
  return this.currentIndex >= 0;
};

PopupModel.prototype.abort = function() {
  this.eventBus.trigger('abort', {
    'scenarioResultHashId': this.getScenarioResultHashId()
  });
};

PopupModel.prototype.delighted = function() {
  this.eventBus.trigger('delighted');
};

PopupModel.prototype.confused = function() {
  this.eventBus.trigger('confused');
};
