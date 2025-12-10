/**
 * FeedPage - Trang feed (trang chủ)
 */

import { useRef } from 'react';
import { Hero } from '../../components/layout/Hero';
import { ProductGrid } from '../../components/product';
import { HotDealsSection } from '../../components/product/HotDealsSection';
import { Categories, RevealSection } from '../../components/shared';
import { FilterSidebar } from '../../components/sidebars/FilterSidebar';
import { useAppContext } from '../../providers/AppProvider';

export function FeedPage() {
  const app = useAppContext();
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
            app.filters.setFilters({ ...app.filters.filters, category })
          }
          onCategoryClick={scrollToProducts}
        />
      </RevealSection>

      <RevealSection delay={0.2}>
        <HotDealsSection
          onAddToCart={app.addToCart}
          onViewDetail={app.handleViewProductDetail}
          onTriggerFlyingIcon={app.handleTriggerFlyingIcon}
          isLoggedIn={app.isLoggedIn}
          onLogin={app.handleLogin}
        />
      </RevealSection>

      <RevealSection delay={0.3}>
        <div ref={productSectionRef} className="container mx-auto px-4 py-8">
          <div className="flex gap-8">
            <FilterSidebar
              isOpen={app.sidebars.isFilterOpen}
              onClose={() => app.sidebars.closeFilter()}
              filters={app.filters.filters}
              onFiltersChange={app.filters.setFilters}
            />

            <div className="flex-1">
              <ProductGrid
                filters={app.filters.filters}
                onAddToCart={app.addToCart}
                onViewDetail={app.handleViewProductDetail}
                onTriggerFlyingIcon={app.handleTriggerFlyingIcon}
                isLoggedIn={app.isLoggedIn}
                onLogin={app.handleLogin}
              />
            </div>
          </div>
        </div>
      </RevealSection>
    </main>
  );
}

