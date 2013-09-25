'use strict';

var go = module.exports = {
    clazz: 'simple'
  , size :  250
  , min  :  0
  , max  :  100 
  , transitionDuration : 500

  , label : {
        text: 'label.text'
    }
  , minorTicks : { 
        count: 4
    }
  , majorTicks : { 
        count: 5
    }
  , needle : {
        widthRatio : 0.6 
    }
  , needleContainer : {
        radiusRatio :  0.7
    }
  , greenZone : undefined
  , yellowZone : {
        from  :  0.73
      , to    :  0.9
    }
  , redZone : {
        from  :  0.9
      , to    :  1.0 
    }
};
