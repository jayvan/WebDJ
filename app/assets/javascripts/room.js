define([
  'volume',
  'knockout',
  "song",
  "utils",
  'song-status',
  'like-status',
  'settings',
  'providers',
  'jquery'
], function(
  VolumeModel,
  ko,
  Song,
  utils,
  SONG_STATUS,
  LIKE_STATUS,
  SETTINGS,
  PROVIDERS,
  $
){
  var Room = function(id) {
    var self = this;
    self.id = id;
    self.songs = ko.observableArray();
    self.upcomingSongs = ko.computed(function() {
      return self.songs().filter(function(song) {
        return song().status() < SONG_STATUS.PLAYING;
      });
    });
    self.currentSong = ko.computed(function() {
      for (var i = 0; i < self.songs().length; i++) {
        if (self.songs()[i]().status() === SONG_STATUS.PLAYING) {
          return self.songs()[i]();
        }
      }
    });
    self.songCount = ko.computed(function() {
      var count = self.upcomingSongs().length;
      if (self.currentSong()) {
        count += 1;
      }
      return count;
    });
    self.baseURL = "/rooms/" + self.id + "/";
    self.lastUpdate = 0;
    self.fetchTimeout = undefined;
    self.fetchData();
    self.searchResults = ko.observableArray();
    self.activeUsers = ko.observable(0);
    self.lastSkip = ko.observable(utils.time());
    self.volumeModel = new VolumeModel();
    self.volume = self.volumeModel.volume;

    // When the volume changes, change the current songs volume
    self.volume.subscribe(function(newValue) {
      if (self.currentSong()) {
        self.currentSong().volume(newValue);
      }
    });

    // When a new song is loaded, change it's volume to match the room's volume
    self.currentSong.subscribe(function(newSong) {
      if (newSong) {
        newSong.fadeTo(self.volume());
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
        url: self.baseURL + "summary.json?lastUpdate=" + self.lastUpdate,
        dataType: 'json',
        success: function(data) {
          utils.calibrateTime(data.timestamp);
          if (data.lastSkip > self.lastSkip()) {
            self.lastSkip(data.lastSkip);
            self.songs().forEach(function(song) {
              song().unload();
            });
            self.songs.removeAll();
          }
          // Add songs we don't already have to the queue
          data.queue.forEach (function(song) {
            song.provider = PROVIDERS[song.provider];
            var newSong = new Song(song);
            self.pushSongToQueue(newSong);
          });
          self.activeUsers(data.activeUsers);
        },
        complete: function() {
          self.fetchTimeout = window.setTimeout(function() {
            self.fetchData();
          }, SETTINGS.FETCH_INTERVAL);

          pulling = false;
        }
      });

      self.lastUpdate = utils.time() - 1;
    };
  })();


  // Adds a song to the play queue by sending the provider & mediaId to the server
  Room.prototype.enqueueSong = function(song) {
    var self = this;
    $.ajax({
        url: self.baseURL + "enqueue",
        type: 'POST',
        data: {
          provider: song.provider.name,
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
    // If the song has already ended, don't bother adding it
    if (song.playAt + song.duration <= utils.time()) { return; }
    for (var i = 0; i < this.songs().length; i++) {
      if (song.playAt === this.songs()[i]().playAt) {
        return;
      }
    }

    this.songs.push(ko.observable(song));
    song.load();
  };

  Room.prototype.likeCurrentSong = function() {
    if (this.currentSong() && this.currentSong().likeStatus() != LIKE_STATUS.LIKED) {
      this.currentSong().likeStatus(LIKE_STATUS.LIKED);
      $.ajax({
        url: this.baseURL + "like_song",
        data: {
          mediaId: this.currentSong().mediaId
        },
        type: 'POST'
      });
    }
  };

  Room.prototype.dislikeCurrentSong = function() {
    if (this.currentSong() && this.currentSong().likeStatus() != LIKE_STATUS.DISLIKED) {
      this.currentSong().likeStatus(LIKE_STATUS.DISLIKED);
      $.ajax({
        url: this.baseURL + "dislike_song",
        data: {
          mediaId: this.currentSong().mediaId
        },
        type: 'POST'
      });
    }
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
