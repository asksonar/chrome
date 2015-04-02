var eventBus = {};

var model = new PopupModel(eventBus);

var view = new PopupView(eventBus, model, {
  'divNext':        $('#div-next'),
  'divFinish':      $('#div-finish'),
  'divRecording':   $('.top-titlebar-recording'),
  'divDescription': $('#div-description'),
  'body':           $('body'),
  'titleBar':       $('#top-titlebar'),
  'btnMinimize':    $('.top-titlebar-minimize-button'),
  'btnClose':       $('.top-titlebar-close-button')
});

var controller = new PopupController(eventBus, model);
