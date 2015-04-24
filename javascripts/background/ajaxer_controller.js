function AjaxerController(eventBus, model, config) {
  this.eventBus = eventBus;
  this.model = model;

  this.url = config.url

  this.init();
  this.initHandlers();
}

AjaxerController.prototype.init = function() {
}

AjaxerController.prototype.initHandlers = function() {
  this.on('sendMessage', this.eventBus, this.onSendMessage);
}

AjaxerController.prototype.on = function(eventType, element, clickHandler) {
  element.on(eventType, $.proxy(clickHandler, this));
}

AjaxerController.prototype.onSendMessage = function(event, command, params, blob) {
  var formData = new FormData();
  formData.append('params', JSON.stringify(params));
  if (blob) {
    formData.append('dataBinary', blob);
    formData.append('dataMimeType', blob.type);
  }

  $.ajax({
    url: this.url + command,
    data: formData,
    cache: false,
    contentType: false,
    processData: false,
    type: 'POST'
  }).done(function(){
    console.log('Delivered message: ' + command);
  }).fail(function(){
    console.log('Failed message: ' + command);
  })
}
