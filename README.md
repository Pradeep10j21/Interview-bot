# Virtual AI Interview Simulation System

A full-stack virtual interview simulation system built with React, featuring real-time speech-to-text, webcam integration, and AI-powered question analysis.

## Features

- 🏢 Company selection with multiple options
- 📹 Live webcam and microphone integration
- 🎤 Real-time speech-to-text transcription
- 🤖 AI-powered question generation and analysis
- 📊 Comprehensive performance feedback
- 🎨 Modern, accessible UI with design system

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Modern browser with Web Speech API support (Chrome, Edge recommended)

## Installation

1. Clone or download this project
2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

Start the development server:
```bash
npm start
```

The app will open at `http://localhost:3000`

## Browser Compatibility

- **Chrome/Edge**: Full support (recommended)
- **Firefox**: Limited Speech Recognition support
- **Safari**: Limited Speech Recognition support

For best experience, use Chrome or Edge.

## Project Structure

```
src/
├── components/
│   ├── VideoInterview.jsx
│   ├── VideoInterview.css
│   ├── AIQuestionPanel.jsx
│   └── AIQuestionPanel.css
├── pages/
│   ├── CompanySelection.jsx
│   ├── CompanySelection.css
│   ├── InterviewPage.jsx
│   ├── InterviewPage.css
│   ├── ResultPage.jsx
│   └── ResultPage.css
├── hooks/
│   ├── useSpeechToText.js
│   └── useInterviewLogic.js
├── utils/
│   └── AIInterviewLogic.js
├── App.js
├── App.css
├── index.js
└── index.css
```

## Usage

1. **Select a Company**: Choose from available companies on the home page
2. **Start Interview**: Click "Start Interview" to begin
3. **Allow Permissions**: Grant camera and microphone access when prompted
4. **Answer Questions**: Speak your answers clearly
5. **View Results**: After completing all questions, review your performance

## Technical Details

- Uses Web Speech API for speech recognition
- getUserMedia API for camera/microphone access
- Mock AI logic for question analysis
- React Router for navigation
- CSS variables for design system consistency

## Notes

- Speech recognition works best in quiet environments
- Speak clearly and at a moderate pace
- Answers are automatically saved when you finish speaking
- The system detects natural pauses to move to the next question

## License

This project is for educational purposes.

