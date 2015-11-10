function FinishWithTitleView(config) {
  this.config = config;
}

FinishWithTitleView.prototype = Object.create(FinishView.prototype);
FinishWithTitleView.prototype.constructor = FinishWithTitleView;

FinishWithTitleView.prototype.init = function(flow) {
  FinishView.prototype.init.call(this, flow);

  this.$titleBar = this.config.titleBar;
  this.$inputTitle = this.config.inputTitle;
  this.$btnSaveTitle = this.config.btnSaveTitle;
  this.$divTitling = this.config.divTitling;

  this.model = flow.model;

  this.$divTitling.show();

  this.initHandlers();
};

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
