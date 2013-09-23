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

  this.el = el;

  this.opts = xtend(defaultOpts, opts);  

  this.size   =  this.opts.size;
  this.radius =  this.size * 0.9 / 2;
  this.cx     =  this.size / 2;
  this.cy     =  this.cx;
  this.min    =  this.opts.min;
  this.max    =  this.opts.max;
  this.range  =  this.max - this.min;
  this.outer  =  this.opts.outer;

  // TODO: just pass percent i.e. 0.7 - 1.0
  this.greenZone = this.opts.greenZone || {
      from  :  this.min + this.range * 0.75
    , to    :  this.min + this.range * 0.9
    , color :  '##109618'
  }


  this.init();
  this.outerCircle();
  // continue with prototype


}

proto.init = function () {
  this.gauge = d3.select(this.el)
    .append('svg:svg')
    .attr('class', 'd3-gauge')
    .attr('width', this.size)
    .attr('height', this.size)
}

proto.outerCircle = function () {
  this.gauge
    .append('svg:circle')
    .attr('cx'            ,  this.cx)
    .attr('cy'            ,  this.cy)
    .attr('r'             ,  this.radius)
    .style('fill'         ,  this.outer.fill)
    .style('stroke'       ,  this.outer.stroke)
    .style('stroke-width' ,  this.outer.strokeWidth)
}


// Test

var el = document.createElement('div');
document.body.appendChild(el);
go(el);
