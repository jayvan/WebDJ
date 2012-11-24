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
  "room"
], function(
  Room
){
  var roomId = window.location.pathname.split("/")[2];
  var room = new Room(roomId);
  ko.applyBindings(room);
});
