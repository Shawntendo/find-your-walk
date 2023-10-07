//Map page JS

let map, geocoder, addressArr = [], markerStorage = []
let position = [40.65489, -75.11352]
// let currentMarker
const markerTypeArr = ['Pesticide', 'Ice', 'Road Work', 'Fallen Tree', 'Heavy Traffic', 'Weather']
const iconImageArr = [ 'assets/map/flask-solid.svg',
                    'assets/map/snowflake-solid.svg',
                    'assets/map/snowplow-solid.svg',
                    'assets/map/tree-solid.svg',
                    'assets/map/truck-solid.svg',
                    'assets/map/umbrella-solid.svg']
let infoFieldForm, infoFieldInput, infoDropdownBox, measureFromLI, newMarkerAnchor, newMarkerEmbed, newMarkerClass = null
infoFieldForm = document.getElementById('infoForm')
infoFieldInput = document.getElementById('infoField')
infoDropdownBox = document.getElementById('infoDropdown')
measureFromLI = document.getElementById('measureFrom')
newMarkerAnchor = document.getElementById('newMarkerType')
newMarkerEmbed = document.getElementById('newMarkerIcon')
let isMarkerBeingPlaced = false
let infoWindowBool = true
// let lastTimePosUpdated = Date.now()
const loadDelayConstant = 500
const idleDelayConstant = 2000
let longEnoughUntilLoad = true,
    idledLongEnough = true,
    tileInitFinished = false,
    mapInitFinished = false
infoFieldForm.reset()

// addressArr = ['116 Birch Lane, Bloomsbury, NJ',
//               '118 Birch Lane, Bloomsbury, NJ'];

function initMap(){
  // console.log('init')

  //sets options
  var options = {
    // zoom: 15,
    zoom: lastZoom,
    // center:{lat:40.65489, lng:-75.11352} // local test
    // center:{lat:39.8283, lng:-98.5795} // global test
    center:{lat:lastLat, lng:lastLng}
  }
  //initializes map with options
  map = new google.maps.Map(document.getElementById('map'), options)
  //geocoder makes markers for all addresses in array
  geocoder = new google.maps.Geocoder();
  for(let i=0; i<addressArr.length; i++){
    codeAddress(geocoder, map, addressArr[i]);
  }

  //gets fetched DB markers from document
  // console.log('PASSED FROM MAP.EJS: ' + markersFromDB)
  
  //sets stored markers
  for(let i=0; i<markersFromDB.length; i++){
    let tempMarker = new google.maps.Marker({
      position:{lat:markersFromDB[i].latitude, lng:markersFromDB[i].longitude},
      map:map,
      icon: iconImageArr[markersFromDB[i].markerType]
    })
    markerStorage.push(tempMarker)
    // cut out info parameter
    let tempWindow = new google.maps.InfoWindow({
      content:
        `<span class="infoWindow windowTop">${markerTypeArr[markersFromDB[i].markerType]}</span><br>` +
        (infoWindowBool ? `<span class="infoWindow windowBot">${markersFromDB[i].info}</span><br>` : ``) +
        (userCode !== markersFromDB[i].flagBy && userCode !== markersFromDB[i].user && userCode ? `<button onclick="flagMarkerButton(${markerStorage.length-1})">Flag as Inaccurate</button><br>` : ``) +
        (userCode === markersFromDB[i].user ? `<button onclick="removeMarkerButton(${markerStorage.length-1})">Remove Marker</button>` : ``)
    })
    tempMarker.addListener('click',function(){
      tempWindow.open(map,tempMarker);
      // console.log('window opened')
    })
  }

  // currentMarker = new google.maps.Marker({
  //   position:{lat:40.65489, lng:-75.11352},
  //   map:map,
  //   // icon:google.maps.SymbolPath.BACKWARD_CLOSED_ARROW
  // })

  var infoWindow = new google.maps.InfoWindow({
    content:'<h1>info window?</h1>'
  })
  // currentMarker.addListener('click',function(){
  //   infoWindow.open(map,currentMarker)
  // })

  //general listener
  const bodyListen = document.querySelector('body')
  // console.log('contents of bodyListen: ' + bodyListen)
  bodyListen.addEventListener('click', (event) => {
    // console.log('bodyListen event: ' + event)
    // console.log('event target: ' + event.target)
    // console.log('event target ID: ' + event.target.id)

    // checks if anchor tag change this to check for LI
    if(event.target.tagName === 'A'){
      // console.log('Anchor tag was found')
      // console.log('event target tagname: ' + event.target.tagName)
      // console.log('event target innerText: ' + event.target.innerText)
      // console.log('event target classlist: ' + event.target.classList)
      // checks if an entry on the dropdown is being clicked
      if(event.target.classList[0] === 'iconList'){
        newMarkerClass = event.target.classList[1]
        // console.log('FIRST CHILD DATA ' + Object.keys(newMarkerAnchor.firstChild))
        newMarkerAnchor.innerText = markerTypeArr[(+newMarkerClass.substring(newMarkerClass.length-1))-1]
        newMarkerEmbed.src = iconImageArr[(+newMarkerClass.substring(newMarkerClass.length-1))-1]
        newMarkerAnchor.classList.remove('hidden')
        newMarkerEmbed.classList.remove('hidden')

        let formBaseLength = measureFromLI.clientWidth
        // console.log('FORMBASELENGTH: ' + formBaseLength)
        infoDropdownBox.style.paddingRight = `${297-formBaseLength}px`

        isMarkerBeingPlaced = true
        // console.log('newMarkerClass: ' + newMarkerClass)
      }
      // checks if the new marker is being cancelled by clicking on the type indicator
      else if(event.target.id === 'newMarkerType'){
        newMarkerAnchor.classList.add('hidden')
        newMarkerEmbed.classList.add('hidden')
        isMarkerBeingPlaced = false
      }
    }
    else{
      // console.log('bodyListen fired, tag did not')
      // console.log('tagName: ' + event.target.tagName)
      // console.log('innerText: ' + event.target.innerText)
    }
  })

  // moves temp marker or places new marker
  google.maps.event.addListener(map, 'click', function(event) {
    if(isMarkerBeingPlaced){
      let imageIndex = (+newMarkerClass.substring(newMarkerClass.length-1))-1,
          newMarkerLat = event.latLng.lat(),
          newMarkerLng = event.latLng.lng()
      let tempMarker = new google.maps.Marker({
        position: {lat:newMarkerLat, lng:newMarkerLng},
        map:map,
        icon: iconImageArr[imageIndex]})
      markerStorage.push(tempMarker)
      let infoFieldValue = infoFieldInput.value
      createNewMarker(imageIndex, newMarkerLat, newMarkerLng, infoFieldValue || '', 1, 0, '0')
      // cut out info parameter
      let tempWindow = new google.maps.InfoWindow({
        // content:`<span class="infoWindow windowTop">${markerTypeArr[imageIndex]}</span><br>
        //          <span class="infoWindow windowBot">info incoming</span><br>
        //          <button onclick="flagMarkerButton(${markerStorage.length-1})">Flag as Inaccurate</button><br>
        //          <button onclick="removeMarkerButton(${markerStorage.length-1})">Remove Marker</button>`
        content:
          `<span class="infoWindow windowTop">${markerTypeArr[imageIndex]}</span><br>` +
          (infoWindowBool ? `<span class="infoWindow windowBot">${infoFieldValue || ''}</span><br>` : ``) +
          `<button onclick="removeMarkerButton(${markerStorage.length-1})">Remove Marker</button>`
      })
      tempMarker.addListener('click',function(){
        tempWindow.open(map,tempMarker);
        // console.log('window opened')
      })

      // marker is placed and new marker indicator disappears
      newMarkerAnchor.classList.add('hidden')
      newMarkerEmbed.classList.add('hidden')
      isMarkerBeingPlaced = false
      infoFieldForm.reset()
    }
    else{
      var result = [event.latLng.lat(), event.latLng.lng()];
      // console.log('test marker translation  ' + result)
      transition(result);
    }
  });

  google.maps.event.addListener(map, 'dragend', function(event) {
    console.log('DRAGEND')
  });
  google.maps.event.addListener(map, 'zoom_changed', function(event) {
    console.log('ZOOM_CHANGED')
    let newZoom = map.getZoom()
    if(lastZoom < 14 && newZoom >= 14){
      for(let i=0; i<markerStorage.length; i++){
        markerStorage[i].setMap(map)
      }
    } else if(lastZoom >= 14 && newZoom < 14){
      for(let i=0; i<markerStorage.length; i++){
        markerStorage[i].setMap(null)
      }
    }
    lastZoom = newZoom
  });
  google.maps.event.addListener(map, 'tilesloaded', function(event) {
    console.log('TILESLOADED')
    if(longEnoughUntilLoad && tileInitFinished){
      longEnoughUntilLoad = false
      delayTileLoadListener()
    }
    tileInitFinished = true
  });
  google.maps.event.addListener(map, 'idle', function(event) {
    console.log('IDLE')
    if(idledLongEnough && mapInitFinished){
      idledLongEnough = false
      delayIdleListener()
    }
    mapInitFinished = true
  });
  console.log('end of map init')
}
async function delayTileLoadListener(){
  try {
    await promisedSleep(loadDelayConstant)
    longEnoughUntilLoad = true
    let newCenter = map.getCenter()
    lastLat = newCenter.lat()
    lastLng = newCenter.lng()
    loadNewMarkers()
    console.log('NEW MARKERS LOADED')
  } catch (err) {
    console.log(err)
  }
}
async function delayIdleListener(){
  try {
    await promisedSleep(idleDelayConstant)
    idledLongEnough = true
    let newCenter = map.getCenter()
    lastLat = newCenter.lat()
    lastLng = newCenter.lng()
    lastZoom = map.getZoom()
    updateMapPosition()
    console.log('MAP POSITION UPDATED')
  } catch (err) {
    console.log(err)
  }
}
function promisedSleep(ms){
  return new Promise(res => setTimeout(res, ms))
}
//5-16 temp
// var numDeltas = 100;
// var delay = 10; //milliseconds
// var i = 0;
// var deltaLat;
// var deltaLng;
// function transition(result){
//   i = 0;
//   deltaLat = (result[0] - position[0])/numDeltas;
//   deltaLng = (result[1] - position[1])/numDeltas;
//   moveMarker();
// }
// function moveMarker(){
//   position[0] += deltaLat;
//   position[1] += deltaLng;
//   var latlng = new google.maps.LatLng(position[0], position[1]);
//   currentMarker.setTitle("Latitude:"+position[0]+" | Longitude:"+position[1]);
//   currentMarker.setPosition(latlng);
//   if(i!=numDeltas){
//     i++;
//     setTimeout(moveMarker, delay);
//   }
// }
function codeAddress(geocoder, map, address) {
  geocoder.geocode({'address': address}, function(results, status) {
    if (status === 'OK') {
      map.setCenter(results[0].geometry.location);
      var addrMarker = new google.maps.Marker({
        map: map,
        position: results[0].geometry.location
      });
      // console.log(results[0].geometry.location.lat())
      // console.log(results[0].geometry.location.lng())
      // console.log(addrMarker.position.toString())
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}

// async function getCreatedMarkerID(newLat, newLng){
//   console.log('getCreatedMarkerID called')
//   try {
//     const response = await fetch(`/map/getMyMarkerID/${newLat}/${newLng}`, {
//       method: "GET",
//       mode: "cors",
//     })
//     console.log('GETCREATEDMARKERID RES: ' + response)
//     // console.log('GETCREATEDMARKERID RES: ' + response.body)
//     // console.log('GETCREATEDMARKERID RES: ' + jsonPromise)
//     // console.log('GETCREATEDMARKERID RES: ' + Object.keys(response))
//   } catch (err) {
//     console.log(err)
//   }
// }
async function createNewMarker(newType, newLat, newLng, newInfo, newApproved, newFlagged, newFlagBy){
  try {
    const response = await fetch("/map/createMarker", {
      method: "POST",
      mode: "cors",
      headers: {
        'Accept': 'application/x-www-form-urlencoded',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: JSON.stringify({ 
              markerType: newType,
              latitude: newLat,
              longitude: newLng,
              info: newInfo,
              approved: newApproved,
              flagged: newFlagged,
              flagBy: newFlagBy
            })
    })
    const createMarkerResponse = response.json()
    // console.log('CREATE MARKER RESPONSE: ' + response)
    createMarkerResponse.then((data) => {
      // console.log('CREATE MARKER RESPONSE: ')
      // console.log(data)
      markersFromDB.push(data)
    })
    // console.log('LAST MARKER: ')
    // console.log(markersFromDB[markersFromDB.length-1])
    // console.log('CREATE MARKER RESPONSE: ' + response.body)
    // console.log('CREATE MARKER RESPONSE: ' + response.headers)
    // console.log('CREATE MARKER RESPONSE ID: ' + response._id)
    // console.log('CREATE MARKER RESPONSE: ' + createMarkerResponse)
    // // console.log('CREATE MARKER RESPONSE PARSED: ' + JSON.parse(response.body))
    // // console.log(Object.keys(response))
    // // console.log(Object.keys(response.json()))
    // for (const [key, value] of Object.entries(response)) {
    //   console.log(`${key}: ${value}`);
    // }

    // getCreatedMarkerID(newLat, newLng)
  } catch (err) {
    console.log(err)
  }  
}
async function flagMarkerButton(arrIndex){
  // console.log('flagged')
  try {
    const response = await fetch(`/map/flagMarker/${markersFromDB[arrIndex]._id}?_method=PUT`, {
      method: "POST",
    })
    // console.log('after flag request')
  } catch (err) {
    console.log(err)
  }
}
async function loadNewMarkers(){
  try {
    const response = await fetch(`/map/loadMarkers/${lastLat}/${lastLng}`)
    const loadMarkersResponse = response.json()
    loadMarkersResponse.then((data) => {
      console.log('LOADMARKER RESPONSE: ')
      console.log(data)
      if(data){
        for(let i=0; i<markerStorage.length; i++){
          markerStorage[i].setMap(null)
        }
        markerStorage = []
        for(let i=0; i<data.length; i++){
          let tempMarker = new google.maps.Marker({
            position:{lat:data[i].latitude, lng:data[i].longitude},
            map:lastZoom >=14 ? map : null,
            icon: iconImageArr[data[i].markerType]
          })
          markerStorage.push(tempMarker)
          let tempWindow = new google.maps.InfoWindow({
            content:
              `<span class="infoWindow windowTop">${markerTypeArr[data[i].markerType]}</span><br>` +
              (infoWindowBool ? `<span class="infoWindow windowBot">${data[i].info}</span><br>` : ``) +
              (userCode !== data[i].flagBy && userCode !== data[i].user && userCode ? `<button onclick="flagMarkerButton(${markerStorage.length-1})">Flag as Inaccurate</button><br>` : ``) +
              (userCode === data[i].user ? `<button onclick="removeMarkerButton(${markerStorage.length-1})">Remove Marker</button>` : ``)
          })
          tempMarker.addListener('click',function(){
            tempWindow.open(map,tempMarker);
          })
        }
      }
    })
  } catch (err) {
    console.log(err)
  }
}
async function updateMapPosition(){
  try {
    const response = await fetch(`/map/updateMapPos/${lastLat}/${lastLng}/${lastZoom}?_method=PUT`, {
      method: "POST",
    })
  } catch (err) {
    console.log(err)
  }
}
async function removeMarkerButton(arrIndex){
  try {
    markerStorage[arrIndex].setMap(null)
    // console.log('before delete request')
    const response = await fetch(`/map/removeMarker/${markersFromDB[arrIndex]._id}?_method=DELETE`, {
      method: "POST",
      // mode: "cors",
      // headers: {
      //   'Content-Type': 'application/x-www-form-urlencoded'
      // },
      // body: JSON.stringify({

      // })
    })
    // console.log('after delete request')
  } catch (err) {
    console.log(err)
  }
}