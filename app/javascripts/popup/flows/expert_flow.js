function ExpertFlow(config, eventBus) {
  this.selectScreenSection = config.selectScreen;
  this.controlSection = config.control;
  this.finishSection = config.finishWithTitle;

  this.eventBus = eventBus;

  this.initHandlers();
}

ExpertFlow.prototype.initHandlers = function() {
  this.eventBus.on('scenarioLoad', $.proxy(this.onScenarioLoad, this));
};

ExpertFlow.prototype.onScenarioLoad = function(event, eventData) {
  if (eventData.flowType === 'expertFlow') {
    this.start();
  }
};

ExpertFlow.prototype.start = function() {
  this.selectScreenSection.onNext(this.controlSection);
  this.selectScreenSection.onPrev(this.close);
  this.controlSection.onNext(this.finishSection);
  this.finishSection.onNext(this.close);

  this.controlSection.hide();
  this.finishSection.hide();

  this.selectScreenSection.show();

  chrome.app.window.current().show();
};
