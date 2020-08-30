# Ada Maps Widget

Display locations or track a geo data stream in real-time over an interactive map.

# Usage

> ### Requirement
>
> In order to use this app inside Ada, you must provide a [Mapbox](https://www.mapbox.com) API key, configured as a `token` in your App Input Data.

## Mark Locations

![Mark Locations](https://user-images.githubusercontent.com/1712450/91664068-07cc2b80-eb30-11ea-9b05-fbb807294a2f.png)

Display a list of coordinates as markers over an interactive map. This can help to answer questions like, *“Where are your stores?”* or *“Where can I visit you?”*.

#### App Input Data

- **points**: an array of coordinates, where each item is of the form `[longitude, latitude]`
- **labels**: an array of labels for each point, where each item is of the form `"place_name"`

#### Example

| App Input Data Key | Value |
| --- | --- |
| token | `your_token` |
| points | `[[144.979999,-37.796021], [144.969415,-37.815514]]` |
| labels | `["Lune HQ, Fitzroy", "Lune, Collins St"]` |

## List Locations

![List Locations](https://user-images.githubusercontent.com/1712450/91664067-06026800-eb30-11ea-8b84-aa7123513846.png)


Display a list of coordinates as labelled, numbered markers. This can help to prompt questions from Ada like, *“Where would you like to book your appointment?“* or *“Choose a pickup location“*.

This can provide a way for the user to visually pick from a collection of locations and **best paired with a List Option Picker message**. 

#### App Input Data

- **points**: an array of coordinates, where each item is of the form `[longitude, latitude]`
- **labels**: an array of labels for each point, where each item is of the form `"place_name"`
- **annotate**: a boolean as a string, of the form `true`

#### Example

| App Input Data Key | Value |
| --- | --- |
| token | `your_token` |
| points | `[[144.979999,-37.796021], [144.969415,-37.815514]]` |
| labels | `["Lune HQ, Fitzroy", "Lune, Collins St"]` |
| annotate| `true` |

## Track Real-time Location

![Track Real-Time Location](https://user-images.githubusercontent.com/1712450/91664063-00a51d80-eb30-11ea-8b11-b4edb5fa3667.png)


Display a marker that updates its location from a live data stream. This can help to answer questions like, *“Where's my package?“* or *“How's my delivery going?“*

Note that real-time tracking only appears if the widget is active, otherwise a message prompting the user to ask for tracking again is displayed.

#### App Input Data

- **stream**: URL endpoint for a [GeoJSON](https://geojson.org) stream, of the form `https://example-url.com`

#### Example

| App Input Data Key | Value |
| --- | --- |
| token | `your_token` |
| stream | `https://example-url.com` |



