# PitWall Backend API

Spring Boot backend for the PitWall F1 Dashboard application.

## Features

- **Live Timing Data**: Real-time F1 timing via OpenF1 API
- **WebSocket Support**: Live data streaming to frontend clients
- **Redis Caching**: High-performance data caching
- **REST API**: RESTful endpoints for race data
- **AI Commentary**: Integration with Claude AI (coming soon)
- **Video Highlights**: YouTube API integration (coming soon)

## Tech Stack

- Spring Boot 3.2.0
- Java 17
- Redis
- WebSocket (STOMP)
- WebFlux (Reactive)
- Lombok

## Prerequisites

- Java 17+
- Maven 3.8+
- Redis Server (optional, for caching)

## Running the Application

```bash
# Clone the repository
cd pitwall-backend

# Run with Maven
mvn spring-boot:run

# Or build and run JAR
mvn clean package
java -jar target/pitwall-backend-0.0.1-SNAPSHOT.jar
```

The server will start on `http://localhost:8080`

## API Endpoints

### Timing
- `GET /api/timing/live` - Get live timing data
- `GET /api/timing/laps/{sessionKey}` - Get lap data for session
- `GET /api/timing/tyres/{sessionKey}` - Get tire data for session
- `GET /api/timing/drivers/{sessionKey}` - Get driver data for session

### Highlights (Coming Soon)
- `GET /api/highlights` - Get race highlights
- `GET /api/highlights/race/{raceId}` - Get highlights for specific race

### AI Commentary (Coming Soon)
- `GET /api/commentary` - Get AI commentary
- `GET /api/commentary/session/{sessionKey}` - Get session commentary
- `POST /api/commentary/generate` - Generate new commentary

## WebSocket

Connect to WebSocket at: `ws://localhost:8080/ws`

Subscribe to timing updates: `/topic/timing`

## Configuration

Edit `src/main/resources/application.properties`:

```properties
# Server
server.port=8080

# Redis (optional)
spring.redis.host=localhost
spring.redis.port=6379

# API Keys (set as environment variables)
YOUTUBE_API_KEY=your_key_here
CLAUDE_API_KEY=your_key_here
```

## Project Structure

```
src/main/java/com/pitwall/
├── PitwallApplication.java
├── config/
│   ├── WebSocketConfig.java
│   ├── RedisConfig.java
│   └── CorsConfig.java
├── controller/
│   ├── TimingController.java
│   ├── HighlightsController.java
│   └── AICommentaryController.java
├── service/
│   ├── OpenF1Service.java
│   ├── YouTubeService.java (TODO)
│   ├── ClaudeService.java (TODO)
│   └── StrategyService.java
├── model/
│   ├── DriverTiming.java
│   ├── LapData.java
│   ├── TireData.java
│   └── AICommentary.java
└── scheduler/
    └── TimingScheduler.java
```

## Development

The application polls OpenF1 API every 2 seconds (configurable via `timing.poll.interval`) and broadcasts updates to connected WebSocket clients.

## License

MIT
