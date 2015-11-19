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
  this.timeLength += Date.now() - this.startTime;
  this.stopRecordingTextTime();
  this.$divRecording.removeClass('on').addClass('off');
};

MicrophoneStatus.prototype.onResumeRecording = function() {
  this.startTime = Date.now();
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
  this.startTime = Date.now();
  this.timeLength = 0;
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
    var timeSeconds = (Date.now() - this.startTime + this.timeLength) / 1000.0;
    var minsText = parseInt(timeSeconds / 60);
    var secsText = parseInt(timeSeconds % 60);

    this.$recordingTextTime.html(
      ('00' + minsText).slice(-2) + ':' + ('00' + secsText).slice(-2)
    );
  };
  timeUpdateFunction.call(this);

  this.recordingTextTimeUpdate = setInterval(timeUpdateFunction.bind(this), 1000);
};

MicrophoneStatus.prototype.stopRecordingTextTime = function() {
  clearInterval(this.recordingTextTimeUpdate);
};
