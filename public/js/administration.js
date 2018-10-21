
/*
  Employee-Recognition 
  Jackie Bradnan
  Oct 14, 2018

  Administration.js contains script to update users.
*/

$(document).ready(function () {
  // selectClient();
});

/* 
This method sets the user id and shows additional properties for that user
*/
function editUser() {
  hideFields($('#new_user_fields'));
  hideFields($('#search_for_user'));
  //get the info for selected client
  var id = $("input[name='selected_user']:checked").val();
  hideFields('#select_user');
  selectUser(id);
  showFields('#editable_user_fields')
}


function selectUser(id) {
  var url = "/get-user" + "?id=" + id;
  fetch(url).then(function(response) {
    if(response.ok) {
      response.json().then(function(json) {
        var data = json[0];
        console.log(data);
        $("#user_id_edit").val(id);
        $("#user_fname_edit").val(data.fname);
        $("#user_lname_edit").val(data.lname);
        $("#user_email_edit").val(data.email);
        $("#user_password_edit").val(data.password);
      });
    } else {
      console.log("error");
    }
  });
}

function updateUser() {
  // var id = $("input[name='user_id_edit']").val();
  // var fname = $("input[name='user_fname_edit']").val();
  // var lname = $("input[name='user_lname_edit']").val();
  // var email = $("input[name='user_email_edit']").val();
  // var password = $("input[name='user_password_edit']").val();
  // var url = "/update-user" + "?id=" + id + "&fname=" + fname + "&lname=" + lname + "&email=" + email + "&password=" + password;
  var fields = $("#editable_user_fields .input-field");
  var id = $('#user_id_edit').val();
  var query = "/update-user" + queryBuilder("id", id, fields);
  fetch(query).then(function(response) {
    if(response.ok) {
      console.log("ok");
    } else {
      console.log("error");
    }
  });
}
// Toggles display to appropriate fields for adding new client
function newUserDisplay(){
  showFields('#new_user_fields');
  hideFields('#select_user');
  hideFields('#search_for_user');
}

// Toggles display to appropriate fields for editing existing user
function editUserDisplay(){
  showFields('#select_user');
  hideFields('#new_user_fields');
  hideFields('#search_for_user');
}

// Toggles Search controls
function searchUserDisplay() {
  showFields('#search_for_user');
  hideFields('#new_user_fields');
  hideFields('#select_user');
}