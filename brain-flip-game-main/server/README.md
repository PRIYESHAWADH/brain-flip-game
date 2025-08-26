# 🚀 Brain Flip Battle Server

A production-ready WebSocket server for the Brain Flip Battle Mode, built with Node.js, TypeScript, Socket.IO, and PostgreSQL.

## ✨ Features

- **Real-time Multiplayer Battles**: WebSocket-based real-time gameplay
- **Advanced Game Logic**: Complex instruction generation and scoring system
- **Power-ups & Achievements**: Dynamic power-up system with achievement tracking
- **Room Management**: Create, join, and manage battle rooms
- **Player Statistics**: Comprehensive player tracking and leaderboards
- **Security**: JWT authentication, rate limiting, and input validation
- **Scalability**: Redis caching, connection pooling, and performance optimization
- **Production Ready**: Logging, monitoring, error handling, and graceful shutdown

## 🏗️ Architecture

```
src/
├── index.ts              # Main server entry point
├── services/             # Business logic services
│   ├── BattleService.ts  # Battle game logic
│   ├── RoomService.ts    # Room management
│   ├── GameService.ts    # Game state management
│   ├── PlayerService.ts  # Player operations
│   └── DatabaseService.ts # Database operations
├── middleware/           # Express middleware
│   ├── RateLimiter.ts    # API rate limiting
│   └── AuthMiddleware.ts # JWT authentication
├── utils/                # Utility functions
│   ├── Logger.ts         # Winston logging
│   ├── GameLogic.ts      # Game instruction generation
│   └── SeededRNG.ts      # Seeded random number generator
└── types/                # TypeScript type definitions
    └── BattleTypes.ts    # Battle system interfaces
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- Redis 6+
- npm or yarn

### Installation

1. **Clone and navigate to server directory**
   ```bash
   cd brain-flip-game/server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up database**
   ```bash
   # Create PostgreSQL database
   createdb brain_flip_battle
   
   # The server will auto-create tables on first run
   ```

5. **Start Redis server**
   ```bash
   redis-server
   ```

6. **Run the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm run build
   npm start
   ```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the server directory:

```env
# Server Configuration
PORT=3001
HOST=localhost
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=brain_flip_battle
DB_USER=postgres
DB_PASSWORD=your_password

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=24h

# Client URL for CORS
CLIENT_URL=http://localhost:3000
```

### Database Schema

The server automatically creates the following tables:

- **players**: Player information and statistics
- **rooms**: Battle room data
- **battle_history**: Game history and analytics
- **achievements**: Achievement definitions

## 🎮 Game Modes

### Supported Battle Types

- **Quick Battle**: Fast-paced single-round battles
- **Elimination**: Last player standing wins
- **Time Attack**: Beat the clock challenges
- **Classic**: Traditional multi-round battles
- **Sudden Death**: One life, high stakes
- **Battle Royale**: Large-scale elimination
- **Team Battle**: Cooperative team play
- **Capture the Flag**: Strategic objective-based gameplay

### Instruction Types

- **Direction**: Movement-based challenges
- **Color**: Visual recognition tasks
- **Action**: Keyboard input challenges
- **Mixed**: Complex multi-step instructions

## 🔌 WebSocket Events

### Client to Server

- `create_room`: Create a new battle room
- `join_room`: Join an existing room
- `ready_signal`: Signal player readiness
- `submit_answer`: Submit game answer
- `activate_powerup`: Use a power-up
- `leave_room`: Leave current room

### Server to Client

- `room_created`: Room creation confirmation
- `room_joined`: Room join confirmation
- `player_joined`: New player notification
- `battle_started`: Game start signal
- `answer_submitted`: Answer result
- `round_ended`: Round completion
- `game_ended`: Game completion
- `powerup_activated`: Power-up effect

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: API protection against abuse
- **Input Validation**: Comprehensive input sanitization
- **CORS Protection**: Cross-origin request security
- **Helmet Security**: HTTP security headers
- **SQL Injection Protection**: Parameterized queries

## 📊 Monitoring & Logging

### Logging

- **Winston Logger**: Structured logging with multiple transports
- **Log Levels**: Error, Warn, Info, Debug
- **File Rotation**: Automatic log file management
- **Performance Tracking**: Response time monitoring

### Health Checks

- **Database Connectivity**: PostgreSQL health monitoring
- **Redis Status**: Cache service health
- **Server Metrics**: Uptime and performance stats

## 🚀 Production Deployment

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["node", "dist/index.js"]
```

### Environment Setup

```bash
# Production environment variables
NODE_ENV=production
PORT=3001
DB_HOST=your_db_host
REDIS_URL=your_redis_url
JWT_SECRET=your_production_secret
```

### Performance Optimization

- **Connection Pooling**: Database connection optimization
- **Redis Caching**: Frequently accessed data caching
- **Compression**: Response compression for bandwidth
- **Rate Limiting**: API abuse prevention

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- --testPathPattern=GameLogic
```

## 📈 Scaling Considerations

### Horizontal Scaling

- **Load Balancing**: Multiple server instances
- **Session Sharing**: Redis-based session storage
- **Database Sharding**: Partition data across databases
- **CDN Integration**: Static asset delivery

### Performance Monitoring

- **APM Tools**: Application performance monitoring
- **Metrics Collection**: Custom game metrics
- **Alerting**: Performance threshold alerts
- **Load Testing**: Stress testing tools

## 🔧 Development

### Development Commands

```bash
# Start development server with hot reload
npm run dev

# Build TypeScript
npm run build

# Lint code
npm run lint

# Clean build artifacts
npm run clean
```

### Code Structure

- **Services**: Business logic separation
- **Middleware**: Request processing pipeline
- **Types**: TypeScript interface definitions
- **Utils**: Reusable utility functions

## 📚 API Documentation

### REST Endpoints

- `GET /health`: Server health check
- `GET /api/battle/stats`: Battle statistics
- `POST /api/battle/room`: Create battle room
- `GET /api/battle/leaderboard`: Player leaderboard

### WebSocket API

Full WebSocket API documentation available in the code comments and type definitions.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:

1. Check the documentation
2. Review existing issues
3. Create a new issue with detailed information
4. Contact the development team

## 🎯 Roadmap

- [ ] Tournament system
- [ ] Spectator mode
- [ ] Replay system
- [ ] Advanced analytics
- [ ] Mobile optimization
- [ ] Social features
- [ ] Custom game modes
- [ ] AI opponents

---

**Built with ❤️ for the Brain Flip community**
