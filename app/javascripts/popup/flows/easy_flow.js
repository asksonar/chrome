function EasyFlow(config, eventBus, model) {
  this.config = config;
  this.eventBus = eventBus;
  this.model = model;
}

EasyFlow.prototype.init = function() {
  this.instructionsSection = this.config.instructions;
  this.selectScreenSection = this.config.selectScreen;
  this.startSection = this.config.start;
  this.stepSection = this.config.step;
  this.finishSection = this.config.finish;

  this.instructionsSection.init(this);
  this.selectScreenSection.init(this);
  this.startSection.init(this);
  this.stepSection.init(this);
  this.finishSection.init(this);
};

EasyFlow.prototype.onScenarioLoad = function(event, eventData) {
  if (eventData.flowType === 'easyFlow') {
    this.init();
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
