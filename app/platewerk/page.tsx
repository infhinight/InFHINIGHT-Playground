"use client";

import { useEffect, useRef } from "react";

import { initPlatewerk } from "./platewerk-engine";
import "./platewerk.css";
import { Footer } from "@/components/sections/footer";

/**
 * Platewerk — raster (JPG/PNG) to colour-separated SVG tracer.
 *
 * This route intentionally sits outside the (marketing) route group, so
 * it does NOT get the marketing SiteHeader/Footer — it's a full-screen
 * tool with its own top bar and footer (see platewerk.css / the markup
 * below), not a marketing page. See app/(marketing)/layout.tsx vs.
 * app/layout.tsx for how that split works.
 *
 * All interactivity (file drop, sliders, tracing, palette editing,
 * export) is handled by the ported vanilla JS in platewerk-engine.js,
 * started here in a useEffect once this JSX has mounted. React itself
 * only renders the initial markup once and never re-renders it — the
 * engine takes it from there, exactly like the original static HTML
 * page did.
 */
export default function PlatewerkPage() {
  const initialized = useRef(false);

  useEffect(() => {
    // Guard against React StrictMode's dev-only double-invoke still
    // running init twice on the same mount pass before cleanup fires.
    if (initialized.current) return;
    initialized.current = true;

    const cleanup = initPlatewerk();
    return () => {
      cleanup();
      initialized.current = false;
    };
  }, []);

  return (
  <>
    <div className="platewerk-app">
      <div className="topbar">
        <div className="brand">
          <div className="mark">
            <svg viewBox="0 0 30 30" fill="none">
              <circle cx="15" cy="15" r="13" stroke="var(--cyan)" strokeWidth="1.4" />
              <circle
                cx="15"
                cy="15"
                r="13"
                stroke="var(--magenta)"
                strokeWidth="1.4"
                strokeDasharray="2 4"
                transform="rotate(40 15 15)"
              />
              <path d="M15 4V26M4 15H26" stroke="var(--yellow)" strokeWidth="1" />
            </svg>
          </div>
          <div>
            <div className="word">Platewerk</div>
            <div className="tag">raster &rarr; colour separations &rarr; svg</div>
          </div>
        </div>
        <div className="ticket">
          <span>
            job <span className="dot">/</span> <b id="ticketFile">no file loaded</b>
          </span>
          <span>
            size <span className="dot">/</span> <b id="ticketSize">—</b>
          </span>
          <span>
            plates <span className="dot">/</span> <b id="ticketPlates">—</b>
          </span>
        </div>
      </div>

      <div className="workbench">
        {/* LEFT RAIL : CONTROLS */}
        <div className="rail">
          <div>
            <div className="section-label">01 — Load artwork</div>
            <div className="dropzone" id="dropzone">
              <input type="file" id="fileInput" accept="image/png, image/jpeg" />
              <div className="icon">
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{ margin: "0 auto" }}
                >
                  <path
                    d="M12 3v12M12 3l-4 4M12 3l4 4"
                    stroke="#e8e3d8"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M4 15v3a2 2 0 002 2h12a2 2 0 002-2v-3"
                    stroke="#e8e3d8"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="title">Drop a JPG or PNG, or click to browse</div>
              <div className="sub">processed locally in your browser</div>
            </div>
            <div
              id="fileChip"
              style={{ display: "none", marginTop: "10px" }}
              className="file-chip"
            >
              <span>
                file: <b id="fileName">—</b>
              </span>
              <span id="fileDims">—</span>
            </div>
          </div>

          <div>
            <div className="section-label">02 — Separation settings</div>

            <div className="field" style={{ marginBottom: "16px" }}>
              <div className="field-row">
                <span>Mode</span>
              </div>
              <div className="seg" id="modeSeg">
                <button data-val="color" className="active">
                  Colour
                </button>
                <button data-val="bw">Black &amp; White</button>
              </div>
            </div>

            <div className="field" id="colorsField" style={{ marginBottom: "16px" }}>
              <div className="field-row">
                <span>Colour plates (palette size)</span>
                <span className="val" id="colorsVal">
                  24
                </span>
              </div>
              <input
                type="range"
                id="colorsSlider"
                min="2"
                max="256"
                defaultValue="24"
                step="1"
              />
            </div>

            <div
              className="field"
              id="bwField"
              style={{ marginBottom: "16px", display: "none" }}
            >
              <div className="field-row">
                <span>Black / white threshold</span>
                <span className="val" id="bwThresholdVal">
                  128
                </span>
              </div>
              <input
                type="range"
                id="bwThresholdSlider"
                min="1"
                max="254"
                defaultValue="128"
                step="1"
              />
            </div>

            <div className="field" style={{ marginBottom: "16px" }}>
              <div className="field-row">
                <span>Trace resolution</span>
              </div>
              <div className="seg" id="resSeg">
                <button data-val="300">Draft</button>
                <button data-val="500" className="active">
                  Standard
                </button>
                <button data-val="800">Fine</button>
              </div>
            </div>

            <div className="field" style={{ marginBottom: "16px" }}>
              <div className="field-row">
                <span>Simplify paths</span>
                <span className="val" id="simplifyVal">
                  1.0
                </span>
              </div>
              <input
                type="range"
                id="simplifySlider"
                min="0"
                max="4"
                defaultValue="1"
                step="0.2"
              />
            </div>

            <div className="field" style={{ marginBottom: "16px" }}>
              <div className="field-row">
                <span>Discard specks under</span>
                <span className="val" id="minAreaVal">
                  6px
                </span>
              </div>
              <input
                type="range"
                id="minAreaSlider"
                min="0"
                max="40"
                defaultValue="6"
                step="1"
              />
            </div>

            <label className="checkbox-row" style={{ marginBottom: "6px" }}>
              <input type="checkbox" id="smoothToggle" defaultChecked />
              Round corners (smoother plates)
            </label>
            <label className="checkbox-row" style={{ marginBottom: "6px" }}>
              <input type="checkbox" id="bgToggle" defaultChecked />
              Treat transparent pixels as background
            </label>
            <label className="checkbox-row">
              <input type="checkbox" id="transparentBgToggle" />
              Transparent background (drop largest plate)
            </label>
          </div>

          <div>
            <div className="btn-row">
              <button className="btn primary" id="traceBtn" disabled>
                Trace to SVG
              </button>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div className="section-label">03 — Ink plates (edit colours)</div>
            <div className="plates" id="plates">
              <div className="plates-empty">
                Trace an image to break it into colour plates. Click any swatch to
                recolour that plate — the SVG updates instantly, no re-tracing
                needed.
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT STAGE : PREVIEW */}
        <div className="stage">
          <div className="stage-head">
            <div className="section-label" style={{ margin: 0 }}>
              Proof
            </div>
            <div className="seg view-toggle" id="viewSeg">
              <button data-view="original" className="active">
                Original
              </button>
              <button data-view="svg">Traced SVG</button>
            </div>
          </div>

          <div className="canvas-frame" id="canvasFrame">
            <div className="reg-mark tl">
              <svg viewBox="0 0 16 16">
                <circle cx="8" cy="8" r="6" stroke="#e8e3d8" strokeWidth="1" fill="none" />
                <path d="M8 0V16M0 8H16" stroke="#e8e3d8" strokeWidth="0.8" />
              </svg>
            </div>
            <div className="reg-mark tr">
              <svg viewBox="0 0 16 16">
                <circle cx="8" cy="8" r="6" stroke="#e8e3d8" strokeWidth="1" fill="none" />
                <path d="M8 0V16M0 8H16" stroke="#e8e3d8" strokeWidth="0.8" />
              </svg>
            </div>
            <div className="reg-mark bl">
              <svg viewBox="0 0 16 16">
                <circle cx="8" cy="8" r="6" stroke="#e8e3d8" strokeWidth="1" fill="none" />
                <path d="M8 0V16M0 8H16" stroke="#e8e3d8" strokeWidth="0.8" />
              </svg>
            </div>
            <div className="reg-mark br">
              <svg viewBox="0 0 16 16">
                <circle cx="8" cy="8" r="6" stroke="#e8e3d8" strokeWidth="1" fill="none" />
                <path d="M8 0V16M0 8H16" stroke="#e8e3d8" strokeWidth="0.8" />
              </svg>
            </div>
            <div className="placeholder" id="placeholder">
              <div className="big">Press proof empty</div>
              no artwork loaded yet
            </div>
          </div>

          <div className="stats-strip" id="statsStrip" style={{ display: "none" }}>
            <div className="stat">
              <div className="k">Plates</div>
              <div className="v" id="statPlates">
                —
              </div>
            </div>
            <div className="stat">
              <div className="k">Paths</div>
              <div className="v" id="statPaths">
                —
              </div>
            </div>
            <div className="stat">
              <div className="k">Points</div>
              <div className="v" id="statPoints">
                —
              </div>
            </div>
            <div className="stat">
              <div className="k">SVG size</div>
              <div className="v" id="statSize">
                —
              </div>
            </div>
          </div>

          <div className="btn-row">
            <button className="btn" id="downloadBtn" disabled>
              Download SVG
            </button>
            <button className="btn" id="copyBtn" disabled>
              Copy SVG code
            </button>
          </div>

          <div className="hint" id="statusHint">
            Load a JPG or PNG on the left to begin. Everything runs in your browser
            — nothing is uploaded anywhere.
          </div>
        </div>
      </div>

      <footer>
        <span>platewerk — client-side colour vectoriser</span>
        <span>k-means quantisation · even-odd contour tracing · no server round-trip</span>
      </footer>
    </div>
    <Footer />
    </>
  );
}
