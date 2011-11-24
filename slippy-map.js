(function() {
  var slippy = {
    name: 'SlippyMap',
    kind: enyo.Control,
    className: 'slippy-map',
    published: { tracking: false },
    events: { onPan: '', onTap: '', onDoubleTap: '' },
    create: function() {
      this.inherited(arguments);
    },
    rendered: function() {
      this.inherited(arguments);
      this.map = new SlippyMap.Map(this.hasNode(), new Mapnik());
      this.trackingChanged();
      _.observe('map:pan',
        _.bind(on_pan, this));
      _.observe('map:tap',
        _.bind(on_tap, this));
      _.observe('map:doubleTap',
        _.bind(on_double_tap, this));
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
    },

    trackingChanged: function() {
      this.map.track(this.tracking);
    }    
  };

  function on_pan(e) {
    this.doPan(e);
  }
  function on_tap(e) {
    this.doTap(e);
  }
  function on_double_tap(e) {
    this.doDoubleTap(e);
  }

  enyo.kind(slippy);
})();