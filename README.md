 # Pepper Disease Detection Using CNN

A deep learning project for detecting bacterial spot disease in pepper plants using Convolutional Neural Networks. The project includes model training, quantization, and a complete web application for real-time disease detection.

## 🌱 Features

- **CNN Model Training**: Complete Jupyter notebook for training pepper disease detection model
- **Model Quantization**: TensorFlow Lite quantized model for efficient deployment 
- **Real-time Detection**: Upload pepper leaf images for instant AI-powered diagnosis
- **Web Interface**: Modern Next.js application with drag-and-drop functionality
- **REST API**: Flask backend API for model predictions
- **Confidence Scoring**: Get confidence levels for predictions
- **Mobile-Friendly**: Responsive design for all devices

## 🏗️ Project Structure

```
├── Training/
│   ├── model.ipynb                                 # Complete CNN training notebook
│   └── pepper_disease_model_quantized.tflite      # Quantized model (14MB)
├── backend/
│   ├── app.py                                      # Flask API server
│   └── requirements.txt                            # Python dependencies
├── frontend/
│   └── plant-disease-detector/                     # Next.js web application
├── data/                                           # Training dataset (excluded from repo)
│   ├── Pepper__bell___Bacterial_spot/              # Bacterial spot images
│   └── Pepper__bell___healthy/                     # Healthy pepper images
└── README.md                                       # Project documentation
```

## 🧠 Model Details

- **Architecture**: Sequential CNN with data augmentation
- **Input Size**: 256x256 RGB images  
- **Classes**: 2 classes (Bacterial Spot, Healthy)
- **Training Dataset**: Pepper plant leaf images
- **Model Format**: Quantized TensorFlow Lite (.tflite)
- **Model Size**: 14MB (optimized from 169MB original)
- **Preprocessing**: Rescaling (0-1 normalization), random flip, rotation, zoom

## 📋 Prerequisites

- **Python 3.8+** for model training and backend API
- **TensorFlow 2.13+** for deep learning
- **Node.js 18+** and npm for frontend development
- **Jupyter Notebook** for model training

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

### 3. Model Training (Optional)

If you want to retrain the model:

```bash
cd "/Users/apple/Desktop/deep learning  project  -- DIsease analysis /Training"

# Open Jupyter notebook
jupyter notebook model.ipynb
```

The trained quantized model is already provided at:
```
Training/pepper_disease_model_quantized.tflite
```

**Note**: The training dataset is not included in the repository due to size constraints. You'll need to add your own pepper disease images to the `data/` folder following the structure:
- `data/Pepper__bell___Bacterial_spot/` - Images of bacterial spot disease
- `data/Pepper__bell___healthy/` - Images of healthy pepper plants

## 🚀 Deployment

### Quick Deploy to Vercel

The easiest way to deploy both frontend and backend:

```bash
# Run the automated deployment script
./deploy.sh
```

This will deploy both the backend API and frontend to Vercel automatically.

### Manual Deployment

For step-by-step deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

### Live Demo

- **Frontend**: `https://your-frontend.vercel.app` (after deployment)
- **Backend API**: `https://your-backend.vercel.app` (after deployment)

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
- **Training Notebook**: `Training/model.ipynb` with complete CNN implementation

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

- Pepper disease dataset for training data
- TensorFlow team for the ML framework
- Next.js and React communities
- Agricultural experts for domain knowledge
# Plant-disease-classification-using-cnn
