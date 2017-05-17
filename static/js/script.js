var coordinates = [];
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
    calculateAndDisplayRoute(directionsService, directionsDisplay);
    codeAddress_a();
  }

  document.getElementById("search").addEventListener("click", onSubmit);
}

function calculateAndDisplayRoute(directionsService, directionsDisplay) {
  var start = document.getElementById('location_a').value;
  var end = document.getElementById('location_b').value;
  directionsService.route({
    origin: start,
    destination: end,
    travelMode: 'WALKING'
  }, function(response, status) {
    if (status === 'OK') {
      directionsDisplay.setDirections(response);
    } else {
      window.alert('Directions request failed due to ' + status);
    }
  });
}

function codeAddress_a() {
  var address = document.getElementById('location_a').value;
  var coord_a = [];
  geocoder.geocode( { 'address': address}, function(results, status) {
    if (status == 'OK') {

      coord_a[0] = results[0].geometry.location.lat();
      coord_a[1] = results[0].geometry.location.lng();

      map.setCenter(results[0].geometry.location);
      // var marker = new google.maps.Marker({
      //     map: map,
      //     position: results[0].geometry.location
      // });
      // console.log(location_a);
      // console.log("Success function");
      coordinates.push.apply(coordinates, coord_a);
      codeAddress_b();
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
    return coord_a;
  });
  console.log("The end");
  
}

function codeAddress_b() {
  // marker will not show without preventDefault
  // evt.preventDefault();
  var address = document.getElementById('location_b').value;
  var coord_b = [];
  geocoder.geocode( { 'address': address}, function(results, status) {
    if (status == 'OK') {

      coord_b[0] = results[0].geometry.location.lat();
      coord_b[1] = results[0].geometry.location.lng();

      map.setCenter(results[0].geometry.location);
      // var marker = new google.maps.Marker({
      //     map: map,
      //     position: results[0].geometry.location
      // });
      coordinates.push.apply(coordinates, coord_b);
      calculateMidpoint();
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
    return coord_b;
  });
  
}

function calculateMidpoint() {
  console.log(coordinates);
  var _lat = (coordinates[0] + coordinates[2])/2.0;
  var _lng = (coordinates[1] + coordinates[3])/2.0;

  console.log(_lat);
  console.log(_lng);

  var coords = {"lat": _lat, "lng": _lng};

  var marker = new google.maps.Marker({
    position: {lat: _lat, lng: _lng},
    map: map
  });

  // ajax the JSON to the server
  // $.get("/search_midpoint", coords);
}


initialize();
