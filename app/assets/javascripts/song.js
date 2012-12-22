define([
  "song-status",
  "like-status",
  "utils"
], function(
  SONG_STATUS,
  LIKE_STATUS,
  utils
){
  var Song = function(json) {
    var self = this;

    self.mediaId = json.mediaId;
    self.provider = json.provider;
    self.title = json.title;
    self.artist = json.artist;
    self.duration = json.duration;
    self.thumbnail = json.thumbnail;
    self.playAt = json.playAt;
    self.createdAt = json.createdAt;
    self.currentTime = ko.observable(0);
    self.startTimeout = null;
    self.stopTimeout = null;
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

    var initialStatus = self.playAt ? SONG_STATUS.NOT_LOADED : SONG_STATUS.UNPLAYABLE;
    self.status = ko.observable(initialStatus);
  };

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

    self.stopTimeout = setTimeout(function() {
      self.provider.stop(self);
      self.status(SONG_STATUS.FINISHED);
    }, timeUntilEnd);
  };

  Song.prototype.unload = function() {
    if (this.status() === SONG_STATUS.LOADED || this.status() === SONG_STATUS.PLAYING) {
      this.provider.stop(this);
    }

    this.status(SONG_STATUS.NOT_LOADED);
    clearTimeout(this.startTimeout);
    clearTimeout(this.stopTimeout);
  };

  Song.prototype.setVolume = function(volume) {
    this.provider.setVolume(this, volume);
  };

  Song.prototype.durationFormatted = function() {
    return utils.formatTime(this.duration);
  };

  return Song;
});
