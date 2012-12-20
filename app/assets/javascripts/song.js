define([
  "song-status",
  "utils"
], function(
  STATUS,
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
    self.currentTimeFormatted = ko.computed(function() {
      return utils.formatTime(self.currentTime());
    });

    var initialStatus = self.playAt ? STATUS.NOT_LOADED : STATUS.UNPLAYABLE;
    self.status = ko.observable(initialStatus);
  };

  Song.prototype.load = function() {
    var self = this;
    self.provider.load(self);
  };

  Song.prototype.setVolume = function(volume) {
    this.provider.setVolume(this, volume);
  };

  Song.prototype.durationFormatted = function() {
    return utils.formatTime(this.duration);
  };

  return Song;
});
