function WebsocketController(eventBus, model, config) {
  this.eventBus = eventBus;
  this.model = model;

  this.websocketUrl = config.websocketUrl;

  this.init();
  this.initHandlers();
}

WebsocketController.prototype.init = function() {
  this.messageQueue = [];
  this.processQueue = $({});
  this.ws = null;
}

WebsocketController.prototype.initHandlers = function() {
  this.on('sendMessage', this.eventBus, this.onSendMessage);
}

WebsocketController.prototype.on = function(eventType, element, clickHandler) {
  element.on(eventType, $.proxy(clickHandler, this));
}

WebsocketController.prototype.openWebsocket = function(next) {
  if (this.ws == null || this.ws.readyState == 3 || this.ws.readyState == 4) {
    this.ws = new WebSocket(this.websocketUrl);
    this.ws.onopen = next;
    this.ws.onerror = $.proxy(this.websocketError, this);
  } else {
    next();
  }
}

WebsocketController.prototype.processQueueMessages = function(next) {
  while(this.messageQueue.length > 0) {
    if (this.ws == null || this.ws.readyState != 1) {
      break;
    }
    var message = this.messageQueue.shift();
    this.ws.send(JSON.stringify(message));
  }
  if (this.messageQueue.length > 0) {
    this.processQueue.queue($.proxy(openWebsocket,this));
    this.processQueue.queue($.proxy(processQueueMessages, this));
  }
  if (next) {
    next();
  }
}

WebsocketController.prototype.websocketError = function(next) {
  // TODO: back off and then try again later
}

WebsocketController.prototype.processMessages = function() {
  this.processQueue.queue($.proxy(this.openWebsocket, this));
  this.processQueue.queue($.proxy(this.processQueueMessages, this));
}

WebsocketController.prototype.onSendMessage = function(event, command, params, blob) {
  if (blob) {

    var fr = new FileReader();

    var pushMessageToQueue = function() {
      this.messageQueue.push({
        'command': command,
        'params': params,
        'data': fr.result
      });

      this.processMessages();
    }

    fr.onloadend = $.proxy(pushMessageToQueue, this);
    fr.readAsDataURL(blob);

  } else {

    this.messageQueue.push({
      'command': command,
      'params': params
    });

    this.processMessages();
  }
}

/*
WebsocketController.prototype.sendStart = function(params) {
  ws.send(JSON.stringify({
    'command': 'data.start',
    'params': params
  }));
}

WebsocketController.prototype.sendStep = function(params) {
  ws.send(JSON.stringify({
    'command': 'data.step',
    'params': params
  }));
}

WebsocketController.prototype.sendFinish = function(params) {
  ws.send(JSON.stringify({
    'command': 'data.finish',
    'params': params
  }));
}

WebsocketController.prototype.sendAudio = function(userScenarioUUID, currentStep, blob) {
  ws.send(JSON.stringify({
    'command': 'audio.step',
    'params': {
      'userScenarioUUID': userScenarioUUID,
      'currentStep': currentStep
    },
    'data': blob
  }));
}

WebsocketController.prototype.sendVideo = function(userScenarioUUID, currentStep, blob) {
  ws.send(JSON.stringify({
    'command': 'video.step',
    'params': {
      'userScenarioUUID': userScenarioUUID,
      'currentStep': currentStep
    },
    'data': blob
  }));
}
*/
