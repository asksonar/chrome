function AbortView() {
  this.$btnAbort = config.btnAbort;
  this.$btnAbortYes = config.btnAbortYes;
  this.$btnAbortNo = config.btnAbortNo;
  this.$btnAbortConfirm = config.btnAbortConfirm;

  this.$divAbort = config.divAbort;
  this.$divAborted = config.divAborted;
}

AbortView.prototype.initHandlers = function() {
  this.on('click', this.$btnAbort, this.showAbort);
  this.on('click', this.$btnAbortYes, this.abort);
  this.on('click', this.$btnAbortNo, this.hideAbort);
  this.on('click', this.$btnAbortConfirm, this.abort);
  this.eventBus.on('recordingFailure', $.proxy(this.onRecordingFailure, this));
};

AbortView.prototype.showAbort = function() {
  this.$divAbort.css({display:'flex'});
};

AbortView.prototype.hideAbort = function() {
  this.$divAbort.css({display:'none'});
};

AbortView.prototype.showAborted = function() {
  this.$divAborted.css({display:'flex'});
};

AbortView.prototype.abort = function() {
  this.model.abort();
  window.close();
};

AbortView.prototype.onRecordingFailure = function(event, eventData) {
  if (this.model.started()) {
    this.showAborted();
  }
};
