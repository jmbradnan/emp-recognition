

function awardsCreated() {
    var url = "/awardsCreatedReport";
    fetch(url).then(function(response) {
    if(response.ok) {
      response.json().then(function(json) {
        getAwardsCreatedChartData(json);
      });
    } else {
      console.log("error");
    }
  });
}

function awardsOverTime() {
    var url = "/awardsOverTimeReport";
    fetch(url).then(function(response) {
    if(response.ok) {
      response.json().then(function(json) {
        getAwardsOverTimeChartData(json);
      });
    } else {
      console.log("error");
    }
  });
}

function getAwardsOverTimeChartData(json) {
    var data = new google.visualization.DataTable();
    var months = ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];
    showFields('#report_area')
    data.addColumn('string', 'Date');
    data.addColumn('number', 'awards');
    console.log(json);
    var awardsCount = {};
    for (i=0; i<json.length; i++) {
        var returnedDate = json[i]['date'];
        var date = returnedDate.split("T");
        console.log(date[0]); 
        var parts = date[0].split("-");
        var month = parts[1];
        var year = parts[0];
        var id = month+year;
        if (!awardsCount.hasOwnProperty(id)) {
            awardsCount[id] = 1;
        } else {
           awardsCount[id] += 1;
        }
        console.log(awardsCount);
    }
    var table = new Array();
    var keys = Object.keys(awardsCount);
    for (j=0; j<keys.length; j++) {
        var monthLabel = keys[j].substring(0,2).replace(/^[0|\D]*/,'');
        var monthPosition = parseInt(monthLabel) -1;
        var yearLabel = keys[j].substring(2,6);
        var count = awardsCount[keys[j]];
        var dateLabel = months[monthPosition] + " " + yearLabel;
        console.log(monthLabel);
        table.push(dateLabel, count);
    }
     if (table.length === keys.length) {
        data.addRows(table);
        // Set chart options
        var options = {'title':'Who is making awards',
            'width':400,
            'height':300};

    // Instantiate and draw our chart, passing in some options.
    var chart = new google.visualization.PieChart(document.getElementById('report'));
    chart.draw(data, options);
    }
}

function getAwardsCreatedChartData(json) {
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
                    var options = {'title':'Who is making awards',
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


