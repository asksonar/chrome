function FinishView(config) {
  this.config = config;
}

FinishView.prototype = Object.create(SectionView.prototype);
FinishView.prototype.constructor = FinishView;

FinishView.prototype.init = function(flow) {
  this.$section = this.config.section;

  this.$progressBar = this.config.progressBar;
  this.$btnProgressPause = this.config.btnProgressPause;
  this.$btnProgressPlay = this.config.btnProgressPlay;

  this.$divUploading = this.config.divUploading;
  this.$divUploaded = this.config.divUploaded;

  this.width = this.config.width;
  this.height = this.config.height;

  this.eventBus = flow.eventBus;

  this.initHandlers();
};

FinishView.prototype.initHandlers = function() {
  this.$btnProgressPause.on('click', $.proxy(this.pauseUpload, this));
  this.$btnProgressPlay.on('click', $.proxy(this.resumeUpload, this));

  this.eventBus.on('uploadProgress', this.onUploadProgress, this);
  this.eventBus.on('uploadFinish', this.onUploadFinish, this);
};

FinishView.prototype.show = function() {
  this.resize(this.width, this.height);
  this.$section.show();

  chrome.app.window.current().setAlwaysOnTop(false);
};

FinishView.prototype.onUploadProgress = function(event, eventData) {
  this.$progressBar.width(Math.min(Math.max(eventData.percentage, 5), 100) + '%');
};

FinishView.prototype.onUploadFinish = function() {
  this.$progressBar.width('100%');
  $({})
    .queue($.proxy(function(next) {
      this.$divUploading.fadeOut('normal', next);
    }, this))
    .queue($.proxy(function(next) {
      this.$divUploaded.fadeIn('normal', next);
    }, this))
    .queue($.proxy(function() {
      this.next();
    }, this));
};

FinishView.prototype.next = function() {
  this.$section.delay(1000).fadeOut(1000, $.proxy(function() {
    SectionView.prototype.next.call(this);
  }, this));
};

FinishView.prototype.pauseUpload = function() {
  this.$btnProgressPause.hide();
  this.$btnProgressPlay.show();
  this.eventBus.trigger('pauseUpload');
};

FinishView.prototype.resumeUpload = function() {
  this.$btnProgressPlay.hide();
  this.$btnProgressPause.show();
  this.eventBus.trigger('resumeUpload');
};
