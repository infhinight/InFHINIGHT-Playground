// @ts-nocheck
/**
 * Ported near-verbatim from the original standalone jpg-png-to-svg.html.
 *
 * This is intentionally left untyped (@ts-nocheck) rather than rewritten
 * as idiomatic typed React/state code: it's ~650 lines of DOM wiring,
 * canvas pixel manipulation, k-means quantization, and contour-tracing
 * geometry that already works. Re-typing or re-architecting it as React
 * state risked introducing subtle bugs in the tracing math for no
 * behavioural benefit — the win here is getting it running inside the
 * app safely, not rewriting a working algorithm.
 *
 * Changes from the original file:
 *   - Wrapped in `initPlatewerk()`, called from a useEffect in
 *     app/platewerk/page.tsx once the JSX below has mounted, instead of
 *     running as an inline <script> at the bottom of <body>.
 *   - Every `el.addEventListener(...)` became `on(el, ...)`, a thin
 *     wrapper that also records a disposer. `initPlatewerk()` returns a
 *     cleanup function that runs all of them, so React StrictMode's
 *     dev-only double-invoke (mount -> cleanup -> mount) doesn't attach
 *     duplicate listeners, and listeners are removed if the user
 *     navigates away.
 *   - All DOM lookups (`document.getElementById(...)`) are unchanged and
 *     still target the ids rendered in the JSX below — same ids as the
 *     original HTML.
 */

export function initPlatewerk() {
  const disposers = [];
  function on(el, event, handler) {
    el.addEventListener(event, handler);
    disposers.push(() => el.removeEventListener(event, handler));
  }

  // ---------------- state ----------------
  const state = {
    img: null,
    origW: 0, origH: 0,
    traceW: 0, traceH: 0,
    labels: null,           // Int16Array traceW*traceH, -1 = transparent/background
    palette: [],            // [{r,g,b,hex,count}]
    order: [],              // palette indices sorted largest-area-first
    loopsByColor: null,     // array (per palette index) of simplified loops [[{x,y},...]]
    svgEl: null,
    fileMeta: { name: '', w: 0, h: 0 }
  };

  const els = {
    fileInput: document.getElementById('fileInput'),
    dropzone: document.getElementById('dropzone'),
    fileChip: document.getElementById('fileChip'),
    fileName: document.getElementById('fileName'),
    fileDims: document.getElementById('fileDims'),
    modeSeg: document.getElementById('modeSeg'),
    colorsField: document.getElementById('colorsField'),
    colorsSlider: document.getElementById('colorsSlider'),
    colorsVal: document.getElementById('colorsVal'),
    bwField: document.getElementById('bwField'),
    bwThresholdSlider: document.getElementById('bwThresholdSlider'),
    bwThresholdVal: document.getElementById('bwThresholdVal'),
    transparentBgToggle: document.getElementById('transparentBgToggle'),
    resSeg: document.getElementById('resSeg'),
    simplifySlider: document.getElementById('simplifySlider'),
    simplifyVal: document.getElementById('simplifyVal'),
    minAreaSlider: document.getElementById('minAreaSlider'),
    minAreaVal: document.getElementById('minAreaVal'),
    smoothToggle: document.getElementById('smoothToggle'),
    bgToggle: document.getElementById('bgToggle'),
    traceBtn: document.getElementById('traceBtn'),
    plates: document.getElementById('plates'),
    viewSeg: document.getElementById('viewSeg'),
    canvasFrame: document.getElementById('canvasFrame'),
    placeholder: document.getElementById('placeholder'),
    statsStrip: document.getElementById('statsStrip'),
    statPlates: document.getElementById('statPlates'),
    statPaths: document.getElementById('statPaths'),
    statPoints: document.getElementById('statPoints'),
    statSize: document.getElementById('statSize'),
    downloadBtn: document.getElementById('downloadBtn'),
    copyBtn: document.getElementById('copyBtn'),
    statusHint: document.getElementById('statusHint'),
    ticketFile: document.getElementById('ticketFile'),
    ticketSize: document.getElementById('ticketSize'),
    ticketPlates: document.getElementById('ticketPlates'),
  };

  let currentRes = 500;
  let currentView = 'original';
  let currentMode = 'color';

  // ---------------- UI wiring ----------------
  (els.colorsSlider, 'input', () => { els.colorsVal.textContent = els.colorsSlider.value; });
  (els.simplifySlider, 'input', () => { els.simplifyVal.textContent = parseFloat(els.simplifySlider.value).toFixed(1); });
  (els.minAreaSlider, 'input', () => { els.minAreaVal.textContent = els.minAreaSlider.value + 'px'; });
  (els.bwThresholdSlider, 'input', () => { els.bwThresholdVal.textContent = els.bwThresholdSlider.value; });

  els.modeSeg.querySelectorAll('button').forEach(btn => {
    (btn, 'click', () => {
      els.modeSeg.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentMode = btn.dataset.val;
      els.colorsField.style.display = currentMode === 'bw' ? 'none' : 'flex';
      els.bwField.style.display = currentMode === 'bw' ? 'flex' : 'none';
    });
  });

  els.resSeg.querySelectorAll('button').forEach(btn => {
    on(btn, 'click', () => {
      els.resSeg.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentRes = parseInt(btn.dataset.val, 10);
    });
  });

  els.viewSeg.querySelectorAll('button').forEach(btn => {
    on(btn, 'click', () => {
      els.viewSeg.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentView = btn.dataset.view;
      renderStage();
    });
  });

  on(els.dropzone, 'click', () => els.fileInput.click());
  on(els.fileInput, 'change', e => {
    if (e.target.files && e.target.files[0]) loadFile(e.target.files[0]);
  });
  ['dragover', 'dragenter'].forEach(ev => {
    on(els.dropzone, ev, e => { e.preventDefault(); els.dropzone.classList.add('drag'); });
  });
  ['dragleave', 'drop'].forEach(ev => {
    on(els.dropzone, ev, e => { e.preventDefault(); els.dropzone.classList.remove('drag'); });
  });
  on(els.dropzone, 'drop', e => {
    const f = e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) loadFile(f);
  });

  on(els.traceBtn, 'click', runTrace);
  on(els.downloadBtn, 'click', downloadSVG);
  on(els.copyBtn, 'click', copySVG);

  // ---------------- file loading ----------------
  function loadFile(file) {
    if (!/^image\/(png|jpe?g)$/i.test(file.type)) {
      setHint('Please choose a JPG or PNG file.');
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      state.img = img;
      state.origW = img.naturalWidth;
      state.origH = img.naturalHeight;
      state.fileMeta = { name: file.name, w: state.origW, h: state.origH };

      els.fileChip.style.display = 'flex';
      els.fileName.textContent = file.name.length > 22 ? file.name.slice(0, 19) + '…' : file.name;
      els.fileDims.textContent = state.origW + '×' + state.origH;
      els.dropzone.classList.add('has-file');
      els.traceBtn.disabled = false;

      els.ticketFile.textContent = file.name;
      els.ticketSize.textContent = state.origW + '×' + state.origH;
      els.ticketPlates.textContent = '—';

      currentView = 'original';
      els.viewSeg.querySelectorAll('button').forEach(b => b.classList.toggle('active', b.dataset.view === 'original'));
      renderStage();
      setHint('Artwork loaded. Adjust settings, then press "Trace to SVG".');
      URL.revokeObjectURL(url);
    };
    img.onerror = () => setHint('Could not read that file — try a different JPG or PNG.');
    img.src = url;
  }

  function setHint(msg) { els.statusHint.textContent = msg; }

  // ---------------- stage rendering ----------------
  function renderStage() {
    els.placeholder.style.display = 'none';
    const old = els.canvasFrame.querySelector('img, svg.output');
    if (old) old.remove();

    if (currentView === 'original') {
      if (!state.img) { els.placeholder.style.display = 'block'; return; }
      const imgTag = document.createElement('img');
      imgTag.src = state.img.src;
      imgTag.alt = 'Original artwork';
      els.canvasFrame.appendChild(imgTag);
    } else {
      if (!state.svgEl) { els.placeholder.style.display = 'block'; return; }
      const clone = state.svgEl.cloneNode(true);
      clone.classList.add('output');
      els.canvasFrame.appendChild(clone);
    }
  }

  // ================================================================
  //  IMAGE QUANTISATION  (k-means with k-means++ init, sampled)
  // ================================================================
  function quantizeImage(imageData, w, h, k, treatAlphaAsBg) {
    const data = imageData.data;
    const n = w * h;
    const opaqueIdx = [];
    for (let i = 0; i < n; i++) {
      const a = data[i * 4 + 3];
      if (treatAlphaAsBg && a < 128) continue;
      opaqueIdx.push(i);
    }
    if (opaqueIdx.length === 0) {
      return { labels: new Int16Array(n).fill(-1), palette: [] };
    }
    k = Math.min(k, opaqueIdx.length);

    // sample for centroid finding
    const maxSample = 18000;
    let sampleIdx = opaqueIdx;
    if (opaqueIdx.length > maxSample) {
      sampleIdx = new Array(maxSample);
      for (let i = 0; i < maxSample; i++) {
        sampleIdx[i] = opaqueIdx[(Math.random() * opaqueIdx.length) | 0];
      }
    }
    const sN = sampleIdx.length;
    const sPix = new Float64Array(sN * 3);
    for (let i = 0; i < sN; i++) {
      const px = sampleIdx[i] * 4;
      sPix[i * 3] = data[px];
      sPix[i * 3 + 1] = data[px + 1];
      sPix[i * 3 + 2] = data[px + 2];
    }

    // k-means++ init
    const centroids = new Float64Array(k * 3);
    const firstPick = (Math.random() * sN) | 0;
    centroids[0] = sPix[firstPick * 3]; centroids[1] = sPix[firstPick * 3 + 1]; centroids[2] = sPix[firstPick * 3 + 2];
    const distSq = new Float64Array(sN).fill(Infinity);
    for (let c = 1; c < k; c++) {
      let total = 0;
      for (let i = 0; i < sN; i++) {
        const dr = sPix[i * 3] - centroids[(c - 1) * 3], dg = sPix[i * 3 + 1] - centroids[(c - 1) * 3 + 1], db = sPix[i * 3 + 2] - centroids[(c - 1) * 3 + 2];
        const d = dr * dr + dg * dg + db * db;
        if (d < distSq[i]) distSq[i] = d;
        total += distSq[i];
      }
      let r = Math.random() * total;
      let pick = 0;
      for (let i = 0; i < sN; i++) { r -= distSq[i]; if (r <= 0) { pick = i; break; } }
      centroids[c * 3] = sPix[pick * 3]; centroids[c * 3 + 1] = sPix[pick * 3 + 1]; centroids[c * 3 + 2] = sPix[pick * 3 + 2];
    }

    // lloyd iterations on sample
    const assign = new Int16Array(sN);
    const iterations = 9;
    for (let it = 0; it < iterations; it++) {
      for (let i = 0; i < sN; i++) {
        let best = 0, bestD = Infinity;
        for (let c = 0; c < k; c++) {
          const dr = sPix[i * 3] - centroids[c * 3], dg = sPix[i * 3 + 1] - centroids[c * 3 + 1], db = sPix[i * 3 + 2] - centroids[c * 3 + 2];
          const d = dr * dr + dg * dg + db * db;
          if (d < bestD) { bestD = d; best = c; }
        }
        assign[i] = best;
      }
      const sums = new Float64Array(k * 3);
      const counts = new Float64Array(k);
      for (let i = 0; i < sN; i++) {
        const c = assign[i];
        sums[c * 3] += sPix[i * 3]; sums[c * 3 + 1] += sPix[i * 3 + 1]; sums[c * 3 + 2] += sPix[i * 3 + 2];
        counts[c]++;
      }
      for (let c = 0; c < k; c++) {
        if (counts[c] > 0) {
          centroids[c * 3] = sums[c * 3] / counts[c];
          centroids[c * 3 + 1] = sums[c * 3 + 1] / counts[c];
          centroids[c * 3 + 2] = sums[c * 3 + 2] / counts[c];
        }
      }
    }

    // final full-image assignment
    const labels = new Int16Array(n).fill(-1);
    const counts = new Float64Array(k);
    for (let idx = 0; idx < opaqueIdx.length; idx++) {
      const i = opaqueIdx[idx];
      const px = i * 4;
      const r = data[px], g = data[px + 1], b = data[px + 2];
      let best = 0, bestD = Infinity;
      for (let c = 0; c < k; c++) {
        const dr = r - centroids[c * 3], dg = g - centroids[c * 3 + 1], db = b - centroids[c * 3 + 2];
        const d = dr * dr + dg * dg + db * db;
        if (d < bestD) { bestD = d; best = c; }
      }
      labels[i] = best;
      counts[best]++;
    }

    const palette = [];
    for (let c = 0; c < k; c++) {
      const r = Math.round(centroids[c * 3]), g = Math.round(centroids[c * 3 + 1]), b = Math.round(centroids[c * 3 + 2]);
      palette.push({ r, g, b, hex: rgbToHex(r, g, b), count: counts[c] });
    }
    return { labels, palette };
  }

  // ================================================================
  //  BLACK & WHITE THRESHOLDING  (luminance-based binary quantiser)
  // ================================================================
  function bwQuantize(imageData, w, h, threshold, treatAlphaAsBg) {
    const data = imageData.data;
    const n = w * h;
    const labels = new Int16Array(n).fill(-1);
    let blackCount = 0, whiteCount = 0;
    let blackSum = [0, 0, 0], whiteSum = [0, 0, 0];
    for (let i = 0; i < n; i++) {
      const px = i * 4;
      const a = data[px + 3];
      if (treatAlphaAsBg && a < 128) continue;
      const r = data[px], g = data[px + 1], b = data[px + 2];
      // standard perceptual luminance
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      if (lum < threshold) {
        labels[i] = 0;
        blackCount++; blackSum[0] += r; blackSum[1] += g; blackSum[2] += b;
      } else {
        labels[i] = 1;
        whiteCount++; whiteSum[0] += r; whiteSum[1] += g; whiteSum[2] += b;
      }
    }
    // default plate colours are pure black / pure white regardless of source pixels,
    // since this is a threshold silhouette, not an average — but keep sensible fallback colours
    const palette = [
      { r: 0, g: 0, b: 0, hex: '#000000', count: blackCount },
      { r: 255, g: 255, b: 255, hex: '#ffffff', count: whiteCount }
    ];
    return { labels, palette };
  }

  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(v => {
      const h = Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0');
      return h;
    }).join('');
  }

  // ================================================================
  //  CONTOUR TRACING  (edge-based boundary extraction, even-odd fill)
  // ================================================================
  function traceMaskLoops(mask, w, h) {
    function key(x, y) { return x * 100000 + y; }
    const edgesFrom = new Map();
    function isMask(x, y) { return x >= 0 && x < w && y >= 0 && y < h && mask[y * w + x] === 1; }
    function addEdge(x1, y1, x2, y2) {
      const k = key(x1, y1);
      let arr = edgesFrom.get(k);
      if (!arr) { arr = []; edgesFrom.set(k, arr); }
      arr.push({ x: x2, y: y2, used: false });
    }
    for (let y = 0; y < h; y++) {
      const row = y * w;
      for (let x = 0; x < w; x++) {
        if (mask[row + x] !== 1) continue;
        if (!isMask(x, y - 1)) addEdge(x, y, x + 1, y);
        if (!isMask(x + 1, y)) addEdge(x + 1, y, x + 1, y + 1);
        if (!isMask(x, y + 1)) addEdge(x + 1, y + 1, x, y + 1);
        if (!isMask(x - 1, y)) addEdge(x, y + 1, x, y);
      }
    }
    const loops = [];
    for (const [k0, arr] of edgesFrom) {
      for (const e0 of arr) {
        if (e0.used) continue;
        const sx = Math.floor(k0 / 100000), sy = k0 - sx * 100000;
        let cx = sx, cy = sy;
        const loop = [{ x: cx, y: cy }];
        let cur = e0;
        let guard = 0;
        const maxGuard = w * h * 4 + 16;
        while (true) {
          cur.used = true;
          cx = cur.x; cy = cur.y;
          loop.push({ x: cx, y: cy });
          if (cx === sx && cy === sy) break;
          const arr2 = edgesFrom.get(key(cx, cy));
          let next = null;
          if (arr2) { for (const e of arr2) { if (!e.used) { next = e; break; } } }
          if (!next) break; // guard against malformed topology
          cur = next;
          guard++;
          if (guard > maxGuard) break;
        }
        loops.push(loop);
      }
    }
    return loops;
  }

  function loopArea(loop) {
    let a = 0;
    for (let i = 0; i < loop.length - 1; i++) a += loop[i].x * loop[i + 1].y - loop[i + 1].x * loop[i].y;
    return a / 2;
  }

  function mergeCollinear(loop) {
    const pts = loop.slice(0, loop.length - 1);
    const n = pts.length;
    if (n < 3) return loop;
    const out = [];
    for (let i = 0; i < n; i++) {
      const prev = pts[(i - 1 + n) % n], cur = pts[i], next = pts[(i + 1) % n];
      const d1x = cur.x - prev.x, d1y = cur.y - prev.y, d2x = next.x - cur.x, d2y = next.y - cur.y;
      if (d1x * d2y - d1y * d2x !== 0) out.push(cur);
    }
    if (out.length === 0) out.push(pts[0]);
    out.push(out[0]);
    return out;
  }

  // Ramer-Douglas-Peucker simplification (closed loop aware, operates on already-merged corner points)
  function rdp(points, tolerance) {
    if (points.length <= 3 || tolerance <= 0) return points;
    const pts = points.slice(0, points.length - 1); // open
    const n = pts.length;
    if (n <= 3) return points;
    const keep = new Uint8Array(n);
    keep[0] = 1;
    function simplifySeg(i0, i1) {
      if (i1 <= i0 + 1) return;
      let maxD = -1, maxI = -1;
      const p0 = pts[i0], p1 = pts[i1 % n];
      for (let i = i0 + 1; i < i1; i++) {
        const p = pts[i % n];
        const d = perpDist(p, p0, p1);
        if (d > maxD) { maxD = d; maxI = i; }
      }
      if (maxD > tolerance) {
        keep[maxI % n] = 1;
        simplifySeg(i0, maxI);
        simplifySeg(maxI, i1);
      }
    }
    // split closed loop at two far-apart points for stable RDP
    let farI = 1, farD = -1;
    for (let i = 1; i < n; i++) {
      const d = dist(pts[0], pts[i]);
      if (d > farD) { farD = d; farI = i; }
    }
    keep[farI] = 1;
    simplifySeg(0, farI);
    simplifySeg(farI, n);
    const result = [];
    for (let i = 0; i < n; i++) if (keep[i]) result.push(pts[i]);
    result.push(result[0]);
    return result.length >= 4 ? result : points;
  }
  function dist(a, b) { const dx = a.x - b.x, dy = a.y - b.y; return Math.sqrt(dx * dx + dy * dy); }
  function perpDist(p, a, b) {
    const dx = b.x - a.x, dy = b.y - a.y;
    const len2 = dx * dx + dy * dy;
    if (len2 === 0) return dist(p, a);
    let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2;
    t = Math.max(0, Math.min(1, t));
    const px = a.x + t * dx, py = a.y + t * dy;
    return Math.sqrt((p.x - px) ** 2 + (p.y - py) ** 2);
  }

  // Build a smooth (rounded-corner) or straight SVG sub-path 'd' string for one loop
  function loopToPathD(loop, round) {
    const pts = loop.slice(0, loop.length - 1);
    const n = pts.length;
    if (n < 3) return '';
    if (!round) {
      let d = 'M' + fmt(pts[0].x) + ' ' + fmt(pts[0].y);
      for (let i = 1; i < n; i++) d += ' L' + fmt(pts[i].x) + ' ' + fmt(pts[i].y);
      d += ' Z';
      return d;
    }
    // rounded corners: cut each corner by a fraction of adjoining edge length
    const R = 0.32;
    const A = []; // entry point of each corner
    const B = []; // exit point of each corner
    for (let i = 0; i < n; i++) {
      const prev = pts[(i - 1 + n) % n], cur = pts[i], next = pts[(i + 1) % n];
      const l1 = Math.min(R, 0.5);
      const l2 = Math.min(R, 0.5);
      A.push({ x: cur.x + (prev.x - cur.x) * l1, y: cur.y + (prev.y - cur.y) * l1 });
      B.push({ x: cur.x + (next.x - cur.x) * l2, y: cur.y + (next.y - cur.y) * l2 });
    }
    let d = 'M' + fmt(B[n - 1].x) + ' ' + fmt(B[n - 1].y);
    for (let i = 0; i < n; i++) {
      d += ' L' + fmt(A[i].x) + ' ' + fmt(A[i].y);
      d += ' Q' + fmt(pts[i].x) + ' ' + fmt(pts[i].y) + ' ' + fmt(B[i].x) + ' ' + fmt(B[i].y);
    }
    d += ' Z';
    return d;
  }
  function fmt(v) { return Math.round(v * 10) / 10; }

  // ================================================================
  //  MAIN TRACE PIPELINE
  // ================================================================
  function runTrace() {
    if (!state.img) return;

    els.traceBtn.disabled = true;
    showLoading(true, 'Reducing to colour plates…');

    setTimeout(() => {
      try {
        const k = parseInt(els.colorsSlider.value, 10);
        const bwThreshold = parseInt(els.bwThresholdSlider.value, 10);
        const maxDim = currentRes;
        const treatAlphaAsBg = els.bgToggle.checked;
        const smooth = els.smoothToggle.checked;
        const simplifyTol = parseFloat(els.simplifySlider.value);
        const minArea = parseInt(els.minAreaSlider.value, 10);
        const transparentBg = els.transparentBgToggle.checked;

        // draw to working canvas at capped resolution
        const scale = Math.min(1, maxDim / Math.max(state.origW, state.origH));
        const tw = Math.max(1, Math.round(state.origW * scale));
        const th = Math.max(1, Math.round(state.origH * scale));
        const cnv = document.createElement('canvas');
        cnv.width = tw; cnv.height = th;
        const ctx = cnv.getContext('2d', { willReadFrequently: true });
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(state.img, 0, 0, tw, th);
        const imageData = ctx.getImageData(0, 0, tw, th);

        state.traceW = tw; state.traceH = th;

        const { labels, palette } = (currentMode === 'bw')
          ? bwQuantize(imageData, tw, th, bwThreshold, treatAlphaAsBg)
          : quantizeImage(imageData, tw, th, k, treatAlphaAsBg);
        state.labels = labels;
        state.palette = palette;

        // order colors largest total area first (draw first = background-most)
        const order = palette.map((p, i) => i).sort((a, b) => palette[b].count - palette[a].count);
        state.order = order;
        const hiddenPlate = transparentBg && order.length ? order[0] : -1;

        showLoading(true, 'Tracing plate boundaries…');

        // trace each color's mask
        const loopsByColor = [];
        let totalPoints = 0, totalPaths = 0;
        const minAreaTrace = minArea; // pixel^2 in trace-space

        for (let c = 0; c < palette.length; c++) {
          if (c === hiddenPlate) { loopsByColor.push([]); continue; }
          const mask = new Uint8Array(tw * th);
          for (let i = 0; i < tw * th; i++) if (labels[i] === c) mask[i] = 1;
          let loops = traceMaskLoops(mask, tw, th);
          loops = loops.map(mergeCollinear);
          if (simplifyTol > 0) {
            loops = loops.map(l => rdp(l, simplifyTol));
          }
          loops = loops.filter(l => Math.abs(loopArea(l)) >= minAreaTrace);
          loopsByColor.push(loops);
        }
        state.loopsByColor = loopsByColor;
        state.hiddenPlate = hiddenPlate;

        // build SVG
        const svgNS = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(svgNS, 'svg');
        svg.setAttribute('xmlns', svgNS);
        svg.setAttribute('viewBox', '0 0 ' + tw + ' ' + th);
        svg.setAttribute('width', state.origW);
        svg.setAttribute('height', state.origH);

        for (const c of order) {
          const loops = loopsByColor[c];
          if (!loops.length) continue;
          let d = '';
          for (const loop of loops) d += loopToPathD(loop, smooth) + ' ';
          if (!d.trim()) continue;
          const path = document.createElementNS(svgNS, 'path');
          path.setAttribute('d', d.trim());
          path.setAttribute('fill', palette[c].hex);
          path.setAttribute('fill-rule', 'evenodd');
          path.setAttribute('data-plate', c);
          svg.appendChild(path);
          totalPaths++;
          for (const l of loops) totalPoints += (l.length - 1);
        }

        state.svgEl = svg;

        // stats
        const serializer = new XMLSerializer();
        const svgStr = serializer.serializeToString(svg);
        const kb = (new Blob([svgStr]).size / 1024).toFixed(1);

        els.statsStrip.style.display = 'flex';
        els.statPlates.textContent = palette.filter(p => loopsByColor[palette.indexOf(p)]).length ? palette.length : palette.length;
        els.statPaths.textContent = totalPaths;
        els.statPoints.textContent = totalPoints.toLocaleString();
        els.statSize.textContent = kb + ' KB';

        els.ticketPlates.textContent = palette.length;

        buildPalettePanel();

        currentView = 'svg';
        els.viewSeg.querySelectorAll('button').forEach(b => b.classList.toggle('active', b.dataset.view === 'svg'));
        renderStage();

        els.downloadBtn.disabled = false;
        els.copyBtn.disabled = false;
        const modeNote = currentMode === 'bw' ? 'black & white' : 'colour';
        const bgNote = hiddenPlate >= 0 ? ' The largest plate was dropped for a transparent background.' : '';
        setHint('Traced into ' + palette.length + ' ' + modeNote + ' plates, ' + totalPaths + ' paths.' + bgNote + ' Edit any plate colour on the left, or download the SVG.');
      } catch (err) {
        console.error(err);
        setHint('Something went wrong while tracing: ' + err.message + '. Try a smaller image or fewer colours.');
      } finally {
        showLoading(false);
        els.traceBtn.disabled = false;
      }
    }, 30);
  }

  function showLoading(on, msg) {
    let ov = els.canvasFrame.querySelector('.loading-overlay');
    if (on) {
      if (!ov) {
        ov = document.createElement('div');
        ov.className = 'loading-overlay';
        ov.innerHTML = '<div class="spinner"></div><div class="msg"></div>';
        els.canvasFrame.appendChild(ov);
      }
      ov.querySelector('.msg').textContent = msg || 'Working…';
    } else if (ov) {
      ov.remove();
    }
  }

  // ---------------- palette panel ----------------
  function buildPalettePanel() {
    els.plates.innerHTML = '';
    const total = state.palette.reduce((s, p) => s + p.count, 0) || 1;
    state.order.forEach((c, i) => {
      const p = state.palette[c];
      const row = document.createElement('div');
      const isHidden = c === state.hiddenPlate;
      row.className = 'plate' + (isHidden ? ' plate-hidden' : '');
      const pct = ((p.count / total) * 100).toFixed(1);
      row.innerHTML =
        '<span class="num">' + String(i + 1).padStart(2, '0') + '</span>' +
        '<span class="swatch-wrap"><input type="color" value="' + p.hex + '" data-idx="' + c + '"></span>' +
        '<span class="hex mono">' + p.hex + '</span>' +
        '<span class="pct mono">' + pct + '%</span>' +
        (isHidden ? '<span class="bg-tag">transparent</span>' : '');
      els.plates.appendChild(row);
    });
    els.plates.querySelectorAll('input[type=color]').forEach(inp => {
      on(inp, 'input', e => {
        const idx = parseInt(e.target.dataset.idx, 10);
        const hex = e.target.value;
        state.palette[idx].hex = hex;
        if (state.svgEl) {
          const path = state.svgEl.querySelector('path[data-plate="' + idx + '"]');
          if (path) path.setAttribute('fill', hex);
        }
        const hexLabel = e.target.parentElement.nextElementSibling;
        if (hexLabel) hexLabel.textContent = hex;
        if (currentView === 'svg') renderStage();
      });
    });
  }

  // ---------------- export ----------------
  function serializedSVG() {
    if (!state.svgEl) return '';
    const clone = state.svgEl.cloneNode(true);
    clone.removeAttribute('class');
    const s = new XMLSerializer().serializeToString(clone);
    return '<?xml version="1.0" encoding="UTF-8"?>\n' + s;
  }

  function downloadSVG() {
    const str = serializedSVG();
    if (!str) return;
    const blob = new Blob([str], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const base = (state.fileMeta.name || 'artwork').replace(/\.[^.]+$/, '');
    a.href = url;
    a.download = base + '-traced.svg';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function copySVG() {
    const str = serializedSVG();
    if (!str) return;
    navigator.clipboard.writeText(str).then(() => {
      const orig = els.copyBtn.textContent;
      els.copyBtn.textContent = 'Copied!';
      setTimeout(() => { els.copyBtn.textContent = orig; }, 1400);
    }).catch(() => {
      setHint('Could not copy automatically — use Download SVG instead.');
    });
  }
  return function cleanup() {
    disposers.forEach((dispose) => dispose());
  };
}
