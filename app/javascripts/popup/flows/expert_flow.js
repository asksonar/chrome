function ExpertFlow(config, eventBus, model) {
  this.config = config;
  this.eventBus = eventBus;
  this.model = model;
}

ExpertFlow.prototype.init = function() {
  this.selectScreenSection = this.config.selectScreen;
  this.controlSection = this.config.control;
  this.finishSection = this.config.finishWithTitle;

  this.selectScreenSection.init(this);
  this.controlSection.init(this);
  this.finishSection.init(this);
};

ExpertFlow.prototype.onScenarioLoad = function(event, eventData) {
  if (eventData.flowType === 'expertFlow') {
    this.init();
    this.start();
  }
};

ExpertFlow.prototype.start = function() {
  var close = { show: function() { window.close(); } };

  this.selectScreenSection.onNext(this.controlSection);
  this.selectScreenSection.onPrev(close);
  this.controlSection.onNext(this.finishSection);
  this.finishSection.onNext(close);

  this.controlSection.hide();
  this.finishSection.hide();

  this.selectScreenSection.show();

  chrome.app.window.current().show();
};
