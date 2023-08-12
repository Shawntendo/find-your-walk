//Use .env file in config folder
//require("dotenv").config({ path: "./config/.env" });

let map, geocoder, address,
  addressArr = ['116 Birch Lane, Bloomsbury, NJ',
                '118 Birch Lane, Bloomsbury, NJ'];
let position = [40.65489, -75.11352]
let currentMarker

function initMap(){
  console.log('init')
  console.log(addressArr)

  //sets options
  var options = {
    zoom: 15,
    center:{lat:40.65489, lng:-75.11352}
  }
  //initializes map with options
  map = new google.maps.Map(document.getElementById('map'), options)
  //geocoder makes markers for all addresses in array
  geocoder = new google.maps.Geocoder();
  for(let i=0; i<addressArr.length; i++){
    address = addressArr[i]
    codeAddress(geocoder, map);
  }

  currentMarker = new google.maps.Marker({
    position:{lat:40.65489, lng:-75.11352},
    map:map,
    // icon:google.maps.SymbolPath.BACKWARD_CLOSED_ARROW
  })

  var infoWindow = new google.maps.InfoWindow({
    content:'<h1>info window?</h1>'
  })
  currentMarker.addListener('click',function(){
    infoWindow.open(map,currentMarker)
  })

  //5-16 temp
  google.maps.event.addListener(map, 'click', function(event) {
    var result = [event.latLng.lat(), event.latLng.lng()];
    console.log('listener ' + result)
    transition(result);
  });

  console.log('map should be here')
}

//5-16 temp
var numDeltas = 100;
var delay = 10; //milliseconds
var i = 0;
var deltaLat;
var deltaLng;
function transition(result){
    i = 0;
    deltaLat = (result[0] - position[0])/numDeltas;
    deltaLng = (result[1] - position[1])/numDeltas;
    moveMarker();
}
function moveMarker(){
    position[0] += deltaLat;
    position[1] += deltaLng;
    var latlng = new google.maps.LatLng(position[0], position[1]);
    currentMarker.setTitle("Latitude:"+position[0]+" | Longitude:"+position[1]);
    currentMarker.setPosition(latlng);
    if(i!=numDeltas){
        i++;
        setTimeout(moveMarker, delay);
    }
}

function codeAddress(geocoder, map) {
  geocoder.geocode({'address': address}, function(results, status) {
    if (status === 'OK') {
      map.setCenter(results[0].geometry.location);
      var addrMarker = new google.maps.Marker({
        map: map,
        position: results[0].geometry.location
      });
      console.log(results[0].geometry.location.lat())
      console.log(results[0].geometry.location.lng())
      console.log(addrMarker)
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}