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

  // this is gross. try to make into a separate function?
  $.get("/yelp_search.json", coords, function(yelpResults) {
    console.log(yelpResults);
    for(let i=0; i < yelpResults.length; i++) {
      // give state, city, zipcode to address
      address = yelpResults[i]['location']['address1'];
      geocoder.geocode( { 'address': address}, function(businessResults, status) {
        
        var _lat = businessResults[0].geometry.location.lat();
        var _lng = businessResults[0].geometry.location.lng();
        if (status == 'OK') {
          
          // all yelp_markers are staying on the page again! need to clear these on new searches
          var yelp_marker = new google.maps.Marker({
            position: {lat: _lat, lng: _lng},
            map: map
          });
          
          // create and populate info window
          // showing error message --- script.js:96 Uncaught TypeError: Cannot read property 'display_phone' of undefined
          var business_phone = yelpResults[i]['display_phone'];
          var business_street_address = yelpResults[i]['location']['display_address'][0];
          var business_city_zip = yelpResults[i]['location']['display_address'][1];
          var business_complete_address = business_street_address + ", " + business_city_zip;

          var rating = yelpResults[i]['rating'];
          var review_count = yelpResults[i]['review_count'];
          var url = yelpResults[i]['url']

          var price = yelpResults[i]['price'];
          var name = yelpResults[i]['name'];
          // populate business marker with details
          var contentString = '<div id="content">'+
                      '<div id="siteNotice">'+
                      '</div>'+
                      '<h1 id="firstHeading" class="firstHeading">' + name + '</h1>'+
                      '<div id="bodyContent">'+
                      '<p><b>' + name + '</b>' + 
                      business_phone + 
                      business_complete_address + 
                      price + 
                      rating +
                      review_count +
                      '</p>' +
                      '<p><a href=' + url + '>'+
                      url + '</a> '+
                      '</p>'+
                      '</div>'+
                      '</div>';

          var infowindow = new google.maps.InfoWindow({
            content: contentString
          });

          yelp_marker.addListener('click', function() {
            infowindow.open(map, yelp_marker);
          });
          // end info window

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

    // change midpointMarker color
    midpointMarker = new google.maps.Marker({
      position: coords,
      map: map
    });
  }
}


function placeYelpBusinessMarkers(coords) {
// refactor code in calculate midpoint to 2 separate functions
}


initialize();






