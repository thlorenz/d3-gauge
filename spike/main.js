'use strict';

// heavily inspired by: http://bl.ocks.org/tomerd/1499279

var d3 = require('d3');

var el = document.createElement('div');
document.body.appendChild(el);

var opts = {
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


var radius = opts.size * 0.9 / 2;
var cx = opts.size / 2;
var cy = cx;
var range = opts.max - opts.min;

// TODO: just pass percent i.e. 0.7 - 1.0
var greenZone = opts.greenZone || {
    from  :  opts.min + range * 0.75
  , to    :  opts.min + range * 0.9
  , color :  '##109618'
}

var gauge = window.g = d3.select(el)
    .append('svg:svg')
    .attr('class', 'gauge')
    .attr('width', opts.size)
    .attr('height', opts.size)
    ;

  (function outerCircle (gauge, cx, cy, radius, outer) {
    gauge
      .append('svg:circle')
      .attr('cx'            ,  cx)
      .attr('cy'            ,  cy)
      .attr('r'             ,  radius)
      .style('fill'         ,  outer.fill)
      .style('stroke'       ,  outer.stroke)
      .style('stroke-width' ,  outer.strokeWidth)
  })(gauge, cx, cy, radius, opts.outer);

  (function innerCircle (gauge, cx, cy, radius, inner) {
    gauge
      .append('svg:circle')
      .attr('cx'            ,  cx)
      .attr('cy'            ,  cy)
      .attr('r'             ,  0.9 * radius)
      .style('fill'         ,  inner.fill)
      .style('stroke'       ,  inner.stroke)
      .style('stroke-width' ,  inner.strokeWidth)
  })(gauge, cx, cy, radius, opts.inner);

  function toDegrees (value, min, range) {
    var threeFourthCircle = range * 270;
    return value / threeFourthCircle - (min / threeFourthCircle + 45);
  }

  function toRadians (value, min, range) {
    return toDegrees(value, min, range) * Math.PI / 180;
  }

  function drawBand (gauge, cx, cy, radius, min, start, end, color) {
    function transform () {
      return 'translate(' + cx + ', ' + cy +') rotate(270)';
    }

    var arc = d3.svg.arc()
      .startAngle(toRadians(start, min, range))
      .endAngle(toRadians(end, min, range))
      .innerRadius(0.65 * radius)
      .outerRadius(0.85 * radius)
      ;

    gauge
      .append('svg:path')
      .style('fill', color)
      .attr('d', arc)
      .attr('transform', transform)
      
  }

  (function zones (gauge, cx, cy, radius, min, greenZone) {
    console.log(greenZone)
    drawBand(gauge, cx, cy, radius, min, greenZone.from, greenZone.to, greenZone.color);
  })(gauge, cx, cy, radius, opts.min, greenZone);


  if (typeof opts.label !== undefined) {
    (function label (gauge, size, labelOpts) {
      var fontSize = labelOpts.fontSize || Math.round(size / 9);
      var halfFontSize = fontSize / 2;
      gauge
        .append('svg:text')
        .attr('x', cx)
        .attr('y', cy / 2 + halfFontSize)
        .attr('dy', halfFontSize)
        .attr('text-anchor', 'middle')
        .text(labelOpts.text)
        .style('font-size', fontSize + 'px')
        .style('fill', labelOpts.fill)
    })(gauge, opts.size, opts.label);
  }
