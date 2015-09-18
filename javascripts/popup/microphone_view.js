function MicrophoneView(eventBus, config) {
  this.eventBus = eventBus;

  this.$micCheck = config.micCheck
  this.$micCheckBars = config.micCheckBars;
  this.$micCheckText = config.micCheckText;
  this.$micLevelBars = config.micLevelBars;

  this.$divRecording = config.divRecording;
  this.$recordingTextTime = config.recordingTextTime;
  this.$speechReminder = config.speechReminder;

  this.init();
  this.initHandlers();
}

MicrophoneView.prototype.init = function() {
  this.mostRecentLoudNoise = null;
  this.mostRecentQuietNoise = null;
  this.hasNoise = null;

  this.audioVisualization = new AudioVisualization(-60, -25);
  this.audioVisualization.start();
  this.startMicCheck();
}

MicrophoneView.prototype.initHandlers = function() {
  this.eventBus.on('recordingStarted', this.onRecordingStarted, this);
  this.eventBus.on('recordingStopped', this.onRecordingStopped, this);
  this.eventBus.on('recordingFailure', this.onRecordingFailure, this);
}

MicrophoneView.prototype.onRecordingStarted = function() {
  this.stopMicCheck();
  this.startRecordingText();
}

MicrophoneView.prototype.onRecordingStopped = function() {
  this.stopRecordingText();
}

MicrophoneView.prototype.onRecordingFailure = function() {
  this.onRecordingStopped();
  // if going back to the instructions page...
  this.startMicCheck();
}

MicrophoneView.prototype.startMicrophoneResponse = function($targets) {
  this.stopMicrophoneResponse();

  var responseFunction = function() {
    this.responseLoop = requestAnimationFrame($.proxy(responseFunction, this));

    var amplitudePercent = this.audioVisualization.getAmplitude() / 255.0;
    if (amplitudePercent < .20) {
      this.mostRecentQuietNoise = Date.now();
    } else if (amplitudePercent > .70) {
      this.mostRecentLoudNoise = Date.now();
    }

    if (amplitudePercent > 0) {
      this.hasNoise = true;
    }

    var amplitudeScaled = Math.round(amplitudePercent * $targets.length);
    //console.log(new Date().getSeconds() + '.' + new Date().getMilliseconds() + ':' + amplitudeScaled);

    $targets.slice(0, amplitudeScaled).addClass('on');
    $targets.slice(amplitudeScaled).removeClass('on');
  }

  responseFunction.call(this);
}

MicrophoneView.prototype.stopMicrophoneResponse = function() {
  window.cancelAnimationFrame(this.responseLoop);
}

MicrophoneView.prototype.startMicCheck = function() {
  this.micCheckStartTime = Date.now();

  this.startMicrophoneResponse(this.$micCheckBars);
  this.micCheckLoop = setInterval($.proxy(function() {
    var micCheckAge = Date.now() - this.micCheckStartTime;

    if (this.recordingHeardTriggered !== true && this.hasNoise) {
      this.eventBus.trigger('recordingHeard');
      this.recordingHeardTriggered = true;
    }

    if (!this.hasNoise && micCheckAge > 5000) {
      this.$micCheckText.html("Sorry, we can't quite hear you.  Is your mic on?");
      this.$micCheck.addClass('color-confused').removeClass('color-delighted');
      this.$micCheckText.addClass('color-confused').removeClass('color-delighted');

    } else if (!this.mostRecentLoudNoise && micCheckAge > 5000) {
      this.$micCheckText.html("Sorry, we can't quite hear you.  Could you speak up a bit?");
      this.$micCheck.addClass('color-confused').removeClass('color-delighted');
      this.$micCheckText.addClass('color-confused').removeClass('color-delighted');

    } else if ((Date.now() - this.mostRecentQuietNoise) > 2000 && micCheckAge > 2000) {
      this.$micCheckText.html("We suggest moving somewhere with less background noise.");
      this.$micCheck.addClass('color-confused').removeClass('color-delighted');
      this.$micCheckText.addClass('color-confused').removeClass('color-delighted');

    } else if (!this.mostRecentLoudNoise) {
      this.$micCheckText.html("Mic check!  Try talking out loud to get started.");

    } else {
      this.$micCheckText.html("Your audio checks out.  Let's get started.");
      this.$micCheck.addClass('color-delighted').removeClass('color-confused');
      this.$micCheckText.addClass('color-delighted').removeClass('color-confused');
    }

  }, this), 500);
}

MicrophoneView.prototype.stopMicCheck = function() {
  clearInterval(this.micCheckLoop);
  this.stopMicrophoneResponse();
}

MicrophoneView.prototype.startRecordingText = function() {
  this.startMicrophoneResponse(this.$micLevelBars);
  this.startRecordingTextTime();
  this.startSpeechReminder();
  this.$divRecording.removeClass('off').addClass('on');
}

MicrophoneView.prototype.stopRecordingText = function() {
  this.stopMicrophoneResponse();
  this.stopSpeechReminder();
  this.stopRecordingTextTime();
  this.stopSpeechReminder();
  this.$divRecording.removeClass('on').addClass('off');
}

MicrophoneView.prototype.startRecordingTextTime = function() {
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
  }
  this.recordingTextTimeUpdate = setInterval($.proxy(timeUpdateFunction, this), 1000);
}

MicrophoneView.prototype.stopRecordingTextTime = function() {
  clearInterval(this.recordingTextTimeUpdate);
}

MicrophoneView.prototype.startSpeechReminder = function() {
  // just to reset the starting timer
  this.mostRecentLoudNoise = Date.now();

  this.speechReminderLoop = setInterval($.proxy(function() {
    if (this.$speechReminder.queue().length) {
      return;
    }

    if ((Date.now() - this.mostRecentLoudNoise) > 15000) {
      this.$speechReminder.css({display:'flex'});
    } else {
      this.$speechReminder.css({display:'none'});
    }

  }, this), 250);
}


MicrophoneView.prototype.stopSpeechReminder = function() {
  clearInterval(this.speechReminderLoop);
}
