$(function(){

  window.eventBus = new BackgroundEventBus();
  window.ajaxer = new Ajaxer(eventBus, {
    'url': 'http://my.asksonar.com'
    // 'url': 'http://dockerhost:3000'
  });

  window.model = new BackgroundModel(eventBus, ajaxer);
  window.controller = new BackgroundController(eventBus, ajaxer, model);
  window.recorder = new RecorderController(eventBus, ajaxer, model, {
    'encoderUrl': '/manifest_encoder.nmf',
    'fps': 10
  });

});
