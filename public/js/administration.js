
/*
  Employee-Recognition: Administration.js
  Jackie Bradnan
  Oct 14, 2018

  Administration.js contains script to update users.
*/
// Adjust canvas coordinate space taking into account pixel ratio,
// to make it look crisp on mobile devices.
// This also causes canvas to be cleared.
// function resizeCanvas() {
//     // When zoomed out to less than 100%, for some very strange reason,
//     // some browsers report devicePixelRatio as less than 1
//     // and only part of the canvas is cleared then.
//     var ratio =  Math.max(window.devicePixelRatio || 1, 1);
//     canvas.width = canvas.offsetWidth * ratio;
//     canvas.height = canvas.offsetHeight * ratio;
//     canvas.getContext("2d").scale(ratio, ratio);
// }

// window.onresize = resizeCanvas;
// resizeCanvas();

$(document).ready(function() {
  // Highlight selected navigation
    $(".nav > li").click(function(){
      $(".nav > li.highlighted").removeClass("highlighted");
      $(this).addClass("highlighted");
    });
    
});

function showUsers() {
  $('#admin_content-area').contents().find('body').html("");
  $('#admin_content-area').attr('src', 'displayusers');
}


function displayUserList() {
  $('#admin_content-area').contents().find('body').html("");
  $('#admin_content-area').attr('src', 'edituser');
}

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

function searchForUser() {
  $('#admin_content-area').contents().find('body').html("");
  $('#admin_content-area').attr('src', 'search');
}


// Toggles Search controls
function searchUserDisplay() {
  showFields('#search_for_user');
  hideFields('#all_user_fields');
  hideFields('#new_user_fields');
  hideFields('#select_user');
  hideFields('#editable_user_fields');
}
