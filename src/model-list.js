(function($) {
  if(!$) return;

  document.addEventListener("DOMContentLoaded", function() {
    $("table.model-list").each(function() {
      var model = $(this).attr("model");
      console.log(model);
      $.ajax({
        url: "/api/" + model
      }).then(data => {
        if(data && typeof data == 'object' && data instanceof Array) {
          if(data.length > 0) {
            $(this).children('thead').html("<tr>" +
            Object.keys(data[0])
            .sort((a, b) => a > b ? 1 : -1)
            .map(key => "<th>" + key + "</th>").join('\n') + "</tr>");
            $(this).children('tbody').html(data.map(d => {
              return "<tr>" + Object.keys(d).sort((a, b) => a > b ? 1 : -1).map(key => {
                  if(key == "_id") {
                    return "<td><a href=\"/api/" + model + "/" + d[key] + "\">" + d[key] + "</a></td>"
                  } else if(key == 'hash' || key == 'password') {
                    return "<td>String[" + d[key].length + "]</td>";
                  } else {
                    return "<td>" + d[key] + "</td>"
                  }
                }).join('\n') + "</tr>";
            }).join('\n'));
          }
        } else {
          console.log(data);
        }
      }).fail(err => {
        console.error(err);
      })
    })
  });
})(jQuery);