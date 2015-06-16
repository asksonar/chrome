function EventBus() {
  this.init();
}

EventBus.prototype.init = function() {
  this.localBus = $({});
  this.portQueue = [];
}

EventBus.prototype.on = function(eventName, eventHandler, eventTarget) {
  this.localBus.on(eventName, $.proxy(eventHandler, eventTarget || this));
}

EventBus.prototype.trigger = function(eventName, eventData) {
  this.localBus.trigger(eventName, eventData);

  if (this.port) {
    this.port.postMessage({
      'eventName': eventName,
      'eventData': eventData
    });
  } else {
    this.portQueue.push({
      'eventName': eventName,
      'eventData': eventData
    });
  }

  console.log('EventBus: ' + eventName);
  console.log(eventData);
}
