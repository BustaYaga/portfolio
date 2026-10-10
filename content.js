/**
 * Content package shortcut.
 * Loads and delegates to js/content.package.js for easy editing of all website copy.
 */

// If PortfolioContent is not yet loaded, load js/content.package.js
if (typeof window !== 'undefined' && !window.PortfolioContent) {
  const script = document.createElement('script');
  script.src = 'js/content.package.js';
  document.head.appendChild(script);
}
