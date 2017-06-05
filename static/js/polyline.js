function initialize() {
  var map = new google.maps.Map(
    document.getElementById("map_canvas"), {
      center: new google.maps.LatLng(51.276092, 1.028938),
      zoom: 13,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    });
  var directionsService = new google.maps.DirectionsService();
  var directionsDisplay = new google.maps.DirectionsRenderer({
    map: map,
    preserveViewport: true
  });
  directionsService.route({
    origin: new google.maps.LatLng(51.269776, 1.061326),
    destination: new google.maps.LatLng(51.30118, 0.926486),
    waypoints: [{
      stopover: false,
      location: new google.maps.LatLng(51.263439, 1.03489)
    }],
    travelMode: google.maps.TravelMode.DRIVING
  }, function(response, status) {
    if (status === google.maps.DirectionsStatus.OK) {
      // directionsDisplay.setDirections(response);
      var polyline = new google.maps.Polyline({
        path: [],
        strokeColor: '#0000FF',
        strokeWeight: 3
      });
      var bounds = new google.maps.LatLngBounds();


      var legs = response.routes[0].legs;
      for (i = 0; i < legs.length; i++) {
        var steps = legs[i].steps;
        for (j = 0; j < steps.length; j++) {
          var nextSegment = steps[j].path;
          for (k = 0; k < nextSegment.length; k++) {
            polyline.getPath().push(nextSegment[k]);
            bounds.extend(nextSegment[k]);
          }
        }
      }

      polyline.setMap(map);
    } else {
      window.alert('Directions request failed due to ' + status);
    }
  });
}
google.maps.event.addDomListener(window, "load", initialize);