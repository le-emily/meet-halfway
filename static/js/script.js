var geocoder;
var directionDisplay;
var directionsService = new google.maps.DirectionsService();
var map;
var markers = [];
var polyline = null;
var infowindow = new google.maps.InfoWindow();

function createMarker(latlng, label, html) {
  // Create markers for start and end points, showing lat/lng coords and address.
  var contentString = '<b>'+label+'</b><br>'+html;
  var img = '';
  if(label == "Start"){
    img = "static/img/darkgreen_MarkerA.png";
  }else if(label == "End") {
    img = "static/img/red_MarkerB.png";
  }
  var marker = new google.maps.Marker({
      position: latlng,
      map: map,
      title: label,
      icon: img,
      zIndex: Math.round(latlng.lat()*-100000)<<5
      });
  markers.push(marker);
  marker.myname = label;

  google.maps.event.addListener(marker, 'click', function() {
      infowindow.setContent(contentString+"<br>"+marker.getPosition().toUrlValue(6));
      infowindow.open(map,marker);
      });
  return marker;
}

function initialize() {
  // Create google map, call calcRoute, and create polyline
  geocoder = new google.maps.Geocoder();
  directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers:true});
  var sf = new google.maps.LatLng(37.791011,-122.402113);
  var myOptions = {
    zoom: 6,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    center: sf,
    scrollwheel: false
  }
  map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
  polyline = new google.maps.Polyline({
  path: [],
  strokeColor: '#29c6ff',
  strokeWeight: 3
  });

  // autocomplete not working
  var first_location_input = document.getElementById('start');
  var autocomplete = new google.maps.places.Autocomplete(first_location_input);

  var second_location_input = document.getElementById('end');
  var autocomplete = new google.maps.places.Autocomplete(second_location_input);

  //Close infowindow when click anywhere on map
  map.addListener('click', function() {
      if(infowindow != null) {
        infowindow.close();
      }
  });
  directionsDisplay.setMap(map);
  calcRoute();
}

// $( function() {
//   $( "#slider-range-max" ).slider({
//     range: "max",
//     min: 1,
//     max: 50,
//     value: 1,
//     slide: function( event, ui ) {
//       $( "#amount" ).val( ui.value );
//     }
//   });
//   $( "#amount" ).val( $( "#slider-range-max" ).slider( "value" ) );
//   console.log($( "#amount" ).val( $( "#slider-range-max" ).slider( "value" ) ));
// } );

function calcRoute() {
  setMapOnAll(null);
  markers = [];
  clearYelpListing();

  var start = document.getElementById("start").value;
  var end = document.getElementById("end").value;

  // var radius = $( "#amount" ).val( $( "#slider-range-max" ).slider( "value" ) );
  // console.log(radius);

  var travelMode = google.maps.DirectionsTravelMode.DRIVING

  var request = {
      origin: start,
      destination: end,
      travelMode: travelMode
  };

  // Send start and end values (directions request) into directionsService which 
  // returns an efficient route path.
  directionsService.route(request, function(response, status) {
    // Response - object of geocoded_waypoints, request, routes and status
    if (status == google.maps.DirectionsStatus.OK) {
      polyline.setPath([]);
      var bounds = new google.maps.LatLngBounds();
      startLocation = new Object();
      endLocation = new Object();
      directionsDisplay.setDirections(response);
      var route = response.routes[0];

      var path = response.routes[0].overview_path;
      var legs = response.routes[0].legs;
      for (i=0;i<legs.length;i++) {
        // For each leg, check for start, end and midpoint, and create marker.
        // Each leg is an object of address, distance, duration, steps, traffic speed,
        // and waypoints
        if (i == 0) {
          startLocation.latlng = legs[i].start_location;
          startLocation.address = legs[i].start_address;
          createMarker(startLocation.latlng, "Start", startLocation.address);
        }
        endLocation.latlng = legs[i].end_location;
        endLocation.address = legs[i].end_address;
        createMarker(endLocation.latlng, "End", endLocation.address);
        var steps = legs[i].steps;
        for (j=0;j<steps.length;j++) {
          // go through each step, which are small instructions of how to get to 
          // midpoint
          var nextSegment = steps[j].path;
          // nextSegment contains an object of 2 lat/lng coords--SE and NE
          // lat/lng coords.
          for (k=0;k<nextSegment.length;k++) {
            // go through each set of lat/lng coords and set the polyline path.
            polyline.getPath().push(nextSegment[k]);
            // Add the SE/NE lat/lng object to bounds
            bounds.extend(nextSegment[k]);
          }
        }
      }
      polyline.setMap(map);
      computeTotalDistance(response);

      putMidpointMarkerOnRoute(50,);
      markYelpBusinessesOnMap(50);
    } else {
      alert("directions response " + status);
    }
  });
}

// Sets the map on all markers in the array.
function setMapOnAll(map) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}



function computeTotalDistance(result) {
  totalDist = 0;
  totalTime = 0;
  var myroute = result.routes[0];
  // loop through route's legs and add distance and duration to totalDist/totalTime
  for (i = 0; i < myroute.legs.length; i++) {
    // Go through legs and get distance and duration from start to end locations
    totalDist += myroute.legs[i].distance.value;
    totalTime += myroute.legs[i].duration.value;
  }

  document.getElementById("total").innerHTML = "Total distance is: "+ (totalDist / 1000.) + 
    " km<br>Total time is: " + (totalTime / 60).toFixed(2) + " minutes";
}

function putMidpointMarkerOnRoute(percentage) {
  var distance = (percentage/100) * totalDist;
  var time = ((percentage/100) * totalTime/60).toFixed(2);
  // GetPointAtDistance-returns a GLatLng at the specified distance along the path. 
  // The distance is specified in metres.
  createMarker(polyline.GetPointAtDistance(distance),"time: "+time,"marker");
}


// Called in computeTotalDistance
function markYelpBusinessesOnMap(percentage) {
  var midpointCoords = polyline.GetPointAtDistance(((percentage/100) * totalDist));
  var venue_type = document.getElementById("venue_type_selections").value;
  var params = {"lat": midpointCoords.lat(),
                "lng": midpointCoords.lng(),
                "venue_type": venue_type,
                "radius": (Math.floor(totalDist*.1))}

  // AJAX get request to yelp_search for yelp api results. Get key business data 
  // from response for infoWindow content.
  $.get("/yelp_search.json", params, function(yelpResults) {
    for(let i=0; i < yelpResults.length; i++) {
      if(yelpResults[i]['location']['address1'] !== "" && yelpResults[i]['location']['address1'] !== null) {
        address = yelpResults[i]['location']['address1'] + " " + yelpResults[i]['location']['city'] + " " + yelpResults[i]['location']['state'];
        geocoder.geocode( { 'address': address}, function(businessResults, status) {
        var _lat = businessResults[0].geometry.location.lat();
        var _lng = businessResults[0].geometry.location.lng();
        if (status == 'OK') {
          var yelp_marker = new google.maps.Marker({
            position: {lat: _lat, lng: _lng},
            map: map
          });

          markers.push(yelp_marker);

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
                '<span id="successFailureMessage">Invite status appears here.</span>' +
              '</div>'+
            '</div>';

          var newInfoWindow = new google.maps.InfoWindow({
            content: yelpBusinessInfowindowDetails
          });


          yelp_marker.addListener('click', function() {
            // Close the previous info window if a new yelp business marker is clicked.
            newInfoWindow.open(map, yelp_marker);
            infowindow.close();
            infowindow = newInfoWindow;
            // InviteFriend function run everytime a window is open.
            inviteFriend();
          });


          function inviteFriend() {
            $(".inviteFriendButton").click(function(evt){
              evt.preventDefault();

              var emailOfPersonInvited = document.getElementById("inviteEmail").value;

              // AJAX post requst to add_invitation to invitation with email, 
              // businessAddress, and name for receiver, business_address, and 
              // business_name for invitation instance respectively.
              $.post(
                url="/add_invitation",
                data= {"email": emailOfPersonInvited,
                        "businessAddress": complete_business_address,
                        "businessName": name},
                // check for valid email, need to be a registered user to be Ok
                function(result){
                  if(result["status"] !== "Ok") {
                    console.log("invalid email!!! :(");
                    var invitation_failed_message = '<div>' +
                      data["email"] + " is an invalid email!" + " Please try again."
                      '</div>';
                    $("#successFailureMessage").html(invitation_failed_message)
                                                .fadeIn()
                                                .fadeOut(3000)

                  } else {
                    var invitation_success_message = '<div>' +
                      result["recipient_name"] +  " has been invited to " + name + "."
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
          showBusinessBelowMapOnBottomDiv(yelpBusinessDict);
        } else {
          alert('Geocode was not successful for the following reason: ' + status);
        }
      });
      }
    }
  });
}


function showBusinessBelowMapOnBottomDiv(yelpBusinessDict) {
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


function clearYelpListing() {
  $("#yelp_business_row").empty();
}

$(".alert-success").fadeOut(3000);

// DOMContentLoaded event is fired when the initial HTML document has been completely 
// loaded and parsed, without waiting for stylesheets, images, and subframes to finish 
// loading.
document.addEventListener("DOMContentLoaded", function(event) {
  initialize();
});