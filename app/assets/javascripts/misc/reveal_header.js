$(function() {
  var setHeaderWidth = function() {
    $('h1').each(function(i, box) {
      var width = window.innerWidth < 960 ? window.innerWidth : window.innerWidth - 370,
          html = '<span style="white-space:nowrap">',
          line = $(box).wrapInner(html).children()[0],
          n = 120;

      $(box).css('font-size', n);

      while ($(line).width() > width) {
        $(box).css( 'font-size', --n );
        console.log("trying", n);
      }

      $(box).text($(line).text());
    });
  };

  setHeaderWidth();
  $(window).resize(setHeaderWidth);
});
