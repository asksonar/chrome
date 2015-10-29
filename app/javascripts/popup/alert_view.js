function AlertView(config) {
  this.$divAlert = config.divAlert;
}

AlertView.prototype.initHandlers = function() {
  this.eventBus.on('alertWindow', this.showAlert, this);
};

AlertView.prototype.showAlert = function() {
  var currentAlwaysOnTop = chrome.app.window.current().isAlwaysOnTop();
  chrome.app.window.current().setAlwaysOnTop(true);
  chrome.app.window.current().setAlwaysOnTop(currentAlwaysOnTop);
  this.$divAlert.fadeIn().fadeOut().fadeIn().fadeOut();
};
