SlippyMap.Surface = (function() {

  function Surface(map, tile_service) {
    this.element = document.createElement('div');
    this.element.className = 'slippy-surface';
    map.element.appendChild(this.element);
    this.service = tile_service;
  }

  _.extend(Surface.prototype, {
    clear: function() {
      this.element.innerHTML = '';
    },

    draw: function(context) {
      this.element.style.webkitTransform = 'translate3d(' +
        Math.round((context.width / 2) - context.x) + 'px,' +
        Math.round((context.height / 2) - context.y) + 'px,0)';

      var unit = context.span / Math.pow(2, context.zoom),
          cols = tile_column_range(context, unit),
          rows = tile_rowset_range(context, unit);

      for (var row = rows.first; row <= rows.last; row++) {
        var y = row * unit;

        for (var col = cols.first; col <= cols.last; col++) {
          var x = col * unit;
          this.draw_tile(col, row, x, y, context.zoom);
        }
      }
    },

    draw_tile: function(column, row, x, y, z) {
      var key = this.service.tile_key(column, row, z);
      if (key != '') {
        var id = tile_identity(key, column, row, z);
        var tile = document.getElementById(id);
        if (tile) {
          tile.style.left = x + 'px';
          tile.style.top = y + 'px';
        }
        else {
          tile = this.new_tile_layer(id, x, y);
          tile.appendChild(this.new_tile_image(column, row, z));
          this.element.appendChild(tile);
        }
      }
    },

    new_tile_layer: function(id, x, y) {
      var size = this.service.tile_size();
      var tile = document.createElement('div');
      tile.id = id;
      tile.className = 'tile';
      tile.style.width = size + 'px';
      tile.style.height = size + 'px';
      tile.style.left = x + 'px';
      tile.style.top = y + 'px';
      return tile;
    },

    new_tile_image: function(column, row, z) {
      var size = this.service.tile_size();
      var image = document.createElement('img');
      image.onload = function() {
        this.style.visibility = 'visible';
      };
      image.onerror = function() {
        _.log('error loading image');
      };
      image.onselectstart = function() { return false; };
      image.onmousemove = function() { return false; };
      image.style.visibility = 'hidden';
      image.src = this.service.tile_url(column, row, z);
      return image;
    }
  });

  function tile_identity(key, column, row, zoom) {
    return 'slippy-' + key + '-(' + zoom + ',' + column + ',' + row + ')';
  }

  function tile_rowset_range(context, unit) {
    var offset_y = context.y - context.height / 2,
        extent_y = context.y + context.height / 2;
    return {
      first: Math.floor(offset_y / unit),
      last: Math.ceil(extent_y / unit) - 1
    }
  }

  function tile_column_range(context, unit) {
    var offset_x = context.x - context.width / 2,
        extent_x = context.x + context.width / 2;
    return {
      first: Math.floor(offset_x / unit),
      last: Math.ceil(extent_x / unit) - 1
    }
  }

  return Surface;
})();