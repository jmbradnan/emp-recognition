

function awardsCreated() {
    var url = "/awardsCreatedReport";
    fetch(url).then(function(response) {
    if(response.ok) {
      response.json().then(function(json) {
        // var data = json;
        console.log(json);
        // showReport(data);
        drawChart(json);
      });
    } else {
      console.log("error");
    }
  });
}

//   var url = "/get-user" + "?id=" + id;
//   fetch(url).then(function(response) {
//     if(response.ok) {
//       response.json().then(function(json) {
//         var data = json[0];
//         // console.log(data);
//         $("#user_id_edit").val(id);
//         $("#user_fname_edit").val(data.fname);
//         $("#user_lname_edit").val(data.lname);
//         $("#user_email_edit").val(data.email);
//         $("#user_password_edit").val(data.password);
//         console.log(data.signature);
//         $("#user_signature_edit").val(data.signature);

//         $("#signature_image").attr("src", data.signature);
//       });
//     } else {
//       console.log("error");
//     }
//   });
// }

function drawChart(json) {
    var data = new google.visualization.DataTable();
  
    showFields('#report_area')
    data.addColumn('string', 'Name');
    // data.addColumn('number', 'ID');
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
        console.log(awardsCount);
    }
    var table = {};
    var keys = Object.keys(awardsCount);
    for (j=0; j<keys.length; j++) {
        var id = keys[j];
        url = "/get-user" + "?id=" + id;
        fetch(url).then(function(response) {
            if(response.ok) {
            response.json().then(function(json) {
                var userData = json[0];
                var name = userData.fname + " " + userData.lname;
                var count = awardsCount[id];
                table[name] = count;
                 });
            } else {
                console.log("error");
            }
       });

    }

// data.rows("User", id);
    // Set chart options
        // var options = {'title':'Users that made awards',
        //                'width':400,
        //                'height':300};

        // // Instantiate and draw our chart, passing in some options.
        // var chart = new google.visualization.BarChart(document.getElementById('report'));
        // chart.draw(data, options);
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

