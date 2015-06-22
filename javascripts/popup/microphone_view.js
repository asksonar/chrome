function MicrophoneView(eventBus, config) {
  this.eventBus = eventBus;

  this.$micCheck = config.micCheck
  this.$micCheckBars = config.micCheckBars;
  this.$micCheckText = config.micCheckText;
  this.$micLevelBars = config.micLevelBars;

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

MicrophoneView.prototype.startMicCheck = function() {
  this.micCheckStartTime = Date.now();

  this.startMicrophoneResponse(this.$micCheckBars);
  this.micCheckLoop = setInterval($.proxy(function() {
    var micCheckAge = Date.now() - this.micCheckStartTime;

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
      this.$micCheckText.html("Testing, testing, 1 2 3.  Try talking into the mic.");

    } else {
      this.eventBus.trigger('recordingHeard');
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

MicrophoneView.prototype.onRecordingStarted = function() {
  this.stopMicCheck();
  this.startMicrophoneResponse(this.$micLevelBars);
}

MicrophoneView.prototype.onRecordingStopped = function() {
  this.stopMicrophoneResponse();
}

MicrophoneView.prototype.onRecordingFailure = function() {
  this.stopMicrophoneResponse();
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
