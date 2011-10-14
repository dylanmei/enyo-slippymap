SlippyMap.Markers = (function() {
  function Markers(map) {
    this.element = document.createElement('div');
    this.element.className = 'slippy-markers';
    this.markers = [];
    map.element.appendChild(this.element);
  }

  _.extend(Markers.prototype, {
    clear: function() {
      this.element.innerHTML = '';
    },

    mark: function(latitude, longitude) {
      var marker = _.detect(this.markers, function(marker) {
        return marker.latitude == latitude && marker.longitude == longitude;
      });
      
      if (!marker) {
        this.markers.push(new Marker(latitude, longitude));
      }
    },

    draw: function(context) {
      this.element.style.webkitTransform = 'translate3d(' +
        Math.round((context.width / 2) - context.x) + 'px,' +
        Math.round((context.height / 2) - context.y) + 'px,0)';

      var cols = marker_column_range(context);

      for (var col = cols.first; col <= cols.last; col++) {
        _.each(this.markers, function(marker) {
          this.draw_marker(context, col, marker);
        }, this);
      }
    },

    draw_marker: function(context, column, marker) {
      var key = marker_element_identity(marker, column)
      var position = context.location_to_position(marker);
      var element = document.getElementById(key);

      if (!element) {
        element = new_marker_element(key);
        this.element.appendChild(element);
      }

      element.style.top = (position.y - 4) + 'px';
      element.style.left = ((position.x - 4) + (column * context.span)) + 'px';
    }
  });

  function new_marker_element(identity) {
    var element = document.createElement('div');
    element.className = 'marker';
    element.id = identity;
    return element;      
  }

  function marker_element_identity(marker, column) {
    var key = column + ',' + marker.latitude + ',' + marker.longitude;
    return 'marker:' + key;
  }

  function marker_column_range(context) {
    var offset_x = context.x - context.width / 2,
        extent_x = context.x + context.width / 2;

    return {
      first: Math.floor(offset_x / context.span),
      last: Math.ceil(extent_x / context.span) - 1
    }
  }

  function Marker(latitude, longitude) {
    this.latitude = latitude;
    this.longitude = longitude;
  }

  return Markers;
})();