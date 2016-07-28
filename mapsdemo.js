$(document).ready(function(){
  // initialize global variables 
  var map;
  var directionsDisplay;
  var directionsService = new google.maps.DirectionsService();

  // Function that detects a user's loation then gives directions to LCUA 
  function intitialize_byLocation() {
    directionsDisplay = new google.maps.DirectionsRenderer();
    var mapOptions = {
      zoom: 6
    };
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    directionsDisplay.setMap(map);
    // Empty directions panel before adding directions list (allows multiple direction attempts to go more smoothely)
    $('#directions-panel').empty();
    directionsDisplay.setPanel(document.getElementById('directions-panel'));

    // Try HTML5 geolocation
    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        var start_pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        var start_info = new google.maps.InfoWindow({
          map: map,
          position: start_pos,
          content: 'Your approximate current location',
          maxWidth: 200
        });
        // Assign starting position to start directions variable
        var start = start_pos;
        // End at LCUA 
        var end = new google.maps.LatLng(41.67096, -91.53906);
        // Form directions request 
        var request = {
          origin:start,
          destination:end,
          travelMode: google.maps.TravelMode.DRIVING
          };
        // Make request
        directionsService.route(request, function(response, status) {
          if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
          }
        });
        // Set new map center 
        map.setCenter(start_pos);
      }, function() {
        handleNoGeolocation(true);
        });
      } else {
      // Browser doesn't support Geolocation
      handleNoGeolocation(false);
      }
  }

  // Function that allows a user to search their location for directions to LCUA 
  function initialize_search() {
    directionsDisplay = new google.maps.DirectionsRenderer();
    var markers = [];
    var mapOptions = {
      zoom: 6,
      center: new google.maps.LatLng(41.67096, -91.53906),
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    directionsDisplay.setMap(map);
    // Empty directions panel before adding directions list (allows multiple direction attempts to go more smoothely)
    $('#directions-panel').empty();
    directionsDisplay.setPanel(document.getElementById('directions-panel'));
    // Set bounds for search
    var defaultBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(41.67096, -91.53906),
        new google.maps.LatLng(41.67096, -91.53906));
    map.fitBounds(defaultBounds);
    // Fix zoom (this is kind of a hack fix since I could not get set bounds to work properly)
    var listener = google.maps.event.addListener(map, "idle", function() { 
      if (map.getZoom() > 16) map.setZoom(10); 
      google.maps.event.removeListener(listener); 
    });
    // Create the search box and link it to the UI element.
    var input = /** @type {HTMLInputElement} */(
        document.getElementById('pac-input'));
    //map.controls[google.maps.ControlPosition.TOP_LEFT].push(input); #<-- Commented out for customization of search bar location 

    var searchBox = new google.maps.places.SearchBox(
      /** @type {HTMLInputElement} */(input));

    // [START region_getplaces]
    // Listen for the event fired when the user selects an item from the
    // pick list. Retrieve the matching places for that item.
    google.maps.event.addListener(searchBox, 'places_changed', function() {
      var places = searchBox.getPlaces();


      var bounds = new google.maps.LatLngBounds();
      for (var i = 0, place; place = places[i]; i++) {
        var image = {
          url: place.icon,
          size: new google.maps.Size(71, 71),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(17, 34),
          scaledSize: new google.maps.Size(25, 25)
        };
      
        var search_start_pos = place.geometry.location;
        // Set starting direction to user inputed location 
        var start = search_start_pos;
        // End at LCUA
        var end = new google.maps.LatLng(41.67096, -91.53906);
        // Form directions request
        var request = {
          origin:start,
          destination:end,
          travelMode: google.maps.TravelMode.DRIVING
          };
        // Make request
        directionsService.route(request, function(response, status) {
          if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
          }
        });
        map.setCenter(start_pos);

        bounds.extend(place.geometry.location);
      }
      map.fitBounds(bounds);
    });

    // Bias the SearchBox results towards places that are within the bounds of the
    // current map's viewport.
    google.maps.event.addListener(map, 'bounds_changed', function() {
      var bounds = map.getBounds();
      searchBox.setBounds(bounds);
    });
  }

  function handleNoGeolocation(errorFlag) {
    if (errorFlag) {
      var content = 'Error: The Geolocation service failed.';
    } else {
      var content = 'Error: Your browser doesn\'t support geolocation.';
    }

    var options = {
      map: map,
      position: new google.maps.LatLng(60, 105),
      content: content
    };

    var marker = new google.maps.Marker(options);
    map.setCenter(options.position);
  }

  // initialize seach as default
  initialize_search();
  // Radio button logic for choosing user location type
  $('input:radio[name=direction_type]').click(function() {
      var linktype = $(this).val();
      console.log(linktype);
       if(linktype == 'default'){
           intitialize_byLocation();
      } else {
          initialize_search();
          $('#pac-input').show();
          $('#searchArea').show();
      }
  });

});