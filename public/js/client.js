
/*
  Vettracker 
  Jackie Bradnan
  March 5, 2017

  Client.js contains script to update client tables including modifying pets (animal table)
  adding pets, or adding new clients.
*/

$(document).ready(function () {
  selectClient();
});

Handlebars.registerHelper('formatTime', function (date, format) {
    var mmnt = moment(date);
    return mmnt.format(format);
});

/* updates fields for pet */
function updatePet() {
  clearError();
  var errortxt = "";
  var fields = $("#editable_pet_fields .input-field");
  var petid = $("#pet_id_edit").val();

  errortxt = checkInputs(fields, errortxt);
  if (errortxt == "") {
    var query = "/update-pet" + queryBuilder("idanimal", petid, fields);
    var req = new XMLHttpRequest();
    //need to make this call synchronous so it completes before selectClientAndPets() is called
    req.open('GET', query, false);
    req.send();
    selectClientAndPets();
  } else {
    displayError(errortxt);
  }
}

//flips display to appropriate fields for adding new client
function newClientDisplay(){
  hideFields('#select_client');
  hideFields('#list_client_pet_fields');
  hideFields('#search_for_client');
  showFields('#new_client_fields');
}

//flips display to appropriate fields for editing existing client
function editClientDisplay(){
  showFields('#select_client');
  hideFields('#search_for_client');
  hideFields('#new_client_fields');
}

//flips display to appropriate fields for searching for client
function searchClientDisplay(){
  hideFields('#select_client');
  hideFields('#list_client_pet_fields');
  showFields('#search_for_client');
  hideFields('#new_client_fields');
}

/* 
This method sets the client id and shows all pets for that client
*/
function editClient() {
  hideFields($('#new_client_fields'));
  hideFields($('#search_for_client'));
  //get the info for selected client
  var myClient = $("input[name='selected_client']:checked").val();
  hideFields('#select_client');
  selectClientAndPets();
  showFields('#list_client_pet_fields');
}

function searchForClient() {
  hideFields($('#new_client_fields'));
  hideFields($('#select_client'));

  //http://stackoverflow.com/questions/12340789/split-first-name-and-last-name-using-javascript
  var fullName = $('#name_search').val().split(' ');
  fname = fullName[0],
  lname = fullName[fullName.length - 1];
  var req = new XMLHttpRequest();
  req.open('GET', '/get-client-by-name' + "?fname=" + fname + "&lname=" + lname, false);
  req.send();
  var response = JSON.parse(req.responseText);
  var data = JSON.parse(req.responseText);
  
  if (response[0] == undefined)
  {
    displayError("Client not found.");
  } else {
    console.log("Client found");
    myClient=response[0].idclient;

  //display all previous visits for this client
  req = new XMLHttpRequest();
  req.open('GET', '/get-client-visits' + "?idclient=" + myClient, false);
  req.send();
  response = JSON.parse(req.responseText);
  source = $("#appointment_report_template").html();
  template = Handlebars.compile(source);
  $("#appointments_found").append(template({ objects: response }));
  showFields($('#appointments_found'));
  //show/hide appropriate fields
  showFields($('#client_found'));
  }
}

/* 
Deletes selected pet for that client
*/
function deletePet(petid) {
  var req = new XMLHttpRequest();
  req.open('GET', '/delete-pet' + "?idanimal=" + petid, false);
  req.send();
  selectClientAndPets();
}

/* display the pet edit fields prepopulated with data for selected pet */
function showEditPetFields(petid) {
  var req = new XMLHttpRequest();
  req.open('GET', '/get-pet-data' + "?idanimal=" + petid, false);
  req.send();
  var response = JSON.parse(req.responseText);
  var data = response[0];
  $("#pet_id_edit").val(petid);
  $("#pet_name_edit").val(data.name);
  $("#pet_type_edit").val(data.type);
  $("#pet_dob_edit").val(data.dob);
  showFields('#editable_pet_fields');
}

/*
// gets all clients 
function selectClient() {
  var req = new XMLHttpRequest();
  req.open('GET', '/get-clients', false);
  req.send();
  var data = JSON.parse(req.responseText);

  var source = $("#clients").html();
  var template = Handlebars.compile(source);
  $("#client_list").append(template({ objects: data }));
}
*/

/* Add a new pet for a specified client, ownerid should not be NULL */
function addNewPet() {
  clearError();
  var errortxt = "";
  var fields = $("#add_pet_fields .input-field");
  //get the info for selected client
  var ownerid = $("input[name='selected_client']:checked").val();
  errortxt = checkInputs(fields, errortxt);
  if (errortxt == "") {
    var query = "/new-pet" + queryBuilder("ownerid", ownerid, fields);
    var req = new XMLHttpRequest();
    //need to make this call synchronous so it completes before selectClientAndPets() is called
    req.open('GET', query, false);
    req.send();
    selectClientAndPets();
  } else {
    displayError(errortxt);
  }
}

/* selects all pets for a specified client */
function selectClientAndPets() {
  var el = document.getElementById("client_and_pet_list");
  el.innerHTML = '';
  var myClient = $("input[name='selected_client']:checked").val();
  var request = "?idclient=" + myClient;
  var req = new XMLHttpRequest();
  req.open('GET', '/get-pets' + request, false);
  req.send();
  var data = JSON.parse(req.responseText);

  var source = $("#clients_with_pets").html();
  var template = Handlebars.compile(source);
  $("#client_and_pet_list").append(template({ objects: data }));
}
