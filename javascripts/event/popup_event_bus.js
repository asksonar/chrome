function PopupEventBus() {
  this.init();
}

PopupEventBus.prototype = new EventBus();
PopupEventBus.prototype.constructor = EventBus;

PopupEventBus.prototype.init = function() {

  var messageListener = function(msg) {
    this.localBus.trigger(msg.eventName, [msg.eventData]);
  }

  this.port = chrome.runtime.connect({name: "sonar"});
  this.port.onMessage.addListener($.proxy(messageListener, this));
}
