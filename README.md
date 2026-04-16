# Dot Market AI Pro

An AI-powered trading and market analysis platform that provides real-time market data, predictive analytics, and comprehensive trading tools.

## Features

- **Real-time Market Data**: Live stock prices, charts, and market indicators
- **AI-Powered Predictions**: Machine learning models for price forecasting and sentiment analysis
- **Interactive Charts**: Advanced trading charts with technical indicators
- **Portfolio Management**: Track and analyze your investment portfolio
- **Backtesting**: Test trading strategies against historical data
- **User Authentication**: Secure login and registration system
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

### Frontend
- **React** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server
- **Shadcn/ui** - Component library
- **Tailwind CSS** - Utility-first CSS framework
- **Supabase** - Backend-as-a-Service

### Backend
- **Supabase** - Database, authentication, and serverless functions
- **Prisma** - Database ORM (for local development)
- **Node.js** - Runtime for serverless functions

### AI Engine
- **Python** - Machine learning and data processing
- **FastAPI** - API framework for AI services

## Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (version 18 or higher) - [Download](https://nodejs.org/)
- **Bun** (optional, for faster package management) - [Install](https://bun.sh/)
- **Supabase CLI** - [Install](https://supabase.com/docs/guides/cli)
- **Python** (version 3.8 or higher) - [Download](https://python.org/)
- **Git** - [Download](https://git-scm.com/)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/4justo/Stock-Market-analysis-tool----DOT-MARKET.git
   cd dot-market-ai-pro
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   # or if using Bun
   bun install
   ```

3. **Install backend dependencies** (if using local Prisma)
   ```bash
   cd ../backend
   npm install
   ```

4. **Install AI engine dependencies**
   ```bash
   cd ../ai-engine
   pip install -r requirements.txt
   ```

5. **Set up Supabase**
   ```bash
   supabase init
   supabase start
   ```

## Configuration

1. **Environment Variables**

   Create `.env` files in the respective directories:

   **Frontend (.env)**
   ```env
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

   **Backend (.env)**
   ```env
   DATABASE_URL=your-database-url
   SUPABASE_URL=your-supabase-url
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

   **AI Engine (.env)**
   ```env
   API_KEY=your-api-key
   DATABASE_URL=your-database-url
   ```

2. **Supabase Setup**
   ```bash
   supabase db reset
   supabase gen types typescript --local > frontend/src/types/supabase.ts
   ```

## Running the Application

### Development Mode

1. **Start Supabase services**
   ```bash
   supabase start
   ```

2. **Start the AI engine**
   ```bash
   cd ai-engine
   python main.py
   ```

3. **Start the backend** (if running locally)
   ```bash
   cd backend
   npm run dev
   ```

4. **Start the frontend**
   ```bash
   cd frontend
   npm run dev
   ```

The application will be available at `http://localhost:5173`

### Using the Start Script

If available, you can use the provided start script:
```bash
./start-local.sh
```

## Building for Production

1. **Build the frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy Supabase functions**
   ```bash
   supabase functions deploy
   ```

3. **Deploy to your hosting platform** (Vercel, Netlify, etc.)

## Testing

### Frontend Tests
```bash
cd frontend
npm run test
```

### Backend Tests
```bash
cd backend
npm run test
```

## API Documentation

- **Supabase Functions**: Available at `http://localhost:54321/functions/v1/`
- **AI Engine API**: Runs on `http://localhost:8000` (FastAPI docs at `/docs`)

## Project Structure

```
dot-market-ai-pro/
├── frontend/          # React frontend application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Application pages
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utility functions
│   ├── public/          # Static assets
│   └── package.json
├── backend/           # Backend services
│   ├── prisma/         # Database schema
│   ├── src/            # Server code
│   └── supabase/       # Supabase configuration
├── ai-engine/         # AI/ML services
│   ├── main.py         # Main AI application
│   └── requirements.txt
├── database/          # Database migrations/scripts
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Environment Setup for Contributors

- Use ESLint and Prettier for code formatting
- Run tests before committing
- Follow conventional commit messages
- Use TypeScript strictly

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@dotmarket.ai or join our Discord community.

## Roadmap

- [ ] Advanced AI models for prediction
- [ ] Mobile app development
- [ ] Integration with more data sources
- [ ] Real-time notifications
- [ ] Multi-language support

---

**Disclaimer**: This application is for educational and informational purposes only. Not financial advice. Always do your own research before making investment decisions.</content>
<parameter name="filePath">/home/symon/Documents/Projects/dotmarket/dot-market-ai-pro/README.md
