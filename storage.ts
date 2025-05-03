import { db } from "@db";
import {
  users, User, InsertUser,
  products, Product, InsertProduct,
  categories, Category, InsertCategory,
  suppliers, Supplier, InsertSupplier,
  orders, Order, InsertOrder,
  orderItems, OrderItem, InsertOrderItem,
  coupons, Coupon, InsertCoupon,
  specialOffers, SpecialOffer, InsertSpecialOffer,
  offerProducts
} from "@shared/schema";
import { and, eq, like, gte, lte, desc, asc, sql, inArray } from "drizzle-orm";
import { createHash } from "crypto";

interface ProductFilters {
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  isDropshipped?: boolean;
  supplierId?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export const storage = {
  // User operations
  async getUserById(id: number): Promise<User | null> {
    return await db.query.users.findFirst({
      where: eq(users.id, id),
    });
  },
  
  async getUserByUsername(username: string): Promise<User | null> {
    return await db.query.users.findFirst({
      where: eq(users.username, username),
    });
  },
  
  async getUserByEmail(email: string): Promise<User | null> {
    return await db.query.users.findFirst({
      where: eq(users.email, email),
    });
  },
  
  async createUser(userData: InsertUser): Promise<User> {
    // Hash the password before storing
    const hashedPassword = createHash('sha256').update(userData.password).digest('hex');
    const [user] = await db.insert(users)
      .values({ ...userData, password: hashedPassword })
      .returning();
    return user;
  },
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | null> {
    // Hash password if it's being updated
    if (userData.password) {
      userData.password = createHash('sha256').update(userData.password).digest('hex');
    }
    
    const [updatedUser] = await db.update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser || null;
  },
  
  // Category operations
  async getAllCategories(): Promise<Category[]> {
    return await db.query.categories.findMany({
      orderBy: asc(categories.name),
    });
  },
  
  async getCategoryById(id: number): Promise<Category | null> {
    return await db.query.categories.findFirst({
      where: eq(categories.id, id),
    });
  },
  
  async createCategory(categoryData: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories)
      .values(categoryData)
      .returning();
    return category;
  },
  
  // Supplier operations
  async getAllSuppliers(): Promise<Supplier[]> {
    return await db.query.suppliers.findMany({
      orderBy: asc(suppliers.name),
    });
  },
  
  async getSupplierById(id: number): Promise<Supplier | null> {
    return await db.query.suppliers.findFirst({
      where: eq(suppliers.id, id),
    });
  },
  
  async createSupplier(supplierData: InsertSupplier): Promise<Supplier> {
    const [supplier] = await db.insert(suppliers)
      .values(supplierData)
      .returning();
    return supplier;
  },
  
  // Product operations
  async getAllProducts(filters: ProductFilters = {}): Promise<{ products: Product[], total: number }> {
    const {
      categoryId,
      minPrice,
      maxPrice,
      search,
      isDropshipped,
      supplierId,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortDirection = 'desc'
    } = filters;
    
    const offset = (page - 1) * limit;
    
    // Build the where conditions based on filters
    const whereConditions = [];
    
    if (categoryId) {
      whereConditions.push(eq(products.categoryId, categoryId));
    }
    
    if (minPrice !== undefined) {
      whereConditions.push(gte(products.price, minPrice.toString()));
    }
    
    if (maxPrice !== undefined) {
      whereConditions.push(lte(products.price, maxPrice.toString()));
    }
    
    if (search) {
      whereConditions.push(
        sql`${products.name} ILIKE ${`%${search}%`} OR ${products.description} ILIKE ${`%${search}%`}`
      );
    }
    
    if (isDropshipped !== undefined) {
      whereConditions.push(eq(products.isDropshipped, isDropshipped));
    }
    
    if (supplierId) {
      whereConditions.push(eq(products.supplierId, supplierId));
    }
    
    // Always include only active products
    whereConditions.push(eq(products.isActive, true));
    
    // Determine sort order
    const sortField = sortBy === 'price' 
      ? products.price 
      : sortBy === 'name' 
        ? products.name 
        : products.createdAt;
        
    const sortOrder = sortDirection === 'asc' ? asc(sortField) : desc(sortField);
    
    // Count total products for pagination
    const totalCount = await db.select({ count: sql<number>`count(*)` })
      .from(products)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .then(result => Number(result[0]?.count || 0));
    
    // Get products
    const productsList = await db.query.products.findMany({
      where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
      orderBy: sortOrder,
      limit,
      offset,
      with: {
        category: true,
        supplier: true,
      },
    });
    
    return {
      products: productsList,
      total: totalCount,
    };
  },
  
  async getProductById(id: number): Promise<Product | null> {
    return await db.query.products.findFirst({
      where: eq(products.id, id),
      with: {
        category: true,
        supplier: true,
      },
    });
  },
  
  async createProduct(productData: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products)
      .values(productData)
      .returning();
    return product;
  },
  
  async updateProduct(id: number, productData: Partial<InsertProduct>): Promise<Product | null> {
    const [updatedProduct] = await db.update(products)
      .set(productData)
      .where(eq(products.id, id))
      .returning();
    return updatedProduct || null;
  },
  
  // Coupon operations
  async getAllActiveCoupons(): Promise<Coupon[]> {
    const now = new Date();
    return await db.query.coupons.findMany({
      where: and(
        eq(coupons.isActive, true),
        lte(coupons.startsAt, now),
        gte(coupons.expiresAt, now)
      ),
      orderBy: asc(coupons.expiresAt),
    });
  },
  
  async getCouponByCode(code: string): Promise<Coupon | null> {
    const now = new Date();
    return await db.query.coupons.findFirst({
      where: and(
        eq(coupons.code, code),
        eq(coupons.isActive, true),
        lte(coupons.startsAt, now),
        gte(coupons.expiresAt, now)
      ),
    });
  },
  
  async incrementCouponUsage(id: number): Promise<void> {
    await db.update(coupons)
      .set({ usageCount: sql`${coupons.usageCount} + 1` })
      .where(eq(coupons.id, id));
  },
  
  async createCoupon(couponData: InsertCoupon): Promise<Coupon> {
    const [coupon] = await db.insert(coupons)
      .values(couponData)
      .returning();
    return coupon;
  },
  
  // Special offers operations
  async getAllActiveSpecialOffers(): Promise<SpecialOffer[]> {
    const now = new Date();
    return await db.query.specialOffers.findMany({
      where: and(
        eq(specialOffers.isActive, true),
        lte(specialOffers.startsAt, now),
        gte(specialOffers.endsAt, now)
      ),
      orderBy: asc(specialOffers.endsAt),
    });
  },
  
  async getSpecialOfferById(id: number): Promise<SpecialOffer | null> {
    return await db.query.specialOffers.findFirst({
      where: eq(specialOffers.id, id),
    });
  },
  
  async getProductsBySpecialOfferId(offerId: number): Promise<Product[]> {
    const offerProductRefs = await db.select()
      .from(offerProducts)
      .where(eq(offerProducts.offerId, offerId));
    
    const productIds = offerProductRefs.map(ref => ref.productId);
    
    if (productIds.length === 0) {
      return [];
    }
    
    return await db.query.products.findMany({
      where: and(
        inArray(products.id, productIds),
        eq(products.isActive, true)
      ),
    });
  },
  
  async createSpecialOffer(offerData: InsertSpecialOffer, productIds: number[]): Promise<SpecialOffer> {
    const [offer] = await db.insert(specialOffers)
      .values(offerData)
      .returning();
    
    // Link products to the offer
    if (productIds.length > 0) {
      await db.insert(offerProducts)
        .values(productIds.map(productId => ({
          offerId: offer.id,
          productId
        })));
    }
    
    return offer;
  },
  
  // Order operations
  async createOrder(orderData: InsertOrder, items: { productId: number; quantity: number; price: string }[]): Promise<Order> {
    const [order] = await db.insert(orders)
      .values(orderData)
      .returning();
    
    // Add order items
    for (const item of items) {
      const product = await this.getProductById(item.productId);
      if (product) {
        await db.insert(orderItems)
          .values({
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            isDropshipped: product.isDropshipped,
            supplierId: product.supplierId,
          });
        
        // Update inventory for non-dropshipped products
        if (!product.isDropshipped) {
          await db.update(products)
            .set({
              inventory: sql`${products.inventory} - ${item.quantity}`
            })
            .where(eq(products.id, item.productId));
        }
      }
    }
    
    return order;
  },
  
  async getOrdersByUserId(userId: number): Promise<Order[]> {
    return await db.query.orders.findMany({
      where: eq(orders.userId, userId),
      orderBy: desc(orders.createdAt),
      with: {
        items: {
          with: {
            product: true,
          },
        },
      },
    });
  },
  
  async getOrderById(id: number, userId: number): Promise<Order | null> {
    return await db.query.orders.findFirst({
      where: and(
        eq(orders.id, id),
        eq(orders.userId, userId)
      ),
      with: {
        items: {
          with: {
            product: true,
            supplier: true,
          },
        },
        coupon: true,
      },
    });
  },
  
  async updateOrderStatus(id: number, status: string): Promise<Order | null> {
    const [updatedOrder] = await db.update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder || null;
  },
  
  // Order item operations for dropshipping
  async updateOrderItemStatus(id: number, status: string): Promise<OrderItem | null> {
    const [updatedItem] = await db.update(orderItems)
      .set({ status })
      .where(eq(orderItems.id, id))
      .returning();
    return updatedItem || null;
  },
  
  async getDropshippedOrderItemsBySupplier(supplierId: number): Promise<OrderItem[]> {
    return await db.query.orderItems.findMany({
      where: and(
        eq(orderItems.supplierId, supplierId),
        eq(orderItems.isDropshipped, true)
      ),
      with: {
        order: true,
        product: true,
      },
      orderBy: desc(orderItems.createdAt),
    });
  },
};
