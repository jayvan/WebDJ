requirejs.config({
  paths: {
    jquery: "http://cdnjs.cloudflare.com/ajax/libs/jquery/1.8.2/jquery.min",
    knockout: "http://cdnjs.cloudflare.com/ajax/libs/knockout/2.2.0/knockout-min",
    bootstrap: "http://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/2.2.1/bootstrap.min"
  },
  baseUrl: '/assets/'
});

require([
  "settings"
], function(
  SETTINGS
){
  if (SETTINGS.RAILS_ENV === 'development') {
    // Append a timestamp to the file names of required js files to prevent caching in dev
    require.config({
      urlArgs: Date.now()
    });
  }
});

require([
  "misc/enable_csrf",
  "misc/reveal_header"
]);

// Create a room
require([
  "room",
  'knockout',
  'customBindings'
], function(
  Room,
  ko
){
  // Works for now, if there are more pages in the future a proper router should be used.
  var roomId = window.location.pathname.split("/")[2];
  if (roomId) {
    var room = new Room(roomId);
    ko.applyBindings(room);
  }
});
