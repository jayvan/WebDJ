define([
  "providers/youtube",
  "providers/soundcloud"
], function(
  Youtube,
  Soundcloud
){
  return {
    'youtube': Youtube,
    'soundcloud': Soundcloud
  };
});

// A 'provider' is a source for music such as Youtube or Soundcloud
// They loosely model the "visitor" design pattern, but are also "Modules"
// Each provider must have the following methods
//
// load(song)
// - Think of this as the "constructor" for playback.
// - Set the songs player attribute
//
// start(song)
// - Trigger playback of the player
//
// stop(song)
// - Think of this as the "deconstructor" for playback
// - stop playback and delete the player
//
// setVolume(song, volume)
// - Sets the players volume to the given volume
// - Given volume is in the range [0-1] so multiply accordingly
//
// search(query, callback)
// - Call the provider's API with the given query
// - If possible limit your search to 'streamable' songs
// - Massage the API results into Song objects and pass them as an array to the callback
