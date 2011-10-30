SlippyMap.Overlay = (function() {
  function Overlay(map) {
    this.element = document.createElement('div');
    this.element.className = 'slippy-overlay';
    map.element.appendChild(this.element);
  }

  _.extend(Overlay.prototype, {
    clear: function() {
      this.element.innerHTML = '';
    },

    draw: function(context) {
      this.element.style.webkitTransform = 'translate3d(' +
        Math.round((context.width / 2) - context.x) + 'px,' +
        Math.round((context.height / 2) - context.y) + 'px,0)';
      
      var cols = overlay_column_range(context);
      var pos = context.location_to_position(0, 0);
      pos.x -= context.span / 2;
      pos.y -= context.span / 2;
      for (var col = cols.first; col <= cols.last; col++) {
        this.draw_overlay(col, pos, context.span);
      }
    },

    draw_overlay: function(column, position, span) {
      var key = overlay_element_identity(column);
      var element = document.getElementById(key);
      if (!element) {
        element = new_overlay_element(key);
        element.appendChild(
          new_overlay_image(span));
        this.element.appendChild(element);
      }

      element.style.top = position.y + 'px';
      element.style.left = (position.x + (column * span)) + 'px';
    }
  });

  function new_overlay_element(identity) {
    var element = document.createElement('div');
    element.className = 'overlay';
    element.id = identity;
    return element;      
  }

  function new_overlay_image(span) {
    var image = document.createElement('img');
    image.onload = function() {
      this.style.visibility = 'visible';
    };
    image.onerror = function() {
      _.log('error loading image');
    };
    image.onselectstart = function() { return false; };
    image.onmousemove = function() { return false; };
    image.width = span;
    image.height = span;
    image.style.visibility = 'hidden';
    image.src = 'images/overlay-x.png';
    return image;
  }  

  function overlay_element_identity(column) {
    return 'overlay:' + column;
  }

  function overlay_column_range(context) {
    var offset_x = (context.x - context.width / 2) - (context.span / 2),
        extent_x = (context.x + context.width / 2) + (context.span / 2);

    return {
      first: Math.floor(offset_x / context.span),
      last: Math.ceil(extent_x / context.span) - 1
    }
  }


  return Overlay;
})();