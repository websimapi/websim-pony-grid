/*
  Simple infinite-scrolling grid that finds images in the root starting with "pony"
  - Loads items in pages
  - Uses IntersectionObserver to append more when near the bottom
  - Images are reused (same source) if only one available
*/

const GRID = document.getElementById('grid');
const LOADER = document.getElementById('loader');

/*
  Collect available pony assets in root by convention.
  We can't list the server directory from the browser, so include a small
  manifest of known root files and filter those that contain "pony".
  Add any new root filenames to this manifest as needed.
*/
const rootFiles = [
  '/simple-cartoon-pony-paper-doll-full-body.png',
  '/pony-twocolor-image-only-use-pure-black-.png',
  '/pony-twocolor-image-only-use-pure-black- (1).png',
  '/simple-cartoon-pony-paper-doll-full-body (1).png',
  '/pony-twocolor-image-only-use-pure-black-.png', /* kept in case of duplicates */
  '/singlecolor-image-only-solid-pure-black-.png',
  '/singlecolor-silhouette-only-solid-pure-b.png',
  '/singlecolor-silhouette-only-solid-pure-b-add-hyper-realistic-.png',
  '/singlecolor-silhouette-only-solid-pure-b-add-hyper-realistic--fix-the-eyes-to-be-j-add-a-flowing-light-.png',
  '/singlecolor-silhouette-only-solid-pure-b-add-hyper-realistic--fix-the-eyes-to-be-j.png',
  '/singlecolor-silhouette-only-solid-pure-b-add-hyper-realistic--fix-the-eyes-to-be-j-define-a-hyper-reali-fix-the-mane-to-be-m.png',
  '/singlecolor-silhouette-only-solid-pure-b-add-hyper-realistic--fix-the-eyes-to-be-j-define-a-hyper-reali.png',
  '/singlecolor-silhouette-only-solid-pure-b-add-hyper-realistic--fix-the-eyes-to-be-j-add-a-flowing-gold-m.png',
  '/singlecolor-silhouette-only-solid-pure-b-add-hyper-realistic--fix-the-eyes-to-be-j-add-a-flowing-golden.png',
  '/singlecolor-silhouette-only-solid-pure-b-add-hyper-realistic--fix-the-eyes-to-be-j-add-a-flowing-golden (1).png',
  '/singlecolor-silhouette-only-solid-pure-b-add-hyper-realistic--fix-the-eyes-to-be-j-add-a-flowing-golden (1)-make-the-horse-white.png',
  '/singlecolor-silhouette-only-solid-pure-b-add-hyper-realistic--fix-the-eyes-to-be-j-add-a-flowing-golden (1)-make-the-horse-white-change-horse-to-be-g.png',
  '/singlecolor-silhouette-only-solid-pure-b-add-hyper-realistic--fix-the-eyes-to-be-j-add-a-flowing-golden (1)-make-the-horse-white-change-horse-to-be-g-now-make-it-have-a-s.png',
  '/singlecolor-silhouette-only-solid-pure-b-add-hyper-realistic--fix-the-eyes-to-be-j-add-a-flowing-golden (1)-make-the-horse-white-change-horse-to-be-g-now-make-it-have-a-s-now-add-a-hyper-real.jpg',
  '/singlecolor-silhouette-only-solid-pure-b-add-hyper-realistic--fix-the-eyes-to-be-j-add-a-solid-golden-m.png',
  '/singlecolor-silhouette-only-solid-pure-b-add-hyper-realistic--fix-the-eyes-to-be-j-add-a-flowing-golden (1).png'
];

// pick any path that includes "pony" (case-insensitive)
const available = rootFiles.filter(p => /pony/i.test(p)).filter(Boolean);

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