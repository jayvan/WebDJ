define([
  "song-status",
  "like-status",
  "utils",
  'knockout'
], function(
  SONG_STATUS,
  LIKE_STATUS,
  utils,
  ko
){
  var Song = function(json) {
    var self = this;

    self.mediaId = json.mediaId;
    self.provider = json.provider;
    self.title = json.title;
    self.artist = json.artist;
    self.artistURL = json.artistURL;
    self.duration = json.duration;
    self.thumbnail = json.thumbnail;
    self.playAt = json.playAt;
    self.createdAt = json.createdAt;
    self.currentTime = ko.observable(0);
    self.startTimeout = null;
    self.stopTimeout = null;
    self.volume = ko.observable(0);
    self.currentTimeFormatted = ko.computed(function() {
      return utils.formatTime(self.currentTime());
    });
    self.likeStatus = ko.observable(LIKE_STATUS.UNRATED);

    self.disliked = ko.computed(function() {
      return self.likeStatus() === LIKE_STATUS.DISLIKED;
    });

    self.liked = ko.computed(function() {
      return self.likeStatus() === LIKE_STATUS.LIKED;
    });

    self.volume.subscribe(function(volume) {
      self.provider.setVolume(self, volume);
    });

    var initialStatus = self.playAt ? SONG_STATUS.NOT_LOADED : SONG_STATUS.UNPLAYABLE;
    self.status = ko.observable(initialStatus);
  };

  Song.FADE_TIME = 3000;
  Song.FADE_STEPS = 30;

  Song.prototype.load = function() {
    var self = this;
    self.provider.load(self);
    self.status(SONG_STATUS.LOADED);
    var timeUntilStart = Math.max(self.playAt - utils.time(), 0) * 1000;
    var timeUntilEnd = (self.playAt + self.duration - utils.time()) * 1000;

    self.startTimeout = setTimeout(function() {
      self.provider.start(self);
      self.status(SONG_STATUS.PLAYING);
    }, timeUntilStart);

    self.stopTimeout = setTimeout(function() { self.unload(); } , timeUntilEnd);
  };

  Song.prototype.unload = function() {
    var self = this;

    if (self.status() === SONG_STATUS.LOADED || self.status() === SONG_STATUS.PLAYING) {
      self.fadeOut();
      window.setTimeout(function() {
        self.provider.stop(self);
        self.status(SONG_STATUS.FINISHED);
      }, Song.FADE_TIME + 3000); // Delete the actual song 3 seconds after the fadeout completes
    }

    clearTimeout(self.startTimeout);
    clearTimeout(self.stopTimeout);
  };

  Song.prototype._fadeTo = function(step, target) {
    var self = this;
    // The video may have been unloaded while fading
    if (self.status() !== SONG_STATUS.PLAYING) {
      return;
    }

    if (Math.abs(self.volume() - target) <= Math.abs(step)) {
      self.volume(target);
      return;
    }

    this.volume(this.volume() + step);

    window.setTimeout(function() {
      self._fadeTo(step, target);
    }, Song.FADE_TIME / Song.FADE_STEPS);
  };

  Song.prototype.fadeOut = function() {
    this._fadeTo(-this.volume() / Song.FADE_STEPS, 0);
  };

  Song.prototype.fadeTo = function(target) {
    this._fadeTo((target - this.volume()) / Song.FADE_STEPS, target);
  };

  Song.prototype.durationFormatted = function() {
    return utils.formatTime(this.duration);
  };

  return Song;
});
