/**
 * HomePage - Trang chủ của ứng dụng
 */

import { useRef } from 'react';
import { Hero } from '../components/layout/Hero';
import { ProductGrid } from '../components/product';
import { HotDealsSection } from '../components/product/HotDealsSection';
import { Categories, RevealSection } from '../components/shared';
import { FilterSidebar } from '../components/sidebars/FilterSidebar';
import { FilterState, Product } from '../types/interface';

interface HomePageProps {
  filters: FilterState;
  isFilterOpen: boolean;
  onFiltersChange: (filters: FilterState) => void;
  onFilterClose: () => void;
  onAddToCart: (product: Product) => Promise<void>;
  onViewProductDetail: (product: Product) => void;
  onAddToWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  onTriggerFlyingIcon: (type: 'heart' | 'cart', element: HTMLElement) => void;
  isLoggedIn: boolean;
  onLogin: () => void;
}

export function HomePage({
  filters,
  isFilterOpen,
  onFiltersChange,
  onFilterClose,
  onAddToCart,
  onViewProductDetail,
  onAddToWishlist,
  isInWishlist,
  onTriggerFlyingIcon,
  isLoggedIn,
  onLogin,
}: HomePageProps) {
  const productSectionRef = useRef<HTMLDivElement>(null);

  const scrollToProducts = () => {
    if (productSectionRef.current) {
      const headerOffset = 80;
      const elementPosition = productSectionRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <main className="pt-16">
      <RevealSection>
        <Hero />
      </RevealSection>

      <RevealSection delay={0.1}>
        <Categories
          onCategorySelect={(category) =>
            onFiltersChange({ ...filters, category })
          }
          onCategoryClick={scrollToProducts}
        />
      </RevealSection>

      <RevealSection delay={0.2}>
        <HotDealsSection
          onAddToCart={onAddToCart}
          onViewDetail={onViewProductDetail}
          onAddToWishlist={onAddToWishlist}
          isInWishlist={isInWishlist}
          onTriggerFlyingIcon={onTriggerFlyingIcon}
          isLoggedIn={isLoggedIn}
          onLogin={onLogin}
        />
      </RevealSection>

      <RevealSection delay={0.3}>
        <div ref={productSectionRef} className="container mx-auto px-4 py-8">
          <div className="flex gap-8">
            <FilterSidebar
              isOpen={isFilterOpen}
              onClose={onFilterClose}
              filters={filters}
              onFiltersChange={onFiltersChange}
            />

            <div className="flex-1">
              <ProductGrid
                filters={filters}
                onAddToCart={onAddToCart}
                onViewDetail={onViewProductDetail}
                onAddToWishlist={onAddToWishlist}
                isInWishlist={isInWishlist}
                onTriggerFlyingIcon={onTriggerFlyingIcon}
                isLoggedIn={isLoggedIn}
                onLogin={onLogin}
              />
            </div>
          </div>
        </div>
      </RevealSection>
    </main>
  );
}

