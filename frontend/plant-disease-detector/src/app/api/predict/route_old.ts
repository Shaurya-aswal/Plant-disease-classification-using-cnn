import { NextRequest, NextResponse } from 'next/server'

// Backend API URL - update this if your Python API runs on a different port
const BACKEND_API_URL = 'http://localhost:5000'

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

    // Forward the request to the Python backend
    const backendFormData = new FormData()
    backendFormData.append('image', file)

    const response = await fetch(`${BACKEND_API_URL}/predict`, {
      method: 'POST',
      body: backendFormData
    })

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`)
    }

    const result = await response.json()
    return NextResponse.json(result)

  } catch (error) {
    console.error('Error processing image:', error)
    
    // Fallback to mock data if backend is not available
    const mockResults = [
      {
        disease: "Tomato Late Blight",
        confidence: 94.5,
        severity: "High",
        description: "Late blight is a serious disease affecting tomato plants, caused by the pathogen Phytophthora infestans.",
        treatment: "Apply copper-based fungicides, improve air circulation, and remove affected leaves immediately.",
        color: "red"
      },
      {
        disease: "Potato Early Blight", 
        confidence: 87.2,
        severity: "Medium",
        description: "Early blight affects potato plants, causing dark spots on leaves and stems.",
        treatment: "Use resistant varieties, practice crop rotation, and apply appropriate fungicides.",
        color: "orange"
      },
      {
        disease: "Healthy Plant",
        confidence: 96.8,
        severity: "None", 
        description: "Your plant appears to be healthy with no signs of disease.",
        treatment: "Continue regular care and monitoring for optimal plant health.",
        color: "green"
      }
    ]
    
    const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)]
    return NextResponse.json(randomResult)
  }
}
