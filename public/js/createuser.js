/*
  Employee-Recognition: createuser.js
  Jackie Bradnan
  Oct 14, 2018

  createuser.js contains script to create users.
*/

/*
  Set up signature pad.
*/
var canvas = document.getElementById('signature-pad');
var signaturePad = new SignaturePad(canvas, {
});

document.getElementById('administratorCheck').addEventListener('change', function () {
  var state = document.getElementById('administratorCheck').checked;
  var newState = state ? 'true' : 'false';
  document.getElementById('administrator_check').value = newState
});

/*
 Save signature and show as image
 */
function createSignature() {
  var data = signaturePad.toDataURL('image/png');
  $("#user_signature_initial").val(data);

  $("#new_signature").attr("src", data);

  hideFields('#enter_signature');
  $("#error_text").addClass("invisible");
  showFields('#hidden_signature');
}

/*
 Check form compliance before submission.
 */
function checkform()
{
  var signature = $('#user_signature_initial').val();
	if (signature === '' || signature === undefined)
	{
    // something is wrong
    displayError("Please enter a signature");
   $("#error_text").removeClass("invisible");
		return false;
	}
  $("#error_text").addClass("invisible");
	return true;
}