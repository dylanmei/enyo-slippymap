SlippyMap.Map = (function() {
  var MIN_ZOOM = 1, MAX_ZOOM = 16, MAX_NORTH = 85.05112877980662, TILE_SIZE = 256;

  function Map(element, tile_service) {
    this.element = element;
    this.tile_service = tile_service;
    this.layers = [
//      new SlippyMap.Surface(this, tile_service)
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
      this.depth = Math.min(Math.max(depth, MIN_ZOOM), MAX_ZOOM);
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
      return location_to_position(this.location());
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
        latitude: this.latitude,
        longitude: this.longitude,
        x: pos.x, y: pos.y, z: this.depth,
        width: this.width,
        height: this.height,
        span: Math.pow(2, this.depth) * TILE_SIZE,
        location_to_position: location_to_position,
        //location_to_viewport: location_to_viewport,
        position_to_location: position_to_location
      };

      _.each(this.layers, function(layer) {
        if (layer.draw) layer.draw(context);
      });
    }    
  });

  function location_to_position(location, zoom) {
    var pair = _.isNumber(location),
        latitude = pair ? arguments[0] : location.latitude,
        longitude = pair ? arguments[1] : location.longitude,
        z = pair ? arguments[2] : zoom;

    var size = Math.pow(2, z) * TILE_SIZE;
    var x = size / 2 + longitude * size / 360;
    var s = Math.sin(Math.PI * latitude / 180);
    if (s == 1) s -= 1e-9;
    if (s == -1) s += 1e-9;
    var l = 0.5 * Math.log((1 + s) / (1 - s));
    var y = size / 2 - l * (size / (2 * Math.PI));
    return { x: x, y: y };
  }

  function position_to_location(position, zoom) {
    var pair = _.isNumber(position),
      x = pair ? arguments[0] : position.x,
      y = pair ? arguments[1] : position.y,
      z = pair ? arguments[2] : zoom;

    var size = Math.pow(2, z) * TILE_SIZE;
    var latitude = (2 * Math.atan(Math.exp((1 - 2 * y / size) * Math.PI)) - Math.PI / 2) * (180 / Math.PI);
    var longitude = (x - size / 2) / (size / 360);

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