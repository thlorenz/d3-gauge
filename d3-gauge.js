'use strict';

// heavily inspired by: http://bl.ocks.org/tomerd/1499279

var xtend = require('xtend');
var defaultOpts = require('./defaults/simple');
var d3 = require('d3');

var go = module.exports = Gauge;
var proto = Gauge.prototype;

/**
 * Creates a gauge appended to the given DOM element.
 *
 * Example: 
 *
 * ```js
 *  var simpleOpts = {
 *      size :  100
 *    , min  :  0
 *    , max  :  50 
 *    , transitionDuration : 500
 *
 *    , label                      :  'label.text'
 *    , minorTicks                 :  4
 *    , majorTicks                 :  5
 *    , needleWidthRatio           :  0.6
 *    , needleContainerRadiusRatio :  0.7
 *
 *    , zones: [
 *        { clazz: 'yellow-zone', from: 0.73, to: 0.9 }
 *      , { clazz: 'red-zone', from: 0.9, to: 1.0 }
 *      ]
 *  }
 *  var gauge = Gauge(document.getElementById('simple-gauge'), simpleOpts);
 *  gauge.write(39);
 * ```
 * 
 * @name Gauge
 * @function
 * @param el {DOMElement} to which the gauge is appended
 * @param opts {Object} gauge configuration with the following properties all of which have sensible defaults:
 *  - label {String} that appears in the top portion of the gauge
 *  - clazz {String} class to apply to the gauge element in order to support custom styling
 *  - size {Number} the over all size (radius) of the gauge
 *  - preserveAspectRatio {String} default 'xMinYMin meet', see https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/preserveAspectRatio
 *  - min {Number} the minimum value that the gauge measures
 *  - max {Number} the maximum value that the gauge measures
 *  - majorTicks {Number} the number of major ticks to draw 
 *  - minorTicks {Number} the number of minor ticks to draw in between two major ticks
 *  - needleWidthRatio {Number} tweaks the gauge's needle width
 *  - needleConatinerRadiusRatio {Number} tweaks the gauge's needle container circumference
 *  - transitionDuration {Number} the time in ms it takes for the needle to move to a new position
 *  - zones {Array[Object]} each with the following properties
 *    - clazz {String} class to apply to the zone element in order to style its fill
 *    - from {Number} between 0 and 1 to determine zone's start 
 *    - to {Number} between 0 and 1 to determine zone's end 
 * @return {Object} the gauge with a `write` method
 */
function Gauge (el, opts) {
  if (!(this instanceof Gauge)) return new Gauge(el, opts);

  this._el = el;

  this._opts = xtend(defaultOpts, opts);  

  this._size   =  this._opts.size;
  this._radius =  this._size * 0.9 / 2;

  this._cx     =  this._size / 2;
  this._cy     =  this._cx;

  this._preserveAspectRatio = this._opts.preserveAspectRatio;

  this._min    =  this._opts.min;
  this._max    =  this._opts.max;
  this._range  =  this._max - this._min;

  this._majorTicks = this._opts.majorTicks;
  this._minorTicks = this._opts.minorTicks;

  this._needleWidthRatio = this._opts.needleWidthRatio;
  this._needleContainerRadiusRatio = this._opts.needleContainerRadiusRatio;
  
  this._transitionDuration = this._opts.transitionDuration;
  this._label = this._opts.label;

  this._zones = this._opts.zones || [];

  this._clazz = opts.clazz;

  this._initZones();
  this._render();
}

/**
 * Writes a value to the gauge and updates its state, i.e. needle position, accordingly.
 * @name write
 * @function
 * @param value {Number} the new gauge value, should be in between min and max
 * @param transitionDuration {Number} (optional) transition duration, if not supplied the configured duration is used
 */
proto.write = function(value, transitionDuration) {
  var self = this;

  function transition () {
    var needleValue = value
      , overflow = value > self._max
      , underflow = value < self._min;

         if (overflow)  needleValue = self._max + 0.02 * self._range;
    else if (underflow) needleValue = self._min - 0.02 * self._range;

    var targetRotation = self._toDegrees(needleValue) - 90
      , currentRotation = self._currentRotation || targetRotation;

    self._currentRotation = targetRotation;
    
    return function (step) {
      var rotation = currentRotation + (targetRotation - currentRotation) * step;
      return 'translate(' + self._cx + ', ' + self._cy + ') rotate(' + rotation + ')'; 
    }
  }

  var needleContainer = this._gauge.select('.needle-container');
  
  needleContainer
    .selectAll('text')
    .attr('class', 'current-value')
    .text(Math.round(value));
  
  var needle = needleContainer.selectAll('path');
  needle
    .transition()
    .duration(transitionDuration ? transitionDuration : this._transitionDuration)
    .attrTween('transform', transition);
}
/**
 * Refreshes the zones and the ticks without removing and rendering the whole gauge.
 * This method is meant to be used when your max/min data could change dynamically.
 * @name refreshRange
 * @param maxValue {Number} (optional) Max. Optional only if you would like to go back to _opts.max
 * @param minValue {Number} (optional) Min.
 */
proto.refreshRange = function(maxValue, minValue) {
	this._min = minValue ? minValue : this._opts.min;
	this._max = maxValue ? maxValue : this._opts.max;
	this._range = this._max - this._min;
	
	this._initZones();
	this._drawZones();
	
	this._gauge.select('.major-tick-label[text-anchor="start"]').remove();
	this._gauge.select('.major-tick-label[text-anchor="end"]').remove();
	this._drawTicks();
	
	return this;
};

proto._initZones = function () {
  var self = this;

  function percentToVal (percent) {
    return self._min + self._range * percent;
  }

  function initZone (zone) {
    return { 
        clazz: zone.clazz
      , from: percentToVal(zone.from)
      , to:  percentToVal(zone.to)
    }
  }

  // create new zones to not mess with the passed in args
  this._zones = this._opts.zones.map(initZone);
}

proto._render = function () {
  this._initGauge();
  this._drawOuterCircle();
  this._drawInnerCircle();
  this._drawLabel();

  this._drawZones();
  this._drawTicks();

  this._drawNeedle();
  this.write(this._min, 0);
}

proto._initGauge = function () {
  this._gauge = d3.select(this._el)
    .append('svg:svg')
    .attr('class'  ,  'd3-gauge' + (this._clazz ? ' ' + this._clazz : ''))
    .attr('width'  ,  this._size)
    .attr('height' ,  this._size)
    .attr('viewBox',  '0 0 ' + this._size + ' ' + this._size)
    .attr('preserveAspectRatio', this._preserveAspectRatio || 'xMinYMin meet')
}

proto._drawOuterCircle = function () {
  this._gauge
    .append('svg:circle')
    .attr('class' ,  'outer-circle')
    .attr('cx'    ,  this._cx)
    .attr('cy'    ,  this._cy)
    .attr('r'     ,  this._radius)
}

proto._drawInnerCircle = function () {
  this._gauge
    .append('svg:circle')
    .attr('class' ,  'inner-circle')
    .attr('cx'    ,  this._cx)
    .attr('cy'    ,  this._cy)
    .attr('r'     ,  0.9 * this._radius)
}

proto._drawLabel = function () {
  if (typeof this._label === undefined) return;

  var fontSize = Math.round(this._size / 9);
  var halfFontSize = fontSize / 2;

  this._gauge
    .append('svg:text')
    .attr('class', 'label')
    .attr('x', this._cx)
    .attr('y', this._cy / 2 + halfFontSize)
    .attr('dy', halfFontSize)
    .attr('text-anchor', 'middle')
    .text(this._label)
}

proto._drawTicks = function () {
  var majorDelta = this._range / (this._majorTicks - 1)
    , minorDelta = majorDelta / this._minorTicks
    , point 
    ;

  for (var major = this._min; major <= this._max; major += majorDelta) {
    var minorMax = Math.min(major + majorDelta, this._max);
    for (var minor = major + minorDelta; minor < minorMax; minor += minorDelta) {
      this._drawLine(this._toPoint(minor, 0.75), this._toPoint(minor, 0.85), 'minor-tick');
    }

    this._drawLine(this._toPoint(major, 0.7), this._toPoint(major, 0.85), 'major-tick');

    if (major === this._min || major === this._max) {
      point = this._toPoint(major, 0.63);
      this._gauge
        .append('svg:text')
        .attr('class', 'major-tick-label')
        .attr('x', point.x)
        .attr('y', point.y)
        .attr('text-anchor', major === this._min ? 'start' : 'end')
        .text(major)
    }
  }
}

proto._drawLine = function (p1, p2, clazz) {
  this._gauge
    .append('svg:line')
    .attr('class' ,  clazz)
    .attr('x1'    ,  p1.x)
    .attr('y1'    ,  p1.y)
    .attr('x2'    ,  p2.x)
    .attr('y2'    ,  p2.y)
}

proto._drawZones = function () {
  var self = this;
  function drawZone (zone) {
    self._drawBand(zone.from, zone.to, zone.clazz);
  }

  this._zones.forEach(drawZone);
}

proto._drawBand = function (start, end, clazz) {
  var self = this;

  function transform () {
    return 'translate(' + self._cx + ', ' + self._cy +') rotate(270)';
  }

  var arc = d3.svg.arc()
    .startAngle(this._toRadians(start))
    .endAngle(this._toRadians(end))
    .innerRadius(0.65 * this._radius)
    .outerRadius(0.85 * this._radius)
    ;

  this._gauge
    .append('svg:path')
    .attr('class', clazz)
    .attr('d', arc)
    .attr('transform', transform)
}

proto._drawNeedle = function () {

  var needleContainer = this._gauge
    .append('svg:g')
    .attr('class', 'needle-container');
		
  var midValue = (this._min + this._max) / 2;
  
  var needlePath = this._buildNeedlePath(midValue);
  
  var needleLine = d3.svg.line()
      .x(function(d) { return d.x })
      .y(function(d) { return d.y })
      .interpolate('basis');
  
  needleContainer
    .selectAll('path')
    .data([ needlePath ])
    .enter()
      .append('svg:path')
        .attr('class' ,  'needle')
        .attr('d'     ,  needleLine)
        
  needleContainer
    .append('svg:circle')
    .attr('cx'            ,  this._cx)
    .attr('cy'            ,  this._cy)
    .attr('r'             ,  this._radius * this._needleContainerRadiusRatio / 10)

  // TODO: not styling font-size since we need to calculate other values from it
  //       how do I extract style value?
  var fontSize = Math.round(this._size / 10);
  needleContainer
    .selectAll('text')
    .data([ midValue ])
    .enter()
      .append('svg:text')
        .attr('x'             ,  this._cx)
        .attr('y'             ,  this._size - this._cy / 4 - fontSize)
        .attr('dy'            ,  fontSize / 2)
        .attr('text-anchor'   ,  'middle')
}

proto._buildNeedlePath = function (value) {
  var self = this;

  function valueToPoint(value, factor) {
    var point = self._toPoint(value, factor);
    point.x -= self._cx;
    point.y -= self._cy;
    return point;
  }

  var delta = this._range * this._needleWidthRatio / 10
    , tailValue = value - (this._range * (1/ (270/360)) / 2)

  var head = valueToPoint(value, 0.85)
    , head1 = valueToPoint(value - delta, 0.12)
    , head2 = valueToPoint(value + delta, 0.12)
  
  var tail = valueToPoint(tailValue, 0.28)
    , tail1 = valueToPoint(tailValue - delta, 0.12)
    , tail2 = valueToPoint(tailValue + delta, 0.12)
  
  return [head, head1, tail2, tail, tail1, head2, head];
}

proto._toDegrees = function (value) {
  // Note: tried to factor out 'this._range * 270' but that breaks things, most likely due to rounding behavior
  return value / this._range * 270 - (this._min / this._range * 270 + 45);
}

proto._toRadians = function (value) {
  return this._toDegrees(value) * Math.PI / 180;
}

proto._toPoint = function (value, factor) {
  var len = this._radius * factor;
  var inRadians = this._toRadians(value);
  return {
    x: this._cx - len * Math.cos(inRadians),
    y: this._cy - len * Math.sin(inRadians)
  };
}
