//Map page JS

let map, geocoder, addressArr = []
let position = [40.65489, -75.11352]
let currentMarker
let codedArr = [ {lat:40.6566104, lng:-75.11770899999999} ]//[ {lat:40.6566104, lng:-75.11770899999999},
               //   {lat:40.6566319, lng:-75.1187581}]
let infoArr = ['info string 1', 'info string 2']
let typeArr = [0] //[0,3]
const markerTypeArr = ['Pesticide', 'Ice', 'Road Work', 'Fallen Tree', 'Heavy Traffic', 'Weather']
const iconImageArr = [ 'assets/map/flask-solid.svg',
                    'assets/map/snowflake-solid.svg',
                    'assets/map/snowplow-solid.svg',
                    'assets/map/tree-solid.svg',
                    'assets/map/truck-solid.svg',
                    'assets/map/umbrella-solid.svg']

let newMarkerAnchor, newMarkerEmbed, newMarkerClass = null
newMarkerAnchor = document.getElementById('newMarkerType')
newMarkerEmbed = document.getElementById('newMarkerIcon')
let isMarkerBeingPlaced = false

// addressArr = ['116 Birch Lane, Bloomsbury, NJ',
//               '118 Birch Lane, Bloomsbury, NJ'];

function initMap(){
  console.log('init')

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
    codeAddress(geocoder, map, addressArr[i]);
  }

  //gets fetched DB markers from document
  console.log('PASSED FROM MAP.EJS: ' + markerText)
  console.log('PASSED FROM MAP.EJS: ' + markerText[0].latitude + ' ' + typeof markerText[0])
  console.log('PASSED FROM MAP.EJS: ' + markerText[1].latitude)
  
  //sets stored markers
  for(let i=0; i<codedArr.length; i++){
    let tempMarker = new google.maps.Marker({
      position:codedArr[i],
      map:map,
      icon: iconImageArr[typeArr[i]]})
    let tempWindow = new google.maps.InfoWindow({
      content:`<span class="infoWindow windowTop">info window ${i+1}?<br></span>
               <span class="infoWindow windowBot">${infoArr[i]}</span>`})
    tempMarker.addListener('click',function(){
      tempWindow.open(map,tempMarker);
      console.log('window opened')})
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

  //general listener
  const bodyListen = document.querySelector('body')
  console.log('contents of bodyListen: ' + bodyListen)
  bodyListen.addEventListener('click', (event) => {
    console.log('bodyListen event: ' + event)
    console.log('event target: ' + event.target)
    console.log('event target ID: ' + event.target.id)

    // checks if anchor tag change this to check for LI
    if(event.target.tagName === 'A'){
      console.log('Anchor tag was found')
      console.log('event target tagname: ' + event.target.tagName)
      console.log('event target innerText: ' + event.target.innerText)
      console.log('event target classlist: ' + event.target.classList)
      // checks if an entry on the dropdown is being clicked
      if(event.target.classList[0] === 'iconList'){
        newMarkerClass = event.target.classList[1]
        console.log('FIRST CHILD DATA ' + Object.keys(newMarkerAnchor.firstChild))
        newMarkerAnchor.innerText = markerTypeArr[(+newMarkerClass.substring(newMarkerClass.length-1))-1]
        newMarkerEmbed.src = iconImageArr[(+newMarkerClass.substring(newMarkerClass.length-1))-1]
        newMarkerAnchor.classList.remove('hidden')
        newMarkerEmbed.classList.remove('hidden')
        isMarkerBeingPlaced = true
        console.log('newMarkerClass: ' + newMarkerClass)
      }
      // checks if the new marker is being cancelled by clicking on the type indicator
      else if(event.target.id === 'newMarkerType'){
        newMarkerAnchor.classList.add('hidden')
        newMarkerEmbed.classList.add('hidden')
        isMarkerBeingPlaced = false
      }
    }
    else{
      console.log('bodyListen fired, tag did not')
      console.log('tagName: ' + event.target.tagName)
      console.log('innerText: ' + event.target.innerText)
    }
  })

  // moves temp marker or places new marker
  google.maps.event.addListener(map, 'click', function(event) {
    if(isMarkerBeingPlaced){
      let tempMarker = new google.maps.Marker({
        position: {lat:event.latLng.lat(), lng:event.latLng.lng()},
        map:map,
        icon: iconImageArr[(+newMarkerClass.substring(newMarkerClass.length-1))-1]})
      let tempWindow = new google.maps.InfoWindow({
        content:`<span class="infoWindow windowTop">info window #?<br></span>
                 <span class="infoWindow windowBot">info incoming</span>`})
      tempMarker.addListener('click',function(){
        tempWindow.open(map,tempMarker);
        console.log('window opened')})

      // marker is placed and new marker indicator disappears
      newMarkerAnchor.classList.add('hidden')
      newMarkerEmbed.classList.add('hidden')
      isMarkerBeingPlaced = false
    }
    else{
      var result = [event.latLng.lat(), event.latLng.lng()];
      console.log('test marker translation listener ' + result)
      transition(result);
    }
  });

  console.log('map should be here')
  console.log(codedArr)
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

function codeAddress(geocoder, map, address) {
  geocoder.geocode({'address': address}, function(results, status) {
    if (status === 'OK') {
      map.setCenter(results[0].geometry.location);
      var addrMarker = new google.maps.Marker({
        map: map,
        position: results[0].geometry.location
      });
      console.log(results[0].geometry.location.lat())
      console.log(results[0].geometry.location.lng())
      console.log(addrMarker.position.toString())
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}