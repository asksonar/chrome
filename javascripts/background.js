$(function(){

  window.eventBus = new BackgroundEventBus();
  window.ajaxer = new Ajaxer(eventBus, {
    'url': CONFIG.endpointUrl,
    'accessKeyId': CONFIG.s3UploadAccessKeyId,
    'secretAccessKey': CONFIG.s3UploadSecretAccessKey,
    'endpoint': CONFIG.s3UploadEndpoint,
    'bucket': CONFIG.s3UploadBucket
  });

  window.model = new BackgroundModel(eventBus, ajaxer);
  window.controller = new BackgroundController(eventBus, ajaxer, model);
  window.recorder = new RecorderController(eventBus, ajaxer, model, {
    'encoderUrl': '/manifest_encoder.nmf',
    'fps': 10
  });

});
