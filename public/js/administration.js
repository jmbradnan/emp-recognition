
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

// var canvas = document.getElementById('signature-pad');
// var signaturePad = new SignaturePad(canvas, {
// });

// var canvas2 = document.getElementById('signature-pad2');
// var signaturePad = new SignaturePad(canvas2, {
// });


document.getElementById('save-png').addEventListener('click', function () {
  if (signaturePad.isEmpty()) {
    return alert("Please provide a signature first.");
  }
  
  var data = signaturePad.toDataURL('image/png');
  $("#user_signature_edit").val(data);
  // console.log(data);
  $("#signature_image").attr("src", data);
  hideFields('#editable_user_signature');
  showFields('#editable_user_fields');
});

document.getElementById('clear').addEventListener('click', function () {
  signaturePad.clear();
});

// function createSignature() {
//   var data = signaturePad.toDataURL('image/png');
//   $("#user_signature_initial").val(data);
//   hideFields('#enter_signature');
//   showFields('#hidden_signature');
//   $("#new_signature").attr("src", data);
// }


/* 
This method sets the user id and shows additional properties for that user
*/
// function editUser() {
//   hideFields($('#new_user_fields'));
//   hideFields($('#search_for_user'));
//   //get the info for selected client
//   var id = $("input[name='selected_user']:checked").val();
//   hideFields('#select_user');
//   selectUser(id);
//   showFields('#editable_user_fields')
// }

// /*
// Delete user
// */
// function deleteUser() {
//   var fields = $("#editable_user_fields .input-field");
//   var id = $('#user_id_edit').val();
//   var query = "/delete-user" + queryBuilder("id", id, fields);
//   fetch(query).then(function(response) {
//     if(response.ok) {
//       console.log("ok");
//     } else {
//       console.log("error");
//     }
//   });
// }

// /*
// Display all users
// */
// function showAllUsers() {
//   fetch("/show-all-users").then(function(response) {
//     console.log(response);
//     if(response.ok) {
//       console.log("ok");
//     } else {
//       console.log("error");
//     }
//   });
// }

// function userSelection() {
//   $('#admin_content-area').contents().find('body').html("");
//   $('#admin_content-area').attr('src', 'edituser');
// }

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
Select a user
*/
// function selectUser(id) {
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


/* 
 Show available reports
*/
function reportsDisplay() {
  showView();
}

// function updateSignature() {
//   hideFields('#editable_user_fields');
//   showFields('#editable_user_signature');
// }

function searchForUser() {
  alert("searchForUser nyi");
}

// // Toggles display to all users
// function allUserDisplay() {
//   showFields('#all_user_fields');
//   hideFields('#new_user_fields');
//   hideFields('#select_user');
//   hideFields('#search_for_user');
//   hideFields('#editable_user_fields');
//   showUsers();
// }

// // Toggles display to appropriate fields for adding new client
// function newUserDisplay(){
//   showFields('#new_user_fields');
//   hideFields('#all_user_fields');
//   hideFields('#select_user');
//   hideFields('#search_for_user');
//   hideFields('#editable_user_fields');
// }




// Toggles display to appropriate fields for editing existing user
// function editUserDisplay(){
//   showFields('#select_user');
//   hideFields('#all_user_fields');
//   hideFields('#new_user_fields');
//   hideFields('#search_for_user');
//   hideFields('#editable_user_fields');
// }

// Toggles Search controls
function searchUserDisplay() {
  showFields('#search_for_user');
  hideFields('#all_user_fields');
  hideFields('#new_user_fields');
  hideFields('#select_user');
  hideFields('#editable_user_fields');
}
