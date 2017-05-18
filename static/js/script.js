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
      debugger

      var two_lats = results[0].geometry.bounds.b;
      var two_lngs = results[0].geometry.bounds.f;
      if (status == 'OK') {

        results = results[0].address_components
        coord.push(results[0].geometry.location.lat());
        coord.push(results[1].geometry.location.lng());
        coord.push(results[2].geometry.location.lat());
        coord.push(results[3].geometry.location.lng());        

        map.setCenter(results[0].geometry.location);
        if (coord.length == 4) {
          return calculateMidpoint(coord);
          coord.length = 0;
        }
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
      
    });
    console.log("The end");
  }
}


function showResults(data){
  debugger
  console.log(data);
}

function calculateMidpoint(coord) {
  // evt.preventDefault();
  var _lat = (coord[0] + coord[2])/2.0;
  var _lng = (coord[1] + coord[3])/2.0;

  console.log("lat:");
  console.log(_lat);
  console.log("lng:");
  console.log(_lng);

  var coords = {"lat": _lat, "lng": _lng};

  var midpointMarker = new google.maps.Marker({
    position: {lat: _lat, lng: _lng},
    map: map
  });

  $.get("/search_midpoint", coords, showResults);

  // ajax the JSON to the server
  
}


initialize();
