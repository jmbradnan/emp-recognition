var canvas2 = document.getElementById('signature-pad2');
var signaturePad = new SignaturePad(canvas2, {
});


/*
Select a user
*/
function selectUser(id) {
  var url = "/get-user" + "?id=" + id;
  fetch(url).then(function(response) {
    if(response.ok) {
      response.json().then(function(json) {
        var data = json[0];
        // console.log(data);
        $("#user_id_edit").val(id);
        $("#user_fname_edit").val(data.fname);
        $("#user_lname_edit").val(data.lname);
        $("#user_email_edit").val(data.email);
        $("#user_password_edit").val(data.password);
        console.log(data.signature);
        $("#user_signature_edit").val(data.signature);

        $("#signature_image").attr("src", data.signature);
      });
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

function updateSignature() {
  hideFields('#editable_user_fields');
  showFields('#editable_user_signature');
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