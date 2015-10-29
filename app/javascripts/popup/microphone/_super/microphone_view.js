function MicrophoneView() {}

MicrophoneView.prototype.startMicrophoneResponse = function($targets) {
  this.stopMicrophoneResponse();

  var responseFunction = function() {
    this.responseLoop = requestAnimationFrame($.proxy(responseFunction, this));

    var now = Date.now();
    var amplitudePercent = this.audioVisualization.getAmplitude() / 255.0;
    if (amplitudePercent < 0.20) {
      this._mostRecentQuietNoise = now;
    } else if (amplitudePercent > 0.70) {
      this._mostRecentLoudNoise = now;
    }

    if (amplitudePercent > 0) {
      this._mostRecentNoise = now;
    }

    var amplitudeScaled = Math.round(amplitudePercent * $targets.length);
    //console.log(new Date().getSeconds() + '.' + new Date().getMilliseconds() + ':' + amplitudeScaled);

    $targets.slice(0, amplitudeScaled).addClass('on');
    $targets.slice(amplitudeScaled).removeClass('on');
  };

  responseFunction.call(this);
};

MicrophoneView.prototype.stopMicrophoneResponse = function() {
  window.cancelAnimationFrame(this.responseLoop);
};

MicrophoneView.prototype.mostRecentLoudNoise = function() {
  return this._mostRecentQuietNoise;
};

MicrophoneView.prototype.mostRecentQuietNoise = function() {
  return this._mostRecentQuietNoise;
};

MicrophoneView.prototype.mostRecentNoise = function() {
  return this._mostRecentNoise;
};
