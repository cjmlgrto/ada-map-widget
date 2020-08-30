// Maps Widget
// ============================================================

import mapboxgl from 'mapbox-gl'
import AdaWidgetSDK from '@ada-support/ada-widget-sdk'

// Utils
// ------------------------------------------------------------

const createBounds = coords => {
  return coords.reduce((bounds, coord) => {
    return bounds.extend(coord)
  }, new mapboxgl.LngLatBounds(coords[0], coords[0]))
}

// Map methods
// ------------------------------------------------------------

const renderMarkers = (map, labels, points, annotate) => {
  points.map((point, index) => {
    const label = labels[index]

    const popup = new mapboxgl.Popup({
      anchor: 'bottom',
      offset: (annotate ? 12 : 36),
      closeButton: false,
      closeOnMove: true
    })
    .setHTML(`
      <div class="custom-popover">
        <strong>${label}</strong>
        <a href="#" onclick="window.open('https://maps.apple.com/?q=${label}&sll${point[1]},${point[0]}', '_blank')">
          Get Directions
        </a>
      </div>
    `)

    if (annotate) {
      var customMarker = document.createElement('div')
      customMarker.className = 'custom-marker'
      customMarker.innerText = `${index + 1}`

      new mapboxgl.Marker(customMarker)
      .setLngLat(point)
      .setPopup(popup)
      .addTo(map)
    } else {
      new mapboxgl.Marker()
      .setLngLat(point)
      .setPopup(popup)
      .addTo(map)
    }
  })
}

const renderTracker = (map, url) => {
  const request = new XMLHttpRequest()

  window.setInterval(() => {
    request.open('GET', url, true)

    request.onload = function() {
      if (this.status >= 200 && this.status < 400) {
        const data = JSON.parse(this.response)
        map.getSource('tracker').setData(data)
        map.flyTo({
          center: data.geometry.coordinates,
          speed: 0.5
        })
      }
    }

    request.send()

  }, 2000)

  map.addSource('tracker', {
    type: 'geojson',
    data: url
  })

  map.addLayer({
    id: 'tracker',
    type: 'symbol',
    source: 'tracker',
    layout: {
      'icon-image': 'rocket-15',
      'icon-size': 1.5
    }
  })
}

// Widget setup
// ------------------------------------------------------------

const widgetSDK = new AdaWidgetSDK()
const statusElement = document.getElementById('status')

widgetSDK.init(event => {

  // Widget init
  // ------------------------------------------------------------

  if (widgetSDK.widgetIsActive) {
    widgetSDK.sendUserData({}, () => {})
  }

  const { 
    token = null, 
    points = null, 
    labels = null, 
    stream = null,
    annotate = false
  } = widgetSDK.metaData

  // Error handling
  // ------------------------------------------------------------

  if (token === null) {
    statusElement.innerHTML = 'Map API token missing.'
    return
  }

  if (
    stream != null
    && (points != null || labels != null)
  ) {
    statusElement.innerHTML = 'Map incorrectly configured.'
    return 
  }

  if (
    points != null 
    && labels != null 
    && JSON.parse(points).length != JSON.parse(labels).length
  ) {
    statusElement.innerHTML = 'Mismatched amount of points to labels.'
    return
  }

  // Map setup
  // ------------------------------------------------------------

  mapboxgl.accessToken = token

  const map = new mapboxgl.Map({
    container: 'map-container',
    style: 'mapbox://styles/mapbox/streets-v11'
  })
  
  const geolocator = new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true
    }
  })
  
  map.on('load', () => {
  
    // Allow user location tracking only if active
    if (widgetSDK.widgetIsActive) {
      map.addControl(geolocator)
    }

    // Configuration: Markers
    if (points != null && labels != null && stream === null) {
      const markerPoints = JSON.parse(points)
      const markerLabels = JSON.parse(labels)
      const markerBounds = createBounds(markerPoints)

      renderMarkers(map, markerLabels, markerPoints, annotate)

      map.fitBounds(markerBounds, { padding: 80 })

      geolocator.on('geolocate', data => {

        const pointsWithUser = [
          [data.coords.longitude, data.coords.latitude]
        ].concat(markerPoints)
        
        const boundsWithUser = createBounds(pointsWithUser)
        
        map.fitBounds(boundsWithUser, { padding: 80 })

      })
    }

    // Configuration: Tracker
    if (stream != null && points === null && labels === null) {
      if (!widgetSDK.widgetIsActive) {
        statusElement.innerHTML = 'Real-time tracking ended. <br/> Ask again to track.'
        map.remove()
        return
      }

      renderTracker(map, stream)
    }

    statusElement.remove()
  })
})