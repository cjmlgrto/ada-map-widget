import AdaWidgetSDK from '@ada-support/ada-widget-sdk'

const widgetSDK = new AdaWidgetSDK()

widgetSDK.init(event => {

  // Get app config
  const { token, type, points } = widgetSDK.metaData

  // Send response to prevent blocking
  if (widgetSDK.widgetIsActive) {
    widgetSDK.sendUserData({}, () => {})
  }

})