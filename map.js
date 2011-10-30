SlippyMap.Map = (function() {
  var MAX_NORTH = 85.05112877980662;

  function Map(element, tile_service) {
    this.element = element;
    this.service = tile_service;
    this.layers = [
      this.surface = new SlippyMap.Surface(this, tile_service),
      this.overlay = new SlippyMap.Overlay(this),
      this.markers = new SlippyMap.Markers(this)
    ];
    new EventHandler(this);
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

    mark: function(latitude, longitude) {
      this.markers.mark(latitude, longitude);
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
      var span = this.span();
      var context = {
        x: pos.x,
        y: pos.y,
        span: span,
        zoom: this.depth,
        width: this.width,
        height: this.height,
        latitude: this.latitude,
        longitude: this.longitude,

        location_to_position: function(location) {
          var args = [].splice.call(arguments, 0);
          args.push(span);
          return location_to_position.apply(null, args);
        },

        position_to_location: function(position) {
          var args = [].splice.call(arguments, 0);
          args.push(span);
          return position_to_location.apply(null, args);
        }
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
      z = pair ? arguments[2] : span;

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

  var EventHandler = function(map) {
    this.map = map;
    this.element = map.element;
    this.tap_timer = null;
    map.element.addEventListener('mousedown', _.bind(this.press, this), false);
    map.element.addEventListener('mouseup', _.bind(this.release, this), false);
    map.element.addEventListener('mouseout', _.bind(this.release, this), false);
    map.element.addEventListener('mousemove', _.bind(this.move, this), false);
  };

  _.extend(EventHandler.prototype, {
    interactive: function() {
      return !_.isUndefined(this.map.ready) && this.map.ready;
    },
    press: function(e) {
      if (!this.interactive()) return;

      var p = this.position_from_event(e);
      this.last_x = p.x;
      this.last_y = p.y;
      this.pressed = _.isUndefined(e.button) || e.button == 0;
      if (this.pressed) this.prevent_default(e);
    },
    release: function(e) {
      if (!this.interactive()) return;

      if (e.type == 'mouseout' && this.is_map_element(e.toElement))
        return;

      if (!this.dragging && this.pressed) {
        if (!this.tap_timer) {
          this.tap_timer = window.setTimeout(_.bind(function(e) {
            this.tap(e); this.tap_timer = null;
          }, this, e), 360);
        }
        else {
          window.clearTimeout(this.tap_timer);
          this.tap_timer = null;
          this.double_tap(e);
        }
      }
      if (this.pressed) this.prevent_default(e);
      this.pressed = this.dragging = false;
    },
    tap: function(e) {
    },
    double_tap: function(e) {
    },
    move: function(e) {
      if (!this.interactive()) return;
      var p = this.position_from_event(e);

      if (this.pressed)  this.dragging = true;
      if (this.dragging) {

        var distance_x = p.x - this.last_x;
        var distance_y = p.y - this.last_y;

        var position = this.map.position();
        position.x -= distance_x;
        position.y -= distance_y;

        var location = position_to_location(
          position, this.map.span());
        this.map.pan(location.latitude, location.longitude);
        this.prevent_default(e);
      }

      this.last_x = p.x;
      this.last_y = p.y;
    },

    is_map_element: function(element) {
      while (element != null && element.nodeName != "BODY") {
        if (element == this.map.element) return true;
        element = element.offsetParent;
      }
      return false;
    },

    prevent_default: function(e) {
      if (e.preventDefault) e.preventDefault();
    },

    position_from_event: function(e) {
      return {
        x: e.clientX - this.element.offsetLeft,
        y: e.clientY - this.element.offsetTop
      };
    },

    location_from_event: function(e) {
      var pos = this.position_from_event(e);
      var center = this.map.position();
      pos.x += (center.x - this.map.span() / 2);
      pos.y += (center.y - this.map.span() / 2);
      return position_to_location(pos);
    }
  });

  return Map;
})();