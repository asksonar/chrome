function ControlView(config) {
  this.config = config;
}

ControlView.prototype = Object.create(SectionView.prototype);
ControlView.prototype.constructor = ControlView;

ControlView.prototype.init = function(flow) {
  this.$section = this.config.section;
  this.$titleBar = this.config.titleBar;

  this.width = this.config.width;
  this.minHeight = this.config.minHeight;

  this.$divBtns = this.config.divBtns;
  this.$divNote = this.config.divNote;
  this.$btnShowNote = this.config.btnShowNote;
  this.$btnHideNote = this.config.btnHideNote;
  this.$inputNote = this.config.inputNote;
  this.$btnSaveNote = this.config.btnSaveNote;

  this.$btnResume = this.config.btnResume;
  this.$btnPause = this.config.btnPause;
  this.$btnFinish = this.config.btnFinish;

  this.$btnMute = this.config.btnMute;

  this.model = flow.model;
  this.eventBus = flow.eventBus;

  this.initHandlers();
};

ControlView.prototype.initHandlers = function() {
  this.$btnShowNote.on('click', $.proxy(this.showNote, this));
  this.$btnHideNote.on('click', $.proxy(this.hideNote, this));

  this.$btnResume.on('click', $.proxy(this.resume, this));
  this.$btnPause.on('click', $.proxy(this.pause, this));
  this.$btnFinish.on('click', $.proxy(this.finish, this));

  this.$btnMute.on('click', $.proxy(this.toggleMute, this));

  this.$btnSaveNote.on('click', $.proxy(this.saveNote, this));

};

ControlView.prototype.show = function() {
  this.resize(this.width, this.height);
  this.moveRightTop(this.width);

  this.hideNote();
  this.$section.show();

  this.model.startStep();
};

ControlView.prototype.showNote = function() {
  this.$divBtns.hide();
  this.$inputNote.val('');
  this.$divNote.show();
  this.resizeToNote();
};

ControlView.prototype.hideNote = function() {
  this.$divNote.hide();
  this.$divBtns.show();
  this.resizeToBtns();
};

ControlView.prototype.resizeToBtns = function() {
  var sectionPadding = this.$section.outerHeight() - this.$section.height(); /* calculate padding */
  var totalHeight = sectionPadding +
    this.$titleBar.height() +
    this.$divBtns.outerHeight(true);

  this.resize(null, Math.max(totalHeight, this.minHeight));
};

ControlView.prototype.resizeToNote = function() {
  var sectionPadding = this.$section.outerHeight() - this.$section.height(); /* calculate padding */
  var totalHeight = sectionPadding +
    this.$titleBar.height() +
    this.$divNote.outerHeight(true);

  this.resize(null, Math.max(totalHeight, this.minHeight));
};

ControlView.prototype.saveNote = function(event, eventData) {
  this.model.saveNote(this.$inputNote.val());
  this.hideNote();
};

ControlView.prototype.resume = function() {
  if (this.$btnResume.hasClass('active')) {
    return;
  }

  this.eventBus.trigger('resumeRecording');

  this.$btnResume.addClass('active');
  this.$btnResume.find('.btn-sub-text').text('recording');
  this.$btnPause.removeClass('active');
  this.$btnPause.find('.btn-sub-text').text('pause');
};

ControlView.prototype.pause = function() {
  if (this.$btnPause.hasClass('active')) {
    return;
  }
  this.eventBus.trigger('pauseRecording');

  this.$btnResume.removeClass('active');
  this.$btnResume.find('.btn-sub-text').text('record');
  this.$btnPause.addClass('active');
  this.$btnPause.find('.btn-sub-text').text('paused');
};

ControlView.prototype.finish = function() {
  this.model.finishStep();
  this.next();
};

ControlView.prototype.toggleMute = function() {
  if (this.$btnMute.hasClass('active')) { // unmuting
    this.eventBus.trigger('unmuteRecording');
    this.$btnMute.removeClass('active');
    this.$btnMute.find('.btn-sub-text').text('mute');
  } else { // muting
    this.eventBus.trigger('muteRecording');
    this.$btnMute.addClass('active');
    this.$btnMute.find('.btn-sub-text').text('muted');
  }
};
