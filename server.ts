import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API Route to proxy Google Apps Script
  app.get("/api/data", async (req, res) => {
    console.log(`[API Request] GET /api/data at ${new Date().toISOString()}`);
    const customUrl = req.query.url as string;
    const gasUrl = customUrl || process.env.GAS_URL || "https://script.google.com/macros/s/AKfycbxhj2wqhEIfaS0oLqr9Y0lp5K4A2sdGuypPYVmFq7wmIhhhiZ-TfJFxtk79o6DH8_Rz/exec";
    
    if (!gasUrl) {
      console.warn("GAS_URL environment variable is not defined");
      return res.status(500).json({ error: "GAS_URL not configured" });
    }

    try {
      const url = new URL(gasUrl);
      url.searchParams.set('t', Date.now().toString());
      
      console.log("Server fetching from GAS:", url.toString());
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Cache-Control": "no-cache"
        }
      });

      if (!response.ok) {
        throw new Error(`GAS returned status ${response.status}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error proxying GAS request:", error);
      res.status(502).json({ error: "Failed to fetch data from source" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
