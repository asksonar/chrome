function SpeechReminder(config) {
  this.$speechReminder = config.speechReminder;
}

SpeechReminder.prototype = Object.create(MicrophoneView.prototype);
SpeechReminder.prototype.constructor = MicrophoneView;

SpeechReminder.prototype.start = function() {
  this.startMicrophoneResponse();
  this.startSpeechReminder();
};

SpeechReminder.prototype.stop = function() {
  this.stopSpeechReminder();
  this.stopMicrophoneResponse();
};

SpeechReminder.prototype.startSpeechReminder = function() {
  // just to reset the starting timer
  this._mostRecentLoudNoise = Date.now(); // TODO: abstract this more neatly

  this.speechReminderLoop = setInterval($.proxy(function() {
    if (this.$speechReminder.queue().length) {
      return;
    }

    if ((Date.now() - this.mostRecentLoudNoise()) > 15000) {
      this.$speechReminder.css({display:'flex'});
    } else {
      this.$speechReminder.css({display:'none'});
    }

  }, this), 250);
};

SpeechReminder.prototype.stopSpeechReminder = function() {
  clearInterval(this.speechReminderLoop);
};
