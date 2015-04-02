function PopupView(eventBus, model, config) {
  this.eventBus = eventBus;
  this.model = model;

  this.$divStart = config.divStart;
  this.$divNext = config.divNext;
  this.$divFinish = config.divFinish;
  this.$divRecording = config.divRecording;
  this.$divDescription = config.divDescription;
  this.$body = config.body;
  this.$titleBar = config.titleBar;
  this.$btnMinimize = config.btnMinimize;
  this.$btnClose = config.btnClose;

  this.init();
  this.initHandlers();
}

PopupView.prototype.init = function() {
  this.$divNext.hide();
  this.$divFinish.hide();
  this.$divRecording.hide();

  this.minimizeHeight = this.$titleBar.height();
}

PopupView.prototype.initHandlers = function() {
  this.on('click', this.$btnMinimize, this.toggleMinimize);
  this.on('click', this.$btnClose, this.close);

  this.on('click', this.$btnStart, this.start);
  this.on('click', this.$btnNext, this.next);

  this.on('click', this.$btnDelighted, this.delighted);
  this.on('click', this.$btnConfused, this.confused);

  this.on('scenarioLoaded', this.eventBus, this.onScenarioLoaded);
  this.on('scenarioNexted', this.eventBus, this.onScenarioNexted);

  this.on('recordingStarted', this.eventBus, this.onRecordingStarted);
  this.on('recordingStopped', this.eventBus, this.onRecordingStopped);

}

PopupView.prototype.on = function(eventType, element, clickHandler) {
  element.on(eventType, $.proxy(clickHandler, this));
}

PopupView.prototype.resizeWindowToFit = function() {
  this.currentHeight = $body.outerHeight(true);
  chrome.app.window.current().outerBounds.height = this.currentHeight;
  //$('#div-buttons').outerHeight(true) + $('#div-description').outerHeight(true) + $('#top-titlebar').outerHeight(true)
}

PopupView.prototype.isMinimized = function() {
  return $titleBar.hasClass('minimized');
}

PopupView.prototype.restore = function() {
  $titleBar.removeClass('minimized');
  chrome.app.window.current().outerBounds.height = this.currentHeight;
}

PopupView.prototype.minimize = function() {
  $titleBar.addClass('minimized');
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

PopupView.prototype.close = function() {
  this.eventBus.trigger('close');
  window.close();
}

PopupView.prototype.start = function() {
  this.eventBus.trigger('start');
}

PopupView.prototype.next = function() {
  if (this.model.isLastStep()) {
    this.eventBus.trigger('finish', [this.model.getCurrentStep()]);
  } else {
    this.eventBus.trigger('next', [this.model.getCurrentStep()]);
  }
}

PopupView.prototype.delighted = function() {
  this.eventBus.trigger('delighted');
}

PopupView.prototype.confused = function() {
  this.eventBus.trigger('confused');
}

PoupView.prototype.onScenarioLoaded = function() {
   $divDescription.html(this.model.getCurrentDescription);
   this.resizeWindowToFit();
}

PopupView.prototype.onScenarioNexted = function() {
  this.$divStart.hide();

  if (!this.model.isPastLastStep()) {
    this.$divNext.show();
    this.$divDescription.html(this.model.getCurrentDescription())
  } else {
    this.$divNext.hide();
    this.$divFinish.show();
    this.$divDescription.html('Thanks for helping out!');
  }

  this.$divDescription.css('opacity', 0).fadeTo('slow', 1);
  this.resizeWindowToFit();
}

PopupView.prototype.onRecordingStarted = function() {
  $divRecording.show();
}

PopupView.prototype.onRecordingStopped = function() {
  $divRecording.hide();
  alert('Oh god why has recording stopped?');
  this.close();
}
