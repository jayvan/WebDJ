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

  return Song;
});
