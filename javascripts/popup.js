$(function(){
  window.eventBus = $({});

  window.model = new PopupModel(eventBus);

  window.view = new PopupView(eventBus, model, {
    'divStart':       $('#div-start'),
    'divStep':        $('#div-step'),
    'divFinish':      $('#div-finish'),
    'divRecording':   $('.titlebar-recording'),
    'divDescription': $('#div-description'),
    'ahrefUrl':       $('#ahref-Url'),
    'titleBar':       $('.titlebar'),
    'content':        $('.content'),
    'btnQuestion':    $('.titlebar-question-button'),
    'btnMinimize':    $('.titlebar-minimize-button'),
    'btnAbort':       $('.titlebar-close-button'),
    'btnFinish':      $('#btn-finish'),
    'btnStart':       $('#btn-start'),
    'btnNext':        $('#btn-next'),
    'btnDelighted':   $('#btn-delighted'),
    'btnConfused':    $('#btn-confused'),
    'micCheckBars':   $('.mic-check div'),
    'micLevelBars':   $('.titlebar-recording-level div'),
  });

  window.controller = new PopupController(eventBus, model);

  model.loadUserScenario();
});
