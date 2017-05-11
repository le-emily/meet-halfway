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

initialize();

// check for user entries -- need location a AND b
// $("#find-midpoint").on("click", function(evt) {
//   if(($("#location_a").val() == "") || ($("#location_b").val() == "")) {
//     evt.preventDefault();
//   }
// });

$("#find-midpoint").on("click", codeAddress_a);
$("#find-midpoint").on("click", codeAddress_b);

// function findMidpoint() {
//   var _coordinates = place.geometry.location; //a google.maps.LatLng object
//   var _kCord = new google.maps.LatLng(location_a[0], location_a[1]);
//   var _pCord = new google.maps.LatLng(location_b[0], location_a[1]);

//   console.log(google.maps.geometry.spherical.computeDistanceBetween(_pCord, _coordinates));
//   console.log(google.maps.geometry.spherical.computeDistanceBetween(_kCord, _coordinates));
// }


