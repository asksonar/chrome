var eventBus = $({});

var model = new PopupModel(eventBus);

var view = new PopupView(eventBus, model, {
  'divStart':       $('#div-start'),
  'divNext':        $('#div-next'),
  'divFinish':      $('#div-finish'),
  'divRecording':   $('.top-titlebar-recording'),
  'divDescription': $('#div-description'),
  'body':           $('body'),
  'titleBar':       $('#top-titlebar'),
  'btnMinimize':    $('.top-titlebar-minimize-button'),
  'btnAbort':       $('.top-titlebar-close-button'),
  'btnClose':       $('#btn-close'),
  'btnStart':       $('#btn-start'),
  'btnNext':        $('#btn-next'),
  'btnDelighted':   $('#btn-delighted'),
  'btnConfused':    $('#btn-confused')
});

var controller = new PopupController(eventBus, model);
