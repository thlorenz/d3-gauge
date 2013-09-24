'use strict';

var go = module.exports = {
    size :  250
  , min  :  0
  , max  :  100 
  , transitionDuration : 500

  , outer  :  {
        fill        :  '#ccc'
      , stroke      :  '#000'
      , width :  '0.5px'
    }
  , inner  :  {
        fill        :  '#fff'
      , stroke      :  '#E0E0E0'
      , width :  '2px'
    }
  , label : {
        text: 'Memory'
      , fill: '#333'
    }
  , minorTicks : { 
        count: 2
      , stroke: '#666'
      , width: '1px'
    }
  , majorTicks : { 
        count: 5
      , stroke: '#333'
      , width: '2px'
    }
  , needle : {
       widthRatio : 0.6 
      , fill        :  '#dc3912'
      , stroke      :  '#c63310'
      , opacity     :  0.7

    }
  , needleContainer : {
        radiusRatio :  0.7
      , fill        :  '#4684EE'
      , stroke      :  '#666'
      , opacity     :  1 
    }
  , greenZone : undefined
  , yellowZone : {
        from  :  0.75
      , to    :  0.9
      , color :  '#FF9900'
    }
  , redZone : {
        from  :  0.9
      , to    :  1.0 
      , color :  '#DC3912'
    }
};
