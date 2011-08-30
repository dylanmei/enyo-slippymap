SlippyMap.Surface = (function() {

  function Surface(map, tile_service) {
    this.component = enyo.create({
      nodeTag: 'div',
      className: 'slippy-surface',
    }).renderInto(map.element);
    this.element = this.component.hasNode();
    this.service = tile_service;
    this.clear();
  }

  _.extend(Surface.prototype, {
    clear: function() {
      this.element.innerHTML = '';
      this.layout = new Layout(this.service.tile_size());
    },

    draw: function(context) {
      this.layout.apply(context);
      
      var offset = this.layout.offset();
      this.element.style.webkitTransform = 'translate3d(' +
        Math.round(offset.x) + 'px,' +
        Math.round(offset.y) + 'px,0)';

      var rows = this.layout.rows(),
          cols = this.layout.cols(),
          unit = this.layout.unit;

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
      tile.className = 'slippy-tile';
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

  function Layout(tile_size) {
    this.unit = tile_size;
  }

  _.extend(Layout.prototype, {
    apply: function(context) {
      this.zoom = context.zoom;
      this.logical_x = context.x;
      this.logical_y = context.y;
      this.logical_width = Math.pow(2, this.zoom) * this.unit;
      this.logical_height = Math.pow(2, this.zoom) * this.unit;
      this.viewport_width = context.width;
      this.viewport_height = context.height;
    },
    offset: function() {
      return {
        x: (this.viewport_width / 2) - this.logical_x,
        y: (this.viewport_height / 2) - this.logical_y
      };
    },
    rows: function() {
      var offset_y = this.logical_y - this.viewport_height / 2,
          extent_y = this.logical_y + this.viewport_height / 2;
      return {
        first: Math.floor(offset_y / this.unit),
        last: Math.ceil(extent_y / this.unit) - 1
      }
    },
    cols: function() {
      var offset_x = this.logical_x - this.viewport_width / 2,
          extent_x = this.logical_x + this.viewport_width / 2;
      return {
        first: Math.floor(offset_x / this.unit),
        last: Math.ceil(extent_x / this.unit) - 1
      }
    }
  });

  return Surface;
})();