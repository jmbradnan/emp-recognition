
/*
  Employee-Recognition 
  Jackie Bradnan
  Oct 14, 2018

  Administration.js contains script to update users.
*/

//

$(document).ready(function () {
  // selectClient();
});

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