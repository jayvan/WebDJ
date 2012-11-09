define([
  "song",
  "utils"
], function(
  Song,
  Utils
){
  var Room = function(id) {
    this.id = id;
    this.songQueue = ko.observableArray();
    this.fetchData();
  };

  Room.prototype.fetchData = function() {
    var self = this;
    $.getJSON("/rooms/" + self.id + "/queue.json", function(data) {
      data.forEach(function(song) {
        console.log(song);
        if (song.play_at >= Utils.time()) {
          self.songQueue.push(new Song(song.provider, song.identifier, song.play_at));
        }
      });
    });
  };

  return Room;
});

