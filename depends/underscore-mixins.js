
_.templateSettings = {
  interpolate : /#\{(.+?)\}/g
};
  
_.mixin({
  noop: function(){},
  observe: function(type, handler) {
    addEventListener(type, handler, false);    
  },

  trigger: function(type, params) {
    var event = document.createEvent('Event');
    event.initEvent(type, true, false);
    return dispatchEvent(_.extend(event, params));    
  },  
  log: _.wrap(enyo.log, function(f) {
    f.apply(null, enyo.logging.expand_arguments_without_crawling(arguments));
  })
});

_.extend(enyo.logging, {
    expand_arguments_without_crawling: function(args) {
      return _(args)
        .reject(function(a) { return _.isFunction(a); })
        .map(function(a) {
          var test = String(a);
          if (test == '[object Object]')
            return enyo.logging.stringify_properties(a);
          return a;
        });
    },
    stringify_properties: function(o) {
      return enyo.json.stringify(o, function(k, v) {
        if (k == '') return v;
        else if (_.isFunction(v)) return undefined;
        return (String(v) == '[object Object]') ? String(v) : v;
      });
    }
});
