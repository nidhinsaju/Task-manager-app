import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./AkamCoinsA4.css";

/* ─── Rarity colour mapping ─── */
const RARITY_CONFIG = {
  C: { label: "C — Common", activeClass: "active-C" },
  S: { label: "S — Scarce", activeClass: "active-S" },
  R: { label: "R — Rare", activeClass: "active-R" },
  X: { label: "X — Extra Rare", activeClass: "active-X" },
};

/* Helper: derive per-cell rarity class for the mini grid */
function rarityCellClass(cellKey, selectedRarity) {
  if (selectedRarity === cellKey) return `rarity-${cellKey}`;
  return "";
}

/* ════════════════════════════════════════════
   TOP LABEL — Rarity Index (left) + Specs
   ════════════════════════════════════════════ */
function AKAMTopLabelRow({ coin }) {
  if (!coin) return <div className="akam-label-row akam-empty-row" />;
  const { metal, shape, diameter, weight, rarity } = coin;
  return (
    <div className="akam-label-row">
      {/* Black rarity box — full height, left side. CSS provides the thin black cut line via border-right */}
      <div className="akam-top-left">
        <div className="akam-rarity-label-title">RARITY INDEX</div>
        <div className="akam-rarity-grid-mini">
          {["C", "S", "R", "X"].map((key) => (
            <div
              key={key}
              className={`akam-rarity-cell-mini ${rarityCellClass(key, rarity)}`}
            >
              {key}
            </div>
          ))}
        </div>
      </div>
      {/* White col: orange stripe → specs → green stripe */}
      <div className="akam-white-col">
        <div className="akam-stripe-top" />
        <div className="akam-label-middle">
          <div className="akam-top-right">
            <div className="akam-spec-pair">
              <span className="akam-spec-key">Shape:</span>
              <span className="akam-spec-val">{shape || "—"}</span>
            </div>
            <div className="akam-spec-pair">
              <span className="akam-spec-key">Weight:</span>
              <span className="akam-spec-val">{weight || "—"}</span>
            </div>
            <div className="akam-spec-pair">
              <span className="akam-spec-key">Metal:</span>
              <span className="akam-spec-val">{metal || "—"}</span>
            </div>
            <div className="akam-spec-pair">
              <span className="akam-spec-key">Dia:</span>
              <span className="akam-spec-val">{diameter || "—"}</span>
            </div>
          </div>
        </div>
        <div className="akam-stripe-bottom" />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   BOTTOM LABEL — Logo image (left) + Denomination/Year/Mint
   ════════════════════════════════════════════ */

/*
  Real DOM split border with blended shadow at the saffron/green junction.
  html2canvas renders plain divs perfectly — no CSS gradient tricks are lost.
  The .akam-logo-border-side-shadow in CSS uses a warm-brown → near-black → deep-green
  gradient to mimic the ink-bleed / colour-mix shadow seen on physical labels.
*/
function LogoBorder() {
  return (
    <>
      {/* Top edge — full saffron */}
      <div className="akam-logo-border-top" />

      {/* Bottom edge — full green */}
      <div className="akam-logo-border-bottom" />

      {/* Left edge — top half saffron / blended shadow / bottom half green */}
      <div className="akam-logo-border-left">
        <div className="akam-logo-border-side-top" />
        <div className="akam-logo-border-side-shadow" />
        <div className="akam-logo-border-side-bottom" />
      </div>

      {/* Right edge — top half saffron / blended shadow / bottom half green */}
      <div className="akam-logo-border-right">
        <div className="akam-logo-border-side-top" />
        <div className="akam-logo-border-side-shadow" />
        <div className="akam-logo-border-side-bottom" />
      </div>
    </>
  );
}

function AKAMBottomLabelRow({ coin, logoDataUrl }) {
  if (!coin) return <div className="akam-label-row akam-empty-row" />;
  const { denomination, year, mint } = coin;
  return (
    <div className="akam-label-row">
      {/* Logo box with real DOM saffron/green split border + blended shadow */}
      <div
        className={`akam-logo-img-box${logoDataUrl ? "" : " akam-logo-placeholder"}`}
      >
        <LogoBorder />
        {logoDataUrl && <img src={logoDataUrl} alt="AKAM Logo" />}
      </div>

      {/* White col: orange stripe → denomination + subtitle → green stripe */}
      <div className="akam-white-col">
        <div className="akam-stripe-top" />
        <div className="akam-label-middle">
          <div className="akam-bottom-left">
            {denomination && (
              <div className="akam-bottom-denomination">{denomination}</div>
            )}
            <div className="akam-bottom-subtitle">AZADI KA AMRIT MAHOTSAV</div>
          </div>
        </div>
        <div className="akam-stripe-bottom" />
      </div>

      {/* Black year/mint box — full height, right side */}
      <div className="akam-bottom-right">
        {year && <div className="akam-year-text">{year}</div>}
        {mint && <div className="akam-mint-text">{mint}</div>}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
function AKAMCoinA4Page() {
  const contentRef = useRef(null);
  const fileInputRef = useRef(null);

  /* ─── Logo state ─── */
  const [logoDataUrl, setLogoDataUrl] = useState(null);
  const [logoFileName, setLogoFileName] = useState("");

  /* ─── Form state ─── */
  const [denomination, setDenomination] = useState("");
  const [year, setYear] = useState("");
  const [mint, setMint] = useState("");
  const [metal, setMetal] = useState("");
  const [shape, setShape] = useState("");
  const [diameter, setDiameter] = useState("");
  const [weight, setWeight] = useState("");
  const [rarity, setRarity] = useState("");

  /* ─── App state ─── */
  const [coins, setCoins] = useState([]);
  const [pageCount, setPageCount] = useState(1);
  const [pdfName, setPdfName] = useState("akam-coins");
  const [editingId, setEditingId] = useState(null);

  const coinsPerPage = 40;
  const autoPages = Math.max(1, Math.ceil(coins.length / coinsPerPage));
  const totalPages = Math.max(autoPages, pageCount);
  const pages = Array.from({ length: totalPages }, (_, pi) =>
    coins.slice(pi * coinsPerPage, (pi + 1) * coinsPerPage),
  );

  const getPageSlots = (pageCoins) => {
    const empty = coinsPerPage - pageCoins.length;
    return [...pageCoins, ...Array.from({ length: empty }, () => null)];
  };

  /* ─── Logo upload handler ─── */
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogoFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setLogoDataUrl(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleLogoClear = () => {
    setLogoDataUrl(null);
    setLogoFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ─── Form helpers ─── */
  const resetForm = () => {
    setDenomination("");
    setYear("");
    setMint("");
    setMetal("");
    setShape("");
    setDiameter("");
    setWeight("");
    setRarity("");
    setEditingId(null);
  };

  const buildCoin = (id) => ({
    id,
    denomination: denomination.trim(),
    year: year.trim(),
    mint: mint.trim(),
    metal: metal.trim(),
    shape: shape.trim(),
    diameter: diameter.trim(),
    weight: weight.trim(),
    rarity,
  });

  const handleAddCoin = (e) => {
    e.preventDefault();
    setCoins((prev) => [...prev, buildCoin(Date.now())]);
    resetForm();
  };

  const handleUpdateCoin = (e) => {
    e.preventDefault();
    setCoins((prev) =>
      prev.map((c) => (c.id === editingId ? buildCoin(editingId) : c)),
    );
    resetForm();
  };

  const handleEditCoin = (id) => {
    const c = coins.find((x) => x.id === id);
    if (!c) return;
    setDenomination(c.denomination);
    setYear(c.year);
    setMint(c.mint);
    setMetal(c.metal);
    setShape(c.shape);
    setDiameter(c.diameter);
    setWeight(c.weight);
    setRarity(c.rarity);
    setEditingId(id);
  };

  /* ─── Duplicate: insert a copy right after the original ─── */
  const handleDuplicateCoin = (id) => {
    setCoins((prev) => {
      const idx = prev.findIndex((c) => c.id === id);
      if (idx === -1) return prev;
      const original = prev[idx];
      const duplicate = { ...original, id: Date.now() };
      const next = [...prev];
      next.splice(idx + 1, 0, duplicate);
      return next;
    });
  };

  const handleRemoveCoin = (id) =>
    setCoins((prev) => prev.filter((c) => c.id !== id));

  const handleAddPage = () => setPageCount((n) => n + 1);
  const handleRemovePage = () => {
    if (pageCount > autoPages) setPageCount((n) => n - 1);
  };

  /* ─── PDF Generation ─── */
  const handleMakePdf = async () => {
    if (!contentRef.current) return;
    const pageEls = Array.from(
      contentRef.current.querySelectorAll(".akam-a4-page"),
    );
    if (!pageEls.length) return;

    const pdf = new jsPDF("portrait", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();

    for (let i = 0; i < pageEls.length; i++) {
      const canvas = await html2canvas(pageEls[i], {
        scale: 5,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");
      const imgH = (canvas.height * pdfWidth) / canvas.width;
      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, imgH);
    }

    pdf.save(`${pdfName.trim() || "akam-coins"}.pdf`);
  };

  /* ─── Rarity badge style for coin list ─── */
  const rarityBadgeStyle = (r) => {
    const map = {
      C: { background: "#94e70f", color: "#fff" },
      S: { background: "#caca36", color: "#fff" },
      R: { background: "#ff8400", color: "#fff" },
      X: { background: "#ef4444", color: "#fff" },
    };
    return map[r] || { background: "#e2e8f0", color: "#475569" };
  };

  /* ─── Render ─── */
  return (
    <div className="akam-page-wrapper">
      {/* ══ FORM PANEL ══ */}
      <div className="akam-form-panel">
        <div className="akam-top-bar">
          <div>
            <h2>AKAM Coin Label Generator</h2>
            <p>
              Generate printable A4 pages of AKAM coin labels — bottom label
              with your uploaded AKAM logo, denomination, year &amp; mint; top
              label with rarity index &amp; coin specs.
            </p>
          </div>
          <div className="akam-stats-badge">
            <span>{coins.length}</span>
            coins ready
          </div>
        </div>

        <form
          className="akam-label-form"
          onSubmit={editingId ? handleUpdateCoin : handleAddCoin}
        >
          {/* ── AKAM Logo Upload ── */}
          <div className="akam-logo-upload-field">
            <label>AKAM Logo Image</label>
            <div className="akam-logo-upload-inner">
              <label className="akam-logo-upload-btn">
                📁 {logoDataUrl ? "Change Logo" : "Upload Logo"}
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                />
              </label>
              {logoDataUrl && (
                <div className="akam-logo-preview-wrap">
                  <img
                    className="akam-logo-preview-img"
                    src={logoDataUrl}
                    alt="Logo preview"
                  />
                  <span className="akam-logo-preview-name">{logoFileName}</span>
                  <button
                    type="button"
                    className="akam-logo-clear-btn"
                    onClick={handleLogoClear}
                  >
                    ✕ Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── Coin fields ── */}
          <div className="akam-form-field">
            <label>Denomination</label>
            <input
              type="text"
              value={denomination}
              onChange={(e) => setDenomination(e.target.value)}
              placeholder="e.g., 20 Rupees"
            />
          </div>
          <div className="akam-form-field">
            <label>Year</label>
            <input
              type="text"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="e.g., 2023"
            />
          </div>
          <div className="akam-form-field">
            <label>Mint</label>
            <input
              type="text"
              value={mint}
              onChange={(e) => setMint(e.target.value)}
              placeholder="e.g., BOM / CAL / HYD"
            />
          </div>

          <div className="akam-form-field">
            <label>Shape</label>
            <input
              type="text"
              value={shape}
              onChange={(e) => setShape(e.target.value)}
              placeholder="e.g., 11-Gon"
            />
          </div>
          <div className="akam-form-field">
            <label>Weight</label>
            <input
              type="text"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="e.g., 8g"
            />
          </div>
          <div className="akam-form-field">
            <label>Metal</label>
            <input
              type="text"
              value={metal}
              onChange={(e) => setMetal(e.target.value)}
              placeholder="e.g., Cu-Ni"
            />
          </div>
          <div className="akam-form-field">
            <label>Diameter</label>
            <input
              type="text"
              value={diameter}
              onChange={(e) => setDiameter(e.target.value)}
              placeholder="e.g., 27mm"
            />
          </div>

          {/* Rarity Selector */}
          <div className="akam-rarity-selector">
            <label>Rarity Index</label>
            <div className="akam-rarity-buttons">
              {Object.entries(RARITY_CONFIG).map(([key, cfg]) => (
                <button
                  key={key}
                  type="button"
                  className={`akam-rarity-btn ${rarity === key ? cfg.activeClass : ""}`}
                  onClick={() => setRarity((prev) => (prev === key ? "" : key))}
                >
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="akam-form-actions">
            <button type="submit" className="akam-add-btn">
              {editingId ? "Update Coin" : "Add Coin"}
            </button>
            {editingId && (
              <button
                type="button"
                className="akam-cancel-btn"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              className="akam-page-btn"
              onClick={handleAddPage}
            >
              Add Blank Page
            </button>
            {pageCount > autoPages && (
              <button
                type="button"
                className="akam-remove-page-btn"
                onClick={handleRemovePage}
              >
                Remove Blank Page
              </button>
            )}
          </div>
        </form>

        <div className="akam-builder-footer">
          <div>
            {totalPages} page{totalPages !== 1 ? "s" : ""} in preview
          </div>
          <div>{coinsPerPage} coin slots per page</div>
          <div>Each coin = 2 stacked labels (top + bottom)</div>
        </div>

        {/* ── Coin List ── */}
        {coins.length > 0 && (
          <div className="akam-label-list">
            {coins.map((c) => (
              <div className="akam-label-item" key={c.id}>
                <div className="akam-label-item-info">
                  <span className="akam-item-title">
                    {c.denomination || "—"}
                  </span>
                  <small>
                    {[c.year, c.mint, c.metal, c.shape, c.diameter, c.weight]
                      .filter(Boolean)
                      .join(" | ")}
                  </small>
                </div>
                {c.rarity && (
                  <div
                    className="akam-item-rarity-badge"
                    style={rarityBadgeStyle(c.rarity)}
                  >
                    {c.rarity}
                  </div>
                )}
                <button
                  type="button"
                  className="akam-item-btn akam-item-duplicate-btn"
                  onClick={() => handleDuplicateCoin(c.id)}
                  title="Duplicate this coin label"
                >
                  Duplicate
                </button>
                <button
                  type="button"
                  className="akam-item-btn akam-item-edit-btn"
                  onClick={() => handleEditCoin(c.id)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="akam-item-btn akam-item-remove-btn"
                  onClick={() => handleRemoveCoin(c.id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {/* PDF Name */}
        <div className="akam-form-field akam-pdf-name-field">
          <label>PDF File Name</label>
          <input
            type="text"
            value={pdfName}
            onChange={(e) => setPdfName(e.target.value)}
            placeholder="akam-coins"
          />
        </div>

        <div className="akam-label-actions">
          <button
            type="button"
            className="akam-pdf-btn"
            onClick={handleMakePdf}
          >
            Generate PDF
          </button>
          <Link
            to={`${process.env.PUBLIC_URL || ""}/Coin-Label-Generator`}
            className="akam-back-link"
          >
            Back to Home
          </Link>
        </div>
      </div>

      {/* ══ A4 PREVIEW ══ */}
      <div className="akam-preview-panel" ref={contentRef}>
        {pages.map((pageCoins, pageIndex) => (
          <div className="akam-a4-page" key={pageIndex}>
            <div className="akam-page-header">
              <div>Page {pageIndex + 1}</div>
              <div>{pageCoins.length} coins</div>
            </div>

            <div className="akam-page-inner">
              <div className="akam-page-grid">
                {getPageSlots(pageCoins).map((coin, slotIndex) => (
                  <div className="akam-slot" key={`${pageIndex}-${slotIndex}`}>
                    {/* Bottom label first (denomination row) */}
                    <AKAMBottomLabelRow coin={coin} logoDataUrl={logoDataUrl} />
                    {/* Top label second (specs row) */}
                    <AKAMTopLabelRow coin={coin} />
                  </div>
                ))}
              </div>
            </div>

            <div className="akam-page-footer">
              AKAM Coin Collection · Page {pageIndex + 1} of {totalPages}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AKAMCoinA4Page;
