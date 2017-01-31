var map;
var initialPlaces = [
  {name: "Foro Romano",
   location: {lat: 41.892451, lng: 12.485324},
   codename: "forum",
   description: "The Roman Forum was the center of the Roman Empire",
   imgSrc: "http://www.placestoseeinyourlifetime.com/wp-content/uploads/2015/02/Forum-Photo-by-Aleksandar-Gospi%C4%87.jpg"},
  {name: "The Pantheon",
   location: {lat: 41.898603, lng: 12.476873},
   codename: "pantheon",
   description: "Built on the Field of Mars, this famous temple was built to"
   + "honor all of the Roman gods at once.",
   imgSrc: "https://upload.wikimedia.org/wikipedia/commons/8/8f/Pantheon_wider_centered.jpg"},
  {name: "The Colosseum",
   location: {lat: 41.890197, lng: 12.492237},
   codename: "colosseum",
   description: "The site of many gladitorial games, executions, and various"
    + " other forms of public entertainment, the Colloseum remains a "
    + "testament to peoples' love of both blood and showmanship.",
    imgSrc: "http://www.reidsitaly.com/images/lazio/rome/sights/colosseum-long.jpg"},
  {name: "Circus Maximus",
   location: {lat: 41.886243, lng: 12.485150},
   codename: "circus",
   description: "Latin for 'Largest Circus', the Circus Maximus was the site of"
    + " various forms of entertainment. It remains one of Rome's best preserved"
    + " sites, perhaps owing its state to its incredible size.",
   imgSrc: "https://upload.wikimedia.org/wikipedia/commons/d/df/Circus_max_1978.jpg"},
  {name: "Tarpeian Rock",
   location: {lat: 41.891524, lng: 12.482376},
   codename: "tarpeian",
   description: "The Tarpeian Rock, named for a traitor of the early Roman "
   + "Republic, was an ancient site of execution. The condemned would be hurled "
   +"from the top, jostling against the rough cliff on the way down, just as its"
   +" namesake did, ages before.",
  imgSrc: "https://wonderland1981.files.wordpress.com/2012/10/chucked_off_the_tarpeian_rock.jpg"},
  {name: "Palatine Hill",
   location: {lat: 41.888605, lng: 12.488407},
   codename: "palatine",
   description: "The centermost hill of the 7 hills of Rome, the Palatine hill"
    + " was, in antiquity, thought to be home to the cave in which Romulus"
    + " and Remus were reared by wolves.",
   imgSrc: "http://www.planetware.com/photos-large/I/italy-rome-palatine-hill-stadium-overview.jpg"},
  {name: "Tiber River",
   location: {lat: 41.888664, lng: 12.479562},
   codename: "tiber",
   description: "The main river flowing through Rome, and the end of many"
    + " sewers. Much commerce was done here; its shoreline was a bustling"
    + " marketplace.",
   imgSrc: "https://745515a37222097b0902-74ef300a2b2b2d9e236c9459912aaf20.ssl.cf2.rackcdn.com/614d9d7dedad990a8975720072cf5b57.jpeg"}
  ];

var setMap = function() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 41.889827, lng: 12.486559},
    mapTypeId: 'satellite',
    zoom: 15,
    mapTypeControl: false,
    draggable: true
  });
  setPlaces();
};

var setPlaces = function() {
  for (i in historicPlaces()) {
    var place = historicPlaces()[i];
    marker = place.codename;
    var marker = new google.maps.Marker({
      name: place.name,
      position: place.location,
      codename: place.codename,
      map:map
    });
    google.maps.event.addListener(marker, 'click', function(name) {
      return function() {
        map.setCenter(name.location);
        map.setZoom(17);
        //Search wikipedia for articles matching name of location.
        requestWiki(name.name);
        //Replace information within modal with that of selected location.
        $('#description').text(name.description);
        $('#modal-title').text(name.name);
        $('#modal-img').attr("src", name.imgSrc);
        $('#modal').modal('show');
      };
    }(place));
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

var setModal = function(place) {};

var Place = function(data) {
  this.name = ko.observable(data.name);
  this.location = ko.observable(data.location);
  this.codename = ko.observable(data.codename);
  this.description = ko.observable(data.description);
  this.imgSrc = ko.observable(data.imgSrc);
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
      map.setCenter(self.selectedPlace().location());
      $('#modal').modal('show');
  };

};

ko.applyBindings(new ViewModel());
