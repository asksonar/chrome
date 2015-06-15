function EventBus() {
  this.localBus = $({});
  this.init();
}

EventBus.prototype.init = function() {

}

EventBus.prototype.on = function(eventName, eventHandler) {
  this.localBus.on(eventName, eventHandler);
}

EventBus.prototype.trigger = function(eventName, eventData) {
  this.localBus.trigger(eventName, eventData);
  this.port.postMessage({
    'eventName': eventName,
    'eventData': eventData
  })
}
