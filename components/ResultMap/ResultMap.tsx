import GoogleMapReact from 'google-map-react'
import { FC, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'

import { selectUser } from '@redux/user'
import { GuessType, LocationType } from '@types'
import { createMarker, getMapTheme, getResultMapValues } from '@utils/helperFunctions'

import { StyledResultMap } from './'

type Props = {
  guessedLocations: GuessType[]
  actualLocations: LocationType[]
  round: number
  isFinalResults?: boolean
}

const ResultMap: FC<Props> = ({ guessedLocations, actualLocations, round, isFinalResults }) => {
  const guessedLocation = guessedLocations[guessedLocations.length - 1]
  const actualLocation = actualLocations[round - 2]
  const user = useSelector(selectUser)
  const deafultCoords = {
    lat: 0,
    lng: 0,
  }

  const lineSymbol = {
    path: 'M 0,-1 0,1',
    strokeOpacity: 1,
    scale: 2,
  }

  const googleKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY as string

  const GoogleMapConfig = {
    key: googleKey,
  }

  const resultMapRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
  const polylinesRef = useRef<google.maps.Polyline[]>([])

  useEffect(() => {
    if (!resultMapRef.current) return

    loadMapMarkers(resultMapRef.current)
  }, [guessedLocations, actualLocations, resultMapRef.current])

  const loadMapMarkers = (map: google.maps.Map) => {
    // Remove old markers and polylines from map
    markersRef.current.map((marker) => marker.setMap(null))
    polylinesRef.current.map((polyline) => polyline.setMap(null))

    // If this is final results map, load all the round markers. Otherwise, simply load the current round markers
    if (isFinalResults) {
      for (let i = 0; i < actualLocations.length; i++) {
        const guessedLocationMarker = createMarker(guessedLocations[i], map, `/images/markers/testMarker2.png`)
        const actualLocationMarker = createMarker(actualLocations[i], map, `/images/markers/actualMarker${i + 1}.png`)
        markersRef.current.push(guessedLocationMarker)
        markersRef.current.push(actualLocationMarker)

        actualLocationMarker.addListener('click', () => {
          window.open(
            `http://www.google.com/maps?layer=c&cbll=${actualLocations[i].lat},${actualLocations[i].lng}`,
            '_blank'
          )
        })

        // Get midpoint between guess and actual to add to polyline path
        // This is to prevent the polyline going across multiple maps
        const midPoint = {
          lat: (guessedLocations[i].lat + actualLocations[i].lat) / 2,
          lng: (guessedLocations[i].lng + actualLocations[i].lng) / 2,
        }

        const polyline = new google.maps.Polyline({
          path: [guessedLocations[i], midPoint, actualLocations[i]],
          map: map,
          strokeOpacity: 0,
          icons: [{ icon: lineSymbol, offset: '0', repeat: '10px' }],
        })

        polylinesRef.current.push(polyline)
      }
    } else {
      const guessedLocationMarker = createMarker(guessedLocation, map, `/images/markers/testMarker2.png`)
      const actualLocationMarker = createMarker(actualLocation, map, '/images/markers/actualMarker.png')
      markersRef.current.push(guessedLocationMarker)
      markersRef.current.push(actualLocationMarker)

      actualLocationMarker.addListener('click', () => {
        window.open(`http://www.google.com/maps?layer=c&cbll=${actualLocation.lat},${actualLocation.lng}`, '_blank')
      })

      const midPoint = {
        lat: (guessedLocation.lat + actualLocation.lat) / 2,
        lng: (guessedLocation.lng + actualLocation.lng) / 2,
      }

      const polyline = new google.maps.Polyline({
        path: [guessedLocation, midPoint, actualLocation],
        map: map,
        strokeOpacity: 0,
        icons: [{ icon: lineSymbol, offset: '0', repeat: '10px' }],
      })

      polylinesRef.current.push(polyline)
    }
  }

  const handleApiLoaded = () => {
    const { center, zoom } = getResultMapValues(guessedLocation, actualLocation, isFinalResults)
    const map = new window.google.maps.Map(document.getElementById('resultMap') as HTMLElement, {
      zoom: zoom,
      minZoom: 1,
      center: center,
      disableDefaultUI: true,
      styles: getMapTheme(''),
      clickableIcons: false,
      gestureHandling: 'greedy',
    })

    loadMapMarkers(map)

    resultMapRef.current = map
  }

  return (
    <StyledResultMap>
      <div id="resultMap" className="map">
        <GoogleMapReact
          bootstrapURLKeys={GoogleMapConfig}
          center={deafultCoords}
          zoom={2}
          yesIWantToUseGoogleMapApiInternals
          onGoogleApiLoaded={handleApiLoaded}
        ></GoogleMapReact>
      </div>
    </StyledResultMap>
  )
}

export default ResultMap
