 var directionDisplay;
  var directionsService = new google.maps.DirectionsService();
  var map;
  var polyline = null;
  var infowindow = new google.maps.InfoWindow();

function createMarker(latlng, label, html) {
    var contentString = '<b>'+label+'</b><br>'+html;
    var marker = new google.maps.Marker({
        position: latlng,
        map: map,
        title: label,
        zIndex: Math.round(latlng.lat()*-100000)<<5
        });
        marker.myname = label;

    google.maps.event.addListener(marker, 'click', function() {
        infowindow.setContent(contentString+"<br>"+marker.getPosition().toUrlValue(6)); 
        infowindow.open(map,marker);
        });
    return marker;
}

  function initialize() {
    directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers:true});
    var chicago = new google.maps.LatLng(41.850033, -87.6500523);
    var myOptions = {
      zoom: 6,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      center: chicago
    }
    map = new google.maps.Map(document.getElementById("map"), myOptions);
    polyline = new google.maps.Polyline({
    path: [],
    strokeColor: '#FF0000',
    strokeWeight: 3
    });
    directionsDisplay.setMap(map);
    calcRoute();
  }

  function calcRoute() {
    var start = document.getElementById('location_a').value;
    var end = document.getElementById('location_b').value;

    var travelMode = google.maps.DirectionsTravelMode.DRIVING

    var request = {
        origin: start,
        destination: end,
        travelMode: travelMode
    };
    directionsService.route(request, function(response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        polyline.setPath([]);
        var bounds = new google.maps.LatLngBounds();
        startLocation = new Object();
        endLocation = new Object();
        directionsDisplay.setDirections(response);
        var route = response.routes[0];
        // var summaryPanel = document.getElementById("directions_panel");
        // summaryPanel.innerHTML = "";

        // For each route, display summary information.
    var path = response.routes[0].overview_path;
    var legs = response.routes[0].legs;
        for (i=0;i<legs.length;i++) {
          if (i == 0) { 
            startLocation.latlng = legs[i].start_location;
            startLocation.address = legs[i].start_address;
            marker = createMarker(legs[i].start_location,"midpoint","","green");
          }
          endLocation.latlng = legs[i].end_location;
          endLocation.address = legs[i].end_address;
          var steps = legs[i].steps;
          for (j=0;j<steps.length;j++) {
            var nextSegment = steps[j].path;
            for (k=0;k<nextSegment.length;k++) {
              polyline.getPath().push(nextSegment[k]);
              bounds.extend(nextSegment[k]);
            }
          }
        }

        polyline.setMap(map);

        computeTotalDistance(response);
      } else {
        alert("directions response "+status);
      }
    });
  }

var totalDist = 0;
var totalTime = 0;
function computeTotalDistance(result) {
  totalDist = 0;
  totalTime = 0;
  var myroute = result.routes[0];
  for (i = 0; i < myroute.legs.length; i++) {
    totalDist += myroute.legs[i].distance.value;
    totalTime += myroute.legs[i].duration.value;      
  }
  putMarkerOnRoute(50);

  totalDist = totalDist / 1000.
  document.getElementById("total").innerHTML = "total distance is: "+ totalDist + " km<br>total time is: " + (totalTime / 60).toFixed(2) + " minutes";
}

function putMarkerOnRoute(percentage) {
  var distance = (percentage/100) * totalDist;
  var time = ((percentage/100) * totalTime/60).toFixed(2);
  if (!marker) {
    marker = createMarker(polyline.GetPointAtDistance(distance),"time: "+time,"marker");
  } else {
    marker.setPosition(polyline.GetPointAtDistance(distance));
    marker.setTitle("time:"+time);
  }
}


initialize();