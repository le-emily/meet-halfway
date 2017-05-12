// holds lat/long of both locations
var locations = [];

var geocoder;
var map;

function initialize() {
      geocoder = new google.maps.Geocoder();
      // Hackbright coordinates - not working? :()
      var latlng = new google.maps.LatLng(37.78, -122.41);
      var mapOptions = {
            zoom: 8,
            center: latlng
      }
      map = new google.maps.Map(document.getElementById('map'), mapOptions);
}


function codeAddress_a(evt) {
      // marker will not show without preventDefault
      evt.preventDefault();
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

function drawPolyline(locations) {
  // draw polyline
  var lin = new google.maps.Polyline({
    path: [
      new google.maps.LatLng(locations[0][0], locations[0][1]),
      new google.maps.LatLng(locations[1][0], locations[1][1])
    ],
    strokeColor: "#000000",
    strokeOpacity: 1.0,
    strokeWeight: 10,
    geodesic: true, //shortest path, account for fact that earth is curved, draw a geodesic line
    map: map
  });
}

initialize();

$("#find-midpoint").on("click", codeAddress_a);
$("#find-midpoint").on("click", codeAddress_b);
$("#find-midpoint").on("click", drawPolyline(locations));

