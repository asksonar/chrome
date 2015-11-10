function AbortView(config) {
  this.config = config;
}

AbortView.prototype.init = function(eventBus, model) {
  this.$divAbort = this.config.divAbort;
  this.$divAborted = this.config.divAborted;

  this.$btnAbort = this.config.btnAbort;
  this.$btnAbortYes = this.config.btnAbortYes;
  this.$btnAbortNo = this.config.btnAbortNo;
  this.$btnAbortConfirm = this.config.btnAbortConfirm;

  this.eventBus = eventBus;
  this.model = model;

  this.initHandlers();
};

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
