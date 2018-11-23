function displayAllAwards() {
    var url = "/displayAllAwards";
    fetch(url).then(function(response) {
    if(response.ok) {
      response.json().then(function(json) {
        getAllAwardsChart(json);
      });
    } else {
      console.log("error");
    }
  });
}

function awardsCreated() {
    var url = "/awardsCreatedReport";
    fetch(url).then(function(response) {
    if(response.ok) {
      response.json().then(function(json) {
        getAwardsCreatedChart(json);
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
        getAwardsOverTimeChart(json);
      });
    } else {
      console.log("error");
    }
  });
}

function updateContentAreaSize() {
    
}

function getAllAwardsChart(json) {
    var data = new google.visualization.DataTable();
    showFields('#report_area');
    data.addColumn('string', 'Award From');
    data.addColumn('string', 'Award To');
    data.addColumn('string', 'Email');
    data.addColumn('string', 'Award-Type');
    data.addColumn('string', 'Time');
    data.addColumn('string', 'Date');
    var table = new Array();
    for (i=0; i<json.length; i++) {
        var sender = json[i]['fname'] + " " + json[i]['lname'];
        var recipient = json[i]['name'];
        var email = json[i]['email'];
        var type = json[i]['type'];
        var time = moment(json[i]['time'], 'HH:mm:ss').format('h:mm A');
        var date = json[i]['date'].split("T");
        var dateShortened = date[0];
        table.push([sender, recipient, email, type, time, dateShortened]);
    }
     data.addRows(table);
     // Instantiate and draw our chart, passing in some options.
    var chart = new google.visualization.Table(document.getElementById('report'));
    chart.draw(data, {showRowNumber: true, width: '100%', height: '100%'});
}

function getAwardsOverTimeChart(json) {
    var data = new google.visualization.DataTable();
    var months = ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];
    showFields('#report_area');
    data.addColumn('string', 'Date');
    data.addColumn('number', 'Awards');
    data.addColumn('number', 'Weekly');
    data.addColumn('number', 'Monthly');
    console.log(json);
    var table = new Array();
    var keys = [];
    var awardsCount = {};
    var typeCount = {};
    for (i=0; i<json.length; i++) {
        var returnedDate = json[i]['date'];
        var date = returnedDate.split("T");
        console.log(date[0]); 
        var parts = date[0].split("-");
        var month = parts[1];
        var year = parts[0];
        var id = month+year;
        var type = json[i]['type'];
        if (!awardsCount.hasOwnProperty(id)) {
            keys.push(id);
            if (type === "Month") {
                awardsCount[id] = [1, 0, 1];
            } else {
                awardsCount[id] = [1, 1, 0];
            }
        } else {
           awardsCount[id][0] += 1;
           if (type === "Month") {
               awardsCount[id][2] += 1;
           } else {
               awardsCount[id][1] += 1;
           }
        }
        console.log(awardsCount);
    }
    // var keys = Object.keys(awardsCount);   // need these in date sorted order
    for (j=0; j<keys.length; j++) {
        var monthLabel = keys[j].substring(0,2).replace(/^[0|\D]*/,'');
        var monthPosition = parseInt(monthLabel) -1;
        var yearLabel = keys[j].substring(2,6);
        var count = awardsCount[keys[j]][0];
        var weekly = awardsCount[keys[j]][1];
        var monthly = awardsCount[keys[j]][2];
        var dateLabel = months[monthPosition] + " " + yearLabel;
        console.log(monthLabel);
        table.push([dateLabel, count, weekly, monthly]);
        console.log(table);
    }
        data.addRows(table);
        // Set chart options
        var options = {'title':'Awards by month',
          curveType: 'function',
           'width':400,
           'height':300,
          legend: { position: 'bottom' }
        };
     // Instantiate and draw our chart, passing in some options.
    var chart = new google.visualization.LineChart(document.getElementById('report'));
    chart.draw(data, options);
    
}

function getAwardsCreatedChart(json) {
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


