define([
  "utils",
  'song-status'
], function(
  Utils,
  STATUS
){
  return {
    load: function(song) {
      var startPosition = Math.max(Utils.time() - song.playAt, 0);
      var player;

      song.status(STATUS.LOADED);

      var timeUntilStart = Math.max(song.playAt - Utils.time(), 0) * 1000;
      var timeUntilEnd = (song.playAt + song.duration - Utils.time()) * 1000;
      // Inject the html
      window.setTimeout(function() {
        player = new Audio(song.streamUrl);

        // You can't set the playing position until the metadata has loaded
        player.addEventListener('canplay', function(e) {
          player.currentTime = startPosition;
        });

        player.play();

        song.status(STATUS.PLAYING);
      }, timeUntilStart);

      // Clean up the html
      window.setTimeout(function() {
        player.pause();
        song.status(STATUS.FINISHED);
      }, timeUntilEnd);
    },

    search: function(query, callback) {
      var url = "/api/soundcloud_search?query=" + encodeURIComponent(query);
      $.getJSON(url, function(data) {
        callback(data.map(function(item) {
          return {
            artist: item.user.username,
            title: item.title,
            provider: 'soundcloud',
            thumbnail: item.artwork_url,
            mediaId: item.id
          };
        }));
      });
    }
  };
});
