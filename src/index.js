import mapboxgl from 'mapbox-gl'
import AdaWidgetSDK from '@ada-support/ada-widget-sdk'

const widgetSDK = new AdaWidgetSDK()

widgetSDK.init(event => {

  // Get app config
  const { token, points, labels, annotate, stream } = widgetSDK.metaData

  // Handle no token
  if (token === undefined) {
    if (widgetSDK.widgetIsActive) {
      // Send response to prevent blocking
      widgetSDK.sendUserData({}, () => {})
    }

    // Show error message
    document.getElementById('loading').innerHTML = 'Could not load map.'
    console.error('MAP ERROR: A Mapbox API token is required to display maps.')

    return
  }

  // Set up map
  mapboxgl.accessToken = token
  const map = new mapboxgl.Map({
    container: 'map-container',
    style: 'mapbox://styles/mapbox/streets-v11',
  })

  // Set up geolocation control
  const geolocate = new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true
    }
  })

  if (widgetSDK.widgetIsActive) {

    // Send response to prevent blocking
    widgetSDK.sendUserData({}, () => {})

    // Only add ability to geolocate if the widget is active
    map.addControl(geolocate)

  }

  if (stream != undefined) {
    // Display realtime map if a stream URL is provided

    map.on('load', () => {
      // Remove loading indicator once map is loaded
      document.getElementById('loading').remove()

      const request = new XMLHttpRequest()
      window.setInterval(() => {
        // Make a GET request to parse the GeoJSON at the url
        request.open('GET', stream, true)
        request.onload = function() {
          if (this.status >= 200 && this.status < 400) {
            var json = JSON.parse(this.response)
            map.getSource('tracker').setData(json)
            map.flyTo({
              center: json.geometry.coordinates,
              speed: 0.5
            })
          }
        }
        request.send()
      }, 2000)

      map.addSource('tracker', { type: 'geojson', data: stream })
      map.addLayer({
        id: 'tracker',
        type: 'symbol',
        source: 'tracker',
        layout: {
          'icon-image': 'rocket-15',
          'icon-size': 1.5
        }
      })
    })
    

  } else {
    // Display default map

    const names = JSON.parse(labels)
    const coords = JSON.parse(points)
    const showNumbers = (annotate === 'true')
  
    // Handle improper points and labels
    if (points === undefined || labels === undefined || names.length != coords.length) {
  
      if (widgetSDK.widgetIsActive) {
        // Send response to prevent blocking
        widgetSDK.sendUserData({}, () => {})
      }
  
      document.getElementById('loading').innerHTML = 'Could not load map.'
  
      if (token === undefined) {
        console.error('MAP ERROR: A Mapbox API token is required to display maps.')
      }
  
      if (points === undefined || labels === undefined) {
        console.error('MAP ERROR: No points or labels have been provided to show on the map.')
      }
  
      if (coords.length != names.length) {
        console.error('MAP ERROR: Mismatched number of points against labels.')
      }
  
      return
    }

    // Add points and labels as markers to map
    for (var i = 0; i < coords.length; i++) {
      const popup = new mapboxgl.Popup({
        anchor: 'bottom',
        offset: (showNumbers ? 12 : 36),
        closeButton: false,
        closeOnMove: true
      })
      .setHTML(`
        <div class="mapboxgl-custom-popover">
          <strong>${names[i]}</strong>
          <a href="#" onclick="window.open('https://maps.apple.com/?q=${names[i]}&sll${coords[i][1]},${coords[i][0]}', '_blank');">Get Directions</a>
        </div>
      `)

      if (showNumbers) {
        // Show a customer marker with a number on it
        var markerElement = document.createElement('div')
        markerElement.className = 'mapboxgl-custom-marker'
        markerElement.innerText = `${i + 1}`

        new mapboxgl.Marker(markerElement)
        .setLngLat(coords[i])
        .setPopup(popup)
        .addTo(map)

      } else {

        new mapboxgl.Marker()
        .setLngLat(coords[i])
        .setPopup(popup)
        .addTo(map)
      }
    
    }

    map.on('load', () => {

      // Remove loading indicator once map is loaded
      document.getElementById('loading').remove()

      // Resize bounds to fit markers
      const bounds = coords.reduce((bounds, coord) => {
        return bounds.extend(coord)
      }, new mapboxgl.LngLatBounds(coords[0], coords[0]))
      map.fitBounds(bounds, { padding: 128 })
    })

    // If geolocation triggered, resize map bounds to show user marker
    geolocate.on('geolocate', data => {

      const coordsWithUser = [
        [data.coords.longitude, data.coords.latitude]
      ].concat(coords)

      const boundsWithUser = coordsWithUser.reduce((bounds, coord) => {
        return bounds.extend(coord)
      }, new mapboxgl.LngLatBounds(coordsWithUser[0], coordsWithUser[0]))

      map.fitBounds(boundsWithUser, { padding: 80 })

    })

  }

})