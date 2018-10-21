
/*
  Employee-Recognition 
  Jackie Bradnan
  Oct 14, 2018

  Administration.js contains script to update users.
*/

$(document).ready(function () {
  // selectClient();
});

function showUsers() {
  fetch("/show-all-users").then(function(response) {
    if(response.ok) {
      console.log("ok");
    } else {
      console.log("error");
    }
  });
}

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

/*
Delete user
*/
function deleteUser() {
  var fields = $("#editable_user_fields .input-field");
  var id = $('#user_id_edit').val();
  var query = "/delete-user" + queryBuilder("id", id, fields);
  fetch(query).then(function(response) {
    if(response.ok) {
      console.log("ok");
    } else {
      console.log("error");
    }
  });
}

/*
Select a user
*/
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

/*
Update a user
*/
function updateUser() {
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

function searchForUser() {
  alert("searchForUser nyi");
}

// Toggles display to all users
function allUserDisplay() {
  showFields('#all_user_fields');
  hideFields('#new_user_fields');
  hideFields('#select_user');
  hideFields('#search_for_user');
}

// Toggles display to appropriate fields for adding new client
function newUserDisplay(){
  showFields('#new_user_fields');
  hideFields('#all_user_fields');
  hideFields('#select_user');
  hideFields('#search_for_user');
}

// Toggles display to appropriate fields for editing existing user
function editUserDisplay(){
  showFields('#select_user');
  hideFields('#all_user_fields');
  hideFields('#new_user_fields');
  hideFields('#search_for_user');
}

// Toggles Search controls
function searchUserDisplay() {
  showFields('#search_for_user');
  hideFields('#all_user_fields');
  hideFields('#new_user_fields');
  hideFields('#select_user');
}