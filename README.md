Touri is an AI Tour Assistant that helps tourists 10x their experience!

![Mockup](<desktop-mockup.jpg>)

An intelligent tourism companion powered by cutting-edge AI technology that provides personalized travel recommendations, real-time location insights, and interactive travel planning to make every journey unforgettable.

## ✨ Features

- 🤖 **AI-Powered Chat Assistant** - Interactive conversations with Touri for travel recommendations
- 📍 **Smart Location Services** - Real-time location detection and nearby place discovery
- 🗺️ **Interactive Spot Discovery** - Find restaurants, attractions, hotels, and hidden gems
- 💬 **Multimodal Input** - Text and image-based queries for enhanced travel planning
- 📱 **Responsive Design** - Seamless experience across desktop and mobile devices
- 🔄 **Real-time Streaming** - Live AI responses with instant feedback
- 💾 **Session Persistence** - Save and continue your travel conversations
- 🎯 **Personalized Recommendations** - Tailored suggestions based on your preferences

## 🛠️ Tech Stack

### AI & Machine Learning
- **Google Vertex AI** - Enterprise-grade AI platform for scalable ML solutions
- **Google Gemini 2.5** - Advanced multimodal AI model for text and image understanding
- **Google Gemini Live** - Real-time streaming AI conversations

### Backend & Database
- **Firestore with MongoDB Compatibility** - NoSQL database for flexible data storage
- **Google Cloud Run** - Serverless container platform for scalable deployment

### APIs & Services
- **Google Places API** - Comprehensive location data and place information

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript development
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Modern UI component library

### Additional Tools
- **Dexie.js** - IndexedDB wrapper for client-side storage
- **React Query** - Data fetching and state management
- **Kinde Auth** - Authentication and user management

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- Google Cloud Project with enabled APIs:
  - Vertex AI API
  - Places API
  - Firestore API

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Touri-KMIPN/main.git
   cd main
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Setup**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Google AI Configuration
   GOOGLE_GENAI_API_KEY=your_gemini_api_key
   GOOGLE_PLACES_API_KEY=your_places_api_key
   
   # Database Configuration
   MONGODB_URI=your_mongodb_connection_string
   
   # Authentication
   KINDE_CLIENT_ID=your_kinde_client_id
   KINDE_CLIENT_SECRET=your_kinde_client_secret
   KINDE_ISSUER_URL=your_kinde_issuer_url
   KINDE_SITE_URL=http://localhost:3000
   KINDE_POST_LOGOUT_REDIRECT_URL=http://localhost:3000
   KINDE_POST_LOGIN_REDIRECT_URL=http://localhost:3000/chat
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API endpoints
│   ├── chat/              # Chat interface pages
│   └── multimodal/        # Multimodal chat features
├── components/            # Reusable UI components
│   ├── chat/              # Chat-specific components
│   ├── ui/                # Base UI components
│   └── _layout/           # Layout components
├── lib/                   # Utility functions and configurations
├── providers/             # React context providers
├── services/              # API services and business logic
│   ├── client/            # Client-side services
│   └── server/            # Server-side services
├── tools/                 # AI tools and integrations
├── types/                 # TypeScript type definitions
└── database/              # Database models and collections
```

## 🎯 Core Features

### AI Chat Assistant
- Conversational interface powered by Google Gemini 2.5
- Context-aware responses with memory of previous conversations
- Support for text and image inputs
- Real-time streaming responses

### Location Intelligence
- Automatic location detection
- Nearby place recommendations
- Reverse geocoding for "Where am I?" queries
- Integration with Google Places API for comprehensive location data

### Travel Planning
- Interactive spot discovery and bookmarking
- Session-based conversation history
- Personalized recommendations based on user preferences
- Multimodal search capabilities

## 🔧 API Endpoints

- `POST /api/ai/generate` - Main AI chat endpoint with streaming support
- `GET /api/auth/*` - Kinde authentication endpoints
- `GET /api/resource/*` - Resource management endpoints

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

- **Issues**: Report bugs or request features via [GitHub Issues](https://github.com/Touri-KMIPN/touri-app/issues)
- **Discussions**: Join our [GitHub Discussions](https://github.com/Touri-KMIPN/touri-app/discussions)
- **Email**: Contact us at support@touri.com

## 🚀 Deployment

### Google Cloud Run

1. Build the Docker container
2. Deploy to Google Cloud Run
3. Configure environment variables
4. Set up custom domain (optional)

For detailed deployment instructions, see our [Deployment Guide](docs/deployment.md).

---

**Made with ❤️ by the Touri Team**

*Transforming travel experiences through AI innovation* 🌟