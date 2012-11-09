define([
  "song",
  "utils",
  'song-status'
], function(
  Song,
  Utils,
  STATUS
){
  var Room = function(id) {
    var self = this;
    self.id = id;
    self.songs = ko.observableArray();
    self.upcomingSongs = ko.computed(function() {
      test = self;
      return self.songs().filter(function(song) {
        return song().status() < STATUS.PLAYING;
      });
    });
    self.currentSong = ko.computed(function() {
      for (var i = 0; i < self.songs().length; i++) {
        if (self.songs()[i]().status() === STATUS.PLAYING) {
          return self.songs()[i]();
        }
      }
    });
    self.fetchData();
  };

  Room.prototype.fetchData = function() {
    var self = this;
    $.getJSON("/rooms/" + self.id + "/queue.json", function(data) {
      data.forEach (function(song) {
        console.log(song.play_at - Utils.time() - song.duration);
        if (song.play_at >= Utils.time() - song.duration) {
          self.songs.push(ko.observable(new Song(song.provider, song.identifier, song.play_at)));
        }
      });
    });
  };

  return Room;
});

