(function($) {
  if(!$) return;

  document.addEventListener('DOMContentLoaded', function() {
    $('form.ajax-post[action]').each(function() {
      console.log(this);
      this.addEventListener('submit', function(event) {
        event.preventDefault();

        console.log('sending post');

        if($(this).attr('action')) {
          var then = function(data) {
            console.log(data);
          };
          var fail = function(err) {
            console.error(err);
          };

          if($(this).attr('onsuccess')) {
            then = eval($(this).attr('onsuccess'));
          }
          if($(this).attr('onfail')) {
            fail = eval($(this).attr('onfail'));
          }

          var data = {};
          $(this).children('[name]').each(function() {
            var splits = $(this).attr('name').split('.');
            splits.reduce((prev, cur) => {
              var evalString = 'data' + prev.map(p => '[\'' + p.split('\'').join('\\\'') + '\']').join('') + '[\'' + cur.split('\'').join('\\\'') + '\']';
              if(cur == splits[splits.length - 1]) {
                var v = $(this).val();
                if(typeof v == 'string') {
                  eval(evalString + '=\'' + v.split('\'').join('\\\'') + '\'');
                } else if(typeof v == 'number' || typeof v == 'boolean') {
                  eval(evalString + '=' + v);
                }
              } else {
                eval('if(!' + evalString + ') ' + evalString + '={};');
              }
              return prev.concat(cur);
            }, []);
          });

          $.ajax({
            url: $(this).attr('action'),
            method: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json'
          }).then(then).fail(fail);
        }
      });
    });
  });
})(window.jQuery);