import { InfoWindowF, MarkerF } from '@react-google-maps/api'
import Image from 'next/image'
import React, { useState } from 'react'

type Props = {
    locate: LatLng
    imageUrl: string
    onClick: (() => void)
}

type LatLng = {
    lat: number,
    lng: number,
}



export const CustomMarker = (props: Props) => {
    const { locate, imageUrl, onClick } = props

    const [isSelected, setisSelected] = useState(false)

    const handleClick = () => {
        setisSelected(!isSelected);
        onClick()
    }

    return (

        <InfoWindowF
            position={locate}
            options={{
                // maxWidth: 100,
            }}

        >
            <div onClick={handleClick}
                style={{ position: "relative" }}
            >
                <Image src={imageUrl} width={100} height={100} alt='marker'
                    draggable={false}
                    style={
                        !isSelected
                            ? {
                                // borderRadius: "50%",
                                objectFit: "cover",

                            }
                            : {
                                objectFit: "contain",
                                opacity: 0.5
                            }
                    } />
                {isSelected && <div style={{
                    position: "absolute",
                    top: 2,
                    right: 5,
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    backgroundColor: "#0098FD"
                }}>
                </div>}
            </div>
        </InfoWindowF >
    )
}
