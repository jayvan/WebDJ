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
  "room",
  'knockout',
  "misc/enable_csrf",
  "misc/reveal_header",
  "customBindings"
], function(
  Room,
  ko
){
  var roomId = window.location.pathname.split("/")[2];
  if (roomId) {
    var room = new Room(roomId);
    ko.applyBindings(room);
  }
});
