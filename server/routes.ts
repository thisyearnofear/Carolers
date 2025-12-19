import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertEventSchema, 
  insertCarolSchema, 
  insertContributionSchema, 
  insertMessageSchema 
} from "@shared/schema";

// MODULAR: Domain-specific route handlers
class EventRoutes {
  static async getAll(req: any, res: any) {
    try {
      const events = await storage.getAllEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch events" });
    }
  }

  static async getById(req: any, res: any) {
    try {
      const event = await storage.getEvent(req.params.id);
      if (!event) return res.status(404).json({ error: "Event not found" });
      res.json(event);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch event" });
    }
  }

  static async create(req: any, res: any) {
    try {
      const validated = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(validated);
      res.status(201).json(event);
    } catch (error) {
      res.status(400).json({ error: "Invalid event data" });
    }
  }

  static async join(req: any, res: any) {
    try {
      const { eventId, userId } = req.body;
      await storage.joinEvent(eventId, userId);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Failed to join event" });
    }
  }
}

class CarolRoutes {
  static async getAll(req: any, res: any) {
    try {
      const carols = await storage.getAllCarols();
      res.json(carols);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch carols" });
    }
  }

  static async vote(req: any, res: any) {
    try {
      await storage.voteForCarol(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Failed to vote" });
    }
  }
}

class ContributionRoutes {
  static async getByEvent(req: any, res: any) {
    try {
      const contributions = await storage.getEventContributions(req.params.eventId);
      res.json(contributions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contributions" });
    }
  }

  static async create(req: any, res: any) {
    try {
      const validated = insertContributionSchema.parse(req.body);
      const contribution = await storage.createContribution(validated);
      res.status(201).json(contribution);
    } catch (error) {
      res.status(400).json({ error: "Invalid contribution data" });
    }
  }
}

class MessageRoutes {
  static async getByEvent(req: any, res: any) {
    try {
      const messages = await storage.getEventMessages(req.params.eventId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  }

  static async create(req: any, res: any) {
    try {
      const validated = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(validated);
      res.status(201).json(message);
    } catch (error) {
      res.status(400).json({ error: "Invalid message data" });
    }
  }
}

// CLEAN: Explicit separation of concerns with clear route organization
export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Event routes
  app.get("/api/events", EventRoutes.getAll);
  app.get("/api/events/:id", EventRoutes.getById);
  app.post("/api/events", EventRoutes.create);
  app.post("/api/events/join", EventRoutes.join);

  // Carol routes
  app.get("/api/carols", CarolRoutes.getAll);
  app.post("/api/carols/:id/vote", CarolRoutes.vote);

  // Contribution routes
  app.get("/api/events/:eventId/contributions", ContributionRoutes.getByEvent);
  app.post("/api/contributions", ContributionRoutes.create);

  // Message routes
  app.get("/api/events/:eventId/messages", MessageRoutes.getByEvent);
  app.post("/api/messages", MessageRoutes.create);

  return httpServer;
}
