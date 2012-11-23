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
