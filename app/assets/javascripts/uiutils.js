$(function() {
  $('h1').each(function(i, box) {
    var width = $( box ).width(),
        html = '<span style="white-space:nowrap">',
        line = $(box).wrapInner(html).children()[0],
        n = 120;

    $(box).css('font-size', n);

    while ($(line).width() > width) {
      $(box).css( 'font-size', --n );
    }

    $(box).css('opacity', 1);
  });
});
