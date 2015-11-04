function ControlView(config, model) {
  this.$section = config.section;
  this.$titleBar = config.titleBar;

  this.width = config.width;
  this.minHeight = config.minHeight;

  this.$divBtns = config.divBtns;
  this.$divNote = config.divNote;
  this.$btnShowNote = config.btnShowNote;
  this.$btnHideNote = config.btnHideNote;
  this.$inputNote = config.inputNote;
  this.$btnSaveNote = config.btnSaveNote;

  this.$btnFinish = config.btnFinish;

  this.model = model;

  this.initHandlers();
}

ControlView.prototype = Object.create(SectionView.prototype);
ControlView.prototype.constructor = ControlView;

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
