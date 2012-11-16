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
    self.baseURL = "/rooms/" + self.id + "/";
    self.lastUpdate = 0;
    self.fetchTimeout = undefined;
    self.fetchData();
  };

  Room.prototype.fetchData = function() {
    var self = this;
    $.getJSON(self.baseURL + "queue.json?last_update=" + self.lastUpdate, function(data) {
      data.forEach (function(song) {
        if (song.play_at + song.duration > Utils.time()) {
          self.songs.push(ko.observable(new Song(song.provider, song.identifier, song.play_at)));
        }
      });

      clearTimeout(self.fetchTimeout);
      self.fetchTimeout = window.setTimeout(function() {
        self.fetchData();
      }, FETCH_INTERVAL);
    });
    self.lastUpdate = Utils.time();
  };

  Room.prototype.enqueueSong = function(form) {
    var self = this;
    var $form = $(form);
    var $submitButton = $form.find('[type="submit"]');

    $submitButton.attr('disabled', true);
    $submitButton.val("Adding...");

    $.post(this.baseURL + "enqueue", $form.serialize(),
      function(data) {
        console.log(data);
        $submitButton.attr('disabled', false);
        $submitButton.val("Add Song");
        $form[0].reset();
        self.fetchData();
      });
  };

  return Room;
});

