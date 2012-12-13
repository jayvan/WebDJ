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
      var embedUrl = "https://www.youtube-nocookie.com/v/" + song.mediaId + "?version=3&autoplay=1&enablejsapi=1&start=" + startPosition;
      var playerHTML = '<object allowScriptAccess="always" type="application/x-shockwave-flash" width="300" height="300" allowScriptAccess="always" data="' + embedUrl + '" style="visibility:hidden;position:absolute;top:0;left:0;"><param name="movie" value="' + embedUrl + '" /><param name="wmode" value="transparent" /></object>';
      var $playerHTML = $(playerHTML);

      song.player = $playerHTML;
      song.status(STATUS.LOADED);

      var timeUntilStart = Math.max(song.playAt - Utils.time(), 0) * 1000;
      var timeUntilEnd = (song.playAt + song.duration - Utils.time()) * 1000;
      // Inject the html
      window.setTimeout(function() {
        $('#playback').append(song.player);
        song.status(STATUS.PLAYING);
      }, timeUntilStart);

      // Clean up the html
      window.setTimeout(function() {
        song.player.remove();
        song.status(STATUS.FINISHED);
      }, timeUntilEnd);
    },

    setVolume: function(song, volume) {
      song.player[0].setVolume(volume * 100);
    },

    search: function(query, callback) {
      var url = "https://gdata.youtube.com/feeds/api/videos?v=2&alt=json-in-script&callback=?&q=" + encodeURIComponent(query);
      $.getJSON(url, function(data) {
        callback(data.feed.entry.map(function(item) {
          return {
            artist: item.author[0].name.$t,
            title: item.title.$t,
            provider: 'youtube',
            thumbnail: item.media$group.media$thumbnail[0].url,
            mediaId: item.media$group.yt$videoid.$t
          };
        }));
      });
    }
  };
});
