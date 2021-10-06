import React, { FC, useEffect, useRef, useState } from 'react'
import { StyledMap } from '.'
import GoogleMapReact from 'google-map-react'
import { LocationType } from '../../types'
import Marker from 'google-map-react'
import { Button } from '../System/Button'
import { useRouter } from 'next/router'
import { useDispatch, useSelector } from 'react-redux'
import { addGuess, selectGame, updateGuess, updateView } from '../../redux/game'
import { getGuessMapDimensions, getMapTheme } from '../../utils/helperFunctions'
import { ChevronDownIcon, ChevronUpIcon, LocationMarkerIcon } from '@heroicons/react/outline'
import { Icon } from '../System'
import { selectUser, updateGuessMapSize } from '../../redux/user'

type Props = {
  coordinate: LocationType
  zoom: number
}

const Map: FC<Props> = ({ coordinate, zoom }) => {
  const [mapHeight, setMapHeight] = useState(180)
  const [mapWidth, setMapWidth] = useState(300)
  const [hovering, setHovering] = useState(false)
  const [hasGuessed, setHasGuessed] = useState(false)
  const prevMarkersRef = useRef<google.maps.Marker[]>([])
  const dispatch = useDispatch()
  const game = useSelector(selectGame)
  const user = useSelector(selectUser)


  const googleKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY as string

  const GoogleMapConfig = {
    key: googleKey,
    libraries: 'places'
  }

  const handleApiLoaded = () => {
    const map = new window.google.maps.Map(
      document.getElementById("guessMap") as HTMLElement, {
        zoom: 2,
        center: { lat: 0, lng: 0 },
        disableDefaultUI: true,
        styles: getMapTheme('Light')
      }   
    )

    clearMarkers(prevMarkersRef.current)

    window.google.maps.event.addListener(map, "click", (e: any) => {
      const location = {
        lat: e.latLng.lat(), 
        lng: e.latLng.lng()
      }
      dispatch(updateGuess({
        currGuess: location
      }))

      const marker = createMarker(location, map)
      clearMarkers(prevMarkersRef.current)
      prevMarkersRef.current.push(marker)
    });
  }

  const createMarker = (position: LocationType, map: google.maps.Map) => {
    const image = {
      url: "https://www.geoguessr.com/images/auto/30/30/ce/0/plain/pin/c2fe16562d9ad321687532d53b067e75.png",
      size: new google.maps.Size(30, 30),
    }

    const svgMarker = {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: 'blue',
      fillOpacity: 0.6,
      strokeWeight: 0,
      rotation: 0,
      scale: 2,
      anchor: new google.maps.Point(15, 30),

    }

    setHasGuessed(true)

    return new window.google.maps.Marker({
      position: position,
      map: map,
      icon: image
    })

  }

  const clearMarkers = (markers: google.maps.Marker[]) => {
    for (let m of markers) {
      m.setMap(null)
    }
  }

  const handleMapHover = () => {
    setHovering(true)
    const { width, height } = getGuessMapDimensions(user.guessMapSize)
    setMapHeight(height)
    setMapWidth(width)
  }

  const handleMapLeave = () => {
    setHovering(false)
    setMapHeight(180)
    setMapWidth(300)
  }

  const handleSubmitGuess = () => {
    const guesses: LocationType[] = game.guessedLocations

    dispatch(updateView({
      currView: 'Result'
    }))
    dispatch(addGuess({
      guessedLocations: game.currGuess
    }))
  }

  const changeMapSize = (change: 'increase' | 'decrease') => {
    if (change === 'increase') {
      dispatch(updateGuessMapSize({
        guessMapSize: user.guessMapSize + 1
      }))
    }
    else {
      dispatch(updateGuessMapSize({
        guessMapSize: user.guessMapSize - 1
      }))
    }
    handleMapHover()

  }

  return (
    <StyledMap mapHeight={mapHeight} mapWidth={mapWidth}>
      <div className="guessMapWrapper" onMouseOver={handleMapHover} onMouseLeave={handleMapLeave}>
      {hovering &&
          <div className="controls">
            <button className="controlBtn" onClick={() => changeMapSize('increase')}>
              <Icon size={16} fill="#fff">
                <ChevronUpIcon />
              </Icon>
            </button>

            <button className="controlBtn" onClick={() => changeMapSize('decrease')}>
              <Icon size={16} fill="#fff">
                <ChevronDownIcon />
              </Icon>
            </button>
          </div>
        }
        <div id="guessMap" className="map"></div> 
        
        <Button 
        type="solidBlue" 
        width="100%" 
        isDisabled={!hasGuessed}
        callback={handleSubmitGuess}
        >Submit Guess</Button> 
      </div>  
      <GoogleMapReact 
            bootstrapURLKeys={GoogleMapConfig}
            defaultCenter={coordinate} 
            defaultZoom={zoom}
            yesIWantToUseGoogleMapApiInternals
            onGoogleApiLoaded={handleApiLoaded}
          >
          </GoogleMapReact>
    </StyledMap>
  )
}

export default Map
