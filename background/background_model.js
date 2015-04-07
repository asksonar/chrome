function BackgroundModel(eventBus) {
  this.eventBus = eventBus;

  this.init();
  this.initHandlers();
}

BackgroundModel.prototype.init = function() {
}

BackgroundModel.prototype.initHandlers = function() {
}

BackgroundModel.prototype.on = function(eventType, element, clickHandler) {
  element.on(eventType, $.proxy(clickHandler, this));
}
