function Ajaxer(eventBus, config) {
  this.eventBus = eventBus;
  this.url = config.url

  this.init();
}

Ajaxer.prototype.init = function() {
}

Ajaxer.prototype.send = function(command, params, blob, callback) {
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
  }).done(function(response){
    console.log('Delivered message: ' + command);
    console.log(params);
    if (callback) {
      callback(response);
    }
  }).fail(function(){
    console.log('Failed message: ' + command);
    console.log(params);
  });
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

Ajaxer.prototype.finishVideo = function(scenarioResultHashId, steps, callback) {
  this.send('video.finish', {
    'scenarioResultHashId': scenarioResultHashId,
    'steps': steps
  }, null, callback);
}

Ajaxer.prototype.uploadVideo = function(uuid, file) {
  var s3 = new AWS.S3({
    'accessKeyId': 'AKIAJ2I34IB32N2LZWGA',
    'secretAccessKey': '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',
    'endpoint': 'http://s3-us-west-1.amazonaws.com'
  });

  var params = {Bucket: 'upload.videos.asksonar', Key: uuid, Body: file};
  var managedUpload = s3.upload(params, $.proxy(this.uploadFinish, this));

  managedUpload.on('httpUploadProgress', $.proxy(this.uploadProgress, this));
}

Ajaxer.prototype.uploadProgress = function (event) {
  if (event.lengthComputable) {
    this.eventBus.trigger('uploadProgress',
      {percentage: event.loaded / event.total * 100}
    );
  }
}

Ajaxer.prototype.uploadFinish = function(err, data) {
  if (err) {
    console.log(err);
  } else {
    this.send('video.upload', {'uuid': data.Location.split('/').pop() });
    this.eventBus.trigger('uploadFinish');
  }
}
