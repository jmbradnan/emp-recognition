/*
  Employee-Recognition: Administration.js
  Jackie Bradnan
  Oct 14, 2018

  Administration.js contains script to update and create users as well as show available reports.
*/

$(document).ready(function () {
  // Highlight selected navigation
  $(".nav > li").click(function () {
    $(".nav > li.highlighted").removeClass("highlighted");
    $(this).addClass("highlighted");
  });
});

function initialPageView() {
  $("#reportsNavigation").addClass("highlighted");
  reportsDisplay();
}

/* 
 Displays users
*/
function displayUserList() {
  $('#admin_content-area').contents().find('body').html("");
  $('#admin_content-area').attr('src', 'edituser');
}

/* 
 Create new user
*/
function createNewUser() {
  $('#admin_content-area').contents().find('body').html("");
  $('#admin_content-area').attr('src', 'createuser');
}

/* 
 Show available reports
*/
function reportsDisplay() {
  $('#admin_content-area').contents().find('body').html("");
  $('#admin_content-area').attr('src', 'reports');
}

