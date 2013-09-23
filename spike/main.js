'use strict';

// heavily inspired by: http://bl.ocks.org/tomerd/1499279

var xtend = require('xtend');
var d3 = require('d3');

var defaultOpts = {
    size :  250
  , min  :  0
  , max  :  100
  , majorTicks : 5
  , minorTicks : 2
  , transitionDuration : 500

  , outer  :  {
        fill        :  '#ccc'
      , stroke      :  '#000'
      , strokeWidth :  '0.5px'
    }

  , inner  :  {
        fill        :  '#fff'
      , stroke      :  '#E0E0E0'
      , strokeWidth :  '2px'
    }
  , label : {
        text: 'Memory'
      , fill: '#333'
    }
}

var go = module.exports = Gauge;
var proto = Gauge.prototype;

function Gauge (el, opts) {
  if (!(this instanceof Gauge)) return new Gauge(el, opts);

  this._el = el;

  this._opts = xtend(defaultOpts, opts);  

  this._size   =  this._opts.size;
  this._radius =  this._size * 0.9 / 2;
  this._cx     =  this._size / 2;
  this._cy     =  this._cx;
  this._min    =  this._opts.min;
  this._max    =  this._opts.max;
  this._range  =  this._max - this._min;
  this._outer  =  this._opts.outer;
  this._inner  =  this._opts.inner;

  // TODO: just pass percent i.e. 0.7 - 1.0
  this._greenZone = this._opts.greenZone || {
      from  :  this._min + this._range * 0.75
    , to    :  this._min + this._range * 0.9
    , color :  '##109618'
  }


  this._initGauge();
  this._drawOuterCircle();
  this._drawInnerCircle();
  this._drawLabel();
  this._drawZones();
}

proto._initGauge = function () {
  this._gauge = d3.select(this._el)
    .append('svg:svg')
    .attr('class', 'd3-gauge')
    .attr('width', this._size)
    .attr('height', this._size)
}

proto._drawOuterCircle = function () {
  this._gauge
    .append('svg:circle')
    .attr('cx'            ,  this._cx)
    .attr('cy'            ,  this._cy)
    .attr('r'             ,  this._radius)
    .style('fill'         ,  this._outer.fill)
    .style('stroke'       ,  this._outer.stroke)
    .style('stroke-width' ,  this._outer.strokeWidth)
}

proto._drawInnerCircle = function () {
  this._gauge
    .append('svg:circle')
    .attr('cx'            ,  this._cx)
    .attr('cy'            ,  this._cy)
    .attr('r'             ,  0.9 * this._radius)
    .style('fill'         ,  this._inner.fill)
    .style('stroke'       ,  this._inner.stroke)
    .style('stroke-width' ,  this._inner.strokeWidth)
}

proto._drawLabel = function () {
  var labelOpts = this._opts.label;
  if (typeof labelOpts === undefined) return;

  var fontSize = labelOpts.fontSize || Math.round(this._size / 9);
  var halfFontSize = fontSize / 2;

  this._gauge
    .append('svg:text')
    .attr('x', this._cx)
    .attr('y', this._cy / 2 + halfFontSize)
    .attr('dy', halfFontSize)
    .attr('text-anchor', 'middle')
    .text(labelOpts.text)
    .style('font-size', fontSize + 'px')
    .style('fill', labelOpts.fill)
}

proto._drawZones = function () {
  if (this._greenZone) this._drawBand(this._greenZone.from, this._greenZone.to, this._greenZone.color);
}

proto._drawBand = function (start, end, color) {

  function transform () {
    return 'translate(' + this._cx + ', ' + this._cy +') rotate(270)';
  }

  var arc = d3.svg.arc()
    .startAngle(this._toRadians(start))
    .endAngle(this._toRadians(end))
    .innerRadius(0.65 * this._radius)
    .outerRadius(0.85 * this._radius)
    ;

  this._gauge
    .append('svg:path')
    .style('fill', color)
    .attr('d', arc)
    .attr('transform', transform)
}

proto._toDegrees =  function (value) {
  var threeFourthCircle = this._range * 270;
  return value / threeFourthCircle - (this._min / threeFourthCircle + 45);
}

proto._toRadians = function (value) {
  return this._toDegrees(value) * Math.PI / 180;
}

// Test

var el = document.createElement('div');
document.body.appendChild(el);
go(el);
