/**
 * FeedPage - Trang feed (trang chủ)
 */

import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Hero } from '../../components/layout/Hero';
import { ProductGrid } from '../../components/product';
import { HotDealsSection } from '../../components/product/HotDealsSection';
import { Categories, RevealSection } from '../../components/shared';
import { FilterSidebar } from '../../components/sidebars/FilterSidebar';
import { useAppContext } from '../../providers/AppProvider';

export function FeedPage() {
  const app = useAppContext();
  const location = useLocation();
  const productSectionRef = useRef<HTMLDivElement>(null);
  const hotDealsSectionRef = useRef<HTMLDivElement>(null);

  function clearSavedScrollPositionForPath(pathname: string) {
    try {
      const stored = sessionStorage.getItem('scrollPositions');
      if (!stored) return;
      const positions = JSON.parse(stored) as Record<string, number>;
      if (positions && typeof positions === 'object') {
        delete positions[pathname];
        sessionStorage.setItem('scrollPositions', JSON.stringify(positions));
      }
    } catch {
      return;
    }
  }

  useEffect(() => {
    clearSavedScrollPositionForPath(location.pathname);
    window.scrollTo({ top: 0, behavior: 'auto' });
    const timeoutId = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }, 150);
    return () => clearTimeout(timeoutId);
  }, [location.pathname]);

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

  const scrollToHotDeals = () => {
    if (hotDealsSectionRef.current) {
      const headerOffset = 80;
      const elementPosition = hotDealsSectionRef.current.getBoundingClientRect().top;
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
        <Hero onShopNowClick={scrollToHotDeals} />
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
        <div ref={hotDealsSectionRef}>
          <HotDealsSection
            onAddToCart={app.addToCart}
            onViewDetail={app.handleViewProductDetail}
            onTriggerFlyingIcon={app.handleTriggerFlyingIcon}
            isLoggedIn={app.isLoggedIn}
            onLogin={app.handleLogin}
          />
        </div>
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

