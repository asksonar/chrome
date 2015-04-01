/*
Copyright 2014 Intel Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

Author: Dongseong Hwang (dongseong.hwang@intel.com)
*/

/**
 * Grabs the desktop capture feed from the browser, requesting
 * desktop capture. Requires the permissions
 * for desktop capture to be set in the manifest.
 *
 * @see https://developer.chrome.com/apps/desktopCapture
 */
var MARGIN = 10;
var WIDTH = 400;
var HEIGHT = 125;
var MINIMIZE_HEIGHT = 32;

/*
var ws = new WebSocket("ws://localhost:5000/");
ws.onopen = function(param) {
  debugger;
}
ws.onclose = function(param) {
  debugger;
}
ws.onmessage = function(param) {
  debugger;
}
ws.ononerror = function(param) {
  debugger;
}
*/


var port = chrome.runtime.connect({name: "sonar"});
port.onMessage.addListener(function(msg) {
  if (msg.command == 'started') {
    started();
  } else if (msg.command == 'stopped') {
    stopped();
  } else if (msg.command == 'closed') {
    closed();
  }
});

var currentStep = 0;
var userScenario;


$('#div-next').hide();
$('#div-finish').hide();
$('.top-titlebar-recording').hide();

function resizeWindowToFit() {
  chrome.app.window.current().outerBounds.height = $('#div-buttons').outerHeight(true) + $('#div-description').outerHeight(true) + $('#top-titlebar').outerHeight(true)
}

function getUserScenarioUUID() {
  return window.document.location.search.substring('?userScenarioUUID='.length);
}

chrome.storage.local.get(getUserScenarioUUID(), function(items) {
  userScenario = items[getUserScenarioUUID()];
  $('#div-description').html(userScenario.description);
  resizeWindowToFit();
});

function getUserScenario() {
  return userScenario;
}

function getCurrentStep() {
  if (currentStep >= userScenario.steps.length) {
    return null;
  } else {
    return userScenario.steps[currentStep];
  }
}

$('.top-titlebar-close-button').click(function(){
  port.postMessage({
    'command': 'close',
    'userScenarioUUID': getUserScenarioUUID(),
    'currentStep': getCurrentStep()
  });
});

function isMinimized() {
  return $('#top-titlebar').hasClass('minimized');
}

function restore() {
  $('#top-titlebar').removeClass('minimized');
  chrome.app.window.current().outerBounds.height = HEIGHT;
}

function minimize() {
  $('#top-titlebar').addClass('minimized');
  chrome.app.window.current().outerBounds.height = MINIMIZE_HEIGHT;
}

$('.top-titlebar-minimize-button').click(function(){
  if(isMinimized()) {
    restore();
  } else {
    minimize();
  }
  return false;
})

$('#btn-start').click(function(){
  port.postMessage({
    'command': 'start',
    'userScenarioUUID': getUserScenarioUUID(),
    'currentStep': getCurrentStep()
  });
});

$('#btn-delighted').click(function(){
  console.log('=)');
});

$('#btn-confused').click(function(){
  console.log('=(');
});

$('#btn-next').click(function(){
  currentStep += 1;
  var step = getCurrentStep();
  if (step == null) {
    port.postMessage({
      'command': 'finish',
      'userScenarioUUID': getUserScenarioUUID(),
      'currentStep': getCurrentStep()
    });
    finish();
  } else {
    port.postMessage({
      'command': 'next',
      'userScenarioUUID': getUserScenarioUUID(),
      'currentStep': getCurrentStep()
    });
    next();
  }
});

function started() {
  $('.top-titlebar-recording').show();
  $('#div-start').hide();
  $('#div-next').show();
  currentStep = 0;
  $('#div-description').html(getCurrentStep().description).css('opacity', 0).fadeTo('slow', 1);
  resizeWindowToFit();
}

function stopped() {
  $('.top-titlebar-recording').hide();
}

function closed() {
  window.close();
}

function next() {
  $('#div-description').html(getCurrentStep().description).css('opacity', 0).fadeTo('slow', 1);
  resizeWindowToFit();
}

function finish() {
  $('#div-description').html('Thanks for helping out!').css('opacity', 0).fadeTo('slow', 1)
  $('#div-next').hide();
  $("#div-finish").show();
}

$('#btn-close').click(function() {
  closed();
});


