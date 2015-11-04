function InstructionsView(config, microphoneCheck) {
  this.$section = config.section;
  this.width = config.width;
  this.height = config.height;
  this.$btnStart = config.btnStart;
  this.microphoneCheck = microphoneCheck;

  this.initHandlers();
}

InstructionsView.prototype = Object.create(SectionView.prototype);
InstructionsView.prototype.constructor = InstructionsView;

InstructionsView.prototype.initHandlers = function() {
  this.$btnStart.on('click', $.proxy(this.onStart, this));
  this.microphoneCheck.on('recordingHeard', $.proxy(this.onRecordingHeard, this));
};

InstructionsView.prototype.onStart = function() {
  if (this.$btnStart.hasClass('disabled')) {
    return;
  } else {
    this.next();
  }
};

InstructionsView.prototype.onRecordingHeard = function() {
  this.$btnStart.removeClass('disabled');
};

InstructionsView.prototype.show = function() {
  this.microphoneCheck.start();
  this.resize(this.width, this.height);
  this.moveCenter(this.width, this.height, 0);
  this.$section.show();
};

InstructionsView.prototype.hide = function() {
  this.microphoneCheck.stop();
  this.$section.hide();
};

