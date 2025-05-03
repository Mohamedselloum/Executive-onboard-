import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Tag, ArrowRight } from "lucide-react";

export function OfferBanner() {
  const { data: specialOffers, isLoading } = useQuery({
    queryKey: ["/api/special-offers"]
  });

  if (isLoading || !specialOffers || specialOffers.length === 0) {
    return null;
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Calculate days remaining for offer
  const getDaysRemaining = (endDateString: string) => {
    const today = new Date();
    const endDate = new Date(endDateString);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <div className="relative overflow-hidden">
      <Carousel className="w-full">
        <CarouselContent>
          {specialOffers.map((offer: any) => (
            <CarouselItem key={offer.id}>
              <div 
                className="relative h-44 md:h-64 w-full flex items-center justify-center overflow-hidden rounded-lg"
                style={{
                  backgroundImage: `url(${offer.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/40"></div>
                
                <div className="relative z-10 text-white p-6 md:p-10 max-w-3xl text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start space-x-2 mb-3">
                    <Badge className="bg-white/20 hover:bg-white/30 text-white">
                      <Clock className="h-3 w-3 mr-1" />
                      {getDaysRemaining(offer.endsAt)} days left
                    </Badge>
                    <Badge className="bg-white/20 hover:bg-white/30 text-white">
                      <Tag className="h-3 w-3 mr-1" />
                      {offer.discountType === "percentage" 
                        ? `${offer.discountValue}% OFF` 
                        : `$${offer.discountValue} OFF`}
                    </Badge>
                  </div>
                  
                  <h2 className="text-xl md:text-3xl font-bold mb-2 tracking-tight">{offer.title}</h2>
                  <p className="text-sm md:text-base text-white/90 mb-4 max-w-xl">
                    {offer.description}
                  </p>
                  
                  <Link href={`/products?offer=${offer.id}`}>
                    <Button className="bg-white text-primary hover:bg-white/90">
                      Shop Now
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4" />
        <CarouselNext className="right-4" />
      </Carousel>
      
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
        {specialOffers.map((_: any, index: number) => (
          <div 
            key={index} 
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === 0 ? "w-6 bg-white" : "w-1.5 bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
