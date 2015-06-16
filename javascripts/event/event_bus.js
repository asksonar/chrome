function EventBus() {
  this.localBus = $({});
  this.init();
}

EventBus.prototype.init = function() {

}

EventBus.prototype.on = function(eventName, eventHandler, eventTarget) {
  this.localBus.on(eventName, $.proxy(eventHandler, eventTarget || this));
}

EventBus.prototype.trigger = function(eventName, eventData) {
  this.localBus.trigger(eventName, eventData);
  this.port.postMessage({
    'eventName': eventName,
    'eventData': eventData
  })
}
