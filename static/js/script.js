// none of these need to be global -- pass these as parameters to each function
// instead of defining them globally
var geocoder;
var map;
var midpointMarker;



function initialize() {
  // TO DO: make sure everything defined in intialize never changes (if it changes, move it out of initialize)
  // console.log('initializing')
  var directionsService = new google.maps.DirectionsService;
  var directionsDisplay = new google.maps.DirectionsRenderer;
  // TO DO: do i change?
  geocoder = new google.maps.Geocoder();
  // TO DO: do i change? --> No
  var latlng = new google.maps.LatLng(37.78, -122.41);
  var mapOptions = {
        zoom: 8,
        center: latlng
  }

  // TODO: initialize instance of map, but re-draw the map on click
  // (if that's what is necessary for adding points to the map)
  map = new google.maps.Map(document.getElementById('map'), mapOptions);
  // TODO: do i need this for an initial map rendering? what does this do?
  directionsDisplay.setMap(map);

  // move this out of initialize
  function onSubmit(evt) {
    evt.preventDefault();
    // TO DO: this is still being assigned as a global map parameter; this is bad
    map = getNewMap(directionsDisplay, mapOptions);
    calculateAndDisplayRoute(directionsService, directionsDisplay);
    getStartAndEndLocationCoords();
  }

  // this is a good use of initialize
  document.getElementById("search").addEventListener("click", onSubmit);
}

function getNewMap(directionsDisplay, mapOptions) {
  // TO DO: notice how this is NOT using a global map parameter 
  // this is good!
  var map = new google.maps.Map(document.getElementById('map'), mapOptions);
  directionsDisplay.setMap(map);
  return map;
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

// TO DO: change my name! too vague
function getStartAndEndLocationCoords() {
  var location = document.getElementsByName('location');
  // TODO: change my name to be more specific! which coords are we talking about here?
  var startAndEndLocationCoords = [];
  // go through each location and geocode;?
  for(var i=0; i < location.length; i++) {
    var address = location[i].value;
    geocoder.geocode( { 'address': address}, function(results, status) {
    var _lat = results[0].geometry.location.lat()
    var _lng = results[0].geometry.location.lng()
      if (status == 'OK') {
        // why push 4 times when i'm iterating i each time?
        startAndEndLocationCoords.push(_lat);
        startAndEndLocationCoords.push(_lng);
        // checked for length of coord array because marker wouldn't update, held all coords
        if (startAndEndLocationCoords.length == 4) {
          // console.log('calculating midpoint')
          calculateMidpoint(startAndEndLocationCoords);

        }
        
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }    
    });
  }
}


function calculateMidpoint(startAndEndLocationCoords) {
  var _lat = (startAndEndLocationCoords[0] + startAndEndLocationCoords[2])/2.0;
  var _lng = (startAndEndLocationCoords[1] + startAndEndLocationCoords[3])/2.0;

  // TODO: rename me! which coords am i?
  var midpointCoords = {"lat": _lat, "lng": _lng};

  placeMidpointMarker(midpointCoords);
  map.setCenter(midpointCoords); 

  // this is gross. try to make into a separate function?
  $.get("/yelp_search.json", midpointCoords, function(yelpResults) {
    // console.log(yelpResults);
    for(let i=0; i < yelpResults.length; i++) {
      // give state, city, zipcode to address
      address = yelpResults[i]['location']['address1'];
      geocoder.geocode( { 'address': address}, function(businessResults, status) {
        // console.log(businessResults) // TO DO: this is null when you do a subsequent search -- why?
        var _lat = businessResults[0].geometry.location.lat();
        var _lng = businessResults[0].geometry.location.lng();
        if (status == 'OK') {
          
          // all yelp_markers are staying on the page again! need to clear these on new searches
          var yelp_marker = new google.maps.Marker({
            position: {lat: _lat, lng: _lng},
            map: map
          });
          
          
          var business_phone = yelpResults[i]['display_phone'];
          var business_street_address = yelpResults[i]['location']['display_address'][0];
          var business_city_zip = yelpResults[i]['location']['display_address'][1];
          var business_complete_address = business_street_address + ", " + business_city_zip;

          var rating = yelpResults[i]['rating'];
          var review_count = yelpResults[i]['review_count'];
          var url = yelpResults[i]['url']

          var price = yelpResults[i]['price'];
          var name = yelpResults[i]['name'];

          var latOfBusiness = yelpResults[i]['coordinates']['latitude'];
          var lngOfBusiness = yelpResults[i]['coordinates']['longitude'];

          var coordsOfOneBusiness = {"lat": latOfBusiness, "lng": lngOfBusiness};

          // populate business marker with details
          
          var yelpBusinessInfowindowDetails = 
            '<div id="content">'+
            '<div id="siteNotice">'+'</div>'+
              '<h2 id="firstHeading" class="firstHeading">' + name + '</h2>' +
              '<div id="bodyContent">'+
                '<p><b>' + name + '</b>' + '<br>' +
                  + business_phone + '<br>' +
                  business_complete_address + '<br>' +
                  'Price: ' + price + '<br>' +
                  'Rating: ' + rating + '<br>' +
                  'Review Count: ' + review_count +
                '</p>' +
                'Click ' + '<span><a href=' + url + '>' +
                'here' + '</a> '+ 'to view this business on Yelp!' +
                '</span>'+ '<br><br>' +
                '<form id="inviteForm" action="/search_midpoint" method="GET">' + 
                  'E-mail: ' + '<br>' + 
                  '<input type="text" id="inviteEmail" name="inviteEmail" value="emily@gmail.com">' + 
                  '<span>' + '<button type="submit" class="inviteFriendButton" value="submit">invite</button>' +
                  '</span>' +
                '</form>' +
              '</div>'+
            '</div>';

          var infowindow = new google.maps.InfoWindow({
            content: yelpBusinessInfowindowDetails
          });

          yelp_marker.addListener('click', function() {
            infowindow.open(map, yelp_marker);
            $(".inviteFriendButton").click(function(evt){ 
              evt.preventDefault(); 
              var coordsOfSelectedBusiness = {"lat": latOfBusiness, "lng": lngOfBusiness};
              // send coordsOfSelectedBusiness to python
              console.log(latOfBusiness);
              console.log(lngOfBusiness);

              // get user email, check if valid in python
              var emailOfPersonInvited = document.getElementById("inviteEmail").value;
              console.log(emailOfPersonInvited);
              $.get(
                  url="/email_for_invitation.json", 
                  data=emailOfPersonInvited
              );
            });
          });
          // end info window

        } else {
          alert('Geocode was not successful for the following reason: ' + status);
        }    
    });
}
});


}

// TO DO: midpoint marker should NOT be global. you can pass midpointmarker here as a parameter
// and call setPosition on it.
// if midpoint marker doesnt exist, you can call something like createMidpointMarker
function placeMidpointMarker(coords) {

  // console.log(midpointMarker)
  if (midpointMarker) {
    // clear the map
    // create a new map with new midpoint
    midpointMarker.setPosition(coords);
  } else {
    // console.log('new google maps')
    // change midpointMarker color
    midpointMarker = new google.maps.Marker({
      position: coords,
      map: map
    });
  }
}

initialize();






