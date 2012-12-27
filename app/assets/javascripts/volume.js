define([
  'knockout'
], function(
  ko
) {
  var VolumeModel = function() {
    var self = this;
    var _volume = ko.observable(1);
    self.volume = ko.computed({
      read: _volume,
      write: function(newVolume) {
        if (newVolume === 0) {
          self.preMuteVolume = _volume();
        }
        _volume(newVolume);
      }
    });
    self.muted = ko.computed(function() {
      return self.volume() === 0;
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
