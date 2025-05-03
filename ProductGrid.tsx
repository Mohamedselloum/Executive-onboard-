import React from "react";
import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "./ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

interface ProductGridProps {
  categoryId?: number;
  search?: string;
  isDropshipped?: boolean;
  supplierId?: number;
  page: number;
  setPage: (page: number) => void;
}

export function ProductGrid({
  categoryId,
  search,
  isDropshipped,
  supplierId,
  page,
  setPage
}: ProductGridProps) {
  // Construct API URL with query params
  const buildQueryUrl = () => {
    const params = new URLSearchParams();
    if (categoryId) params.append("categoryId", categoryId.toString());
    if (search) params.append("search", search);
    if (isDropshipped !== undefined) params.append("isDropshipped", isDropshipped.toString());
    if (supplierId) params.append("supplierId", supplierId.toString());
    params.append("page", page.toString());
    params.append("limit", "12");
    
    return `/api/products?${params.toString()}`;
  };

  const { data, isLoading, error } = useQuery({
    queryKey: [buildQueryUrl()],
    keepPreviousData: true
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-48 w-full rounded-md" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-8 w-28" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-semibold text-gray-900">Error Loading Products</h3>
        <p className="text-gray-500 mt-2">Please try again later.</p>
      </div>
    );
  }

  if (!data?.products || data.products.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-semibold text-gray-900">No Products Found</h3>
        <p className="text-gray-500 mt-2">Try adjusting your search or filters to find what you're looking for.</p>
      </div>
    );
  }

  // Calculate total pages
  const totalPages = Math.ceil(data.total / 12);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {data.products.map((product: any) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            price={product.price}
            compareAtPrice={product.compareAtPrice}
            image={product.image}
            isDropshipped={product.isDropshipped}
            categoryId={product.categoryId}
            category={product.category}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            {page > 1 && (
              <PaginationItem>
                <PaginationPrevious onClick={() => setPage(page - 1)} />
              </PaginationItem>
            )}

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNumber;
              
              // Logic to show pages around the current page
              if (totalPages <= 5) {
                pageNumber = i + 1;
              } else if (page <= 3) {
                pageNumber = i + 1;
              } else if (page >= totalPages - 2) {
                pageNumber = totalPages - 4 + i;
              } else {
                pageNumber = page - 2 + i;
              }
              
              return (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    isActive={pageNumber === page}
                    onClick={() => setPage(pageNumber)}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            {page < totalPages && (
              <PaginationItem>
                <PaginationNext onClick={() => setPage(page + 1)} />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
