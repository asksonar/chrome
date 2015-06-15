function BackgroundEventBus() {
  this.init();
}

BackgroundEventBus.prototype.init = function() {

  var messageListener = function(msg) {
    this.localBus.trigger(msg.eventName, [msg.eventData]);
  }

  var listenerResponse = function(port) {
    console.assert(port.name == 'sonar');
    this.port = port;
    this.port.onMessage.addListener($.proxy(messageListener, this));
  }

  chrome.runtime.onConnect.addListener($.proxy(listenerResponse, this));
}
