function BackgroundEventBus() {
  this.init();
}

BackgroundEventBus.prototype = new EventBus();
BackgroundEventBus.prototype.constructor = EventBus;

BackgroundEventBus.prototype.init = function() {

  var messageListener = function(msg) {
    this.localBus.trigger(msg.eventName, [msg.eventData]);
  }

  var listenerResponse = function(port) {
    console.assert(port.name == 'sonar');
    this.port = port;
    this.port.onMessage.addListener($.proxy(messageListener, this));
    this.port.onDisconnect.addListener($.proxy(function(){
      this.port = null;
    }, this));

    var message;
    while(message = this.portQueue.shift()) {
      this.port.postMessage(message);
    }
  }

  chrome.runtime.onConnect.addListener($.proxy(listenerResponse, this));
}
