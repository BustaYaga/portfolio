/**
 * Legacy script.js entry point.
 * Loads and delegates to the stacked PortfolioPackage from js/portfolio.package.js.
 */

// If PortfolioPackage is already available (via js/portfolio.package.js), ensure it's initialized
if (typeof window !== 'undefined' && window.PortfolioPackage) {
  if (!window.PortfolioPackage.initialized) {
    window.PortfolioPackage.init();
  }
} else {
  // Dynamically load the package if script.js was called directly
  const script = document.createElement('script');
  script.src = 'js/portfolio.package.js';
  document.head.appendChild(script);
}
