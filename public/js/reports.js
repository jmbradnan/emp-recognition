

function awardsCreated() {
    var url = "/awardsCreatedReport";
    fetch(url).then(function(response) {
    if(response.ok) {
      response.json().then(function(json) {
        // var data = json;
        console.log(json);
        // showReport(data);
        getChartData(json);
      });
    } else {
      console.log("error");
    }
  });
}

function getChartData(json) {
    var data = new google.visualization.DataTable();
  
    showFields('#report_area')
    data.addColumn('string', 'Name');
    data.addColumn('number', 'count');


    var size = Object.keys(json).length;
    var awardsCount = {};
    for (i=0; i<json.length; i++) {
        var id = json[i]['user_id'];
        if (!awardsCount.hasOwnProperty(id)) {
            awardsCount[id] = 1;
        } else {
           awardsCount[id] += 1;
        }
    }
    var table = new Array();
    var keys = Object.keys(awardsCount);
    for (j=0; j<keys.length; j++) {
        var id = keys[j];
        url = "/get-user" + "?id=" + id;
        fetch(url).then(function(response) {
            if(response.ok) {
            response.json().then(function(json) {
                var userData = json[0];
                var name = userData.fname + " " + userData.lname;
                var count = Number(awardsCount[userData.id]);
                table.push([name, count]);

                console.log(table);
                if (table.length === keys.length) {
                    data.addRows(table);
                    // Set chart options
                    var options = {'title':'Users that made awards',
                       'width':400,
                       'height':300};

                // Instantiate and draw our chart, passing in some options.
                var chart = new google.visualization.PieChart(document.getElementById('report'));
                chart.draw(data, options);
                }
                 });
            } else {
                console.log("error");
            }
       });
    }
    
}

// function showReport(data) {
//      var report = $("#report");
//      var size = Object.keys(data).length;
//      report.append(li);
//      console.log(size);
//      for (i=0; i<data.length; i++) {
//          console.log(data[i]['user_id']);
//          li = '<li>'+ "User: " + data[i]['user_id'] + '</li>';
//          report.append(li);
//      }
//      showFields('#report_area')
// }

