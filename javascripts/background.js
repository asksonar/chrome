$(function(){

  window.eventBus = new BackgroundEventBus();
  window.ajaxer = new Ajaxer({
    'url': 'http://video.asksonar.com/api/v2/'
    //'url': 'http://dockerhost:5000/api/v2/'
  });

  window.model = new BackgroundModel(eventBus, ajaxer);
  window.controller = new BackgroundController(eventBus, ajaxer, model, {
    'margin': 10,
    'width': 400,
    'height': 300
  });
  window.recorder = new RecorderController(eventBus, ajaxer, model, {
    'encoderUrl': '/manifest_encoder.nmf',
    'fps': 10
  });

});
