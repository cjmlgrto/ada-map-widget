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

  // Remove loading indicator once map is loaded
  map.on('load', () => {
    document.getElementById('loading').remove()
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

  }
  

})