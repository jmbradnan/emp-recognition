var canvas = document.getElementById('signature-pad');
var signaturePad = new SignaturePad(canvas, {
});

document.getElementById('administratorCheck').addEventListener('change', function () {
    var state = document.getElementById('administratorCheck').checked;
    var newState = state ? 'true' : 'false';
    document.getElementById('administrator_check').value = newState
});

function clearSignature() {
  signaturePad.clear();
}

function createSignature() {
  var data = signaturePad.toDataURL('image/png');
  $("#user_signature_initial").val(data);

  $("#new_signature").attr("src", data);

  hideFields('#enter_signature');
  showFields('#hidden_signature');
}