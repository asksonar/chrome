function PopupModel(eventBus) {
  this.eventBus = eventBus;

  this.init();
  this.initHandlers();
}

PopupModel.prototype.init = function() {
  this.currentIndex = -1;
  this.userScenario = null;
  this.stepResults = [];
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

PopupModel.prototype.getScenarioResultHashId = function() {
  return window.document.location.search.substring('?scenarioResultHashId='.length);
}

PopupModel.prototype.loadUserScenario = function() {
  var onLoadScenarioFromStorage = function(items) {
    this.userScenario = items[this.getScenarioResultHashId()];
    this.eventBus.trigger('scenarioLoaded');
  }

  chrome.storage.local.get(this.getScenarioResultHashId(), $.proxy(onLoadScenarioFromStorage, this));
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

PopupModel.prototype.getCurrentUrl = function() {
  return this.userScenario.steps[this.currentIndex].url;
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
  this.getCurrentResult().feelings = [];
  this.getCurrentResult().start = Date.now();
}

PopupModel.prototype.closeCurrentStep = function() {
  this.getCurrentResult().hashid = this.userScenario.steps[this.currentIndex].hashid;
  this.getCurrentResult().finish = Date.now();
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

PopupModel.prototype.onAborted = function() {
  if (this.currentIndex == -1) {
    return;
  }
  this.closeCurrentStep();
  this.eventBus.trigger('scenarioAborted', [this.getCurrentResult()]);
}

PopupModel.prototype.onDelighted = function() {
  this.getCurrentResult().feelings.push({
    type: 'delighted',
    time: Date.now(),
    offset: Date.now() - this.getCurrentResult().start
  });
}

PopupModel.prototype.onConfused = function() {
  this.getCurrentResult().feelings.push({
    type: 'confused',
    time: Date.now(),
    offset: Date.now() - this.getCurrentResult().start
  });
}
