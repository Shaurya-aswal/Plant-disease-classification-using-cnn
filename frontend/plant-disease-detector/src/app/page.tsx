'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Camera, AlertCircle, CheckCircle, Leaf, Info, X, Zap, Shield, Brain } from 'lucide-react'
import Image from 'next/image'

interface PredictionResult {
  disease: string
  confidence: number
  severity: string
  treatment?: string
  description?: string
  color: string
}

export default function PlantDiseaseDetector() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setSelectedImage(reader.result as string)
        setPrediction(null)
        setError(null)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024 // 10MB
  })

  // Camera functionality
  const startCamera = useCallback(async () => {
    try {
      console.log('Starting camera...')
      setError(null)
      
      // Check if navigator.mediaDevices is available
      if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
        throw new Error('Camera API not supported in this browser')
      }

      console.log('Requesting camera permission...')
      
      // Simplified camera request
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true
      })
      
      console.log('Camera stream obtained:', stream)
      streamRef.current = stream
      setShowCamera(true)
      setCameraReady(false)
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        console.log('Video element assigned stream')
        
        // Wait for video to be ready
        const handleMetadata = () => {
          console.log('Video metadata loaded')
          setCameraReady(true)
        }
        
        const handleCanPlay = () => {
          console.log('Video can play')
          setCameraReady(true)
        }
        
        videoRef.current.addEventListener('loadedmetadata', handleMetadata, { once: true })
        videoRef.current.addEventListener('canplay', handleCanPlay, { once: true })
      }
      
      setError(null)
      console.log('Camera setup completed')
      
    } catch (err: any) {
      console.error('Camera error details:', err)
      let errorMessage = 'Camera access failed'
      
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Camera permission denied. Please allow camera access and try again.'
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No camera found on this device.'
      } else if (err.name === 'NotSupportedError') {
        errorMessage = 'Camera not supported in this browser.'
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'Camera is already in use by another application.'
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
      setShowCamera(false)
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setShowCamera(false)
    setCameraReady(false)
  }, [])

  const capturePhoto = useCallback(() => {
    if (videoRef.current && videoRef.current.videoWidth > 0 && videoRef.current.videoHeight > 0) {
      const canvas = document.createElement('canvas')
      const video = videoRef.current
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      const ctx = canvas.getContext('2d')
      if (ctx) {
        // Draw the video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        
        // Convert to data URL with higher quality
        const dataURL = canvas.toDataURL('image/jpeg', 0.9)
        
        console.log('Photo captured:', {
          videoWidth: video.videoWidth,
          videoHeight: video.videoHeight,
          dataURLLength: dataURL.length,
          dataURLPrefix: dataURL.substring(0, 50)
        })
        
        setSelectedImage(dataURL)
        setPrediction(null)
        setError(null)
        stopCamera()
      } else {
        setError('Failed to capture photo - canvas context not available')
      }
    } else {
      setError('Camera not ready - please wait for video to load')
    }
  }, [stopCamera])

  const analyzePlant = async () => {
    if (!selectedImage) return

    setIsLoading(true)
    setError(null)

    try {
      // Convert base64 to blob for API upload
      const response = await fetch(selectedImage)
      const blob = await response.blob()
      
      const formData = new FormData()
      formData.append('image', blob, 'plant-image.jpg')

      const apiResponse = await fetch('/api/predict', {
        method: 'POST',
        body: formData
      })

      if (!apiResponse.ok) {
        throw new Error(`API Error: ${apiResponse.status}`)
      }

      const result = await apiResponse.json()
      
      if (result.error) {
        throw new Error(result.error)
      }

      setPrediction(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze plant')
      console.error('Analysis error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const getDiseaseInfo = (prediction: PredictionResult) => {
    const colorMap = {
      'red': {
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        progressColor: "bg-red-500"
      },
      'orange': {
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
        progressColor: "bg-orange-500"
      },
      'green': {
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        progressColor: "bg-green-500"
      },
      'gray': {
        color: "text-gray-600",
        bgColor: "bg-gray-50",
        borderColor: "border-gray-200",
        progressColor: "bg-gray-500"
      }
    }
    
    return colorMap[prediction.color as keyof typeof colorMap] || colorMap.gray
  }

  // Check camera permissions
  const checkCameraPermissions = useCallback(async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.permissions) {
        const permission = await navigator.permissions.query({ name: 'camera' as PermissionName })
        console.log('Camera permission status:', permission.state)
        return permission.state
      }
    } catch (err) {
      console.log('Could not check camera permissions:', err)
    }
    return null
  }, [])

  // Cleanup camera stream on component unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
    }
  }, [])

  // Test camera availability on component mount
  useEffect(() => {
    console.log('Component mounted, checking camera availability...')
    
    // Check if MediaDevices API is available
    if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
      console.log('Camera API is available')
      
      // Check available devices
      navigator.mediaDevices.enumerateDevices()
        .then(devices => {
          const videoDevices = devices.filter(device => device.kind === 'videoinput')
          console.log('Available video devices:', videoDevices.length)
          videoDevices.forEach((device, index) => {
            console.log(`Device ${index}:`, device.label || `Camera ${index + 1}`)
          })
        })
        .catch(err => {
          console.error('Error enumerating devices:', err)
        })
    } else {
      console.error('Camera API not available')
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 font-system">
      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Take Photo</h3>
              <button
                onClick={stopCamera}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-auto max-h-96 object-cover"
              />
              
              {/* Loading overlay when camera is starting */}
              {!cameraReady && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                    <p>Starting camera...</p>
                  </div>
                </div>
              )}
              
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <button
                  onClick={capturePhoto}
                  disabled={!cameraReady}
                  className="bg-white text-gray-900 px-6 py-3 rounded-full font-medium shadow-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Capture Photo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-green-500 to-blue-600 p-2 rounded-xl">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  PlantCare AI
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">
                  Advanced Disease Detection
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs bg-gradient-to-r from-green-500 to-blue-600 text-white px-2 py-1 rounded-full font-medium">
                AI-Powered
              </span>
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                Real-time
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
            Detect Plant Diseases
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent block sm:inline sm:ml-3">
              Instantly
            </span>
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Upload a photo of your crop to get instant AI-powered disease diagnosis and treatment recommendations. 
            Protect your harvest with cutting-edge machine learning technology.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 sm:gap-8 mb-8 sm:mb-12">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-green-600">15+</div>
            <div className="text-xs sm:text-sm text-gray-600">Diseases Detected</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-blue-600">95%</div>
            <div className="text-xs sm:text-sm text-gray-600">Accuracy Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-purple-600">&lt;2s</div>
            <div className="text-xs sm:text-sm text-gray-600">Analysis Time</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Upload Section */}
          <div className="space-y-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg mr-3">
                  <Camera className="h-5 w-5 text-white" />
                </div>
                Upload Plant Image
              </h3>
              
              <div
                {...getRootProps()}
                className={`
                  border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-300
                  ${isDragActive 
                    ? 'border-green-400 bg-green-50 scale-105' 
                    : 'border-gray-300 hover:border-green-400 hover:bg-gray-50 hover:scale-102'
                  }
                `}
              >
                <input {...getInputProps()} />
                <div className="space-y-4">
                  <div className="flex justify-center space-x-4">
                    <Upload className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                    <Camera className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                  </div>
                  <div className="text-gray-600">
                    {isDragActive ? (
                      <p className="text-green-600 font-medium">Drop the image here...</p>
                    ) : (
                      <div className="space-y-2">
                        <p className="font-medium text-sm sm:text-base">Click to upload or drag and drop</p>
                        <p className="text-xs sm:text-sm text-gray-500">
                          Supports: JPG, PNG, WebP (Max 10MB)
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Camera Button */}
              <div className="mt-4">
                <button
                  onClick={() => {
                    console.log('Camera button clicked')
                    startCamera()
                  }}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <Camera className="h-5 w-5" />
                  <span>Take Photo with Camera</span>
                </button>
              </div>

              {selectedImage && (
                <div className="mt-6 space-y-4">
                  {/* Debug info in development */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded">
                      Image type: {selectedImage.startsWith('data:image/') ? 'Data URL' : 'Regular URL'}<br/>
                      Length: {selectedImage.length} characters<br/>
                      Format: {selectedImage.substring(5, selectedImage.indexOf(';'))}
                    </div>
                  )}
                  
                  <div className="relative w-full h-48 sm:h-64 rounded-xl overflow-hidden shadow-lg bg-gray-100">
                    {/* Use regular img tag for data URLs to avoid Next.js Image optimization issues */}
                    <img
                      src={selectedImage}
                      alt="Selected plant"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Image failed to load:', e);
                        setError('Failed to display captured image. Please try taking another photo.');
                      }}
                      onLoad={() => {
                        console.log('Image loaded successfully');
                      }}
                    />
                    
                    {/* Image loaded indicator */}
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                      ✓ Image Ready
                    </div>
                  </div>
                  
                  <button
                    onClick={analyzePlant}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:from-green-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Analyzing with AI...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <Brain className="h-5 w-5 mr-2" />
                        Analyze Plant Health
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg border border-white/20">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-600 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm">Instant Analysis</h4>
                <p className="text-xs text-gray-600 mt-1">AI results in under 2 seconds</p>
              </div>
              
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg border border-white/20">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm">95% Accuracy</h4>
                <p className="text-xs text-gray-600 mt-1">Professional-grade detection</p>
              </div>
              
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg border border-white/20">
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm">Smart Treatment</h4>
                <p className="text-xs text-gray-600 mt-1">Personalized recommendations</p>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0" />
                  <span className="text-red-800 text-sm">{error}</span>
                </div>
              </div>
            )}

            {prediction && (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-lg mr-3">
                    <Info className="h-5 w-5 text-white" />
                  </div>
                  AI Diagnosis Results
                </h3>

                <div className={`rounded-xl p-4 sm:p-6 mb-6 ${getDiseaseInfo(prediction).bgColor} ${getDiseaseInfo(prediction).borderColor} border shadow-sm`}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                    <h4 className={`font-bold text-lg sm:text-xl ${getDiseaseInfo(prediction).color} mb-2 sm:mb-0`}>
                      {prediction.disease}
                    </h4>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getDiseaseInfo(prediction).color} bg-white shadow-sm`}>
                      {prediction.confidence}% confidence
                    </span>
                  </div>
                  
                  <div className="flex items-center mb-4">
                    <span className="text-sm text-gray-700 mr-2 font-medium">Severity Level:</span>
                    <span className={`text-sm font-bold ${getDiseaseInfo(prediction).color}`}>
                      {prediction.severity}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Confidence Score</span>
                      <span>{prediction.confidence}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                      <div 
                        className={`h-3 rounded-full transition-all duration-1000 ${getDiseaseInfo(prediction).progressColor} shadow-sm`}
                        style={{ width: `${prediction.confidence}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {prediction.description && (
                  <div className="mb-6">
                    <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Info className="h-4 w-4 mr-2" />
                      Description
                    </h5>
                    <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 p-4 rounded-lg">
                      {prediction.description}
                    </p>
                  </div>
                )}

                {prediction.treatment && (
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Recommended Treatment
                    </h5>
                    <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4 shadow-sm">
                      <p className="text-blue-900 text-sm leading-relaxed font-medium">
                        {prediction.treatment}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!prediction && !error && (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                <div className="text-center py-8 sm:py-12">
                  <div className="bg-gradient-to-br from-green-500 to-blue-600 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Leaf className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
                    Ready for AI Analysis
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
                    Upload an image of your plant to get instant, accurate disease detection powered by advanced machine learning.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-12 bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 border border-white/20">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">
            Pro Tips for Best Results
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="text-center group">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                <Camera className="h-5 w-5 sm:h-8 sm:w-8 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Clear Photos</h4>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">Take well-lit, focused images for best accuracy</p>
            </div>
            
            <div className="text-center group">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                <Leaf className="h-5 w-5 sm:h-8 sm:w-8 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Show Symptoms</h4>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">Focus on affected areas and visible damage</p>
            </div>
            
            <div className="text-center group">
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                <AlertCircle className="h-5 w-5 sm:h-8 sm:w-8 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Multiple Angles</h4>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">Try different perspectives for comprehensive analysis</p>
            </div>
            
            <div className="text-center group">
              <div className="bg-gradient-to-br from-orange-500 to-red-600 w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="h-5 w-5 sm:h-8 sm:w-8 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Early Detection</h4>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">Regular monitoring prevents major crop loss</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-lg border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Powered by advanced AI • Supporting farmers worldwide • 
              <span className="font-medium text-green-600 ml-1">PlantCare AI</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
