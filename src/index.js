import mapboxgl from 'mapbox-gl'
import AdaWidgetSDK from '@ada-support/ada-widget-sdk'

const widgetSDK = new AdaWidgetSDK()

widgetSDK.init(event => {

  // Get app config
  const { token, type, points } = widgetSDK.metaData

  // Set up map
  mapboxgl.accessToken = token
  const map = new mapboxgl.Map({
    container: 'map-container',
    style: 'mapbox://styles/mapbox/streets-v11',
  })

  // Prepare locations
  const coords = JSON.parse(points)
  const bounds = coords.reduce((bounds, coord) => {
    return bounds.extend(coord)
  }, new mapboxgl.LngLatBounds(coords[0], coords[0]))

  // Add locations as markers to map
  for (const coord of coords) {
    new mapboxgl.Marker()
    .setLngLat(coord)
    .addTo(map)
  }

  // Remove loading indicator once map is loaded
  map.on('load', () => {
    document.getElementById('loading').remove()

    // Resize bounds to fit markers
    map.fitBounds(bounds, { padding: 64 })
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

      map.fitBounds(boundsWithUser, { padding: 64 })

    })

  }
  

})