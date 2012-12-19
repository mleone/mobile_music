var mobileMusic = {
  //
  //
  // REPLACE WITH YOUR JAMBASE API KEY BELOW:
  //
  //
  jb_api_key: "",  
  jb_base_url: "http://api.jambase.com/search?apikey=",
  data: null,
  
  search: function(zipcode) {
    $.yqlXML(this.jb_base_url + escape(this.jb_api_key) + "&zip=" + escape(zipcode) + "&n=20", function(data) {
      mobileMusic.data = data;
      if (typeof data.JamBase_Data == "undefined" || typeof data.JamBase_Data.errorNode != "undefined") {
        alert(data.JamBase_Data.errorNode);
      }
      else {
        $('.choice_list h1').text("Choose an event in " + data.JamBase_Data.Results_Title);
        $("#event_lists").empty();
        $(data.JamBase_Data.event).each(function(index, event) {
          mobileMusic.makeEventListing(event);
        });
        $('#event_lists').listview('refresh');
      }
    });
  },
  
  urlParam: function(url, name) {
    var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(url);
    if (results == null) {
      return false;
    }
    else {
      return decodeURIComponent(results[1]);
    }
  },
  
  initializeMap: function(address) {
      var geocoder;
      var map;
      geocoder = new google.maps.Geocoder();
      var mapOptions = {
          zoom: 13,
          zoomControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      
      map = new google.maps.Map(document.getElementById('venue-map'), mapOptions);

      geocoder.geocode( { 'address': address}, function(results, status) {
          if (status == google.maps.GeocoderStatus.OK) {
              map.setCenter(results[0].geometry.location);
          } else {
              // Do nothing for now
          }
      });
  },

  makeEventListing: function(event) {
    var html = "<li>\
  <a href=\"event_detail.html?#{event_data}\" data-transition=\"slidedown\">\
    <h3 class=\"ui-li-heading\">#{band}</h3>\
    <p class=\"ui-li-desc\">#{venue}</p>\
    <p class=\"ui-li-desc\">#{date}</p>\
  </a>\
</li>";

    if (event.artists.artist.constructor == Array) {
      artists = [];
      $(event.artists.artist).each(function(index, artist) {
        artists.push(artist.artist_name);
      });
      artist_name = artists.join(', ');
    }
    else {
      artist_name = event.artists.artist.artist_name;
    }
    
    event_data = [];
    event_data.push("artist_name="+encodeURIComponent(artist_name));
    event_data.push("venue_name="+encodeURIComponent(event.venue.venue_name));
    event_data.push("event_date="+encodeURIComponent(event.event_date));
    event_data.push("venue_city="+encodeURIComponent(event.venue.venue_city));
    event_data.push("venue_state="+encodeURIComponent(event.venue.venue_state));
    event_data.push("venue_zip="+encodeURIComponent(event.venue.venue_zip));    
    event_data.push("event_url="+encodeURIComponent(event.event_url));    
    $('#event_lists').append(html.replace("#{band}", artist_name).replace("#{venue}", event.venue.venue_name).replace("#{date}", event.event_date).replace("#{event_data}", event_data.join('&amp;')));
  }
};

$('#home').live('pageinit', function(event) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(handle_geolocation_query, handle_errors);
  }
  
  function handle_errors(error)  
  {  
    switch(error.code)  
    {  
      case error.PERMISSION_DENIED: //alert("user did not share geolocation data");  
      break;  
      case error.POSITION_UNAVAILABLE: //alert("could not detect current position");  
      break;  
      case error.TIMEOUT: //alert("retrieving position timed out");  
      break;  
      default: //alert("unknown error");  
      break;  
    }  
  }  
  
  function handle_geolocation_query(position){  
    var position = position.coords.latitude + "," + position.coords.longitude;
    $.yqlJSON("http://maps.google.com/maps/api/geocode/json?latlng="+position+"&sensor=false", function(data) {
      //Find the zip code of the first result
      if (!(data.status == "OK")) {
        // alert('Zip Code not Found');
        return;
      }
      var found = false;
      $(data.results[0].address_components).each(function(i, el) {
        if ($.inArray("postal_code", jQuery.makeArray(el.types)) > -1) {
          $("#zipcode").val(el.short_name);
          found = true;
          return;
        }
      });
      if(!found){
        // alert('Zip Code not Found');
      }
    });
  }
});

$('#choisir_ville').live('pageinit', function(event) {
  // Get ZIPCODE param if submitted
  var zipcode;
  if ((zipcode = mobileMusic.urlParam(event.currentTarget.baseURI, "zipcode")) !== false) {
    $.mobile.loading('show');
    mobileMusic.search(zipcode);
    $.mobile.loading('hide');
  }
  else {
    $.mobile.changePage("index.html");
  }
});

$('#restau').live('pageinit', function(event) {
  // Get event-data param if submitted
  var artist_name = mobileMusic.urlParam(event.currentTarget.baseURI, "artist_name");
  var venue_name  = mobileMusic.urlParam(event.currentTarget.baseURI, "venue_name");
  var event_date  = mobileMusic.urlParam(event.currentTarget.baseURI, "event_date");
  var venue_city  = mobileMusic.urlParam(event.currentTarget.baseURI, "venue_city");
  var venue_state = mobileMusic.urlParam(event.currentTarget.baseURI, "venue_state");
  var venue_zip   = mobileMusic.urlParam(event.currentTarget.baseURI, "venue_zip");
  var event_url   = mobileMusic.urlParam(event.currentTarget.baseURI, "event_url");
  
  if (artist_name !== false && venue_name !== false && event_date !== false && venue_city !== false && venue_state !== false && venue_zip !== false && event_url !== false) {
    $.mobile.loading('show');

    base_address = venue_city + " " + venue_state + " " + venue_zip;
    venue_query = venue_name + " " + base_address;
    map_link = "http://maps.google.com/maps?q=" + encodeURIComponent(venue_query);

    $("#band-name").html(artist_name);
    $("#event-date").html(event_date);
    $("#venue-name").html(venue_name);
    $("#venue-address").html(base_address);
    $("#jambase-link").attr("href", event_url);
    $("#maps-link").attr("href", map_link);
    
    mobileMusic.initializeMap(base_address);
    $.mobile.loading('hide');
  }
  else {
    $.mobile.changePage("index.html");
  }
});
