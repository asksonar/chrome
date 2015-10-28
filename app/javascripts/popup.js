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
    'divAbort':       $('#div-abort'),
    'divAborted':     $('#div-aborted'),
    'divAlert':       $('#div-alert'),

    'titleBar':       $('.titlebar'),
    'content':        $('.content'),
    'btnAbort':       $('.titlebar-close-button'),
    'btnAbortYes':    $('#btn-abort-yes'),
    'btnAbortNo':     $('#btn-abort-no'),
    'btnAbortConfirm': $('#btn-abort-confirm'),

    'divTitle':       $('#div-title'),
    'divDescription': $('#div-description'),
    'divStepOfText':  $('#div-step-of-text'),
    'divCtnDescription': $('.ctn-description'),
    'ahrefUrl':       $('#ahref-Url'),

    'btnStart':       $('#btn-start'),
    'btnFirstStep':   $('#btn-first-step'),
    'btnNext':        $('#btn-next'),
    'btnFinish':      $('#btn-finish'),
    'btnDelighted':   $('#btn-delighted'),
    'btnConfused':    $('#btn-confused'),

    'btnShowLess':    $('.btn-show-less'),
    'btnShowMore':    $('.btn-show-more'),

    'ctnTooltips':    $('.tooltip-trigger'),

    'progressBar':    $('.progress-bar'),
    'btnProgressPause':  $('#btn-progress-pause'),
    'btnProgressPlay':   $('#btn-progress-play'),

    'centerWidth':    500,
    'centerHeight':   310,

    'cornerMargin':   10,
    'cornerWidth':    400,
    'cornerHeight':   135,
    'cornerMinWidth': 330, /* so talk notice won't wrap */
    'cornerMinHeight': 85 /* fits smily face buttons */
  });

  window.microphoneView = new MicrophoneView(eventBus, {
    'micCheck':     $('.mic-check'),
    'micCheckBars': $('.mic-check div'),
    'micLevelBars': $('.titlebar-recording-level div'),
    'micCheckText': $('#div-mic-check-text'),
    'speechReminder': $('#ctn-speech-reminder'),
    'divRecording':   $('.titlebar-recording'),
    'recordingTextTime': $('#titlebar-recording-text-time')

  });

});
