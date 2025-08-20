# Plant Disease Detection System

A complete AI-powered plant detection system with a modern web interface for farmers and agricultural professionals.

## 🌱 Features

- **Real-time Disease Detection**: Upload plant images for instant AI-powered diagnosis
- **Comprehensive Disease Database**: Covers 15+ common plant diseases
- **Treatment Recommendations**: Get specific treatment advice for detected diseases
- **User-Friendly Interface**: Modern, responsive web design optimized for farmers
- **Confidence Scoring**: See how confident the AI is in its predictions
- **Mobile-Friendly**: Works on phones, tablets, and desktop computers

## 🏗️ Architecture

- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **Backend**: Python Flask API with TensorFlow
- **AI Model**: Convolutional Neural Network trained on PlantVillage dataset
- **Image Processing**: PIL for image preprocessing
- **File Upload**: React Dropzone for drag-and-drop functionality

## 📋 Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- Your trained TensorFlow model (.h5 file)

## 🚀 Setup Instructions

### 1. Clone and Setup Frontend

```bash
cd "/Users/apple/deep learning  project  -- DIsease analysis /frontend/plant-disease-detector"

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

### 2. Setup Backend API

```bash
cd "/Users/apple/deep learning  project  -- DIsease analysis /backend"

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate

# Install dependencies
pip install -r requirements.txt

# Start the Flask API
python app.py
```

The backend API will be available at `http://localhost:5000`

### 3. Model Integration

Make sure your trained model is located at:
```
/Users/apple/deep learning  project  -- DIsease analysis /training/plant_disease_model.h5
```

If your model is elsewhere, update the `MODEL_PATH` in `backend/app.py`.

## 📱 Usage

1. **Open the web application** at `http://localhost:3000`
2. **Upload an image** by clicking the upload area or dragging and dropping a plant image
3. **Click "Analyze Plant Health"** to get the AI diagnosis
4. **View results** including:
   - Disease name and confidence score
   - Severity level
   - Detailed description
   - Treatment recommendations

## 🧠 Supported Diseases

The system can detect the following pepper plant conditions:

### Peppers
- **Bacterial Spot**: Caused by Xanthomonas bacteria, showing dark spots on leaves
- **Healthy**: Normal, disease-free pepper plants

*Note: This model is specifically trained for pepper disease detection. Future versions may include additional crops and diseases.*

## 📊 API Endpoints

### Health Check
```http
GET http://localhost:5000/health
```

### Predict Disease
```http
POST http://localhost:5000/predict
Content-Type: multipart/form-data

image: [image file]
```

### Get Disease Classes
```http
GET http://localhost:5000/classes
```

## 🔧 Configuration

### Backend Configuration

Edit `backend/app.py` to modify:
- Model path
- Disease information
- API settings

### Frontend Configuration

Edit `frontend/plant-disease-detector/src/app/api/predict/route.ts` to modify:
- Backend API URL
- Fallback behavior

## 📸 Tips for Best Results

1. **Clear Photos**: Take well-lit, focused images
2. **Show Symptoms**: Focus on affected areas of the plant
3. **Multiple Angles**: Try different perspectives if first attempt is unclear
4. **Early Detection**: Check plants regularly for early disease detection

## 🛠️ Development

### Adding New Diseases

1. **Update the model** to include new disease classes
2. **Update `CLASS_NAMES`** in `backend/app.py`
3. **Add disease information** to `DISEASE_INFO` dictionary
4. **Retrain the model** with new disease samples

### Customizing the UI

The frontend uses Tailwind CSS for styling. Modify components in:
- `src/app/page.tsx` - Main application component
- `src/app/globals.css` - Global styles

## 🔬 Model Details

- **Architecture**: Sequential CNN with Conv2D, MaxPooling, and Dense layers
- **Input Size**: 256x256 RGB images
- **Training Dataset**: Pepper disease dataset with bacterial spot and healthy classes
- **Preprocessing**: Rescaling (0-1 normalization) and data augmentation
- **Model Format**: Quantized TensorFlow Lite (.tflite) for optimal mobile deployment
- **Model Size**: 14MB (quantized from original 169MB)

## 🚨 Troubleshooting

### Backend Issues
- Ensure TensorFlow is properly installed
- Check that the model file exists and is accessible
- Verify Python dependencies are installed

### Frontend Issues  
- Ensure Node.js dependencies are installed
- Check that the backend API is running
- Verify CORS configuration

### Model Issues
- Ensure model was saved with compatible TensorFlow version
- Check that class names match your training data
- Verify image preprocessing matches training

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is for educational and research purposes. Please ensure compliance with relevant agricultural and AI regulations in your region.

## 🙏 Acknowledgments

- PlantVillage dataset for training data
- TensorFlow team for the ML framework
- Next.js and React communities
- Agricultural experts for domain knowledge
# Plant-disease-classification-using-cnn
