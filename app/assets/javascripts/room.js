define([
  "song",
  "utils"
], function(
  Song,
  Utils
){
  var Room = function(id) {
    var self = this;
    self.id = id;
    self.songQueue = ko.observableArray();
    self.currentSong = ko.observable();
    self.fetchData();
  };

  Room.prototype.fetchData = function(callback) {
    var self = this;
    $.getJSON("/rooms/" + self.id + "/queue.json", function(data) {
      data.forEach(function(song) {
        if (song.play_at >= Utils.time() - song.duration) {
          self.songQueue.push(new Song(song.provider, song.identifier, song.play_at));
        }
      });
      callback();
    });
  };

  return Room;
});

