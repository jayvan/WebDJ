require([
  "room"
], function(
  Room
){
  var roomId = window.location.pathname.split("/")[2];
  var room = new Room(roomId);
  ko.applyBindings(room);
});
