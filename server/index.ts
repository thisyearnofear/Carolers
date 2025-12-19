import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import { Server as SocketIOServer } from "socket.io";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

// CLEAN: Security and CORS middleware
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === "development" ? false : undefined
}));
app.use(cors());

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // MODULAR: Setup Socket.IO for real-time features
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === "development" ? "*" : false,
      methods: ["GET", "POST"]
    }
  });

  // CLEAN: Event-specific socket rooms
  io.on('connection', (socket) => {
    log(`User connected: ${socket.id}`, 'websocket');

    // Join event room
    socket.on('join-event', (eventId: string) => {
      socket.join(`event-${eventId}`);
      log(`User ${socket.id} joined event ${eventId}`, 'websocket');
    });

    // Real-time chat
    socket.on('send-message', async (data: { eventId: string, memberId: string, text: string }) => {
      try {
        const { storage } = await import('./storage');
        const message = await storage.createMessage({
          eventId: data.eventId,
          memberId: data.memberId,
          text: data.text
        });
        
        // Broadcast to all users in the event room
        io.to(`event-${data.eventId}`).emit('new-message', message);
        log(`Message sent in event ${data.eventId}`, 'websocket');
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Real-time voting
    socket.on('vote-carol', async (data: { carolId: string, eventId: string }) => {
      try {
        const { storage } = await import('./storage');
        await storage.voteForCarol(data.carolId);
        const carol = await storage.getCarol(data.carolId);
        
        // Broadcast updated vote count to event room
        io.to(`event-${data.eventId}`).emit('carol-voted', { 
          carolId: data.carolId, 
          votes: carol?.votes || 0 
        });
        log(`Vote cast for carol ${data.carolId}`, 'websocket');
      } catch (error) {
        socket.emit('error', { message: 'Failed to vote' });
      }
    });

    socket.on('disconnect', () => {
      log(`User disconnected: ${socket.id}`, 'websocket');
    });
  });

  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
