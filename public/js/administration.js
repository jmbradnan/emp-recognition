
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
  var myUser = $("input[name='selected_user']:checked").val();
  hideFields('#select_user');
  selectUser(myUser);
}

function selectUser(myUser) {
  var url = "/get-user" + "?id=" + myUser;
  fetch(url).then(function(response) {
    if(response.ok) {
      response.json().then(function(json) {
        var test = json;
        console.log(test);
      });
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