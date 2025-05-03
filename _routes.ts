import express from "express";
import app from "./index";

// This is used by Vercel to handle API routes
export default async function handler(req: express.Request, res: express.Response) {
  // Forward the request to our express app
  return app(req, res);
}