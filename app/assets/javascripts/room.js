define([
  "song",
  "utils",
  'song-status',
  'settings',
  'providers'
], function(
  Song,
  Utils,
  STATUS,
  SETTINGS,
  PROVIDERS
){
  var Room = function(id) {
    var self = this;
    self.id = id;
    self.songs = ko.observableArray();
    self.upcomingSongs = ko.computed(function() {
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
    self.baseURL = "/rooms/" + self.id + "/";
    self.lastUpdate = 0;
    self.fetchTimeout = undefined;
    self.fetchData();
    self.searchResults = ko.observableArray();

    self.volume = ko.observable(1);

    // When the volume changes, change the current songs volume
    self.volume.subscribe(function(newValue) {
      if (self.currentSong()) {
        self.currentSong().setVolume(newValue);
      }
    });
  };

  Room.prototype.fetchData = (function() {
    var pulling = false;

    return function() {
      var self = this;

      // Unschedule any queued pulls
      clearTimeout(self.fetchTimeout);

      // If we already have a request out: don't send another, if we don't: we do now.
      if (pulling) {
        return;
      } else {
        pulling = true;
      }

      $.ajax({
        url: self.baseURL + "queue.json?lastUpdate=" + self.lastUpdate,
        dataType: 'json',
        success: function(data) {
          data.forEach (function(song) {
            if (song.playAt + song.duration > Utils.time()) {
              var newSong = new Song(song);
              self.pushSongToQueue(newSong);
            }
          });
        },
        complete: function() {
          self.fetchTimeout = window.setTimeout(function() {
            self.fetchData();
          }, SETTINGS.FETCH_INTERVAL);

          pulling = false;
        }
      });

      self.lastUpdate = Utils.time() - 1;
    };
  })();


  // Adds a song to the play queue by sending the provider & mediaId to the server
  Room.prototype.enqueueSong = function(song) {
    var self = this;
    $.ajax({
        url: self.baseURL + "enqueue",
        type: 'POST',
        data: {
          provider: song.provider,
          mediaId: song.mediaId
        },
        success: function(data) {
          self.fetchData();
        }
      });
    self.searchResults.removeAll();
  };

  // Makes sure that the song is unique and adds it to the queue
  Room.prototype.pushSongToQueue = function(song) {
    for (var i = 0; i < this.songs().length; i++) {
      if (song.playAt === this.songs()[i]().playAt) {
        return;
      }
    }

    this.songs.push(ko.observable(song));
    song.load();
  };

  Room.prototype.search = function(formElement) {
    var self = this;
    var query = $(formElement).find('input[name="query"]').val();

    self.searchResults.removeAll();

    var addResults = function(results) {
      results.forEach(function(result) {
        self.searchResults.push(result);
      });
    };

    for (var provider in PROVIDERS) {
      PROVIDERS[provider].search(query, addResults);
    }
  };

  return Room;
});
