/*
  Employee Recognition
  Jackie Bradnan
  Oct 20, 2018

  common.js contains common scripts for the Employee Recognition app
*/


//reveal hidden fieldset
function showFields(identifier) {
  $(identifier).show();
}

//hide fieldset
function hideFields(identifier) {
  $(identifier).hide();
}

// builds query for client-server calls.    Assumes some primary key (keyName=idkey)
// and arbitrary set of input fields with values
function queryBuilder(keyName, idkey, fields) {
  var query = "?" + keyName + "=" + idkey;
  var length = fields.length;

  //iterates through each input field and adds name/value pair to query
  for (var i = 0; i < length; i++) {
    query += "&" + fields[i].name + "=";
    query += fields[i].value;
  }
  return query;
}
