function PopupModel(eventBus) {
  this.eventBus = eventBus;

  this.init();
  this.initHandlers();
}

PopupModel.prototype.init = function() {
  this.currentIndex = 0;
  this.userScenario = null;
}

PopupModel.prototype.initHandlers = function() {
  this.eventBus.on('scenarioLoad', this.onScenarioLoaded, this);
}

PopupModel.prototype.onScenarioLoaded = function(event, eventData) {
  this.scenarioResultHashId = Object.keys(eventData.scenario)[0];
  this.userScenario = eventData.scenario[this.scenarioResultHashId];
}

PopupModel.prototype.nextStep = function() {
  this.currentIndex += 1;
}

PopupModel.prototype.getUserScenario = function() {
  return this.userScenario;
}

PopupModel.prototype.getScenarioResultHashId = function() {
  return this.scenarioResultHashId;
}

PopupModel.prototype.getResultStepHashId = function() {
  return this.userScenario.steps[this.currentIndex].hashid;
}

PopupModel.prototype.isLastStep = function() {
  return this.currentIndex == this.userScenario.steps.length - 1;
}

PopupModel.prototype.getCurrentDescription = function() {
  return this.userScenario.steps[this.currentIndex].description;
}

PopupModel.prototype.getCurrentUrl = function() {
  return this.userScenario.steps[this.currentIndex].url;
}

PopupModel.prototype.getCurrentStepDisplay = function() {
  return this.currentIndex + 1;
}

PopupModel.prototype.getTotalStepDisplay = function() {
  return this.userScenario.steps.length;
}

