'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, CameraOff } from 'lucide-react'

interface CameraFeedProps {
    isOn: boolean
}

export default function CameraFeed({ isOn }: CameraFeedProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [stream, setStream] = useState<MediaStream | null>(null)
    const [hasPermission, setHasPermission] = useState(false)

    useEffect(() => {
        if (isOn && !stream) {
            startCamera()
        } else if (!isOn && stream) {
            stopCamera()
        }

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop())
            }
        }
    }, [isOn])

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false,
            })
            setStream(mediaStream)
            setHasPermission(true)

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream
            }
        } catch (error) {
            console.error('Error accessing camera:', error)
            setHasPermission(false)
        }
    }

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop())
            setStream(null)
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null
        }
    }

    return (
        <motion.div
            className="w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border border-gray-700 shadow-lg"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            {isOn && hasPermission ? (
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center">
                    {isOn ? (
                        <div className="text-center">
                            <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-xs text-gray-400">Camera access needed</p>
                        </div>
                    ) : (
                        <div className="text-center">
                            <CameraOff className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-xs text-gray-400">Camera off</p>
                        </div>
                    )}
                </div>
            )}

            {/* User label */}
            <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-xs">
                You
            </div>
        </motion.div>
    )
}