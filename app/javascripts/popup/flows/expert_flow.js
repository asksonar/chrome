function ExpertFlow(config, eventBus) {
  this.selectScreen = config.selectScreen;
  this.control = config.control;
  this.finish = config.finishWithTitle;

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
  this.selectScreen.onNext(this.control);
  this.selectScreen.onPrev(this.close);
  this.control.onNext(this.finish);
  this.finish.onNext(this.close);

  this.control.hide();
  this.finish.hide();

  this.selectScreen.show();

  chrome.app.window.current().show();
};
