Mapnik = (function() {
  var MIN_ZOOM = 1,
      MAX_ZOOM = 16,
      TILE_SIZE = 256,
      VOID_TEMPLATE = _.template('void.png'),
      TILE_TEMPLATE = _.template('http://#{subdomain}.tile.openstreetmap.org/#{z}/#{x}/#{y}.png');

  function Mapnik() {
  }

  _.extend(Mapnik.prototype, {
    tile_url: function(x, y, z) {
      var p = service_parameters(x, y, z);
      return p ? TILE_TEMPLATE(p) : VOID_TEMPLATE(p);
    },
    tile_key: function(x, y, z) {
      var key = constrain_parameters(x, y, z);
      return key ? key.x + '-' + key.y + '-' + key.z : '';
    },
    tile_size: function() { return TILE_SIZE; }
  });

  function service_parameters(x, y, z) {
    var tile = constrain_parameters(x, y, z);
    return tile ? _.extend(tile, { subdomain: Subdomain.next() }) : null;    
  }

  function constrain_parameters(x, y, z) {
    z = Math.min(Math.max(z, MIN_ZOOM), MAX_ZOOM);
    var scale = Math.pow(2, z);
    if (y < 0 || y >= scale) return null;
    return { x: ((x % scale) + scale) % scale, y: y, z: z };
  };

  var Subdomain = {
    hits: 0,
    list: ['a', 'b', 'c'],
    next: function() {
      return Subdomain.list[(Subdomain.hits++) % Subdomain.list.length]
    }
  };

  return Mapnik;
})();
