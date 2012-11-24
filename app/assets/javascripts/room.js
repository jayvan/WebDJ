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
          }, FETCH_INTERVAL);

          pulling = false;
        }
      });

      self.lastUpdate = Utils.time();
    };
  })();

  // Makes sure that the song is unique and adds it to the queue
  Room.prototype.pushSongToQueue = function(song) {
    for (var i = 0; i < this.songs().length; i++) {
      if (song.startAt === this.songs()[i]().startAt) {
        return;
      }
    }

    this.songs.push(ko.observable(song));
    song.load();
  };

  Room.prototype.enqueueSong = function(form) {
    var self = this;
    var $form = $(form);
    var $submitButton = $form.find('[type="submit"]');

    $submitButton.attr('disabled', true);
    $submitButton.val("Adding...");

    $.post(this.baseURL + "enqueue", $form.serialize(),
      function(data) {
        $submitButton.attr('disabled', false);
        $submitButton.val("Add Song");
        $form[0].reset();
        self.fetchData();
      });
  };

  return Room;
});

