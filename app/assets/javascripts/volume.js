define(function() {
  var VolumeModel = function() {
    var self = this;
    var volume = ko.observable(1);
    self.volume = ko.computed({
      read: volume,
      write: function(newVolume) {
        if (newVolume === 0) {
          self.preMuteVolume = volume();
        }
        volume(newVolume);
      }
    });
    self.muted = ko.computed(function() {
      return volume() === 0;
    });

    self.preMuteVolume = 1;
  };

  VolumeModel.prototype.toggleMute = function() {
    this.muted() ? this.unMute() : this.mute();
  };

  VolumeModel.prototype.mute = function() {
    this.volume(0);
  };

  VolumeModel.prototype.unMute = function() {
    if (this.preMuteVolume === 0) {
      this.preMuteVolume = 1;
    }

    this.volume(this.preMuteVolume);
  };

  return VolumeModel;
});
