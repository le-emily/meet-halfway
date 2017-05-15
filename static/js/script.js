// holds lat/long of both locations
var locations = [];
var geocoder;
var map;

function initialize() {
  var directionsService = new google.maps.DirectionsService;
  var directionsDisplay = new google.maps.DirectionsRenderer;
  geocoder = new google.maps.Geocoder();
  var latlng = new google.maps.LatLng(37.78, -122.41);
  var mapOptions = {
        zoom: 8,
        center: latlng
  }
  map = new google.maps.Map(document.getElementById('map'), mapOptions);
  directionsDisplay.setMap(map);
  function onSubmit(evt) {
    evt.preventDefault();
    // codeAddress_a(evt);
    // codeAddress_b(evt);
    calculateAndDisplayRoute(directionsService, directionsDisplay);
  }

  document.getElementById("find-midpoint").addEventListener("click", onSubmit);
}

// Directions Services
function calculateAndDisplayRoute(directionsService, directionsDisplay) {
  var location_a = document.getElementById('location_a').value;
  var location_b = document.getElementById('location_b').value;
  directionsService.route({
    origin: location_a,
    destination: location_b,
    travelMode: 'DRIVING'
  }, function(response, status) {
    if (status === 'OK') {
      directionsDisplay.setDirections(response);
    } else {
      window.alert('Directions request failed due to ' + status);
    }
  });
}

function codeAddress_a(evt) {
  var address = document.getElementById('location_a').value;
  var location_a = [];
  geocoder.geocode( { 'address': address}, function(results, status) {
  if (status == 'OK') {

    location_a[0] = results[0].geometry.location.lat();
    location_a[1] = results[0].geometry.location.lng();

    map.setCenter(results[0].geometry.location);
    var marker = new google.maps.Marker({
        map: map,
        position: results[0].geometry.location
    });
  } else {
    alert('Geocode was not successful for the following reason: ' + status);
  }
  });
  locations.push(location_a);
}


function codeAddress_b(evt) {
  // marker will not show without preventDefault
  evt.preventDefault();
  var address = document.getElementById('location_b').value;
  var location_b = [];
  geocoder.geocode( { 'address': address}, function(results, status) {
  if (status == 'OK') {

    location_b[0] = results[0].geometry.location.lat();
    location_b[1] = results[0].geometry.location.lng();

    map.setCenter(results[0].geometry.location);
    var marker = new google.maps.Marker({
        map: map,
        position: results[0].geometry.location
    });
  } else {
    alert('Geocode was not successful for the following reason: ' + status);
  }
  });
  locations.push(location_b);
}

initialize();



// document.getElementById('find-midpoint').on('click', onChangeHandler);

