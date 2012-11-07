define([
  "providers"
], function(
  Providers
){
  var Song = function(provider, id, playAt) {
    var self = this;
    self.provider = Providers[provider];
    self.id = id;
    self.playAt = playAt;
    this.title = ko.observable();
    this.artist = ko.observable();
    this.duration = ko.observable();
    self.getInfo();
  };

  // Sends a request for song info through to the provider
  // Passes the song object because this involves a jsonp call
  // so we need to set values in a callback
  Song.prototype.getInfo = function() {
    var self = this;
    $.extend(self,
      self.provider.getInfo(self));
  };

  return Song;
});
