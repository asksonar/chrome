function MicrophoneCheck(config) {
  this.config = config;
}

MicrophoneCheck.prototype = Object.create(MicrophoneView.prototype);
MicrophoneCheck.prototype.constructor = MicrophoneCheck;

MicrophoneCheck.prototype.init = function() {
  this.$micCheck = this.config.micCheck
  this.$micCheckBars = this.config.micCheckBars;
  this.$micCheckText = this.config.micCheckText;

  this.privateEventBus = $({});
};

MicrophoneCheck.prototype.on = function() {
  this.privateEventBus.on.apply(this.privateEventBus, arguments);
};

MicrophoneCheck.prototype.start = function() {
  this.startMicrophoneResponse(this.$micCheckBars);
  this.startMicCheck();
};

MicrophoneCheck.prototype.stop = function() {
  this.stopMicrophoneResponse();
  this.stopMicCheck();
};

MicrophoneView.prototype.startMicCheck = function() {
  this.stopMicCheck();

  this.micCheckStartTime = Date.now();

  var micCheckFunction = function() {
    var micCheckAge = Date.now() - this.micCheckStartTime;

    if (this.recordingHeardTriggered !== true && this.mostRecentNoise()) {
      this.privateEventBus.trigger('recordingHeard');
      this.recordingHeardTriggered = true;
    }

    if (!this.mostRecentNoise() && micCheckAge > 5000) {
      this.$micCheckText.html("Sorry, we can't quite hear you.  Is your mic on?");
      this.$micCheck.addClass('color-confused').removeClass('color-delighted');
      this.$micCheckText.addClass('color-confused').removeClass('color-delighted');

    } else if (!this.mostRecentLoudNoise() && micCheckAge > 5000) {
      this.$micCheckText.html("Sorry, we can't quite hear you.  Could you speak up a bit?");
      this.$micCheck.addClass('color-confused').removeClass('color-delighted');
      this.$micCheckText.addClass('color-confused').removeClass('color-delighted');

    } else if ((Date.now() - this.mostRecentQuietNoise()) > 2000 && micCheckAge > 2000) {
      this.$micCheckText.html("We suggest moving somewhere with less background noise.");
      this.$micCheck.addClass('color-confused').removeClass('color-delighted');
      this.$micCheckText.addClass('color-confused').removeClass('color-delighted');

    } else if (!this.mostRecentLoudNoise()) {
      this.$micCheckText.html("Mic check!  Try talking out loud to get started.");

    } else if (this.mostRecentNoise()) {
      this.$micCheckText.html("Your audio checks out.  Let's get started.");
      this.$micCheck.addClass('color-delighted').removeClass('color-confused');
      this.$micCheckText.addClass('color-delighted').removeClass('color-confused');
    }
  };

  this.micCheckLoop = setInterval($.proxy(micCheckFunction, this), 500);
};

MicrophoneView.prototype.stopMicCheck = function() {
  clearInterval(this.micCheckLoop);
};
