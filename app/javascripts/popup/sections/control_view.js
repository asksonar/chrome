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

  this.$btnFinish = this.config.btnFinish;

  this.model = flow.model;

  this.initHandlers();
};

ControlView.prototype.initHandlers = function() {
  this.$btnShowNote.on('click', $.proxy(this.showNote, this));
  this.$btnHideNote.on('click', $.proxy(this.hideNote, this));

  this.$btnSaveNote.on('click', $.proxy(this.saveNote, this));
  this.$btnFinish.on('click', $.proxy(this.onFinish, this));
};

ControlView.prototype.show = function() {
  this.resize(this.width, this.height);
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

ControlView.prototype.onFinish = function() {
  this.model.finishStep();
  this.next();
};
