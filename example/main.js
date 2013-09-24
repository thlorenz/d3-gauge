'use strict';

var gauge = require('../')
  , deepXtend = require('deep-extend')
  , small = require('../defaults/small')
  , simple = require('../defaults/simple');

function smallGauge () {
  var smallEl = document.createElement('div');
  document.body.appendChild(smallEl);
  gauge(smallEl, deepXtend(small, { label: { text: 'Proc Mem' } }));
}

function simpleGauge () {
  var simpleEl = document.createElement('div');
  document.body.appendChild(simpleEl);
  gauge(simpleEl, { label: { text: 'Main Mem' } });
}

simpleGauge();
smallGauge();
