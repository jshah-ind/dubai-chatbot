# Dubai Police Crime Research API

A comprehensive crime research and analysis system for Dubai Police using Perplexity AI, featuring both a FastAPI backend and a modern React TypeScript frontend.

## Features

- **AI-Powered Chat Interface**: Interactive chat with crime research assistant
- **Advanced Crime Search**: Filter and search crime cases with multiple criteria
- **Real-time API Integration**: Live data from Perplexity AI
- **Modern UI**: React TypeScript frontend with styled-components
- **Professional Design**: Dubai Police themed interface with glass-morphism effects

## Project Structure

```
police_chat/
├── main.py                 # FastAPI backend server
├── requirements.txt        # Python dependencies
├── .env                   # Environment variables (create from .env.example)
├── .env.example          # Environment variables template
├── frontend/             # React TypeScript frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── services/     # API services
│   │   └── App.tsx       # Main application
│   └── package.json      # Node.js dependencies
└── README.md             # This file
```

## Setup Instructions

### 1. Backend Setup

1. **Clone the repository and navigate to the project directory**

2. **Create a virtual environment**:
   ```bash
   python -m venv env
   source env/bin/activate  # On Windows: env\Scripts\activate
   ```

3. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Perplexity API key:
   ```
   PERPLEXITY_API_KEY=your_actual_api_key_here
   ```
   
   Get your API key from: https://www.perplexity.ai/settings/api

5. **Start the backend server**:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

### 2. Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies**:
   ```bash
   npm install
   ```

3. **Start the React development server**:
   ```bash
   npm start
   ```

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## API Endpoints

- `GET /` - API information
- `GET /health` - Health check
- `POST /chat` - Chat with AI assistant
- `POST /search/crimes` - Search crime cases
- `GET /test-api` - Test Perplexity API connection

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PERPLEXITY_API_KEY` | Your Perplexity AI API key | Yes |
| `DEBUG` | Enable debug mode | No |
| `HOST` | Server host | No |
| `PORT` | Server port | No |

## Technologies Used

### Backend
- **FastAPI** - Modern Python web framework
- **Perplexity AI** - AI-powered search and chat
- **Pydantic** - Data validation
- **HTTPX** - Async HTTP client

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Styled Components** - CSS-in-JS styling
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Lucide React** - Modern icons

## Development

### Running Tests
```bash
# Backend tests (if available)
pytest

# Frontend tests
cd frontend
npm test
```

### Building for Production
```bash
# Frontend build
cd frontend
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is developed for Dubai Police internal use.
