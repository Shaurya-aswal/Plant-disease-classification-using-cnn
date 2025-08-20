import { NextRequest, NextResponse } from 'next/server'

// Backend API URL - update this if your Python API runs on a different port
const BACKEND_API_URL = 'http://localhost:5001'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload an image.' },
        { status: 400 }
      )
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Please upload an image smaller than 10MB.' },
        { status: 400 }
      )
    }

    // Forward the request to the Python backend
    const backendFormData = new FormData()
    backendFormData.append('image', file)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    try {
      const response = await fetch(`${BACKEND_API_URL}/predict`, {
        method: 'POST',
        body: backendFormData,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status}`)
      }

      const result = await response.json()
      
      // Add response headers for caching and performance
      return NextResponse.json(result, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      })

    } catch (fetchError) {
      clearTimeout(timeoutId)
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timeout. Please try again.' },
          { status: 408 }
        )
      }
      
      throw fetchError
    }

  } catch (error) {
    console.error('API Error:', error)
    
    // Return realistic demo data if backend is not available
    const demoResults = [
      {
        disease: "Tomato Late Blight",
        confidence: 94.5,
        severity: "High",
        description: "Late blight is a serious disease affecting tomato plants, caused by the pathogen Phytophthora infestans. This disease can spread rapidly in cool, wet conditions.",
        treatment: "Apply copper-based fungicides immediately, improve air circulation, remove affected leaves, and avoid overhead watering. Consider using resistant varieties.",
        color: "red"
      },
      {
        disease: "Potato Early Blight", 
        confidence: 87.2,
        severity: "Medium",
        description: "Early blight affects potato plants, causing dark spots with concentric rings on leaves and stems. It typically starts on lower, older leaves.",
        treatment: "Use resistant varieties, practice crop rotation, apply appropriate fungicides, and maintain proper spacing for air circulation.",
        color: "orange"
      },
      {
        disease: "Healthy Tomato Plant",
        confidence: 96.8,
        severity: "None", 
        description: "Your tomato plant appears to be healthy with no signs of disease. The leaves show good color and structure.",
        treatment: "Continue regular care including proper watering, fertilizing, and monitoring for early disease detection.",
        color: "green"
      },
      {
        disease: "Pepper Bell Bacterial Spot",
        confidence: 89.3,
        severity: "Medium",
        description: "Bacterial spot is causing dark, water-soaked lesions on pepper leaves and fruits. This disease thrives in warm, humid conditions.",
        treatment: "Use copper-based bactericides, improve air circulation, avoid overhead watering, and remove affected plant material.",
        color: "orange"
      }
    ]
    
    const randomResult = demoResults[Math.floor(Math.random() * demoResults.length)]
    return NextResponse.json({
      ...randomResult,
      demo_mode: true,
      message: "Backend unavailable - showing demo data"
    })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Plant Disease Detection API',
    version: '2.0.0',
    features: [
      'AI-powered disease detection',
      'Real-time image analysis', 
      'Treatment recommendations',
      'Mobile-friendly interface'
    ],
    endpoints: {
      predict: 'POST /api/predict - Upload image for disease detection'
    },
    backend_status: 'Check backend at http://localhost:5000/health',
    supported_formats: ['JPEG', 'PNG', 'WebP'],
    max_file_size: '10MB'
  })
}
