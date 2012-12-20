define([
  "song",
  "utils",
  'song-status'
], function(
  Song,
  utils,
  STATUS
){
  var youtube = {
    name: 'youtube'
  };

  youtube.load = function(song) {
    var startPosition = Math.max(utils.time() - song.playAt, 0);
    var embedUrl = "https://www.youtube-nocookie.com/v/" + song.mediaId + "?version=3&autoplay=1&enablejsapi=1&start=" + startPosition;
    var playerHTML = '<object allowScriptAccess="always" type="application/x-shockwave-flash" width="320" height="320" data="' + embedUrl + '" style="visibility:hidden;position:absolute;top:0;left:0;"><param name="movie" value="' + embedUrl + '" /><param name="wmode" value="transparent" /></object>';
    var $playerHTML = $(playerHTML);

    song.player = $playerHTML;
    song.status(STATUS.LOADED);

    var timeUntilStart = Math.max(song.playAt - utils.time(), 0) * 1000;
    var timeUntilEnd = (song.playAt + song.duration - utils.time()) * 1000;

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
  };

  youtube.setVolume = function(song, volume) {
    song.player[0].setVolume(volume * 100);
  };

  youtube.search = function(query, callback) {
    var url = "https://gdata.youtube.com/feeds/api/videos?v=2&alt=json-in-script&callback=?&q=" + encodeURIComponent(query);
    $.getJSON(url, function(data) {
      // If there are no results
      if (data.feed.entry === undefined) {
        data.feed.entry = [];
      }

      callback(data.feed.entry.map(function(item) {
        var songData = {
          artist: item.author[0].name.$t,
          title: item.title.$t,
          provider: youtube,
          thumbnail: item.media$group.media$thumbnail[0].url,
          mediaId: item.media$group.yt$videoid.$t,
          duration: parseInt(item.media$group.yt$duration.seconds, 10)
        };
        return new Song(songData);
      }));
    });
  };

  return youtube;
});
