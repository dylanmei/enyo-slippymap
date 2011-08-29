SlippyMap.Surface = (function() {

  function Surface(map, tile_service) {
    this.service = tile_service;
    this.component = enyo.create({
      nodeTag: 'div',
      className: 'slippy-surface',
    }).renderInto(map.element);
    this.element = this.component.hasNode();
  }

  _.extend(Surface.prototype, {
    draw: function(context) {
      var offset_x = context.x - context.width / 2,
          offset_y = context.y - context.height / 2,
          tile_size = this.service.tile_size();
      var grid = tile_grid(context.x, context.width,
        context.y, context.height, tile_size);

      for (var row = grid.row.first; row <= grid.row.last; row++) {
        var pixel_y = row * tile_size - offset_y;

        for (var column = grid.column.first; column <= grid.column.last; column++) {
          var pixel_x = column * tile_size - offset_x;
          this.draw_tile(column, row, pixel_x, pixel_y, context.z);
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

  function tile_grid(x, width, y, height, tile_size) {
    return {
      row: {
        first: Math.floor((y - height / 2) / tile_size),
        last: Math.ceil((y + height / 2) / tile_size) - 1
      },
      column: {
        first: Math.floor((x - width / 2) / tile_size),
        last: Math.ceil((x + width / 2) / tile_size) - 1
      }
    };
  }

  function tile_identity(key, column, row, zoom) {
    return 'slippy-' + key + '-(' + zoom + ',' + column + ',' + row + ')';
  }

  return Surface;
})();