define([
  "providers",
  "song-status"
], function(
  Providers,
  STATUS
){
  var Song = function(json) {
    var self = this;

    for (var key in json) {
      self[key] = json[key];
    }

    self.provider = Providers[json.provider];
    self.status = ko.observable(STATUS.NOT_LOADED);
    return self;
  };

  Song.prototype.load = function() {
    var self = this;
    self.provider.load(self);
  };

  Song.prototype.setVolume = function(volume) {
    this.provider.setVolume(this, volume);
  };

  Song.prototype.durationFormatted = function() {
    var minutes = Math.floor(this.duration / 60);
    var seconds = Math.floor(this.duration % 60);
    var formattedString = minutes + ':';
    formattedString += seconds < 10 ? '0' + seconds : seconds;
    return formattedString;
  };

  return Song;
});
