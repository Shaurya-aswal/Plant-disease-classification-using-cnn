'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

export default function CameraTest() {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    // Check camera availability on component mount
    console.log('Camera test component mounted')
    
    if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
      console.log('MediaDevices API available')
      
      // Get available devices
      navigator.mediaDevices.enumerateDevices()
        .then(deviceList => {
          const videoDevices = deviceList.filter(device => device.kind === 'videoinput')
          console.log('Found video devices:', videoDevices)
          setDevices(videoDevices)
        })
        .catch(err => {
          console.error('Error enumerating devices:', err)
          setError('Cannot enumerate devices: ' + err.message)
        })
    } else {
      console.error('MediaDevices API not available')
      setError('MediaDevices API not available')
    }
  }, [])

  const startCamera = useCallback(async () => {
    try {
      console.log('Attempting to start camera...')
      setError(null)

      if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
        throw new Error('MediaDevices API not available')
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      })

      console.log('Camera stream obtained:', mediaStream)
      setStream(mediaStream)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        console.log('Video element updated with stream')
      }

    } catch (err: any) {
      console.error('Camera error:', err)
      let errorMessage = 'Camera access failed: ' + err.message
      
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Camera permission denied. Please allow camera access.'
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No camera found on this device.'
      } else if (err.name === 'NotSupportedError') {
        errorMessage = 'Camera not supported in this browser.'
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'Camera is already in use.'
      }
      
      setError(errorMessage)
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
      console.log('Camera stopped')
    }
  }, [stream])

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Camera Test Page</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Available Video Devices:</h2>
          {devices.length > 0 ? (
            <ul className="list-disc list-inside">
              {devices.map((device, index) => (
                <li key={device.deviceId}>
                  {device.label || `Camera ${index + 1}`} ({device.deviceId.substring(0, 8)}...)
                </li>
              ))}
            </ul>
          ) : (
            <p>No video devices found or permission not granted</p>
          )}
        </div>

        <div className="space-x-4">
          <button
            onClick={startCamera}
            disabled={!!stream}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Start Camera
          </button>
          <button
            onClick={stopCamera}
            disabled={!stream}
            className="bg-red-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Stop Camera
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="border rounded p-4">
          <h3 className="font-semibold mb-2">Camera Preview:</h3>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full max-w-md h-auto border rounded"
            style={{ backgroundColor: '#f0f0f0' }}
          />
        </div>

        <div className="text-sm text-gray-600">
          <p><strong>Browser:</strong> {typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'}</p>
          <p><strong>MediaDevices API:</strong> {typeof navigator !== 'undefined' && navigator.mediaDevices ? 'Available' : 'Not Available'}</p>
          <p><strong>Stream Status:</strong> {stream ? 'Active' : 'Inactive'}</p>
        </div>
      </div>
    </div>
  )
}
