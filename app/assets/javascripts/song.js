define([
  "providers",
  "song-status"
], function(
  Providers,
  STATUS
){
  var Song = function(provider, id, playAt) {
    var self = this;
    self.provider = Providers[provider];
    self.id = id;
    self.playAt = playAt;
    self.title = ko.observable();
    self.artist = ko.observable();
    self.duration = ko.observable();
    self.status = ko.observable(STATUS.NO_DATA);
    self.getInfo();
  };

  // Sends a request for song info through to the provider
  // Passes the song object because this involves a jsonp call
  // so we need to set values in a callback
  Song.prototype.getInfo = function() {
    var self = this;
    self.provider.getInfo(self);
  };

  Song.prototype.load = function() {
    var self = this;
    self.provider.load(self);
  };

  return Song;
});
