var map;
// Where the places are.
var initialPlaces = [
  {name: "Foro Romano",
   location: {lat: 41.892451, lng: 12.485324},
   description: "The Roman Forum was the center of the Roman Empire"},
  {name: "The Pantheon",
   location: {lat: 41.898603, lng: 12.476873},
   description: "Built on the Field of Mars, this famous temple was built to"
   + "honor all of the Roman gods at once."},
  {name: "The Colosseum",
   location: {lat: 41.890197, lng: 12.492237},
   description: "The site of many gladitorial games, executions, and various"
    + " other forms of public entertainment, the Colloseum remains a "
    + "testament to peoples' love of both blood and showmanship."},
  {name: "Circus Maximus",
   location: {lat: 41.886243, lng: 12.485150},
   description: "Latin for 'Largest Circus', the Circus Maximus was the site of"
    + " various forms of entertainment. It remains one of Rome's best preserved"
    + " sites, perhaps owing its state to its incredible size."},
  {name: "Palatine Hill",
   location: {lat: 41.888605, lng: 12.488407},
   description: "The centermost hill of the 7 hills of Rome, the Palatine hill"
    + " was, in antiquity, thought to be home to the cave in which Romulus"
    + " and Remus were reared by wolves."},
  {name: "Tiber River",
   location: {lat: 41.888664, lng: 12.479562},
   description: "The main river flowing through Rome, and the end of many"
    + " sewers. Much commerce was done here; its shoreline was a bustling"
    + " marketplace."}
 ];

var setMap = function() {
    // Initiation of google map.
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 41.889827, lng: 12.486559},
        mapTypeId: 'satellite',
        zoom: 15,
        mapTypeControl: false,
        draggable: true
    });
    // Instantiate collected places on the map.
    setPlaces();
};

var stopAnimation = function(marker) {
    // Sets timeout for marker animation after one is clicked.
    setTimeout(function () {
        marker.setAnimation(null);
    }, 5000);
};

var setPlaces = function() {
    for (i in historicPlaces()) {
        var place = historicPlaces()[i];
        marker = new google.maps.Marker({
            name: place.name,
            position: place.location,
            map:map
        });
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
    };
};

var requestWiki = function(object) {
    var wikiurl = 'https://en.wikipedia.org/w/api.php?action='
        + 'opensearch&search='+ object +'&format=json';
    $.ajax({
        url: wikiurl,
        dataType: "jsonp",
        success: function(response) {
        //Return the first and (theoretically) most relavent link.
            var wikiLink = response[3][0];
            //Set link value to modal's "Learn more" link.
            $('#wiki-link').attr("href", wikiLink);
            //Trigger opening of secondary 'wiki' modal upon click.
            $('#wiki-link').on('click', function() {
                $('#wiki-modal').modal('show');
            });
        }
    });
};

var requestGetty = function(object) {

    var apiKey = 'ubstqzcp66y6hsesq4dwpawz';

    $.ajax({
        type:'GET',
        url:"https://api.gettyimages.com/v3/search/images/creative?phrase=" + object,
        beforeSend: function (request) {
            request.setRequestHeader("Api-Key", apiKey);
        }
    })
    .done(function(data){
        console.log("Success with data");
        for(var i = 0;i< 9;i++) {
            $("#image-container").prepend("<img src='"
                + data.images[i].display_sizes[0].uri + "'/>");
         }
    })
    .fail(function(data){
        alert(JSON.stringify(data,2))
    });
};

var Place = function(data) {
  this.name = ko.observable(data.name);
  this.location = ko.observable(data.location);
  this.description = ko.observable(data.description);
};

var ViewModel = function() {

    var self = this;

    historicPlaces = ko.observableArray([]);
    this.historicPlacesObservable = ko.observableArray([]);

    initialPlaces.forEach(function(place) {
        historicPlaces.push(place);
    });

    initialPlaces.forEach(function(placeItem) {
        self.historicPlacesObservable.push( new Place(placeItem) );
    });

    this.selectedPlace = ko.observable( this.historicPlacesObservable()[0] );

    this.viewListItem = function(clicked) {
        self.selectedPlace(clicked);
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
