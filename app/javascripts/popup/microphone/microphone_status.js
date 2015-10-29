function MicrophoneStatus() {
  this.$micLevelBars = config.micLevelBars;
  this.$divRecording = config.divRecording;
  this.$recordingTextTime = config.recordingTextTime;
}

MicrophoneStatus.prototype.init = function() {
  this.audioVisualization = new AudioVisualization(-60, -25);
  this.audioVisualization.start();
};

MicrophoneStatus.prototype.initHandlers = function() {
  this.eventBus.on('recordingStarted', this.onRecordingStarted, this);
  this.eventBus.on('recordingStopped', this.onRecordingStopped, this);
  this.eventBus.on('recordingFailure', this.onRecordingFailure, this);
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

  this.$recordingTextTime.html('00:00');

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
