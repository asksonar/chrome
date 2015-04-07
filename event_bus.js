function EventBus() {
  this.bus = $({});
}

EventBus.prototype.on = function(eventType, handler) {
  this.bus.on(eventType, handler);
}

EventBus.prototype.trigger = function(eventType, params) {
  var clonedParams = [];
  for(var i = 0; params && i < params.length; i++) {
    clonedParams.push($.extend(true, {}, params[i]));
  }

  this.bus.trigger(eventType, clonedParams);
}
