import { MapTabButton } from '@/components/atoms/MapTabButton'
import { SearchButton } from '@/components/atoms/SearchButton'
import { BottomNav } from '@/components/organisms/commons/BottomNav'
import { CustomMarker } from '@/components/organisms/map/CustomMarker'
import {
  DirectionsRenderer,
  DirectionsService,
  GoogleMap,
  LoadScriptNext,
  MarkerF,
} from '@react-google-maps/api'
import { PAGE_NAME } from 'constants/PathName'
import { NextPage } from 'next'
import React, { useEffect, useState } from 'react'
import { useAuthLister } from 'utils/hooks/auth/useAuth'
import { useFetchLikedPost } from 'utils/hooks/likedPost/useFetchLikedPost'
import { useFetchPosts } from 'utils/hooks/post/useFetchPost'
import { useCustomRouter } from 'utils/hooks/useCustomRouter'
import { LatLng } from 'types/latlng'
import { findFarthestLocation } from 'utils/hooks/useDirection'

/* global google */

const APIkey = process.env.NEXT_PUBLIC_GCP_KEY_SUB as string

// const locates = [
//   {
//     lat: 34.933249,
//     lng: 137.168636,
//     img: '/',
//   },
//   {
//     lat: 34.93876,
//     lng: 137.1665,
//     img: '',
//   },
//   {
//     lat: 34.93145,
//     lng: 137.16265,
//     img: '',
//   },
// ]

// const destination = {
//   lat: 34.93145,
//   lng: 137.16265,
// }

// const transpoints = [
//   {
//     location: {
//       lat: 34.93876,
//       lng: 137.16650,
//     }
//   }
// ]


const map: NextPage = () => {

  const { userId } = useAuthLister()

  const { data: posts } = useFetchPosts()
  const { data: likePosts } = useFetchLikedPost(userId!)

  const { isActive, isLastActive, pathHistory } = useCustomRouter()
  // 現在位置
  const [center, setCenter] = useState({ lat: 0, lng: 0 })
  // ユーザー選択のいきたいポイント集
  const [selectedPoints, setSelectedPoints] = useState<LatLng[]>([])
  // ルート表示用の途中ポイント集
  const [transpoints, setTranspoints] = useState<
    google.maps.DirectionsWaypoint[]
  >([])
  // 現在のルート
  const [currentDirection, setCurrentDirection] = useState(null)
  // 上タグ
  const [isRecommend, setisRecommend] = useState(false)


  // 現在位置を取得
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setCenter({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      })
    }
  }, [])

  const directionsCallback = (googleRes: any) => {
    if (googleRes) {
      if (currentDirection) {
        if (
          googleRes.status === 'OK' &&
          googleRes.geocoded_waypoints.length !==
          // @ts-ignore
          currentDirection.geocoded_waypoints.length
        ) {
          // console.log('ルートが設定されたのでstateを更新する')
          setCurrentDirection(googleRes)
        } else {
          // console.log('前回と同じルートのためstateを更新しない')
        }
      } else {
        if (googleRes.status === 'OK') {
          // console.log('初めてルートが設定された')
          setCurrentDirection(googleRes)
        } else {
          // console.log('前回と同じルートのためstateを更新しない')
        }
      }
    }
  }

  // マーカークリック時
  const handleClickMarkerF = (latLng: LatLng) => {
    const contained = selectedPoints.findIndex(
      (p) => p.lat === latLng.lat && p.lng === latLng.lng,
    )
    if (contained >= 0) {
      const newPoints = [...selectedPoints]
      newPoints.splice(contained, 1)
      setSelectedPoints(newPoints)
    } else {
      // 選択されていない場合は追加する
      setSelectedPoints([...selectedPoints, latLng])
    }
    console.log(selectedPoints)
  }

  // 道検索ボタン押すたびに道を再生成
  const handleSearch = () => {
    const waypoints = selectedPoints.map((point) => ({ location: point }))
    setTranspoints(waypoints)
    setCurrentDirection(null)
  }

  // 表示する内容をタブで分ける
  const data = isRecommend ? likePosts : posts

  // 最終地点を決める
  // @ts-ignore
  const destination = findFarthestLocation(center, transpoints)
  return (
    <div style={{ background: '#eee', height: '200vw', width: '100vw' }}>
      <LoadScriptNext googleMapsApiKey={APIkey}>
        <GoogleMap
          mapContainerStyle={{
            width: '100%',
            height: '100vh',
          }}
          center={center}
          zoom={15}
          clickableIcons={false}
          options={{
            gestureHandling: 'greedy',
            streetViewControl: false,
            fullscreenControl: false,
            disableDefaultUI: false,
            mapTypeControl: false,
            zoomControl: false
          }}
        >
          {data &&
            data.map((post, i) => (
              <CustomMarker
                locate={{ lat: post.address.latitude, lng: post.address.longitude }}
                imageUrl={post.postImages[0].imagePath}
                onClick={() => handleClickMarkerF({ lat: post.address.latitude, lng: post.address.longitude })}
                key={i}
              />
            ))}
          <MarkerF position={center} />

          {transpoints.length > 0 && (
            <DirectionsService
              options={{
                origin: center,
                destination: destination!,
                // travelMode: google.maps.TravelMode.WALKING,
                // @ts-ignore
                travelMode: 'WALKING',
                optimizeWaypoints: true,
                waypoints: transpoints,
              }}
              callback={directionsCallback}
            />
          )}
          {currentDirection !== null && (
            <DirectionsRenderer
              options={{
                directions: currentDirection,
                suppressMarkers: true,
                markerOptions: { visible: false },
              }}
            />
          )}
        </GoogleMap>
      </LoadScriptNext>
      <SearchButton onClick={handleSearch} />
      <div style={{
        position: "absolute",
        top: 15,
        left: 5,
        backgroundColor: "rgba(0,0,0,0)",
      }}>
        <MapTabButton name={"すべて"} onClick={() => setisRecommend(false)} selected={!isRecommend} />
        <MapTabButton name={"おすすめ"} onClick={() => setisRecommend(true)} selected={isRecommend} />
      </div>
      <BottomNav
        PAGE_NAME={PAGE_NAME}
        isActive={isActive}
        isLastActive={isLastActive}
        pathHistory={pathHistory}
      />
    </div>
  )
}

export default map
