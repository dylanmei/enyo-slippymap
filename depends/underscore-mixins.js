
_.templateSettings = {
  interpolate : /#\{(.+?)\}/g
};

_.mixin({
  noop: function(){},

  proxy: function(destination, source, methods) {
    _.each(methods, function(f) {
      destination[f] = function() {
        var value = source[f].apply(source, arguments);
        return _.isUndefined(value) ? destination : value;
      }
    });
  },

  observe: function(type, handler) {
    addEventListener(type, handler);
  },

  trigger: function(type, params) {
    var event = document.createEvent('Event');
    event.initEvent(type, false, false);
    return dispatchEvent(_.extend(event, params));
  },
});

enyo.log = _.wrap(enyo.log, function(f) {
    f.apply(null, enyo.logging.expand_arguments_without_crawling(arguments));
});

enyo.warn = _.wrap(enyo.warn, function(f) {
    f.apply(null, enyo.logging.expand_arguments_without_crawling(arguments));
});

enyo.error = _.wrap(enyo.error, function(f) {
    f.apply(null, enyo.logging.expand_arguments_without_crawling(arguments));
});

_.mixin({
    log: enyo.log,
    warn: enyo.warn,
    error: enyo.error
});

_.extend(enyo.logging, {
    expand_arguments_without_crawling: function(args) {
        return _(args)
            .reject(function(a) { return _.isFunction(a); })
            .map(function(a) {
                var test = String(a);
                if (test == '[object Object]')
                  return enyo.logging.stringify_properties(a);
                else if (test == '[object Event]')
                  return enyo.logging.stringify_event(a);
                return a;
            });
    },
    stringify_event: function(e) {
      return enyo.logging.stringify_properties(e);
    },
    stringify_properties: function(o) {
      return enyo.json.stringify(o, function(k, v) {
          if (k == '') return v;
          else if (_.isFunction(v)) return undefined;
          return (String(v) == '[object Object]') ? String(v) : v;
      });
    }
});
