import type { Express, Request, Response, RequestHandler, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { createHash } from "crypto";
import PgSimpleStore from "connect-pg-simple";
import { pool } from "@db";

const PgSession = PgSimpleStore(session);

// Type definitions for request with authenticated user
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
  };
}

// Helper function to handle type casting for route handlers with AuthenticatedRequest
const authHandler = (handler: (req: AuthenticatedRequest, res: Response, next?: NextFunction) => any): RequestHandler => {
  return handler as RequestHandler;
};

export async function registerRoutes(app: Express, serverless: boolean = false): Promise<Server | null> {
  // Set up session store and authentication
  app.use(
    session({
      store: new PgSession({
        pool,
        tableName: "session",
      }),
      secret: process.env.SESSION_SECRET || "e-commerce-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        secure: process.env.NODE_ENV === "production",
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Invalid username or password" });
        }

        const hashedPassword = createHash("sha256")
          .update(password)
          .digest("hex");
        if (user.password !== hashedPassword) {
          return done(null, false, { message: "Invalid username or password" });
        }

        return done(null, {
          id: user.id,
          username: user.username,
          email: user.email,
        });
      } catch (error) {
        return done(error);
      }
    })
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUserById(id);
      done(null, user ? { id: user.id, username: user.username, email: user.email } : null);
    } catch (error) {
      done(error);
    }
  });

  // Middleware to check if user is authenticated
  const isAuthenticated = authHandler((
    req: AuthenticatedRequest,
    res: Response,
    next?: NextFunction
  ) => {
    if (req.isAuthenticated() && next) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  });

  // API Routes
  const apiPrefix = "/api";

  // Auth routes
  app.post(`${apiPrefix}/auth/register`, async (req, res) => {
    try {
      const { username, password, email, fullName } = req.body;

      // Check if username already exists
      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }

      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const user = await storage.createUser({
        username,
        password,
        email,
        fullName,
      });

      // Log the user in
      req.login(
        { id: user.id, username: user.username, email: user.email },
        (err) => {
          if (err) {
            return res.status(500).json({ message: "Login failed" });
          }
          return res.status(201).json({
            id: user.id,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
          });
        }
      );
    } catch (error) {
      console.error("Registration error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      return res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post(`${apiPrefix}/auth/login`, passport.authenticate("local"), (req, res) => {
    res.json({ user: req.user });
  });

  app.post(`${apiPrefix}/auth/logout`, (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get(`${apiPrefix}/auth/user`, authHandler((req: AuthenticatedRequest, res) => {
    if (req.user) {
      res.json({ user: req.user });
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  }));

  // User routes
  app.get(`${apiPrefix}/users/profile`, isAuthenticated, authHandler(async (req: AuthenticatedRequest, res) => {
    try {
      const user = await storage.getUserById(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove sensitive information
      const { password, ...userProfile } = user;
      res.json(userProfile);
    } catch (error) {
      console.error("Profile fetch error:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  }));

  app.put(`${apiPrefix}/users/profile`, isAuthenticated, authHandler(async (req: AuthenticatedRequest, res) => {
    try {
      const { fullName, address, city, state, zipCode } = req.body;
      
      const updatedUser = await storage.updateUser(req.user!.id, {
        fullName,
        address,
        city,
        state,
        zipCode
      });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove sensitive information
      const { password, ...userProfile } = updatedUser;
      res.json(userProfile);
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  }));

  // Category routes
  app.get(`${apiPrefix}/categories`, async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      console.error("Categories fetch error:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get(`${apiPrefix}/categories/:id`, async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const category = await storage.getCategoryById(categoryId);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(category);
    } catch (error) {
      console.error("Category fetch error:", error);
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });

  // Product routes
  app.get(`${apiPrefix}/products`, async (req, res) => {
    try {
      const {
        categoryId,
        minPrice,
        maxPrice,
        search,
        isDropshipped,
        supplierId,
        page = "1",
        limit = "12",
        sortBy = "createdAt",
        sortDirection = "desc"
      } = req.query;
      
      const filters: any = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        sortBy: sortBy as string,
        sortDirection: sortDirection as "asc" | "desc"
      };
      
      if (categoryId) filters.categoryId = parseInt(categoryId as string);
      if (minPrice) filters.minPrice = parseFloat(minPrice as string);
      if (maxPrice) filters.maxPrice = parseFloat(maxPrice as string);
      if (search) filters.search = search as string;
      if (isDropshipped !== undefined) filters.isDropshipped = isDropshipped === "true";
      if (supplierId) filters.supplierId = parseInt(supplierId as string);
      
      const result = await storage.getAllProducts(filters);
      res.json(result);
    } catch (error) {
      console.error("Products fetch error:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get(`${apiPrefix}/products/:id`, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.getProductById(productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      console.error("Product fetch error:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Coupon routes
  app.get(`${apiPrefix}/coupons`, async (req, res) => {
    try {
      const coupons = await storage.getAllActiveCoupons();
      res.json(coupons);
    } catch (error) {
      console.error("Coupons fetch error:", error);
      res.status(500).json({ message: "Failed to fetch coupons" });
    }
  });

  app.post(`${apiPrefix}/coupons/validate`, async (req, res) => {
    try {
      const { code } = req.body;
      
      if (!code) {
        return res.status(400).json({ message: "Coupon code is required" });
      }
      
      const coupon = await storage.getCouponByCode(code);
      
      if (!coupon) {
        return res.status(404).json({ message: "Invalid coupon code" });
      }
      
      // Check if the coupon has a usage limit and if it's been reached
      if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
        return res.status(400).json({ message: "Coupon usage limit reached" });
      }
      
      res.json(coupon);
    } catch (error) {
      console.error("Coupon validation error:", error);
      res.status(500).json({ message: "Failed to validate coupon" });
    }
  });

  // Special offer routes
  app.get(`${apiPrefix}/special-offers`, async (req, res) => {
    try {
      const offers = await storage.getAllActiveSpecialOffers();
      res.json(offers);
    } catch (error) {
      console.error("Special offers fetch error:", error);
      res.status(500).json({ message: "Failed to fetch special offers" });
    }
  });

  app.get(`${apiPrefix}/special-offers/:id/products`, async (req, res) => {
    try {
      const offerId = parseInt(req.params.id);
      const products = await storage.getProductsBySpecialOfferId(offerId);
      res.json(products);
    } catch (error) {
      console.error("Special offer products fetch error:", error);
      res.status(500).json({ message: "Failed to fetch special offer products" });
    }
  });

  // Order routes
  app.post(`${apiPrefix}/orders`, isAuthenticated, authHandler(async (req: AuthenticatedRequest, res) => {
    try {
      const {
        shippingAddress,
        shippingCity,
        shippingState,
        shippingZip,
        total,
        items,
        couponId,
        couponDiscount
      } = req.body;
      
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Order must contain at least one item" });
      }
      
      const order = await storage.createOrder(
        {
          userId: req.user!.id,
          status: "pending",
          shippingAddress,
          shippingCity,
          shippingState,
          shippingZip,
          total,
          couponId: couponId || null,
          couponDiscount: couponDiscount || "0"
        },
        items
      );
      
      // If a coupon was used, increment its usage count
      if (couponId) {
        await storage.incrementCouponUsage(couponId);
      }
      
      res.status(201).json(order);
    } catch (error) {
      console.error("Order creation error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create order" });
    }
  }));

  app.get(`${apiPrefix}/orders`, isAuthenticated, authHandler(async (req: AuthenticatedRequest, res) => {
    try {
      const orders = await storage.getOrdersByUserId(req.user!.id);
      res.json(orders);
    } catch (error) {
      console.error("Orders fetch error:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  }));

  app.get(`${apiPrefix}/orders/:id`, isAuthenticated, authHandler(async (req: AuthenticatedRequest, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const order = await storage.getOrderById(orderId, req.user!.id);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(order);
    } catch (error) {
      console.error("Order fetch error:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  }));

  // Supplier routes
  app.get(`${apiPrefix}/suppliers`, async (req, res) => {
    try {
      const suppliers = await storage.getAllSuppliers();
      res.json(suppliers);
    } catch (error) {
      console.error("Suppliers fetch error:", error);
      res.status(500).json({ message: "Failed to fetch suppliers" });
    }
  });

  // If in serverless mode (Vercel), don't create a server
  if (serverless) {
    console.log("Running in serverless mode - no HTTP server created");
    return null;
  }
  
  // Create HTTP server for development mode but don't start it here
  // The server will be started in server/index.ts
  const httpServer = createServer(app);
  
  return httpServer;
}
