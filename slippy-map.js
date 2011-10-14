(function() {
  var slippy = {
    name: 'SlippyMap',
    kind: enyo.Control,
    className: 'slippy-map',
    create: function() {
      this.inherited(arguments);
    },
    rendered: function() {
      this.inherited(arguments);
      this.map = new SlippyMap.Map(this.hasNode(), new Mapnik());
    },
    pan: function(latitude, longitude) {
      if (this.map) this.map.pan(latitude, longitude);
      return this;
    },
    zoom: function(value) {
      if (this.map) this.map.zoom(value);
      return this;
    },
    size: function(width, height) {
      if (this.map) this.map.size(width, height);
      else {
        this.applyStyle('width', width + 'px');
        this.applyStyle('height', height + 'px');
      }
      return this;
    },
    mark: function(latitude, longitude) {
      if (this.map) this.map.mark(latitude, longitude);
      return this;
    }
  };

  enyo.kind(slippy);
})();