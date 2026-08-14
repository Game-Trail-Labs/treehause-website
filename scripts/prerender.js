#!/usr/bin/env node
/**
 * Prerender build step for TreeHaus Woodworking.
 *
 * This updates the static index.html at build time so Snipcart's crawler
 * sees real product markup. It now includes per-product engraving
 * controls (checkbox + optional text input) so the static HTML matches
 * the client-side renderer's behavior.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SITE_URL = 'https://treehauswoodworking.com';

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>\"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function renderProductsHtml(products) {
  return products.map((p, i) => {
    const delay = (i * 0.1).toFixed(1);
    const badge = p.badge ? `<span class="product-badge">${escapeHtml(p.badge)}</span>` : '';
    const priceLabel = p.priceLabel || `$${p.price}`;

    // Engraving controls (checkbox + optional text input) — rendered server-side
    const engravingControls = `
      <div class="product-engraving">
        <label class="engrave-label"><input type="checkbox" class="product-engrave-checkbox"> Engrave (+$20)</label>
        <input type="text" class="product-engrave-text" placeholder="Engraving text (optional)" maxlength="60" style="display:none;margin-top:6px;width:100%;padding:6px;border:1px solid #ddd;border-radius:6px">
      </div>`;

    const action = p.linkToBuilder
      ? `<a href="#builder" class="btn btn-sm">Configure →</a>`
      : `<div class="product-actions">
           ${engravingControls}
           <button class="btn btn-sm snipcart-add-item"
             data-item-id="${escapeHtml(p.id)}"
             data-item-name="${escapeHtml(p.name)}"
             data-item-price="${Number(p.price).toFixed(2)}"
             data-item-url="${SITE_URL}/index.html"
             data-item-description="${escapeHtml(p.description || '')}"
             data-item-image="${SITE_URL}/${escapeHtml(p.image)}">Add to Cart</button>
         </div>`;

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
