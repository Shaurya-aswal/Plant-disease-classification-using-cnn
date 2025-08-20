#!/usr/bin/env python3
"""
Plant Disease Detection API
This Flask API serves the trained TensorFlow model for plant disease classification.
"""

import os
import numpy as np
import tensorflow as tf
from flask import Flask, request, jsonify
from if __name__ == '__main__':
    print("Starting Plant Disease Detection API...")
    load_model()
    app.run(host='0.0.0.0', port=5000, debug=False)

# Initialize model on import for Vercel
load_model()rs import CORS
from PIL import Image
import io
import base64

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load the trained model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "pepper_disease_model_quantized.tflite")
interpreter = None

# Disease classes (should match your training data - sorted alphabetically as in dataset)
CLASS_NAMES = [
    'Pepper__bell___Bacterial_spot',
    'Pepper__bell___healthy'
]

# Disease information database
# Disease information database - Updated for 2-class pepper disease detection
DISEASE_INFO = {
    'Pepper__bell___Bacterial_spot': {
        'name': 'Pepper Bell Bacterial Spot',
        'severity': 'Medium',
        'description': 'A bacterial disease that affects bell peppers, caused by Xanthomonas species. Creates dark, water-soaked spots on leaves and fruits.',
        'treatment': 'Apply copper-based bactericides, improve air circulation, avoid overhead watering, remove infected plant material, and practice crop rotation.',
        'color': 'orange',
        'symptoms': [
            'Small, dark, water-soaked spots on leaves',
            'Spots may have yellow halos around them',
            'Leaf yellowing and premature drop',
            'Fruit spots that are raised and scabby',
            'Reduced fruit quality and yield'
        ],
        'causes': [
            'Bacterial infection (Xanthomonas campestris, X. vesicatoria, X. euvesicatoria, X. gardneri)',
            'Warm, humid weather conditions',
            'Poor air circulation',
            'Overhead watering',
            'Contaminated seeds or transplants'
        ],
        'prevention': [
            'Start with certified disease-free seeds',
            'Provide adequate plant spacing',
            'Ensure good drainage',
            'Avoid working with plants when wet',
            'Practice crop rotation',
            'Remove crop debris after harvest'
        ]
    },
    'Pepper__bell___healthy': {
        'name': 'Healthy Bell Pepper',
        'severity': 'None',
        'description': 'Your bell pepper plant appears healthy with no signs of disease. Continue with proper care practices.',
        'treatment': 'Continue regular care and monitoring for optimal plant health.',
        'color': 'green',
        'symptoms': [
            'Vibrant green foliage',
            'No spots or discoloration on leaves',
            'Strong, upright growth',
            'Clear, unblemished fruit',
            'Good overall plant vigor'
        ],
        'causes': [
            'Proper growing conditions',
            'Good soil health and nutrition',
            'Adequate water management',
            'Disease prevention practices',
            'Healthy growing environment'
        ],
        'prevention': [
            'Maintain optimal growing conditions',
            'Regular monitoring for diseases',
            'Proper spacing and air circulation',
            'Balanced fertilization program',
            'Clean garden practices',
            'Timely harvest of mature fruit'
        ]
    }
}

def load_model():
    """Load the trained TensorFlow Lite model"""
    global interpreter
    try:
        if os.path.exists(MODEL_PATH):
            interpreter = tf.lite.Interpreter(model_path=MODEL_PATH)
            interpreter.allocate_tensors()
            print(f"TensorFlow Lite model loaded successfully from {MODEL_PATH}")
        else:
            print(f"Model file not found at {MODEL_PATH}")
            interpreter = None
    except Exception as e:
        print(f"Error loading model: {e}")
        interpreter = None

def preprocess_image(image_file):
    """Preprocess the uploaded image for prediction"""
    try:
        # Open and convert image
        image = Image.open(io.BytesIO(image_file))
        print(f"Original image size: {image.size}, mode: {image.mode}")
        
        # Convert to RGB if needed
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Resize to model input size (256x256) using high-quality resampling
        image = image.resize((256, 256), Image.Resampling.LANCZOS)
        
        # Convert to numpy array - Keep in [0,255] range (do NOT normalize)
        img_array = np.array(image, dtype=np.float32)
        # Do NOT divide by 255 - the model expects [0,255] range
        
        # Add batch dimension
        img_array = np.expand_dims(img_array, axis=0)
        
        print(f"Preprocessed image shape: {img_array.shape}")
        print(f"Image value range: [{img_array.min():.1f}, {img_array.max():.1f}]")
        
        return img_array
    except Exception as e:
        print(f"Error preprocessing image: {e}")
        return None

@app.route('/', methods=['GET'])
def home():
    """Home endpoint with API information"""
    return jsonify({
        'message': 'Plant Disease Detection API',
        'version': '1.0.0',
        'model_loaded': model is not None,
        'endpoints': [
            '/health - Health check',
            '/predict - Disease prediction (POST with image)',
            '/classes - Get all disease classes'
        ]
    })

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None
    })

@app.route('/predict', methods=['POST'])
def predict():
    """Predict plant disease from uploaded image"""
    try:
        # Check if model is loaded
        if interpreter is None:
            return jsonify({'error': 'Model not loaded'}), 500
        
        # Check if image file is provided
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No image file selected'}), 400
        
        print(f"Processing image: {file.filename}")
        
        # Preprocess the image
        img_array = preprocess_image(file.read())
        if img_array is None:
            return jsonify({'error': 'Error processing image'}), 400
        
        # Make prediction with TensorFlow Lite
        print("Making prediction...")
        input_details = interpreter.get_input_details()
        output_details = interpreter.get_output_details()
        
        interpreter.set_tensor(input_details[0]['index'], img_array)
        interpreter.invoke()
        predictions = interpreter.get_tensor(output_details[0]['index'])
        
        print(f"Raw predictions shape: {predictions.shape}")
        print(f"Raw predictions: {predictions[0]}")
        
        # Get the predicted class
        predicted_class_index = np.argmax(predictions[0])
        confidence = float(predictions[0][predicted_class_index]) * 100
        
        print(f"Predicted class index: {predicted_class_index}")
        print(f"Confidence: {confidence:.2f}%")
        
        # Validate class index
        if predicted_class_index >= len(CLASS_NAMES):
            print(f"Warning: Predicted index {predicted_class_index} exceeds class list length {len(CLASS_NAMES)}")
            return jsonify({'error': 'Invalid prediction result'}), 500
        
        # Get predicted class name
        predicted_disease = CLASS_NAMES[predicted_class_index]
        print(f"Predicted disease: {predicted_disease}")
        
        # Get disease information
        disease_info = DISEASE_INFO.get(predicted_disease, {
            'name': predicted_disease.replace('_', ' ').replace('__', ' - '),
            'severity': 'Unknown',
            'description': 'Disease information not available.',
            'treatment': 'Consult with a plant pathologist for treatment recommendations.',
            'color': 'gray'
        })
        
        # Get top 3 predictions for debugging
        top_3_indices = np.argsort(predictions[0])[-3:][::-1]
        print("Top 3 predictions:")
        for i, idx in enumerate(top_3_indices):
            prob = predictions[0][idx] * 100
            print(f"  {i+1}. {CLASS_NAMES[idx]}: {prob:.2f}%")
        
        result = {
            'disease': disease_info['name'],
            'confidence': round(confidence, 2),
            'severity': disease_info['severity'],
            'description': disease_info['description'],
            'treatment': disease_info['treatment'],
            'color': disease_info['color'],
            'predicted_class': predicted_disease,
            'class_index': int(predicted_class_index)
        }
        
        print(f"Returning result: {result}")
        return jsonify(result)
        
    except Exception as e:
        print(f"Error in prediction: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/classes', methods=['GET'])
def get_classes():
    """Get all available disease classes"""
    return jsonify({
        'classes': CLASS_NAMES,
        'count': len(CLASS_NAMES)
    })

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for deployment platforms"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': interpreter is not None,
        'timestamp': str(np.datetime64('now'))
    })

if __name__ == '__main__':
    print("Starting Plant Disease Detection API...")
    load_model()
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)

# Initialize model on startup
load_model()
