/*
  Simple infinite-scrolling grid that finds images in the root starting with "pony"
  - Loads items in pages
  - Uses IntersectionObserver to append more when near the bottom
  - Images are reused (same source) if only one available
*/

const GRID = document.getElementById('grid');
const LOADER = document.getElementById('loader');

// collect available pony assets in root by convention
// list of known filenames (in a real project you might fetch a manifest)
const available = [
  // include any file in root that starts with "pony"
  '/pony-twocolor-image-only-use-pure-black-.png'
].filter(Boolean);

if (!available.length) {
  GRID.innerHTML = '<div style="padding:20px;color:#666">No pony assets found.</div>';
  throw new Error('No pony assets found');
}

const PAGE_SIZE = 18;
let page = 0;
let loading = false;

// produce a pseudo-random variation to make tiles look varied (flips, background)
function makeCard(src, idx){
  const el = document.createElement('div');
  el.className = 'card';
  const img = document.createElement('img');
  img.decoding = 'async';
  img.loading = 'lazy';
  img.src = src;
  img.alt = 'pony';
  // small visual variation
  if (idx % 3 === 0) img.style.transform = 'scaleX(-1)';
  el.appendChild(img);
  return el;
}

function loadPage(){
  if (loading) return;
  loading = true;
  LOADER.hidden = false;
  return new Promise(resolve=>{
    // simulate a small delay for UX
    setTimeout(()=>{
      const start = page * PAGE_SIZE;
      for (let i=0;i<PAGE_SIZE;i++){
        const idx = start + i;
        // rotate through available images
        const src = available[idx % available.length];
        const card = makeCard(src, idx);
        GRID.appendChild(card);
      }
      page++;
      loading = false;
      LOADER.hidden = true;
      resolve();
    }, 200);
  });
}

// infinite scroll using sentinel
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
}, {
  root: null,
  rootMargin: '400px',
  threshold: 0
});
io.observe(sentinel);

// initial load
loadPage();

// optional: allow keyboard quick-add (space to load more)
window.addEventListener('keydown', (e)=>{
  if (e.code === 'Space') {
    e.preventDefault();
    loadPage();
  }
});