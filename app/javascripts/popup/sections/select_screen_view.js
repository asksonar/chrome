function SelectScreenView(config, eventBus) {
  this.$section = config.section;
  this.eventBus = eventBus;
}

SelectScreeView.prototype.initHandlers = function() {
  this.on('click', this.$btnFirstStep, this.firstStep);
  this.eventBus.on('recordingStarted', $.proxy(this.onRecordingStarted, this));
  this.eventBus.on('recordingFailure', $.proxy(this.onRecordingFailure, this));
};

SelectScreenView.prototype.show = function() {
  // asks for recording and awaits recording success to actually start
  this.eventBus.trigger('requestRecording');
  this.resize(this.width, this.height);
  this.moveRightTop(this.width, 0);
  this.$section.show();
};

SelectScreeView.prototype.onRecordingStarted = function(event, eventData) {
  this.next();
};

SelectScreeView.prototype.onRecordingFailure = function(event, eventData) {
  if (!this.model.isStarted()) {
    this.prev();
  }
};
