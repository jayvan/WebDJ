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
    var startPosition = Math.max(utils.time() - song.playAt, 0);
    song.status(STATUS.LOADED);

    var timeUntilStart = Math.max(song.playAt - utils.time(), 0) * 1000;
    var timeUntilEnd = (song.playAt + song.duration - utils.time()) * 1000;
    // Inject the html
    window.setTimeout(function() {
      var stream_url = "http://api.soundcloud.com/tracks/" + song.mediaId + "/stream?client_id=" + SETTINGS.SOUNDCLOUD_KEY;
      song.player = new Audio(stream_url);

      // You can't set the playing position until the metadata has loaded
      song.player.addEventListener('canplay', function(e) {
        song.player.currentTime = startPosition;
        song.status(STATUS.PLAYING);
      });

      song.player.addEventListener('timeupdate', function(e) {
        song.currentTime(Math.round(this.currentTime));
      });

      song.player.play();
    }, timeUntilStart);

    // Clean up the html
    window.setTimeout(function() {
      song.player.pause();
      song.status(STATUS.FINISHED);
    }, timeUntilEnd);
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
