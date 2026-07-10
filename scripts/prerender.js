#!/usr/bin/env node
/**
 * Prerender build step for TreeHaus Woodworking.
 *
 * Why this exists:
 * Snipcart validates cart items by crawling the page with a plain HTTP
 * request (no JavaScript execution) to confirm the item's price/ID/name
 * actually appear on the page. Products and gallery photos are normally
 * rendered client-side by script.js after fetching products.json /
 * gallery.json — so Snipcart's crawler only ever sees an empty <div>,
 * and every checkout gets flagged with "price of products in the cart
 * may have changed."
 *
 * This script runs at Netlify build time (see netlify.toml), reads
 * products.json / gallery.json, and injects the same HTML that
 * script.js would render client-side directly into index.html between
 * marker comments. Netlify then publishes that baked HTML, so the
 * crawler (and non-JS clients) see real product markup.
 *
 * script.js still re-renders on page load as a client-side refresh /
 * safety net — this is intentional and harmless, since it just
 * overwrites the grid with identical content once the JSON is fetched.
 *
 * IMPORTANT: This script writes to index.html only in the ephemeral
 * Netlify build environment. It is never committed back to git — each
 * build starts from a fresh checkout of the repo.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SITE_URL = 'https://treehauswoodworking.com';

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function renderProductsHtml(products) {
  return products.map((p, i) => {
    const delay = (i * 0.1).toFixed(1);
    const badge = p.badge ? `<span class="product-badge">${escapeHtml(p.badge)}</span>` : '';
    const priceLabel = p.priceLabel || `$${p.price}`;

    const action = p.linkToBuilder
      ? `<a href="#builder" class="btn btn-sm">Configure →</a>`
      : `<button class="btn btn-sm snipcart-add-item"
            data-item-id="${escapeHtml(p.id)}"
            data-item-name="${escapeHtml(p.name)}"
            data-item-price="${Number(p.price).toFixed(2)}"
            data-item-url="${SITE_URL}/index.html"
            data-item-description="${escapeHtml(p.description || '')}"
            data-item-image="${SITE_URL}/${escapeHtml(p.image)}">Add to Cart</button>`;

    return `
        <div class="product-card" data-category="${escapeHtml(p.category)}" data-animate="fade-up" data-delay="${delay}">
          <div class="product-img">
            <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" loading="lazy">
            ${badge}
          </div>
          <div class="product-info">
            <h3>${escapeHtml(p.name)}</h3>
            <p class="product-wood">${escapeHtml(p.wood)}</p>
            <div class="product-footer">
              <span class="product-price">${escapeHtml(priceLabel)}</span>
              ${action}
            </div>
          </div>
        </div>`;
  }).join('');
}

function renderGalleryHtml(images) {
  return images.map((img, i) => {
    const delay = ((i % 3) * 0.1).toFixed(1);
    const sizeClass = img.size === 'wide' ? ' gallery-wide'
                    : img.size === 'tall' ? ' gallery-tall' : '';
    return `
        <div class="gallery-item${sizeClass}" data-animate="fade-up" data-delay="${delay}" data-lightbox="${escapeHtml(img.image)}">
          <img src="${escapeHtml(img.image)}" alt="${escapeHtml(img.alt || '')}" loading="lazy">
          <span class="gallery-zoom"><i data-lucide="maximize-2"></i></span>
        </div>`;
  }).join('');
}

function injectBetweenMarkers(html, startMarker, endMarker, content) {
  const startIdx = html.indexOf(startMarker);
  const endIdx = html.indexOf(endMarker);
  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
    throw new Error(`Markers not found or out of order: ${startMarker} / ${endMarker}`);
  }
  const before = html.slice(0, startIdx + startMarker.length);
  const after = html.slice(endIdx);
  return `${before}\n${content}\n        ${after}`;
}

function main() {
  const indexPath = path.join(ROOT, 'index.html');
  const productsPath = path.join(ROOT, 'products.json');
  const galleryPath = path.join(ROOT, 'gallery.json');

  let html = fs.readFileSync(indexPath, 'utf8');

  const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
  const galleryData = JSON.parse(fs.readFileSync(galleryPath, 'utf8'));

  const productsHtml = renderProductsHtml(productsData.products || []);
  const galleryHtml = renderGalleryHtml(galleryData.images || []);

  html = injectBetweenMarkers(
    html,
    '<!--PRERENDER:PRODUCTS:START-->',
    '<!--PRERENDER:PRODUCTS:END-->',
    productsHtml
  );

  html = injectBetweenMarkers(
    html,
    '<!--PRERENDER:GALLERY:START-->',
    '<!--PRERENDER:GALLERY:END-->',
    galleryHtml
  );

  fs.writeFileSync(indexPath, html, 'utf8');

  console.log(`Prerendered ${productsData.products?.length ?? 0} products and ${galleryData.images?.length ?? 0} gallery photos into index.html`);
}

main();
