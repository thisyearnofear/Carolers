import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
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
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // CLEAN: Setup static file serving or Vite dev server
  // On Vercel, outputDirectory + routes handle static files automatically
  // Only use serveStatic for local production runs (not serverless)
  const isVercel = !!process.env.VERCEL;
  const isDev = process.env.NODE_ENV !== "production";

  if (isDev) {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  } else if (!isVercel) {
    // PERFORMANT: Only serve static in local production, not on Vercel
    serveStatic(app);
  }

  // ENHANCEMENT FIRST: Initialize database before starting server
  try {
    const { initializeDatabase } = await import("./db");
    await initializeDatabase();
  } catch (error) {
    log("Failed to initialize database, server will not start", "database");
    process.exit(1);
  }

  if (process.env.NODE_ENV !== "production") {
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
  }

  // CLEAN: Graceful shutdown handling
  const shutdown = async () => {
    log("Shutting down server gracefully...", "shutdown");
    
    try {
      // Close database connection
      const { closeDatabaseConnection } = await import("./db");
      await closeDatabaseConnection();
      
      // Close HTTP server
      httpServer.close(() => {
        log("Server shutdown complete", "shutdown");
        process.exit(0);
      });
      
      // Force shutdown after timeout
      setTimeout(() => {
        log("Forcing shutdown after timeout", "shutdown");
        process.exit(1);
      }, 30000);
      
    } catch (error) {
      log(`Error during shutdown: ${error}`, "shutdown");
      process.exit(1);
    }
  };

  // MODULAR: Handle process signals
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
  process.on("uncaughtException", (error) => {
    log(`Uncaught exception: ${error}`, "error");
    shutdown();
  });
  process.on("unhandledRejection", (reason) => {
    log(`Unhandled rejection: ${reason}`, "error");
  });
})();

export default app;
