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
    codeAddress();
    calculateMidpoint();
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

function codeAddress() {
  var location = document.getElementsByName('location');
  var coord = [];
  for(var x=0; x < location.length; x++) {
    var address = location[x].value;
    geocoder.geocode( { 'address': address}, function(results, status) {
      if (status == 'OK') {

        coord.push(results[0].geometry.location.lat());
        coord.push(results[0].geometry.location.lng());

        map.setCenter(results[0].geometry.location);
        // coordinates.push.apply(coordinates, coord);
        if (coord.length == 4) {
          // console.log("coord variable has:");
          // console.log(coord);
          return calculateMidpoint(coord);
        }
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
      
    });
    console.log("The end");
  }
}

function calculateMidpoint(evt) {
  var _lat = (evt[0] + evt[2])/2.0;
  var _lng = (evt[1] + evt[3])/2.0;

  var coords = {"lat": _lat, "lng": _lng};

  var marker = new google.maps.Marker({
    position: {lat: _lat, lng: _lng},
    map: map
  });

  // ajax the JSON to the server
  // $.get("/search_midpoint", coords);
}


initialize();
