function FinishView(config) {
  this.$section = config.section;
  this.width = config.width;
  this.height = config.height;

  this.$progressBar = config.progressBar;
  this.$btnProgressPause = config.btnProgressPause;
  this.$btnProgressPlay = config.btnProgressPlay;
}

FinishView.prototype.initHandlers = function() {
  this.on('click', this.$btnProgressPause, this.pauseUpload);
  this.on('click', this.$btnProgressPlay, this.resumeUpload);

  this.eventBus.on('uploadProgress', this.onUploadProgress, this);
  this.eventBus.on('uploadFinish', this.onUploadFinish, this);
};

FinishView.prototype.show = function() {
  this.resize(this.width, this.height);
  this.moveRightTop();
  this.$section.show();

  chrome.app.window.current().setAlwaysOnTop(false);
};

PopupView.prototype.onUploadProgress = function(event, eventData) {
  this.$progressBar.width(Math.min(Math.max(eventData.percentage, 5), 100) + '%');
};

PopupView.prototype.onUploadFinish = function() {
  this.$progressBar.width('100%');
  this.$divFinish.delay(1000).fadeOut(1000, function(){
    window.close();
  });
};

PopupView.prototype.pauseUpload = function() {
  this.$btnProgressPause.hide();
  this.$btnProgressPlay.show();
  this.eventBus.trigger('pauseUpload');
};

PopupView.prototype.resumeUpload = function() {
  this.$btnProgressPlay.hide();
  this.$btnProgressPause.show();
  this.eventBus.trigger('resumeUpload');
};
