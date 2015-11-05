function EasyFlow(config, eventBus) {
  this.instructionsSection = config.instructions;
  this.selectScreenSection = config.selectScreen;
  this.startSection = config.start;
  this.stepSection = config.step;
  this.finishSection = config.finish;

  this.eventBus = eventBus;

  this.initHandlers();
}

EasyFlow.prototype.initHandlers = function() {
  this.eventBus.on('scenarioLoad', this.onScenarioLoad, this);
};

EasyFlow.prototype.onScenarioLoad = function(event, eventData) {
  if (eventData.flowType === 'easyFlow') {
    this.start();
  }
};

EasyFlow.prototype.start = function() {
  var close = { show: function() { window.close(); } };

  this.instructionsSection.onNext(this.selectScreenSection);
  this.selectScreenSection.onNext(this.startSection);
  this.selectScreenSection.onPrev(this.instructionsSection);
  this.startSection.onNext(this.stepSection);
  this.stepSection.onNext(this.finishSection);
  this.finishSection.onNext(close);

  this.selectScreenSection.hide();
  this.startSection.hide();
  this.stepSection.hide();
  this.finishSection.hide();

  this.instructionsSection.show();

  chrome.app.window.current().show();
};
