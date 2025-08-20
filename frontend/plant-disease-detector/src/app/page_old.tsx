'use client'

import { useState, useCallback, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Camera, AlertCircle, CheckCircle, Leaf, Info, X } from 'lucide-react'
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
    multiple: false
  })

  // Camera functionality
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment' // Use back camera on mobile
        } 
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setShowCamera(true)
      setError(null)
    } catch (err) {
      setError('Camera access denied or not available')
      console.error('Camera error:', err)
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setShowCamera(false)
  }, [])

  const capturePhoto = useCallback(() => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas')
      const video = videoRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const dataURL = canvas.toDataURL('image/jpeg', 0.8)
        setSelectedImage(dataURL)
        setPrediction(null)
        setError(null)
        stopCamera()
      }
    }
  }, [stopCamera])

  const analyzePlant = async () => {
    if (!selectedImage) return

    setIsLoading(true)
    setError(null)

    try {
      // Convert base64 to blob
      const response = await fetch(selectedImage)
      const blob = await response.blob()
      
      // Create form data
      const formData = new FormData()
      formData.append('image', blob)

      // Call our API
      const apiResponse = await fetch('/api/predict', {
        method: 'POST',
        body: formData
      })

      if (!apiResponse.ok) {
        throw new Error('Failed to analyze image')
      }

      const result = await apiResponse.json()
      setPrediction(result)
      
    } catch (err) {
      setError('Failed to analyze the image. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getDiseaseInfo = (prediction: PredictionResult) => {
    const colorMap = {
      'red': {
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200"
      },
      'orange': {
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200"
      },
      'green': {
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200"
      },
      'gray': {
        color: "text-gray-600",
        bgColor: "bg-gray-50",
        borderColor: "border-gray-200"
      }
    }
    
    return colorMap[prediction.color as keyof typeof colorMap] || colorMap.gray
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-3">
            <Leaf className="h-8 w-8 text-green-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              Plant Disease Detector
            </h1>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              AI-Powered
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Detect Plant Diseases Instantly
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload a photo of your crop to get instant AI-powered disease diagnosis and treatment recommendations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Camera className="h-5 w-5 mr-2" />
                Upload Plant Image
              </h3>
              
              <div
                {...getRootProps()}
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                  ${isDragActive 
                    ? 'border-green-400 bg-green-50' 
                    : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'
                  }
                `}
              >
                <input {...getInputProps()} />
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="text-gray-600">
                  {isDragActive ? (
                    <p>Drop the image here...</p>
                  ) : (
                    <div>
                      <p className="font-medium">Click to upload or drag and drop</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Supports: JPG, PNG, WebP (Max 10MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {selectedImage && (
                <div className="mt-6">
                  <div className="relative w-full h-64 rounded-lg overflow-hidden">
                    <Image
                      src={selectedImage}
                      alt="Selected plant"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    onClick={analyzePlant}
                    disabled={isLoading}
                    className="w-full mt-4 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Analyzing...
                      </span>
                    ) : (
                      'Analyze Plant Health'
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Camera className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-medium text-gray-900">Upload</h4>
                <p className="text-sm text-gray-600">Take or upload a clear photo</p>
              </div>
              
              <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                  <AlertCircle className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-medium text-gray-900">Analyze</h4>
                <p className="text-sm text-gray-600">AI identifies diseases</p>
              </div>
              
              <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="font-medium text-gray-900">Treat</h4>
                <p className="text-sm text-gray-600">Get treatment advice</p>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                  <span className="text-red-800">{error}</span>
                </div>
              </div>
            )}

            {prediction && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Info className="h-5 w-5 mr-2" />
                  Diagnosis Results
                </h3>

                <div className={`rounded-lg p-4 mb-4 ${getDiseaseInfo(prediction).bgColor} ${getDiseaseInfo(prediction).borderColor} border`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`font-semibold text-lg ${getDiseaseInfo(prediction).color}`}>
                      {prediction.disease}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDiseaseInfo(prediction).color} bg-white`}>
                      {prediction.confidence}% confident
                    </span>
                  </div>
                  
                  <div className="flex items-center mb-3">
                    <span className="text-sm text-gray-600 mr-2">Severity:</span>
                    <span className={`text-sm font-medium ${getDiseaseInfo(prediction).color}`}>
                      {prediction.severity}
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div 
                      className={`h-2 rounded-full ${
                        prediction.confidence > 90 ? 'bg-green-500' :
                        prediction.confidence > 70 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${prediction.confidence}%` }}
                    ></div>
                  </div>
                </div>

                {prediction.description && (
                  <div className="mb-4">
                    <h5 className="font-medium text-gray-900 mb-2">Description:</h5>
                    <p className="text-gray-700 text-sm">{prediction.description}</p>
                  </div>
                )}

                {prediction.treatment && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Recommended Treatment:</h5>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-blue-800 text-sm">{prediction.treatment}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!prediction && !error && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-center py-8">
                  <Leaf className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Ready to Analyze
                  </h3>
                  <p className="text-gray-600">
                    Upload an image of your plant to get started with disease detection.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Tips for Better Results
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <Camera className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Clear Photos</h4>
              <p className="text-sm text-gray-600">Take well-lit, focused images</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <Leaf className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Show Symptoms</h4>
              <p className="text-sm text-gray-600">Focus on affected areas</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <AlertCircle className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Multiple Angles</h4>
              <p className="text-sm text-gray-600">Try different perspectives</p>
            </div>
            
            <div className="text-center">
              <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="h-6 w-6 text-orange-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Early Detection</h4>
              <p className="text-sm text-gray-600">Check plants regularly</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
