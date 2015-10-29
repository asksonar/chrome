function SelectScreenView(config, eventBus, model) {
  this.$section = config.section;

  this.width = config.width;
  this.height = config.height;

  this.eventBus = eventBus;
  this.model = model;

  this.initHandlers();
}

SelectScreenView.prototype = Object.create(SectionView.prototype);
SelectScreenView.prototype.constructor = SectionView;

SelectScreenView.prototype.initHandlers = function() {
  this.eventBus.on('recordingStarted', this.onRecordingStarted, this);
  this.eventBus.on('recordingFailure', this.onRecordingFailure, this);
};

SelectScreenView.prototype.show = function() {
  // asks for recording and awaits recording success to actually start
  this.eventBus.trigger('requestRecording');
  this.resize(this.width, this.height);
  this.moveRightTop(this.width, 0);
  this.$section.show();
};

SelectScreenView.prototype.onRecordingStarted = function(event, eventData) {
  this.next();
};

SelectScreenView.prototype.onRecordingFailure = function(event, eventData) {
  if (!this.model.isStarted()) {
    this.prev();
  }
};
