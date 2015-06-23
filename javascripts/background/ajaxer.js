function Ajaxer(eventBus, config) {
  this.eventBus = eventBus;
  this.url = config.url

  this.init();
}

Ajaxer.prototype.init = function() {
}

Ajaxer.prototype.send = function(command, params, blob) {
  var formData = new FormData();
  formData.append('params', JSON.stringify(params));
  if (blob) {
    formData.append('dataBinary', blob);
    formData.append('dataMimeType', blob.type);
  }

  $.ajax({
    url: this.url + command,
    data: formData,
    cache: false,
    contentType: false,
    processData: false,
    type: 'POST'
  }).done(function(){
    console.log('Delivered message: ' + command);
    console.log(params);
  }).fail(function(){
    console.log('Failed message: ' + command);
    console.log(params);
  }).always($.proxy(function() {
    if (blob) {
      this.uploadFinish();
    }
  }, this));
}

Ajaxer.prototype.uploadProgress = function (event) {
  if (event.lengthComputable) {
    this.eventBus.trigger('uploadProgress',
      {percentage: event.loaded / event.total * 100}
    );
  }
}

Ajaxer.prototype.uploadFinish = function() {
  this.eventBus.trigger('uploadFinish');
}

Ajaxer.prototype.notifyStart = function(scenarioResultHashId) {
  this.send('data.start', {
    'scenarioResultHashId': scenarioResultHashId
  });
}

Ajaxer.prototype.notifyFinish = function(scenarioResultHashId) {
  this.send('data.finish', {
    'scenarioResultHashId': scenarioResultHashId
  });
}

Ajaxer.prototype.notifyAbort = function(scenarioResultHashId) {
  this.send('data.abort', {
    'scenarioResultHashId': scenarioResultHashId
  });
}

Ajaxer.prototype.notifyStep = function(resultStep) {
  this.send('data.step', {
    'step': resultStep
  });
}

Ajaxer.prototype.uploadVideo = function(scenarioResultHashId, steps, file) {
  this.send('video.finish', {
    'scenarioResultHashId': scenarioResultHashId,
    'steps': steps
  }, file);
}
