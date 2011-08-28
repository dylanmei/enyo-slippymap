SlippyMap.Map = (function() {
  var MAX_NORTH = 85.05112877980662;

  function Map(element, tile_service) {
    this.element = element;
    this.service = tile_service;
    this.layers = [
      new SlippyMap.Surface(this, tile_service)
    ];
  }

  _.extend(Map.prototype, {
    pan: function(latitude, longitude) {
      this.go(latitude, longitude, this.depth);
    },

    zoom: function(depth) {
      this.go(this.latitude, this.longitude, depth);
    },

    go: function(latitude, longitude, depth) {
      this.depth = depth;
      this.latitude = normalize_latitude(latitude, this.depth);
      this.longitude = normalize_longitude(longitude, this.depth);
      this.refresh();
    },

    size: function(size) {
      var pair = _.isNumber(size),
          width = pair ? arguments[0] : size.width,
          height = pair ? arguments[1] : size.height;
      this.element.style.width = (this.width = width) + 'px';
      this.element.style.height = (this.height = height) + 'px';
      this.refresh();
    },

    location: function() {
      return { latitude: this.latitude, longitude: this.longitude };
    },

    position: function() {
      return location_to_position(this.location(), this.span());
    },

    span: function() {
      return Math.pow(2, this.depth) * this.service.tile_size();
    },

    refresh: function() {
      if (this.ready) this.draw();
      else {
        this.ready = !(
          _.isUndefined(this.latitude)  || _.isUndefined(this.longitude) ||
          _.isUndefined(this.width)     || _.isUndefined(this.height)
        );
        if (this.ready) {
          _.defer(_.bind(this.refresh, this));
        }
      }
    },

    draw: function() {
      var pos = this.position();
      var context = {
        x: pos.x,
        y: pos.y,
        z: this.depth,
        width: this.width,
        height: this.height,
        latitude: this.latitude,
        longitude: this.longitude
      };

      _.each(this.layers, function(layer) {
        if (layer.draw) layer.draw(context);
      });
    }    
  });

  function location_to_position(location, span) {
    var pair = _.isNumber(location),
        latitude = pair ? arguments[0] : location.latitude,
        longitude = pair ? arguments[1] : location.longitude,
        span = pair ? arguments[2] : span;

    var x = span / 2 + longitude * span / 360;
    var s = Math.sin(Math.PI * latitude / 180);
    if (s == 1) s -= 1e-9;
    if (s == -1) s += 1e-9;
    var l = 0.5 * Math.log((1 + s) / (1 - s));
    var y = span / 2 - l * (span / (2 * Math.PI));
    return { x: x, y: y };
  }

  function position_to_location(position, span) {
    var pair = _.isNumber(position),
      x = pair ? arguments[0] : position.x,
      y = pair ? arguments[1] : position.y,
      z = pair ? arguments[2] : zoom;

    var latitude = (2 * Math.atan(Math.exp((1 - 2 * y / span) * Math.PI)) - Math.PI / 2) * (180 / Math.PI);
    var longitude = (x - span / 2) / (span / 360);

    return {
      latitude: normalize_latitude(latitude),
      longitude: normalize_longitude(longitude)
    };
  }

  function normalize_latitude(latitude) {
    return (latitude > MAX_NORTH ? MAX_NORTH : (latitude < -MAX_NORTH ? -MAX_NORTH : latitude));
  }

  function normalize_longitude(longitude) {
    return (longitude + 180) % 360 + (longitude < -180 ? 180 : -180);
  }

  return Map;
})();