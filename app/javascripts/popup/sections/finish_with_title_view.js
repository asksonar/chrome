function FinishWithTitleView(config, eventBus, model) {
  this.$section = config.section;
  this.$titleBar = config.titleBar;

  this.$progressBar = config.progressBar;
  this.$btnProgressPause = config.btnProgressPause;
  this.$btnProgressPlay = config.btnProgressPlay;
  this.$divUploading = config.divUploading;
  this.$divUploaded = config.divUploaded;

  this.$inputTitle = config.inputTitle;
  this.$btnSaveTitle = config.btnSaveTitle;

  this.$divTitling = config.divTitling;

  this.width = config.width;
  this.height = config.height;

  this.eventBus = eventBus;
  this.model = model;

  this.initHandlers();
}

FinishWithTitleView.prototype = Object.create(FinishView.prototype);
FinishWithTitleView.prototype.constructor = FinishWithTitleView;

FinishWithTitleView.prototype.initHandlers = function() {
  FinishView.prototype.initHandlers.call(this);
  this.$btnSaveTitle.on('click', $.proxy(this.saveTitle, this));
};

FinishWithTitleView.prototype.saveTitle = function() {
  this.model.saveTitle(this.$inputTitle.val());
  this.titleSaved = true;

  $({})
    .queue($.proxy(function(next) {
      this.$divTitling.fadeOut('normal', next);
    }, this))
    .queue($.proxy(function() {
      this.resizeToFit();
      this.next();
    }, this));
};

FinishWithTitleView.prototype.resizeToFit = function() {
  var sectionPadding = this.$section.outerHeight() - this.$section.height(); /* calculate padding */
  var divHeights = this.$section.children('div:visible').toArray().reduce(function(previousValue, currentValue) {
    return previousValue + $(currentValue).outerHeight(true);
  }, 0);
  var totalHeight = sectionPadding +
    divHeights +
    this.$titleBar.height();

  this.resize(null, totalHeight);
};

FinishWithTitleView.prototype.onUploadFinish = function() {
  this.uploadFinished = true;
  FinishView.prototype.onUploadFinish.call(this);
  this.resizeToFit();
};

FinishWithTitleView.prototype.show = function() {
  FinishView.prototype.show.call(this);
  this.resizeToFit();
}

FinishWithTitleView.prototype.next = function() {
  if (this.titleSaved === true && this.uploadFinished === true) {
    FinishView.prototype.next.call(this);
  }
};
