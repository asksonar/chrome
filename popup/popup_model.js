function PopupModel(eventBus) {
  this.eventBus = eventBus;

  this.init();
  this.initHandlers();
}

PopupModel.prototype.init = function() {
  this.currentIndex = -1;
  this.userScenario = null;
  this.loadUserScenario();
  this.stepResults = [];
  this.loadUserScenario();
}

PopupModel.prototype.initHandlers = function() {
  this.on('start', this.eventBus, this.onStarted);
  this.on('next', this.eventBus, this.onNexted);
  this.on('finish', this.eventBus, this.onFinished);
  this.on('delighted', this.eventBus, this.onDelighted);
  this.on('confused', this.eventBus, this.onConfused);
  this.on('abort', this.eventBus, this.onAborted);
}

PopupModel.prototype.on = function(eventType, element, clickHandler) {
  element.on(eventType, $.proxy(clickHandler, this));
}

PopupModel.prototype.getUserScenarioUUID = function() {
  return window.document.location.search.substring('?userScenarioUUID='.length);
}

PopupModel.prototype.loadUserScenario = function() {
  var onLoadScenarioFromStorage = function(items) {
    this.userScenario = items[this.getUserScenarioUUID()];
    this.eventBus.trigger('scenarioLoaded');
  }

  chrome.storage.local.get(this.getUserScenarioUUID(), $.proxy(onLoadScenarioFromStorage, this));
}

PopupModel.prototype.getUserScenario = function() {
  return this.userScenario;
}

PopupModel.prototype.getCurrentIndex = function() {
  return this.currentIndex;
}

PopupModel.prototype.isLastStep = function() {
  return this.currentIndex == this.userScenario.steps.length - 1;
}

PopupModel.prototype.getCurrentDescription = function() {
  if (this.currentIndex < 0) {
    return this.userScenario.description;
  } else {
    return this.userScenario.steps[this.currentIndex].description;
  }
}

PopupModel.prototype.getResult = function(resultIndex) {
  return this.stepResults[resultIndex];
}

PopupModel.prototype.getCurrentResult = function() {
  return this.stepResults[this.currentIndex];
}

PopupModel.prototype.cloneCurrentResult = function() {
  return $.extend(true, {}, this.getCurrentResult());
}

PopupModel.prototype.openNextStep = function() {
  this.currentIndex += 1;

  this.stepResults[this.currentIndex] = {};
  this.getCurrentResult().index = this.currentIndex;
  this.getCurrentResult().delighted = [];
  this.getCurrentResult().confused = [];
  this.getCurrentResult().start = new Date();
}

PopupModel.prototype.closeCurrentStep = function() {
  this.getCurrentResult().finish = new Date();
  this.getCurrentResult().length = this.getCurrentResult().finish - this.getCurrentResult().start
}

PopupModel.prototype.onStarted = function() {
  this.openNextStep();
  this.eventBus.trigger('scenarioStarted');
}

PopupModel.prototype.onNexted = function() {
  this.closeCurrentStep();
  var submitResult = this.getCurrentResult();
  this.openNextStep();
  this.eventBus.trigger('scenarioNexted', [submitResult]);
}

PopupModel.prototype.onFinished = function() {
  this.closeCurrentStep();
  this.eventBus.trigger('scenarioFinished', [this.getCurrentResult()]);
}

PopupModel.prototype.onDelighted = function() {
  this.getCurrentResult().delighted.push({
    time: new Date(),
    offset: new Date() - this.getCurrentResult().start
  });
}

PopupModel.prototype.onConfused = function() {
  this.getCurrentResult().confused.push({
    time: new Date(),
    offset: new Date() - this.getCurrentResult().start
  });
}

PopupModel.prototype.onAborted = function() {
  this.eventBus.trigger('scenarioAborted', [this.getCurrentResult()]);
}
