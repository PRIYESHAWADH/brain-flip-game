# Brain Flip Game 🧠

A challenging cognitive puzzle game where you must do the opposite of what you see! When the game shows "UP", you click "DOWN". When it shows "RED", you click "GREEN". It sounds simple, but gets increasingly challenging as the timer shortens and instructions become more complex.

## 🎮 Game Overview

Brain Flip Game is a web-based cognitive training game designed to improve reaction time, cognitive flexibility, and decision-making skills. The game presents visual instructions that players must reverse, creating an engaging mental workout.

## ✨ Features

### Core Gameplay
- **3 Game Modes**: Classic (60s), Duel (45s), and Sudden Death (90s)
- **Adaptive Difficulty**: Timer shortens as you progress
- **Multiple Instruction Types**: Directional, color, and action-based challenges
- **Real-time Scoring**: Immediate feedback and score tracking

### Advanced Features
- **Multiplayer Battles**: Challenge friends in real-time battles
- **Daily Challenges**: New puzzles every day
- **Achievement System**: Unlock badges and rewards
- **Leaderboards**: Compete globally and with friends
- **PWA Support**: Install as a mobile app
- **Offline Play**: Works without internet connection

### Social & Engagement
- **Friend System**: Add and challenge friends
- **Social Sharing**: Share achievements and scores
- **Tournaments**: Weekly competitive events
- **Login Streaks**: Daily rewards for consistent play

## 🛠️ Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **React 18** - UI components and hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Zustand** - State management

### Backend & Services
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **Supabase** - Database and authentication
- **WebSocket** - Real-time multiplayer
- **Redis** - Session management

### Infrastructure
- **Docker** - Containerization
- **Kubernetes** - Orchestration
- **InfluxDB** - Time-series data
- **Prometheus** - Monitoring
- **Kafka** - Stream processing

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Docker (for local development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/PRIYESHAWADH/brain-flip-game.git
   cd brain-flip-game
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd brain-flip-game-main
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 How to Play

1. **Choose Game Mode**: Select from Classic, Duel, or Sudden Death
2. **Read Instructions**: Pay attention to what the game shows
3. **Do the Opposite**: Click the opposite of what's displayed
4. **Get Faster**: Timer decreases as you progress
5. **Beat Your Score**: Try to achieve the highest score possible

## 🎥 Gameplay Video

Watch the Brain Flip Game in action! This video demonstrates the core gameplay mechanics, different game modes, and the overall user experience.

[![Brain Flip Game Demo](https://img.youtube.com/vi/YOUR_VIDEO_ID/0.jpg)](https://www.youtube.com/watch?v=YOUR_VIDEO_ID)

**Video Features:**
- 🎮 **Gameplay Walkthrough** - See how the game works
- ⚡ **Speed Challenges** - Watch the difficulty increase
- 🏆 **Achievement System** - See rewards and badges
- 👥 **Multiplayer Mode** - Real-time battles with friends
- 📱 **PWA Features** - Mobile app-like experience

*Replace `YOUR_VIDEO_ID` with your actual YouTube video ID*

## 🏗️ Project Structure

```
brain-flip-game/
├── .claude/                 # AI workspace files
├── .qodo/                   # AI workspace files  
├── brain-flip-game-main/    # Main project
│   ├── src/                # Source code
│   │   ├── app/           # Next.js app router
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks
│   │   ├── store/         # State management
│   │   └── utils/         # Utility functions
│   ├── server/            # Backend server
│   ├── database/          # Database schemas
│   ├── tests/             # Test suite
│   └── public/            # Static assets
├── k8s/                   # Kubernetes manifests
├── monitoring/            # Prometheus configs
└── services/              # Kafka and stream processing
```

## 🧪 Testing

Run the test suite to ensure everything works correctly:

```bash
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
```

## 🐳 Docker Deployment

### Development
```bash
docker-compose -f docker-compose.dev.yml up
```

### Production
```bash
docker-compose up -d
```

## ☁️ Kubernetes Deployment

Deploy to Kubernetes cluster:

```bash
kubectl apply -f k8s/namespace.yaml
helm install brain-flip k8s/helm/brain-flip/
```

## 📊 Monitoring

The application includes comprehensive monitoring:
- **Prometheus** metrics collection
- **Grafana** dashboards
- **Custom metrics** for game performance
- **Real-time alerts** for system health

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ using Next.js and React
- Special thanks to the open source community
- Inspired by cognitive training research

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/PRIYESHAWADH/brain-flip-game/issues)

---

