$(function(){
  var eventBus = new PopupEventBus();
  var model = new PopupModel(eventBus);

  var microphoneCheck = new MicrophoneCheck({
    'micCheck':     $('.mic-check'),
    'micCheckBars': $('.mic-check div'),
    'micCheckText': $('#div-mic-check-text')
  });
  var instructions = new InstructionsView({
    'section':  $('#div-instructions'),
    'width':    500,
    'height':   310,
    'btnStart': $('#btn-start')
  }, microphoneCheck);

  var selectScreen = new SelectScreenView({
    'section':  $('#div-select-screen'),
    'width':    400,
    'height':   135
  }, eventBus, model);

  var start = new StartView({
    'section':      $('#div-start'),
    'btnFirstStep': $('#btn-first-step'),
    'width':        500,
    'height':       310
  }, model);

  var speechReminder = new SpeechReminder({
    'speechReminder': $('#ctn-speech-reminder'),
  });
  var step = new StepView({
    'section':            $('#div-step'),

    'btnNext':            $('#btn-next'),
    'btnDelighted':       $('#btn-delighted'),
    'btnConfused':        $('#btn-confused'),
    'btnShowLess':        $('.btn-show-less'),
    'btnShowMore':        $('.btn-show-more'),

    'divDescription':     $('#div-description'),
    'divStepOfText':      $('#div-step-of-text'),
    'divCtnDescription':  $('.ctn-description'),
    'ahrefUrl':           $('#ahref-Url'),
    'titleBar':           $('.titlebar'),

    'width':              400,
    'minHeight':          86
  }, speechReminder, model);

  var finish = new FinishView({
    'section':  $('#div-finish'),
    'progressBar':    $('.progress-bar'),
    'btnProgressPause':  $('#btn-progress-pause'),
    'btnProgressPlay':   $('#btn-progress-play'),
    'width':    400,
    'height':   135
  }, eventBus);

  var alert = new AlertView({
    'divAlert': $('#div-alert')
  }, eventBus);

  var abort = new AbortView({
    'divAbort':       $('#div-abort'),
    'divAborted':     $('#div-aborted'),

    'btnAbort':       $('.titlebar-close-button'),
    'btnAbortYes':    $('#btn-abort-yes'),
    'btnAbortNo':     $('#btn-abort-no'),
    'btnAbortConfirm': $('#btn-abort-confirm'),
  }, eventBus, model);

  var microphoneStatus = new MicrophoneStatus({
    'micLevelBars': $('.titlebar-recording-level div'),
    'divRecording':   $('.titlebar-recording'),
    'recordingTextTime': $('#titlebar-recording-text-time')
  }, eventBus);

  var easyFlow = new EasyFlow({
    'instructions': instructions,
    'selectScreen': selectScreen,
    'start': start,
    'step': step,
    'finish': finish
  }, eventBus);

});
