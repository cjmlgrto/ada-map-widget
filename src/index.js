import mapboxgl from 'mapbox-gl'
import AdaWidgetSDK from '@ada-support/ada-widget-sdk'

const widgetSDK = new AdaWidgetSDK()

widgetSDK.init(event => {

  // Get app config
  const { token, points, labels } = widgetSDK.metaData

  const names = JSON.parse(labels)
  const coords = JSON.parse(points)

  // Handle impropr config
  if (token === undefined || points === undefined || labels === undefined || names.length != coords.length) {

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

  // Set up map
  mapboxgl.accessToken = token
  const map = new mapboxgl.Map({
    container: 'map-container',
    style: 'mapbox://styles/mapbox/streets-v11',
  })

  // Add points and labels as markers to map
  for (var i = 0; i < coords.length; i++) {
    const popup = new mapboxgl.Popup({
      anchor: 'bottom'
    })
    .setHTML('<strong>' + names[i] + '</strong>')

    new mapboxgl.Marker()
    .setLngLat(coords[i])
    .setPopup(popup)
    .addTo(map)
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

  if (widgetSDK.widgetIsActive) {

    // Send response to prevent blocking
    widgetSDK.sendUserData({}, () => {})

    // Set up geolocation control
    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      }
    })
    map.addControl(geolocate)

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