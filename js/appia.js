var map;
// An array to hold the markers created
var markers = [];
// Where the places are
var initialPlaces = [
    {name: "Foro Romano",
     location: {lat: 41.892451, lng: 12.485324},
     period: "Pre-Imperial",
     description: "The Roman Forum was the center of the Roman Empire"},
    {name: "Septimus Severus Arch",
     location: {lat: 41.892884, lng: 12.484744},
     period: "Pre-Imperial",
     description: "This arch was built to honor a Roman victory over the"
     + "Parthians. Built in the days of the Roman Republic."},
    {name: "The Pantheon",
     location: {lat: 41.898603, lng: 12.476873},
     period: "Imperial",
     description: "Built on the Field of Mars, this famous temple was built to"
     + "honor all of the Roman gods at once."},
    {name: "The Colosseum",
     location: {lat: 41.890197, lng: 12.492237},
     period: "Imperial",
     description: "The site of many gladitorial games, executions, and various"
      + " other forms of public entertainment, the Colloseum remains a "
      + "testament to peoples' love of both blood and showmanship."},
    {name: "Circus Maximus",
     location: {lat: 41.886243, lng: 12.485150},
     period: "Imperial",
     description: "Latin for 'Largest Circus', the Circus Maximus was the site of"
      + " various forms of entertainment. It remains one of Rome's best preserved"
      + " sites, perhaps owing its state to its incredible size."},
    {name: "Palatine Hill",
     location: {lat: 41.888605, lng: 12.488407},
     period: "Pre-Imperial",
     description: "The centermost hill of the 7 hills of Rome, the Palatine hill"
      + " was, in antiquity, thought to be home to the cave in which Romulus"
      + " and Remus were reared by wolves."},
    {name: "Tiber River",
     location: {lat: 41.888664, lng: 12.479562},
     period: "",
     description: "The main river flowing through Rome, and the end of many"
      + " sewers. Much commerce was done here; its shoreline was a bustling"
      + " marketplace."},
    {name: "Trajan's Column",
     location: {lat: 41.895829, lng: 12.484305},
     period: "Imperial",
     description: "Built by Trajan to celebrate a victory over the Dacians."},
    {name: "Piazza del Popolo",
     location: {lat: 41.910701, lng: 12.476376},
     period: "Post-Imperial",
     description: "'The People's Square' in Italian, this relatively modern"
     + " plaza is situated at the ancient northern gate to the city."},
    {name: "Porta Alchemica",
     location: {lat: 41.895640, lng: 12.503592},
     period: "Post-Imperial",
     description: "As legend has it, an odd pilgrim vanished through this door"
     + " long ago, leaving behind some gold flakes."}
 ];

var periods = ["Pre-Imperial", "Imperial", "Post-Imperial"];

var setMap = function() {
    // Initiation of Google map.
    map = new google.maps.Map(document.getElementById("map"), {
        center: {lat: 41.889827, lng: 12.486559},
        mapTypeId: "satellite",
        zoom: 15,
        mapTypeControl: false,
        draggable: true
    });
    // Instantiate collected places on the map.
    setPlaces();
};

var setPlaces = function() {
    for (i in historicPlaces()) {
        var place = historicPlaces()[i];
        marker = new google.maps.Marker({
            name: place.name,
            period: place.period,
            position: place.location,
            map:map
        });
        markers.push(marker);
        google.maps.event.addListener(marker, 'click', function(name, target) {
            return function() {
            // Set animation to clicked marker
                target.setAnimation(google.maps.Animation.BOUNCE);
                stopAnimation(target);
                map.setCenter(name.location);
                map.setZoom(17);
                $('#image-container').html('');
            // Search wikipedia for articles matching name of location
                requestWiki(name.name);
                requestGetty(name.name);
            // Replace information within modal with that of selected location
                $('#description').text(name.description);
                $('#modal-title').text(name.name);
                $('#modal').modal('show');
            };
        // Closure assigning the values of place and marker to 'name' and
        // 'target' respectively in the preceding function
        }(place, marker));
    }
};

var stopAnimation = function(marker) {
    // Sets timeout for marker animation after one is clicked.
    setTimeout(function () {
        marker.setAnimation(null);
    }, 5000);
};

var filterPlaces = function(period) {
    //Set visibility of markers according to period selected
    for (i = 0; i < markers.length; i++) {
        marker = markers[i];
        if(marker.period == period || period.length == 0) {
            marker.setVisible(true);
        } else {
            marker.setVisible(false);
        }
    }
};

var requestWiki = function(object) {
    //Clear error message if present
    $('#error-msg').text('');

    var wikiTimeout = setTimeout(function(){
      $('#error-msg').text("Unable to find Wikipedia articles for " + object);
    }, 5000);

    var request = $.ajax({
        url: 'https://en.wikipedia.org/w/api.php?action='
            + 'opensearch&search='+ object +'&format=json',
        dataType: "jsonp"
      });
      .done(function(response) {
          clearTimeout(wikiTimeout);
              //Return the first and (theoretically) most relavent link
              var wikiLink = response[3][0]
              //Set link value to modal's "Learn more" link.
              $('#wiki-link').attr("href", wikiLink);
              //Trigger opening of secondary 'wiki' modal upon click.
              $('#wiki-link').on('click', function() {
                  $('#wiki-modal').modal('show');
            });
      });
};

var requestGetty = function(object) {

    var apiKey = 'ubstqzcp66y6hsesq4dwpawz';

    $.ajax({
        type:'GET',
        url:"https://api.gettyimages.com/v3/search/images/creative?phrase="
          + object,
        beforeSend: function (request) {
            request.setRequestHeader("Api-Key", apiKey);
        }
    })
    .done(function(data){
        //Add the first 9 images returned from Getty to modal
        for(var i = 0;i< 9;i++) {
            $("#image-container").append("<img class='modal-image' src='"
                + data.images[i].display_sizes[0].uri + "'/>");
         }
    }),
    .fail(function(data){
        alert("Unable to retrieve images.");
    });
};

var Place = function(data) {
    this.name = ko.observable(data.name);
    this.location = ko.observable(data.location);
    this.period = ko.observable(data.period);
    this.description = ko.observable(data.description);
};

var ViewModel = function() {

    var self = this;
    //  Two arrays are separated to facilitate creation of markers and the
    //  inherently chnaging 'historicPlacesList'.
    historicPlaces = ko.observableArray([]);
    this.historicPlacesList = ko.observableArray([]);

    initialPlaces.forEach(function(place) {
        historicPlaces.push(place)
    });

    initialPlaces.forEach(function(placeItem) {
        self.historicPlacesList.push( new Place(placeItem) );
    });

    this.selectedPlace = ko.observable( this.historicPlacesList()[0] );

    this.selectedPeriod = ko.observable('');

    this.filterPlacesList = function() {
        //Empty list of places to be filled with those meeting specification
        self.historicPlacesList([]);
        for (i = 0; i < initialPlaces.length; i++) {
            var place = initialPlaces[i];
            //Each place's period is compared to the selected one
            if (initialPlaces[i].period == self.selectedPeriod() ||
                self.selectedPeriod() == undefined) {
                //If given place's period matches selected period, add to list
                //If no period is selected, all are added to list
                self.historicPlacesList.push( new Place(place) );
            }
        }
    }

    this.viewListItem = function(clicked) {
        self.selectedPlace(clicked);
        for (i = 0; i < markers.length; i++) {
            marker = markers[i];
            if (marker.name == self.selectedPlace().name()) {
                marker.setAnimation(google.maps.Animation.BOUNCE);
                stopAnimation(marker);
                console.log(marker.name);
            }
        }
        //Execute API call functions to fill modal
        requestWiki(self.selectedPlace().name());
        requestGetty(self.selectedPlace().name());
        map.setZoom(17);
        map.setCenter(self.selectedPlace().location());
        $('#image-container').html('');
        $('#modal').modal('show');
    };

    this.mapReset = function() {
        setMap();
    };
};

ko.applyBindings(new ViewModel());
