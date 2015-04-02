function PopupModel(eventBus) {
  this.eventBus = eventBus;

  this.init();
  this.initHandlers();
}

PopupModel.prototype.init = function() {
  this.currentStep = -1;
  this.userScenario = null;
  this.loadUserScenario();
  this.stepResults = [];
}

PopupModel.prototype.initHandlers = function() {
  this.on('next', this.eventBus, this.onNexted);
  this.on('delighted', this.eventBus, this.onDelighted);
  this.on('confused', this.eventBus, this.onConfused);
}

PopupView.prototype.on = function(eventType, element, clickHandler) {
  element.on(eventType, $.proxy(clickHandler, this));
}

PopupModel.prototype.getUserScenarioUUID = function() {
  return window.document.location.search.substring('?userScenarioUUID='.length);
}

PopupModel.prototype.loadUserScenario = function() {
  var onLoadScenarioFromStorage = function(items) {
    this.userScenario = items[getUserScenarioUUID()];
    this.eventBus.trigger('scenarioLoaded');
  }

  chrome.storage.local.get(this.getUserScenarioUUID(), $.proxy(onLoadScenarioFromStorage, this));
}

PopupModel.prototype.getUserScenario = function() {
  return this.userScenario;
}

PopupModel.prototype.getCurrentStep = function() {
  return this.currentStep;
}

PopupModel.prototype.isLastStep = function() {
  return this.currentStep == this.userScenario.steps.length - 1;
}

PopupModel.prototype.getCurrentDescription = function() {
  if (this.currentStep < 0) {
    return this.userScenario.description;
  } else {
    return this.userScenario.steps[currentStep].description;
  }
}

PopupModel.prototype.getResult = function(resultIndex) {
  return this.stepResults[resultIndex];
}

PopupModel.prototype.currentResult = function() {
  return this.stepResults[this.currentStep];
}

PopupModel.prototype.onNexted = function() {
  this.currentResult().finish = new Date();
  this.currentResult().length = this.currentResult().finish - this.currentResult().start

  this.currentStep += 1;

  this.stepResults[this.currentStep] = {};
  this.currentResult().delighted = [];
  this.currentResult().confused = [];
  this.currentResult().start = new Date();

  this.eventBus.trigger('scenarioNexted');
}

PopupModel.prototype.onDelighted = function() {
  this.currentResult().delighted.push({
    time: new Date(),
    offset: new Date() - this.currentResult().start
  });
}

PopupModel.prototype.onConfused = function() {
  this.currentResult().confused.push({
    time: new Date(),
    offset: new Date() - this.currentResult().start
  });
}
