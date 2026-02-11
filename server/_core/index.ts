import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "./routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Configure body parser
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // Development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // FIXED FOR KOYEB: Use system port and listen on 0.0.0.0
  const port = parseInt(process.env.PORT || "8000");

  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
    if (process.env.OAUTH_SERVER_URL) {
      console.log(`OAuth Callback URL: ${process.env.OAUTH_SERVER_URL}/api/oauth/callback`);
    } else {
      console.warn("WARNING: OAUTH_SERVER_URL is not set!");
    }
  });
}

startServer().catch(console.error);
