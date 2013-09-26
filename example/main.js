'use strict';

var gauge = require('../')
  , xtend = require('xtend')
  , small = require('../defaults/small')
  , simple = require('../defaults/simple')
  , gauges = [];

function createGauge (opts) {
  var el = document.createElement('div');
  el.setAttribute('class', 'gauge-container');
  document.body.appendChild(el);
  var g = gauge(el, opts);
  g.currentValue = g._range / 2;
  gauges.push(g);
}

function getRandomNextValue(gauge) {
  gauge.currentValue += (Math.random() - 0.5) * gauge._range / 10; 
  return gauge.currentValue;
}

function updateGauges() {
  gauges.forEach(function (gauge) {
    gauge.redraw(getRandomNextValue(gauge));
  });
}

createGauge({ clazz: 'simple', label:  'Main Mem' });
createGauge(xtend(small, { clazz: 'small', label: 'Proc Mem' }));

setInterval(updateGauges, 500);
