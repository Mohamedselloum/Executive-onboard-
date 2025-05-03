import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(logLine);
    }
  });

  next();
});

(async () => {
  // Error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  // Check if we're in serverless mode (for Vercel)
  const isServerless = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
  
  // Setup routes based on environment
  const server = await registerRoutes(app, isServerless);

  // In development mode, setup vite dev server
  // Only proceed with Vite setup if we have a valid server
  if (app.get("env") === "development") {
    if (server) {
      await setupVite(app, server);
    } else {
      console.warn("No server instance available for Vite HMR. Falling back to static serving.");
      serveStatic(app);
    }
  } else {
    // In production, serve static files
    serveStatic(app);
  }

  // Only start listening for connections in development mode
  // In production with Vercel, we don't manually listen for connections
  if (!isServerless && server) {
    // Use the port from environment variables or default to 5000
    const port = process.env.PORT || 5000;
    server.listen({
      port: Number(port),
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      console.log(`Server is listening on port ${port}`);
    });
  }
})();
