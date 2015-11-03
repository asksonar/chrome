function AbortView(config, eventBus, model) {
  this.$divAbort = config.divAbort;
  this.$divAborted = config.divAborted;

  this.$btnAbort = config.btnAbort;
  this.$btnAbortYes = config.btnAbortYes;
  this.$btnAbortNo = config.btnAbortNo;
  this.$btnAbortConfirm = config.btnAbortConfirm;

  this.eventBus = eventBus;
  this.model = model;

  this.initHandlers();
}

AbortView.prototype.initHandlers = function() {
  this.$btnAbort.on('click', $.proxy(this.showAbort, this));
  this.$btnAbortYes.on('click', $.proxy(this.abort, this));
  this.$btnAbortNo.on('click', $.proxy(this.hideAbort, this));
  this.$btnAbortConfirm.on('click', $.proxy(this.abort, this));
  this.eventBus.on('recordingFailure', this.onRecordingFailure, this);
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
  if (this.model.isStarted()) {
    this.showAborted();
  }
};
