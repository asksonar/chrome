function MicrophoneStatus(config) {
  this.config = config;
}

MicrophoneStatus.prototype = Object.create(MicrophoneView.prototype);
MicrophoneStatus.prototype.constructor = MicrophoneStatus;

MicrophoneStatus.prototype.init = function(eventBus) {
  this.$micLevelBars = this.config.micLevelBars;
  this.$divRecording = this.config.divRecording;
  this.$recordingTextTime = this.config.recordingTextTime;

  this.eventBus = eventBus;

  this.initHandlers();
};

MicrophoneStatus.prototype.initHandlers = function() {
  this.eventBus.on('recordingStarted', this.onRecordingStarted, this);
  this.eventBus.on('recordingStopped', this.onRecordingStopped, this);
  this.eventBus.on('recordingFailure', this.onRecordingFailure, this);

  this.eventBus.on('pauseRecording', this.onPauseRecording, this);
  this.eventBus.on('resumeRecording', this.onResumeRecording, this);
  this.eventBus.on('muteRecording', this.onMuteRecording, this);
  this.eventBus.on('unmuteRecording', this.onUnmuteRecording, this);
};

MicrophoneStatus.prototype.onPauseRecording = function() {
  this.stopRecordingTextTime();
  this.$divRecording.removeClass('on').addClass('off');
};

MicrophoneStatus.prototype.onResumeRecording = function() {
  this.startRecordingTextTime();
  this.$divRecording.removeClass('off').addClass('on');
};

MicrophoneStatus.prototype.onMuteRecording = function() {
  this.stopMicrophoneResponse();
  this.$divRecording.addClass('muted');
};

MicrophoneStatus.prototype.onUnmuteRecording = function() {
  this.startMicrophoneResponse(this.$micLevelBars);
  this.$divRecording.removeClass('muted');
};

MicrophoneStatus.prototype.onRecordingStarted = function(event, eventData) {
  this.start();
};

MicrophoneStatus.prototype.onRecordingStopped = function(event, eventData) {
  this.stop();
};

MicrophoneStatus.prototype.onRecordingFailure = function(event, eventData) {
  this.stop();
};

MicrophoneStatus.prototype.start = function() {
  this.startMicrophoneResponse(this.$micLevelBars);
  this.$recordingTextTime.html('00:00');
  this.startRecordingTextTime();
  this.$divRecording.removeClass('off').addClass('on');
};

MicrophoneStatus.prototype.stop = function() {
  this.stopMicrophoneResponse();
  this.stopRecordingTextTime();
  this.$divRecording.removeClass('on').addClass('off');
};

MicrophoneStatus.prototype.startRecordingTextTime = function() {
  this.stopRecordingTextTime();

  var timeUpdateFunction = function() {
    var timeText = this.$recordingTextTime.html();
    var minsText = parseInt(timeText.split(":")[0]);
    var secsText = parseInt(timeText.split(":")[1]);

    secsText += 1;
    if (secsText == 60) {
      minsText += 1;
      secsText = 0;
    }
    this.$recordingTextTime.html(
      ('00' + minsText).slice(-2) + ':' + ('00' + secsText).slice(-2)
    );
  };

  this.recordingTextTimeUpdate = setInterval($.proxy(timeUpdateFunction, this), 1000);
};

MicrophoneStatus.prototype.stopRecordingTextTime = function() {
  clearInterval(this.recordingTextTimeUpdate);
};
