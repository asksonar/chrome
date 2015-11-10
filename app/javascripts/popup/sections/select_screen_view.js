function SelectScreenView(config) {
  this.config = config;
}

SelectScreenView.prototype = Object.create(SectionView.prototype);
SelectScreenView.prototype.constructor = SelectScreenView;

SelectScreenView.prototype.init = function(flow) {
  this.$section = this.config.section;

  this.width = this.config.width;
  this.height = this.config.height;

  this.eventBus = flow.eventBus;
  this.model = flow.model;

  this.initHandlers();
}

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
