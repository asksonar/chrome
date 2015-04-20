function PopupView(eventBus, model, config) {
  this.eventBus = eventBus;
  this.model = model;

  this.$divStart = config.divStart;
  this.$divStep = config.divStep;
  this.$divFinish = config.divFinish;
  this.$divRecording = config.divRecording;
  this.$divDescription = config.divDescription;
  this.$titleBar = config.titleBar;
  this.$content = config.content;
  this.$btnQuestion = config.btnQuestion;
  this.$btnMinimize = config.btnMinimize;
  this.$btnAbort = config.btnAbort;
  this.$btnFinish = config.btnFinish;
  this.$btnStart = config.btnStart;
  this.$btnNext = config.btnNext;
  this.$btnDelighted = config.btnDelighted;
  this.$btnConfused = config.btnConfused;

  this.init();
  this.initHandlers();
}

PopupView.prototype.init = function() {
  this.$divStart.show();
  this.$divStep.hide();
  this.$divFinish.hide();

  this.minimizeHeight = this.$titleBar.height();
  this.resizeWindowToFit();
}

PopupView.prototype.initHandlers = function() {
  this.on('click', this.$btnQuestion, this.toggleStart);
  this.on('click', this.$btnMinimize, this.toggleMinimize);
  this.on('click', this.$btnAbort, this.abort);

  this.on('click', this.$btnStart, this.start);
  this.on('click', this.$btnNext, this.next);
  this.on('click', this.$btnDelighted, this.delighted);
  this.on('click', this.$btnConfused, this.confused);
  this.on('click', this.$btnFinish, this.finish);

  this.on('scenarioLoaded', this.eventBus, this.onScenarioLoaded);
  this.on('scenarioStarted', this.eventBus, this.onScenarioStarted);
  this.on('scenarioNexted', this.eventBus, this.onScenarioNexted);
  this.on('scenarioFinished', this.eventBus, this.onScenarioFinished);

  this.on('videoRecordingStarted', this.eventBus, this.onRecordingStarted);
  this.on('videoRecordingStopped', this.eventBus, this.onRecordingStopped);
  this.on('audioRecordingStopped', this.eventBus, this.onRecordingStopped);
}

PopupView.prototype.on = function(eventType, element, clickHandler) {
  element.on(eventType, $.proxy(clickHandler, this));
}

PopupView.prototype.resizeWindowToFit = function() {
  chrome.app.window.current().outerBounds.height = this.$content.outerHeight(true);
}

PopupView.prototype.toggleStart = function() {
  if (this.$divStart.hasClass('started')) {
    this.$divStart.toggle();
    this.resizeWindowToFit();
  }
}

PopupView.prototype.isMinimized = function() {
  return this.$titleBar.hasClass('minimized');
}

PopupView.prototype.restore = function() {
  this.$titleBar.removeClass('minimized');
  chrome.app.window.current().outerBounds.height = this.$content.outerHeight(true);
}

PopupView.prototype.minimize = function() {
  this.$titleBar.addClass('minimized');
  chrome.app.window.current().outerBounds.height = this.minimizeHeight;
}

PopupView.prototype.toggleMinimize = function() {
  if (this.isMinimized()) {
    this.restore();
  } else {
    this.minimize();
  }
  return false;
}

PopupView.prototype.finish = function() {
  window.close();
}

PopupView.prototype.abort = function() {
  this.eventBus.trigger('abort');
  window.close();
}

PopupView.prototype.start = function() {
  this.eventBus.trigger('start');
}

PopupView.prototype.next = function() {
  if (this.model.isLastStep()) {
    this.eventBus.trigger('finish');
  } else {
    this.eventBus.trigger('next');
  }
}

PopupView.prototype.delighted = function() {
  this.eventBus.trigger('delighted');
}

PopupView.prototype.confused = function() {
  this.eventBus.trigger('confused');
}

PopupView.prototype.onScenarioLoaded = function() {
  this.$divDescription.html(this.model.getCurrentDescription());
}

PopupView.prototype.onScenarioStarted = function() {
  this.$divStart.hide();
  this.$divStart.addClass('started');
}

PopupView.prototype.onScenarioNexted = function() {
  this.$divDescription.html(this.model.getCurrentDescription());
  this.$content.hide().fadeIn('slow');
  this.resizeWindowToFit();
}

PopupView.prototype.onScenarioFinished = function() {
  this.$divStart.hide();
  this.$divStep.hide();
  this.$divFinish.fadeIn('slow');
  this.resizeWindowToFit();
}

PopupView.prototype.onRecordingStarted = function() {
  this.$divStep.show();
  this.onScenarioNexted();
  this.$divRecording.removeClass('off').addClass('on');
}

PopupView.prototype.onRecordingStopped = function() {
  this.$divRecording.removeClass('on').addClass('off');
  alert('Oh god why has recording stopped?');
  this.abort();
}
