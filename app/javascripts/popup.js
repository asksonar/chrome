$(function(){
  window.eventBus = new PopupEventBus();
  window.model = new PopupModel(eventBus);

  window.microphoneCheck = new MicrophoneCheck({
      'micCheck':     $('.mic-check'),
      'micCheckBars': $('.mic-check div'),
      'micCheckText': $('#div-mic-check-text')
    });
  window.instructions = new InstructionsView({
    'section':  $('#div-instructions'),
    'width':    500,
    'height':   310,
    'btnStart': $('#btn-start')
  }, microphoneCheck);

  window.selectScreen = new SelectScreenView({
    'section':  $('#div-select-screen'),
    'width':    400,
    'height':   135
  }, eventBus, model);

  window.start = new StartView({
    'section':      $('#div-start'),
    'btnFirstStep': $('#btn-first-step'),
    'width':        500,
    'height':       310
  }, model);

  window.step = new StepView({
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

    'speechReminder': $('#ctn-speech-reminder'),

    'width':              400,
    'minHeight':          86
  }, model);

  window.finish = new FinishView({
    'section':  $('#div-finish'),
    'progressBar':    $('.progress-bar'),
    'btnProgressPause':  $('#btn-progress-pause'),
    'btnProgressPlay':   $('#btn-progress-play'),
    'width':    400,
    'height':   135
  }, eventBus);

  // window.control = new ControlView({

  // });

  // window.finishWithTitle = new FinishWithTitleView({

  // });

  window.alert = new AlertView({
    'divAlert': $('#div-alert')
  }, eventBus);

  window.abort = new AbortView({
    'divAbort':       $('#div-abort'),
    'divAborted':     $('#div-aborted'),

    'btnAbort':       $('.titlebar-close-button'),
    'btnAbortYes':    $('#btn-abort-yes'),
    'btnAbortNo':     $('#btn-abort-no'),
    'btnAbortConfirm': $('#btn-abort-confirm'),
  }, eventBus, model);

  window.microphoneStatus = new MicrophoneStatus({
    'micLevelBars': $('.titlebar-recording-level div'),
    'divRecording':   $('.titlebar-recording'),
    'recordingTextTime': $('#titlebar-recording-text-time')
  }, eventBus);

  window.easyFlow = new EasyFlow({
    'instructions': instructions,
    'selectScreen': selectScreen,
    'start': start,
    'step': step,
    'finish': finish
  }, eventBus);

  // window.expertFlow = new ExpertFlow({
  //   'selectScreen': selectScreen,
  //   'control': control,
  //   'finish': finish
  // }, eventBus);

});
