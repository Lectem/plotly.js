'use strict';

var Plotly = require('../../plotly');

var Mesh3D = module.exports = {};

Plotly.Plots.register(Mesh3D, 'mesh3d', ['gl3d'], {
    description: [
        ''
    ].join(' ')
});

Mesh3D.attributes = require('../attributes/mesh3d');

Mesh3D.supplyDefaults = function(traceIn, traceOut, defaultColor, layout) {
  var self = this;
  function coerce(attr, dflt) {
      return Plotly.Lib.coerce(traceIn, traceOut, self.attributes, attr, dflt);
  }

  //Read in face/vertex properties
  function readComponents(array) {
    var ret = array.map(function(attr) {
      var result = coerce(attr);
      if(result && Array.isArray(result)) {
        return result;
      }
      return null;
    });
    return ret.every(function(x) {
      return x && x.length === ret[0].length;
    }) && ret;
  }

  var coords  = readComponents(['x', 'y', 'z']);
  var indices = readComponents(['i', 'j', 'k']);

  if(!coords) {
    traceOut.visible = false;
    return;
  }

  if(indices) {
    //Otherwise, convert all face indices to ints
    indices.forEach(function(index) {
      for(var i=0; i<index.length; ++i) {
        index[i] |= 0;
      }
    });
  }

  //Coerce remaining properties
  [ 'lighting.ambient',
    'lighting.diffuse',
    'lighting.specular',
    'lighting.roughness',
    'lighting.fresnel',
    'contour.show',
    'contour.color',
    'contour.width',
    'colorscale',
    'reversescale',
    'flatshading',
    'alphahull',
    'delaunayaxis',
    'opacity'
  ].forEach(function(x) { coerce(x); });

  if('intensity' in traceIn) {
    coerce('intensity');
    coerce('showscale', true);
  } else {
    traceOut.showscale = false;
    if('vertexColor' in traceIn) {
      coerce('vertexColor');
    } else if('faceColor' in traceIn) {
      coerce('faceColor');
    } else {
      coerce('color', defaultColor);
    }
  }

  if(traceOut.reversescale) {
      traceOut.colorscale = traceOut.colorscale.map(function (si) {
          return [1 - si[0], si[1]];
      }).reverse();
  }

  if(traceOut.showscale) {
      Plotly.Colorbar.supplyDefaults(traceIn, traceOut, layout);
  }
};

Mesh3D.colorbar = Plotly.Colorbar.traceColorbar;