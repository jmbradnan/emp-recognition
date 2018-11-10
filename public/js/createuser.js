var canvas = document.getElementById('signature-pad');
var signaturePad = new SignaturePad(canvas, {
});

function createSignature() {
  var data = signaturePad.toDataURL('image/png');
  $("#user_signature_initial").val(data);

  $("#new_signature").attr("src", data);
}