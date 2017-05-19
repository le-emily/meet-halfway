var geocoder;
var map;
var midpointMarker;

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
  // go through each location and geocode;?
  for(var i=0; i < location.length; i++) {
    var address = location[i].value;
    geocoder.geocode( { 'address': address}, function(results, status) {
    var _lat = results[0].geometry.location.lat()
    var _lng = results[0].geometry.location.lng()
      if (status == 'OK') {
        // why push 4 times when i'm iterating i each time?
        coord.push(_lat);
        coord.push(_lng);
        // checked for length of coord array because marker wouldn't update, held all coords
        if (coord.length == 4) {
          calculateMidpoint(coord);
        }
        
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }    
    });
  }
}


function calculateMidpoint(coord) {
  var _lat = (coord[0] + coord[2])/2.0;
  var _lng = (coord[1] + coord[3])/2.0;

  var coords = {"lat": _lat, "lng": _lng};

  placeMidpointMarker(coords);
  map.setCenter(coords); 

  $.get("/yelp_search.json", coords, function(results) {
    // create marker for each yelp business and place on map
    console.log(results);
    
    // make a separate marker function
    for(var i=0; i < results.length; i++) {
      // not accessing the address correctly
      address = results[i]['location']['address1']
      geocoder.geocode( { 'address': address}, function(results, status) {
      var _lat = results[0].geometry.location.lat()
      var _lng = results[0].geometry.location.lng()
        if (status == 'OK') {
          // why push 4 times when i'm iterating i each time?
          // make marker with lat/long
          var yelp_marker = new google.maps.Marker({
            position: {lat: _lat, lng: _lng},
            map: map
          });
        } else {
          alert('Geocode was not successful for the following reason: ' + status);
        }    
    });
}
  

    

  });

}

function placeMidpointMarker(coords) {
  if (midpointMarker) {
    midpointMarker.setPosition(coords);
  } else {
    midpointMarker = new google.maps.Marker({
      position: coords,
      map: map
    });
  }
}


function placeYelpBusinessMarkers() {
  // code to place and clear yelp business markers after every search
}


initialize();
