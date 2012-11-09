define([
  "song",
  "utils",
  'song-status'
], function(
  Song,
  Utils,
  STATUS
){
  var FETCH_INTERVAL = 10000;

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
    self.lastUpdate = 0;
    self.fetchData();
  };

  Room.prototype.fetchData = function() {
    var self = this;
    $.getJSON("/rooms/" + self.id + "/queue.json?last_update=" + self.lastUpdate, function(data) {
      data.forEach (function(song) {
        if (song.play_at >= Utils.time() - song.duration) {
          self.songs.push(ko.observable(new Song(song.provider, song.identifier, song.play_at)));
        }
      });

      window.setTimeout(function() {
        self.fetchData();
      }, FETCH_INTERVAL);
    });
    self.lastUpdate = Utils.time();
  };

  return Room;
});

