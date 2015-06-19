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
    'content':        $('.content'),
    'btnQuestion':    $('.titlebar-question-button'),
    'btnMinimize':    $('.titlebar-minimize-button'),
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

    'ctnTooltips':    $('.ctn-tooltip'),

    'centerWidth':    500,
    'centerHeight':   325,
    'centerMinWidth': 410,
    'centerMinHeight': 325,

    'cornerMargin':   10,
    'cornerWidth':    400,
    'cornerHeight':   300,
    'cornerMinWidth': 250,
    'cornerMinHeight': 150
  });

  window.microphoneView = new MicrophoneView(eventBus, {
    'micCheck':     $('.mic-check'),
    'micCheckBars': $('.mic-check div'),
    'micLevelBars': $('.titlebar-recording-level div'),
    'micCheckText': $('#div-mic-check-text')

  });

  window.view.showCenterWindow();

});
