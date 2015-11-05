function AlertView(config) {
  this.config = config;
}

AlertView.prototype.init = function(eventBus) {
  this.$divAlert = this.config.divAlert;

  this.eventBus = eventBus;

  this.initHandlers();
};

AlertView.prototype.initHandlers = function() {
  this.eventBus.on('alertWindow', this.showAlert, this);
};

AlertView.prototype.showAlert = function() {
  var currentAlwaysOnTop = chrome.app.window.current().isAlwaysOnTop();
  chrome.app.window.current().setAlwaysOnTop(true);
  chrome.app.window.current().setAlwaysOnTop(currentAlwaysOnTop);
  this.$divAlert.fadeIn().fadeOut().fadeIn().fadeOut();
};
