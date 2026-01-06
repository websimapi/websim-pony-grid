/*
  Infinite-scrolling grid that loads a runtime manifest (/assets.json)
  - Fetches available assets from /assets.json (root-relative)
  - Loads items in pages
  - Uses IntersectionObserver to append more when near the bottom
  - Recycles early cards so the list loops continuously
*/

const GRID = document.getElementById('grid');
const LOADER = document.getElementById('loader');

const PAGE_SIZE = 18;
let page = 0;
let loading = false;
let available = [];

// DOM item tracking & limits
let totalItems = 0;
const MAX_MULTIPLIER = 8;
const MAX_ITEMS = PAGE_SIZE * MAX_MULTIPLIER;

function makeCard(src, idx){
  const el = document.createElement('div');
  el.className = 'card';
  const img = document.createElement('img');
  img.decoding = 'async';
  img.loading = 'lazy';
  img.src = src;
  img.alt = src.split('/').pop() || 'asset';
  if (idx % 3 === 0) img.style.transform = 'scaleX(-1)';
  el.appendChild(img);
  return el;
}

function recycleIfNeeded(){
  if (totalItems <= MAX_ITEMS) return;
  const removeCount = PAGE_SIZE;
  const removed = [];
  for (let i = 0; i < removeCount && GRID.firstChild; i++){
    removed.push(GRID.firstChild);
    GRID.removeChild(GRID.firstChild);
  }
  totalItems -= removed.length;
  const removedHeight = removed.reduce((sum, node) => sum + (node.offsetHeight || 0), 0);
  if (removedHeight > 0){
    window.scrollBy({ top: -removedHeight, left: 0, behavior: 'instant' });
  }
}

function loadPage(){
  if (loading || !available.length) return;
  loading = true;
  LOADER.hidden = false;
  return new Promise(resolve=>{
    setTimeout(()=>{
      const start = page * PAGE_SIZE;
      for (let i=0;i<PAGE_SIZE;i++){
        const idx = start + i;
        const src = available[idx % available.length];
        const card = makeCard(src, idx);
        GRID.appendChild(card);
        totalItems++;
      }
      recycleIfNeeded();
      page++;
      loading = false;
      LOADER.hidden = true;
      resolve();
    }, 180);
  });
}

// sentinel for infinite scroll
const sentinel = document.createElement('div');
sentinel.style.height = '1px';
sentinel.style.width = '100%';
GRID.after(sentinel);

const io = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if (entry.isIntersecting){
      loadPage();
    }
  });
}, { root: null, rootMargin: '400px', threshold: 0 });
io.observe(sentinel);

// keyboard quick-add
window.addEventListener('keydown', (e)=>{
  if (e.code === 'Space') {
    e.preventDefault();
    loadPage();
  }
});

// fetch runtime manifest and initialize grid
async function init(){
  LOADER.hidden = false;
  try {
    const res = await fetch('/assets.json', {cache: 'no-store'});
    if (!res.ok) throw new Error('Manifest not found');
    const list = await res.json();
    // keep only strings that look like asset paths
    available = Array.isArray(list) ? list.filter(v => typeof v === 'string' && v.trim()) : [];
  } catch (err) {
    console.warn('Failed to load /assets.json, falling back to listing root (none found)', err);
    available = [];
  } finally {
    LOADER.hidden = true;
  }

  if (!available.length) {
    GRID.innerHTML = '<div style="padding:20px;color:#666">No assets found. Add an /assets.json listing to the project root.</div>';
    return;
  }

  // seed a couple pages so grid feels populated immediately
  await loadPage();
  await loadPage();
}

init();