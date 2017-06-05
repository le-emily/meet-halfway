// none of these need to be global -- pass these as parameters to each function
// instead of defining them globally
var geocoder;
// var map;
// var midpointMarker;

function initialize() {
  // TO DO: make sure everything defined in intialize never changes (if it changes, move it out of initialize)
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

  var first_location_input = document.getElementById('location_a');
  var autocomplete = new google.maps.places.Autocomplete(first_location_input);

  var second_location_input = document.getElementById('location_b');
  var autocomplete = new google.maps.places.Autocomplete(second_location_input);

  // TODO: initialize instance of map, but re-draw the map on click
  // (if that's what is necessary for adding points to the map)
  // this map is necessary to show map on load
  map = new google.maps.Map(document.getElementById('map'), mapOptions);

  // TODO: do i need this for an initial map rendering? what does this do?
  // directionsDisplay is a DirectionsRenderer object that controls how the map renders.
  // You can create markers and add them to a map at a later time e.g. after clicking some button using setMap()
  // directionsDisplay.setMap(map);

  var oldInfoWindow = {
    oldWindow: null
  };

  // move this out of initialize
  function onSubmit(evt) {
    evt.preventDefault();
    // TO DO: this is still being assigned as a global map parameter; this is bad
    map = getNewMap(directionsDisplay, mapOptions);
    calculateAndDisplayRoute(directionsService, directionsDisplay);
    getStartAndEndLocationCoords(oldInfoWindow);
    clearYelpListing();
  }

  // this is a good use of initialize
  document.getElementById("search").addEventListener("click", onSubmit);
}


function getNewMap(directionsDisplay, mapOptions) {
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

function getStartAndEndLocationCoords(oldInfoWindow) {
  var location = document.getElementsByName('location');

  var startAndEndLocationCoords = [];
  // go through each location and geocode;?
  // goes through each location entered and get the geocode.
  for(var i=0; i < location.length; i++) {
    var address = location[i].value;
    geocoder.geocode( { 'address': address}, function(results, status) {
    var _lat = results[0].geometry.location.lat()
    var _lng = results[0].geometry.location.lng()
      if (status == 'OK') {
        startAndEndLocationCoords.push(_lat);
        startAndEndLocationCoords.push(_lng);
        if (startAndEndLocationCoords.length == 4) {
          // console.log('calculating midpoint')
          calculateMidpoint(startAndEndLocationCoords, oldInfoWindow);
        }
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }    
    });
  }
}

function calculateMidpoint(startAndEndLocationCoords, oldInfoWindow) {
  var _lat = (startAndEndLocationCoords[0] + startAndEndLocationCoords[2])/2.0;
  var _lng = (startAndEndLocationCoords[1] + startAndEndLocationCoords[3])/2.0;

  var midpointCoords = {"lat": _lat, "lng": _lng};

  placeMidpointMarker(midpointCoords);
  map.setCenter(midpointCoords); 

  markYelpBusinessesOnMap(midpointCoords, oldInfoWindow);
}


function markYelpBusinessesOnMap(midpointCoords, oldInfoWindow) {
  var venue_type = document.getElementById("venue_type_selections").value;
  var params = {"lat": midpointCoords["lat"], 
                "lng": midpointCoords["lng"],
                "venue_type": venue_type}

  $.get("/yelp_search.json", params, function(yelpResults) {
    console.log(yelpResults);
    // window.yelpResults = yelpResults;
    for(let i=0; i < yelpResults.length; i++) {
      if(yelpResults[i]['location']['address1'] !== "" && yelpResults[i]['location']['address1'] !== null) {
        address = yelpResults[i]['location']['address1'] + " " + yelpResults[i]['location']['city'] + " " + yelpResults[i]['location']['state'];
      geocoder.geocode( { 'address': address}, function(businessResults, status) {
        // businessResults no longer null during subsequent search
        // console.log("BUSINESS RESULTS: ");
        // console.log(businessResults);
        // console.log("end busiess results"); // TO DO: this is null when you do a subsequent search -- why?
        console.log(businessResults);
        var _lat = businessResults[0].geometry.location.lat();
        var _lng = businessResults[0].geometry.location.lng();
        if (status == 'OK') {
          var yelp_marker = new google.maps.Marker({
            position: {lat: _lat, lng: _lng},
            map: map
          });

          yelp_marker.setIcon('http://maps.google.com/mapfiles/ms/icons/blue-dot.png');
          
          var business_phone = yelpResults[i]['display_phone'];
          var business_street_address = yelpResults[i]['location']['display_address'][0];
          var business_city_zip = yelpResults[i]['location']['display_address'][1];
          var complete_business_address = business_street_address + ", " + business_city_zip;

          var rating = yelpResults[i]['rating'];
          var review_count = yelpResults[i]['review_count'];
          var url = yelpResults[i]['url']

          var price = yelpResults[i]['price'];
          var name = yelpResults[i]['name'];

          var latOfBusiness = yelpResults[i]['coordinates']['latitude'];
          var lngOfBusiness = yelpResults[i]['coordinates']['longitude'];

          var coordsOfOneBusiness = {"lat": latOfBusiness, "lng": lngOfBusiness};

          
          var yelpBusinessDict = {
            "complete_business_address": complete_business_address,
            "business_phone": business_phone,
            "image_url": yelpResults[i].image_url,
            "name": name
          }
          
          var yelpBusinessInfowindowDetails = 
            '<div id="content">'+
              '<h3 id="firstHeading" class="firstHeading">' + name + '</h3>' +
              '<div id="bodyContent">'+
                '<p>' + business_phone + '<br>' +
                  complete_business_address + '<br>' +
                  'Price: ' + price + '<br>' +
                  'Rating: ' + rating + '<br>' +
                  'Review Count: ' + review_count +
                '</p>' +
                'Click ' + '<span><a href=' + url + '>' +
                'here' + '</a> '+ 'to view this business on Yelp!' +
                '</span>'+ '<br><br>' +
                '<form id="inviteForm">' + 
                  'E-mail: ' + '<br>' + 
                  '<input type="text" id="inviteEmail" name="inviteEmail" value="emily@gmail.com">' + 
                  '<span>' + '<button type="submit" class="inviteFriendButton" value="submit">invite</button>' +
                  '</span>' +
                '</form>' +
              '</div>'+
            '</div>';

          var newInfoWindow = new google.maps.InfoWindow({
            content: yelpBusinessInfowindowDetails
          });


          yelp_marker.addListener('click', function() {
            openInfoWindowAndCallInvitationHandler(newInfoWindow, complete_business_address, name, yelp_marker, oldInfoWindow);
          });

          showBusinessOnLeftScreen(yelpBusinessDict);
          // end info window
        } else {
          alert('Geocode was not successful for the following reason: ' + status);
        }  
      });
      }
    }
  });
}


function showBusinessOnLeftScreen(yelpBusinessDict) {
  var yelpBusinessInfowindowDetails = 
    '<div id="bodyContent">'+
    '<h3 id="firstHeading" class="firstHeading">' + name + '</h3>' +
      '<p>' + yelpBusinessDict.name + '<br>' +
        yelpBusinessDict.complete_business_address + '<br>' +
        yelpBusinessDict.business_phone + '<br>' +
      '</p>' +
    '</div>' + '<hr>';

  $("#yelp_business_row").append(yelpBusinessInfowindowDetails);
}


function clearYelpListing(elementID) {
  $("#yelp_business_row").empty();
}


function openInfoWindowAndCallInvitationHandler(newInfoWindow, complete_business_address, name, yelp_marker, oldInfoWindow) {
  if(oldInfoWindow.oldWindow == null) {
    newInfoWindow.open(map, yelp_marker);
    oldInfoWindow.oldWindow = newInfoWindow;
  } else {
    oldInfoWindow.oldWindow.close(map, yelp_marker);
    newInfoWindow.open(map, yelp_marker);
    oldInfoWindow.oldWindow = newInfoWindow;
  }

  $(".inviteFriendButton").click(function(evt){ 
    evt.preventDefault(); 

    var emailOfPersonInvited = document.getElementById("inviteEmail").value;

    $.post(
      url="/add_invitation", 
      data= {"email": emailOfPersonInvited, 
              "businessAddress": complete_business_address,
              "businessName": name}, 
      // check for valid email, need to be a registered user to be Ok
      function(result){
        if(result["status"] !== "Ok") {
          console.log("invalid email!!! :(");
          // need to figure out how to make this htmlcontent to show up in a certain area of my page
          var invitation_failed_message = '<div>' + 
            data["email"] + " is an invalid email!" + " Please try again."
            '</div>';
          $("#successFailureMessage").html(invitation_failed_message)
                                      .fadeIn()
                                      .fadeOut(3000)
   
        } else {
          var invitation_success_message = '<div>' + 
            result["recipient_name"] +  " has been invited to " + name + "at " + 
              complete_business_address + "."
            '</div>';
          try {
          $("#successFailureMessage").html(invitation_success_message)
                                      .fadeIn()
                                      .fadeOut(3000)
          }
          catch(err) {
            console.log(err.message);
          }
        }
        setTimeout(function() { $("#successFailureMessage").val('');}, 6000);
      }
    );
  });
}

$(".alert-success").fadeOut(3000);
// TO DO: midpoint marker should NOT be global. you can pass midpointmarker here as a parameter
// and call setPosition on it.
// if midpoint marker doesnt exist, you can call something like createMidpointMarker
function placeMidpointMarker(midpointCoords, midpointMarker) {
  if (midpointMarker) {
    midpointMarker.setPosition(midpointCoords);
  } else {
    createMidpointMarker(midpointCoords);
  }
}


function createMidpointMarker(coords) {
  var midpointMarker = new google.maps.Marker({
      position: coords,
      map: map
  });
}


$(".respond_to_invitation").submit(function(evt) {
    evt.preventDefault();
    var formData = $(this).closest('form').serializeArray();

    var data = {"invitation_id": $(this).data("id"),
                "selection": formData[0].value};

    $.post("/invitations", data, function() {
        console.log("yay!");
    })
})

initialize();