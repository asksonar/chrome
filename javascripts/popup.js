$(function(){
  window.eventBus = new PopupEventBus();

  window.model = new PopupModel(eventBus);

  window.view = new PopupView(eventBus, model, {
    'baseUrl':        'http://my.asksonar.com/',
    //'baseUrl':        'http://dockerhost:3000/',
    'divInstructions':$('#div-instructions'),
    'divSelectScreen':$('#div-select-screen'),
    'divStart':       $('#div-start'),
    'divStep':        $('#div-step'),
    'divFinish':      $('#div-finish'),

    'divRecording':   $('.titlebar-recording'),
    'titleBar':       $('.titlebar'),
    'recordingTextTime': $('#titlebar-recording-text-time'),
    'content':        $('.content'),
    'btnQuestion':    $('.titlebar-question-button'),
    'btnAbort':       $('.titlebar-close-button'),

    'divDescription': $('#div-description'),
    'divStepOfText':  $('#div-step-of-text'),
    'ahrefUrl':       $('#ahref-Url'),

    'btnStart':       $('#btn-start'),
    'btnFirstStep':   $('#btn-first-step'),
    'btnNext':        $('#btn-next'),
    'btnFinish':      $('#btn-finish'),
    'btnDelighted':   $('#btn-delighted'),
    'btnConfused':    $('#btn-confused'),

    'ctnTooltips':    $('.tooltip-trigger'),

    'progressBar':    $('.progress-bar'),

    'centerWidth':    500,
    'centerHeight':   310,

    'cornerMargin':   10,
    'cornerWidth':    400,
    'cornerHeight':   135,
    'cornerMinWidth': 300,
    'cornerMinHeight': 85
  });

  window.microphoneView = new MicrophoneView(eventBus, {
    'micCheck':     $('.mic-check'),
    'micCheckBars': $('.mic-check div'),
    'micLevelBars': $('.titlebar-recording-level div'),
    'micCheckText': $('#div-mic-check-text')

  });

  window.view.showInstructions();

});
