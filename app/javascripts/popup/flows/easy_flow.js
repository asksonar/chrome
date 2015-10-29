function EasyFlow(config, eventBus) {
  this.instructions = config.instructions;
  this.selectScreen = config.selectScreen;
  this.start = config.start;
  this.next = config.step;
  this.finish = config.finish;

  this.eventBus = eventBus;
}

EasyFlow.prototype.initHandlers = function() {
  this.eventBus.on('scenarioLoad', $.proxy(this.onScenarioLoad, this));
};

EasyFlow.prototype.onScenarioLoad = function(event, eventData) {
  if (eventData.flowType === 'easyFlow') {
    this.start();
  }
};

EasyFlow.prototype.start = function() {
  this.instructions.onNext(this.selectScreen);
  this.selectScreen.onNext(this.start);
  this.selectScreen.onPrev(this.instructions);
  this.start.onNext(this.step);
  this.next.onNext(this.finish);
  this.finish.onNext(this.close);

  this.selectScreen.hide();
  this.start.hide();
  this.next.hide();
  this.finish.hide();

  this.instructions.show();

  chrome.app.window.current().show();
};
