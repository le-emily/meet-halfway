      // This example requires the Geometry library. Include the libraries=geometry
      // parameter when you first load the API. For example:
      // <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=geometry">

      // var marker1, marker2;
      // var poly, geodesicPoly;

      // function initMap() {
      //   var map = new google.maps.Map(document.getElementById('map'), {
      //     zoom: 4,
      //     center: {lat: 34, lng: -40.605}
      //   });

      //   marker1 = new google.maps.Marker({
      //     map: map,
      //     draggable: true,
      //     position: {lat: 37.7887, lng: 122.4116}
      //   });

      //   marker2 = new google.maps.Marker({
      //     map: map,
      //     draggable: true,
      //     position: {lat: 37.343389, lng:  -121.794217}
      //   });

      // $("#find-midpoint").on("click", function() {
      //   var a = new google.maps.LatLng(0,0);
      //   var b = new google.maps.LatLng(0,1);
      //   var distance = google.maps.geometry.spherical.computeDistanceBetween(a,b);
      // });
  

      var location_a = new google.maps.LatLng(37.7887,122.4116);
      var location_b = new google.maps.LatLng(37.7749,122.4194);
      var distance = google.maps.geometry.spherical.computeDistanceBetween(location_a, location_b);

      // var map = new google.maps.Map(document.getElementById('map'), {
      //     center: eastAustralia,
      //     zoom: 8,
      // });

      var interpolation = google.maps.geometry.spherical.interpolate(location_a, location_b, 0.5);

      console.log(interpolation);
