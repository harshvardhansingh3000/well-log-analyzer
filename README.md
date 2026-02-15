# Well Log Analyzer

A full-stack web application for uploading, visualizing, and analyzing well log data from LAS (Log ASCII Standard) files using AI-powered interpretation.

## 🎯 Features

- **LAS File Upload**: Upload and parse industry-standard LAS files
- **Data Visualization**: Interactive multi-curve visualization with independent scales using Plotly.js
- **AI Interpretation**: Get geological insights using Groq's LLaMA 3.3 70B model
- **Conversational AI**: Chat with an AI geologist about your well data
- **Cloud Storage**: Automatic backup to AWS S3
- **PostgreSQL Database**: Efficient storage and querying of well data

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- React 18 with Vite
- Tailwind CSS for styling
- Plotly.js for interactive charts
- React Markdown for formatted AI responses
- Axios for API communication

**Backend:**
- Node.js with Express
- PostgreSQL database
- AWS S3 for file storage
- Groq SDK for AI capabilities
- Multer for file uploads

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- AWS Account (for S3 storage)
- Groq API Key (free at https://console.groq.com)

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/harshvardhansingh3000/well-log-analyzer
cd well-log-analyzer
```

### 2. Database Setup

```bash
# Create PostgreSQL database
psql -U postgres
CREATE DATABASE well_logs;
\q

# Create tables
psql -U postgres -d well_logs

CREATE TABLE wells (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  start_depth DECIMAL,
  stop_depth DECIMAL,
  step DECIMAL,
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  s3_file_key VARCHAR(500)
);

CREATE TABLE well_data (
  id SERIAL PRIMARY KEY,
  well_id INTEGER REFERENCES wells(id) ON DELETE CASCADE,
  depth DECIMAL NOT NULL,
  data JSONB NOT NULL
);

CREATE INDEX idx_well_data_well_id ON well_data(well_id);
CREATE INDEX idx_well_data_depth ON well_data(depth);
```

### 3. Backend Setup

```bash
cd backend
npm install

# Create .env file
cat > .env << EOF
PORT=5000
DATABASE_URL=postgresql://localhost:5432/well_logs
AWS_REGION=your-region
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET_NAME=your-bucket-name
GROQ_API_KEY=your-groq-api-key
EOF

# Start backend server
npm run dev
```

### 4. Frontend Setup

```bash
cd frontend
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:5000/api" > .env

# Start frontend
npm run dev
```

### 5. AWS S3 Setup (Optional but Recommended)

1. Create an S3 bucket in AWS Console
2. Create IAM user with S3 permissions
3. Add bucket policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::YOUR-ACCOUNT-ID:user/YOUR-USER"
            },
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
        }
    ]
}
```

4. Update backend `.env` with your AWS credentials

### 6. Get Groq API Key

1. Visit https://console.groq.com
2. Sign up (free, no credit card required)
3. Generate API key
4. Add to backend `.env` file

## 📖 Usage

### 1. Upload LAS File
- Navigate to the Upload page
- Select a LAS file from your computer
- Click "Upload" and wait for processing

### 2. View Wells
- After upload, you'll see the wells list
- Each well shows metadata (name, location, depth range)

### 3. Visualize Data
- Click "Visualize" on any well
- Select curves from the checkbox list
- Set depth range (start and end depth)
- Click "Visualize" to see interactive charts
- Each curve displays with its own scale
- Use Plotly controls to zoom, pan, and hover for values

### 4. AI Interpretation
- After visualizing data, click "🤖 AI Analysis"
- Wait 2-3 seconds for AI to analyze
- View geological interpretation below the chart

### 5. Chat with AI
- Click "💬 Chat" on any well
- Ask questions about formations, curves, or interpretations
- Examples:
  - "What curves are available?"
  - "Explain gamma ray logs"
  - "What formations might we see?"

## 🎨 Features in Detail

### Multi-Scale Visualization
The application handles curves with vastly different scales (e.g., GR: 0-150, DEPTH: 0-12000) by creating separate subplots with independent X-axes. This is the industry-standard approach for well log visualization.

### AI-Powered Analysis
Uses Groq's LLaMA 3.3 70B model to provide:
- Formation interpretation
- Key observations
- Anomaly detection
- Rock type identification

### Conversational Interface
The chatbot maintains conversation history and provides context-aware responses about your specific well data.

### Data Storage
- **PostgreSQL**: Stores well metadata and data in JSONB format for flexible querying
- **AWS S3**: Backs up original LAS files for archival
- **Database clears on restart**: Fresh state for development/testing

## 📁 Project Structure

```
well-log-analyzer/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   │   ├── aiService.js  # Groq AI integration
│   │   │   ├── dbService.js  # Database operations
│   │   │   └── s3Service.js  # AWS S3 operations
│   │   ├── utils/
│   │   │   └── lasParser.js  # LAS file parser
│   │   └── server.js         # Express server
│   ├── uploads/              # Temporary file storage
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Upload.jsx
│   │   │   ├── WellsList.jsx
│   │   │   ├── Visualization.jsx
│   │   │   └── Chat.jsx
│   │   ├── services/
│   │   │   └── api.js        # API client
│   │   └── App.jsx
│   └── package.json
└── README.md
```

## 🔧 API Endpoints

### Wells
- `GET /api/wells` - List all wells
- `GET /api/wells/:id` - Get well details
- `GET /api/wells/:id/curves` - Get available curves
- `GET /api/wells/:id/data` - Get well data (with depth range and curve filters)
- `POST /api/wells/:id/interpret` - Get AI interpretation

### Upload
- `POST /api/upload` - Upload LAS file

### Chat
- `POST /api/chat` - Chat with AI about well data

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL is running
pg_isready

# Verify database exists
psql -U postgres -l | grep well_logs
```

### S3 Upload Fails
- Verify AWS credentials in `.env`
- Check bucket policy allows PutObject
- Ensure bucket name is correct

### Frontend Can't Connect to Backend
- Verify backend is running on port 5000
- Check `VITE_API_URL` in frontend `.env`
- Check CORS is enabled in backend

### AI Analysis Not Working
- Verify `GROQ_API_KEY` is set in backend `.env`
- Check Groq API quota (free tier limits)
- Restart backend after adding API key

## 🎥 Demo Video

[Watch Demo Video](./demo/Screen%20Recording%202026-02-15%20at%2010.17.05AM.mov)

**Note:** Download the video file from the `demo` folder to watch the full demonstration of all features.

## 👥 Contributors

- Harshvardhan Singh Khurmi

## 🙏 Acknowledgments

- Groq for providing free AI API access
- AWS for cloud storage infrastructure
- Plotly.js for excellent visualization capabilities
