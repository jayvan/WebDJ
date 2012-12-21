define(function() {

  var handleEvent = function(e, valueAccessor) {
    var $this = $(this);
    var volume = (e.pageX - $this.offset().left) / $this.width();

    if (volume < 0) {
      volume = 0;
    } else if (volume > 1) {
      volume = 1;
    }

    valueAccessor()(volume);
  };

  ko.bindingHandlers.slide = {
    init: function(element, valueAccessor, allbindingsAccessor, viewModel, bindingContext) {
      $(element).on('click', function(e) {
        handleEvent.call(this, e, valueAccessor);
      });

      $(element).on('mousedown', function(e) {
        $('body').on('mousemove', function(e) {
          handleEvent.call(element, e, valueAccessor);
        });
        $('body').on('mouseup', function(e) {
          $('body').unbind('mousemove');
        });
        return false;
      });
    },

    update: function(element, valueAccessor, allbindingsAccessor, viewModel, bindingContext) {
      var value = valueAccessor();
      var valueUnwrapped = ko.utils.unwrapObservable(value);
      var $this = $(element);
      var newWidth = $this.width() * valueUnwrapped;
      $this.children().css('width', newWidth);
    }
  };
});
