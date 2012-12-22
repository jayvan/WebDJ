define([
  "utils",
  'song-status',
  'settings',
  'song'
], function(
  utils,
  STATUS,
  SETTINGS,
  Song
){
  var soundcloud = {
    name: 'soundcloud'
  };

  soundcloud.load = function(song) {
    // Nothing special to do here.
  };

  soundcloud.start = function(song) {
    var startPosition = Math.max(utils.time() - song.playAt, 0);
    var stream_url = "http://api.soundcloud.com/tracks/" + song.mediaId + "/stream?client_id=" + SETTINGS.SOUNDCLOUD_KEY;
    song.player = new Audio(stream_url);

    // You can't set the playing position until the metadata has loaded
    song.player.addEventListener('loadedmetadata', function(e) {
      song.player.currentTime = startPosition;
      song.status(STATUS.PLAYING);
      song.player.play();
    });

    song.player.addEventListener('timeupdate', function(e) {
      song.currentTime(Math.round(this.currentTime));
    });
  };

  soundcloud.stop = function(song) {
    if (song.player) {
      song.player.pause();
    }
    delete song.player;
  };

  soundcloud.setVolume = function(song, volume) {
    song.player.volume = volume;
  },

  soundcloud.search = function(query, callback) {
    var url = "http://api.soundcloud.com/tracks.json?client_id=" + SETTINGS.SOUNDCLOUD_KEY + "&filter=streamable&callback=?&q=" + encodeURIComponent(query);
    $.getJSON(url, function(data) {
      callback(data.map(function(item) {
        var songData = {
          artist: item.user.username,
          title: item.title,
          provider: soundcloud,
          thumbnail: item.artwork_url,
          mediaId: item.id,
          duration: item.duration / 1000
        };
        return new Song(songData);
      }));
    });
  };

  return soundcloud;
});
