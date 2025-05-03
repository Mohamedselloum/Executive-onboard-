import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductDetail } from "@/components/product/ProductDetail";
import { ProductCard } from "@/components/product/ProductCard";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductPage() {
  // Get product ID from URL
  const [, params] = useRoute<{ id: string }>("/products/:id");
  const productId = params?.id ? parseInt(params.id) : 0;
  
  // Fetch the current product
  const { data: product, isLoading, error } = useQuery({
    queryKey: [`/api/products/${productId}`],
    enabled: !!productId,
  });

  // Fetch related products in the same category
  const { data: relatedProducts, isLoading: relatedLoading } = useQuery({
    queryKey: [product?.categoryId ? `/api/products?categoryId=${product.categoryId}&limit=4` : null],
    enabled: !!product?.categoryId,
  });

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            <div className="space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-[500px] w-full" />
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-8">
              The product you're looking for doesn't exist or has been removed.
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center text-sm text-gray-500 mb-6">
            <a href="/" className="hover:text-primary">Home</a>
            <span className="mx-2">/</span>
            <a href="/products" className="hover:text-primary">Products</a>
            <span className="mx-2">/</span>
            {product.category && (
              <>
                <a href={`/products?categoryId=${product.category.id}`} className="hover:text-primary">
                  {product.category.name}
                </a>
                <span className="mx-2">/</span>
              </>
            )}
            <span className="text-gray-700">{product.name}</span>
          </div>

          {/* Product Detail Component */}
          <ProductDetail productId={productId} />

          {/* Related Products */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Related Products</h2>
            <Separator className="mb-6" />

            {relatedLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-48 w-full rounded-md" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-8 w-28" />
                  </div>
                ))}
              </div>
            ) : relatedProducts?.products?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {relatedProducts.products
                  .filter((related: any) => related.id !== productId) // Filter out current product
                  .slice(0, 4)
                  .map((related: any) => (
                    <ProductCard
                      key={related.id}
                      id={related.id}
                      name={related.name}
                      price={related.price}
                      compareAtPrice={related.compareAtPrice}
                      image={related.image}
                      isDropshipped={related.isDropshipped}
                      categoryId={related.categoryId}
                      category={related.category}
                    />
                  ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No related products found</p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
