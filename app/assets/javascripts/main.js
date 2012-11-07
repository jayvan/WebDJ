require([
  "room"
], function(
  Room
){
  var roomId = window.location.pathname.split("/").slice(-1)[0];
  var room = new Room(roomId);
  ko.applyBindings(room);
});

