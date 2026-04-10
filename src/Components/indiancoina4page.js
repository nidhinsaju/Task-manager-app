import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./indiancoina4.css";

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
  return ""; /* default grey */
}

/* ─── Top Label ─── */
function TopLabelRow({ coin }) {
  if (!coin) return <div className="coin-label-row empty-row" />;
  const { metal, shape, diameter, weight, rarity } = coin;
  return (
    <div className="coin-label-row">
      <div className="coin-top-left">
        <div className="rarity-label-title">RARITY INDEX</div>
        <div className="rarity-grid-mini">
          {["C", "S", "R", "X"].map((key) => (
            <div
              key={key}
              className={`rarity-cell-mini ${rarityCellClass(key, rarity)}`}
            >
              {key}
            </div>
          ))}
        </div>
      </div>
      <div className="coin-white-col">
        <div className="coin-stripe-top" />
        <div className="coin-label-middle">
          <div className="coin-top-right">
            <div className="coin-spec-pair">
              <span className="coin-spec-key">Shape:</span>
              <span className="coin-spec-val">{shape || "—"}</span>
            </div>
            <div className="coin-spec-pair">
              <span className="coin-spec-key">Weight:</span>
              <span className="coin-spec-val">{weight || "—"}</span>
            </div>
            <div className="coin-spec-pair">
              <span className="coin-spec-key">Metal:</span>
              <span className="coin-spec-val">{metal || "—"}</span>
            </div>
            <div className="coin-spec-pair">
              <span className="coin-spec-key">Dia:</span>
              <span className="coin-spec-val">{diameter || "—"}</span>
            </div>
          </div>
        </div>
        <div className="coin-stripe-bottom" />
      </div>
    </div>
  );
}

/* ─── Bottom Label ─── */
function BottomLabelRow({ coin }) {
  if (!coin) return <div className="coin-label-row empty-row" />;
  const { denomination, year, mint } = coin;
  return (
    <div className="coin-label-row">
      <div className="coin-white-col">
        <div className="coin-stripe-top" />
        <div className="coin-label-middle">
          <div className="coin-bottom-left">
            {denomination && (
              <div className="coin-bottom-denomination">{denomination}</div>
            )}
          </div>
        </div>
        <div className="coin-stripe-bottom" />
      </div>
      <div className="coin-bottom-right">
        {year && <div className="coin-year-text">{year}</div>}
        {mint && <div className="coin-mint-text">{mint}</div>}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
function IndianCoinA4Page() {
  const contentRef = useRef(null);

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
  const [pdfName, setPdfName] = useState("indian-coins");
  const [editingId, setEditingId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

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

  /* ─── Helpers ─── */
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

  /* ─── NEW: Duplicate a coin ─── */
  /* Inserts the duplicate immediately after the original coin */
  const handleDuplicateCoin = (id) => {
    setCoins((prev) => {
      const idx = prev.findIndex((c) => c.id === id);
      if (idx === -1) return prev;
      const original = prev[idx];
      const duplicate = { ...original, id: Date.now() + Math.random() };
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
      contentRef.current.querySelectorAll(".coin-a4-page"),
    );
    if (!pageEls.length) return;

    setIsGenerating(true);

    try {
      const pdf = new jsPDF("portrait", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();

      for (let i = 0; i < pageEls.length; i++) {
        const canvas = await html2canvas(pageEls[i], {
          scale: 5,
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false,
          allowTaint: false,
          scrollX: 0,
          scrollY: -window.scrollY,
          windowWidth: document.documentElement.scrollWidth,
          windowHeight: document.documentElement.scrollHeight,
        });

        const imgData = canvas.toDataURL("image/png");
        const imgH = (canvas.height * pdfWidth) / canvas.width;
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, imgH);
      }

      pdf.save(`${pdfName.trim() || "indian-coins"}.pdf`);
    } finally {
      setIsGenerating(false);
    }
  };

  /* ─── Rarity badge style for list ─── */
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
    <div className="coin-page-wrapper">
      {/* ══ FORM PANEL ══ */}
      <div className="coin-form-panel">
        <div className="coin-top-bar">
          <div>
            <h2>Indian Coin Label Generator</h2>
            <p>
              Generate printable A4 pages of paired coin labels — top label with
              rarity &amp; specs, bottom label with denomination, year &amp;
              mint.
            </p>
          </div>
          <div className="coin-stats-badge">
            <span>{coins.length}</span>
            coins ready
          </div>
        </div>

        <form
          className="coin-label-form"
          onSubmit={editingId ? handleUpdateCoin : handleAddCoin}
        >
          <div className="coin-form-field">
            <label>Denomination</label>
            <input
              type="text"
              value={denomination}
              onChange={(e) => setDenomination(e.target.value)}
              placeholder="e.g., 1 Rupees"
            />
          </div>
          <div className="coin-form-field">
            <label>Year</label>
            <input
              type="text"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="e.g., 1920"
            />
          </div>
          <div className="coin-form-field">
            <label>Mint</label>
            <input
              type="text"
              value={mint}
              onChange={(e) => setMint(e.target.value)}
              placeholder="e.g., BOM / CAL / HYD"
            />
          </div>
          <div className="coin-form-field">
            <label>Metal</label>
            <input
              type="text"
              value={metal}
              onChange={(e) => setMetal(e.target.value)}
              placeholder="e.g., Cu-Ni"
            />
          </div>
          <div className="coin-form-field">
            <label>Shape</label>
            <input
              type="text"
              value={shape}
              onChange={(e) => setShape(e.target.value)}
              placeholder="e.g., 11-Gon"
            />
          </div>
          <div className="coin-form-field">
            <label>Diameter</label>
            <input
              type="text"
              value={diameter}
              onChange={(e) => setDiameter(e.target.value)}
              placeholder="e.g., 26mm"
            />
          </div>
          <div className="coin-form-field">
            <label>Weight</label>
            <input
              type="text"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="e.g., 6g"
            />
          </div>

          {/* Rarity Selector */}
          <div className="rarity-selector">
            <label>Rarity Index</label>
            <div className="rarity-buttons">
              {Object.entries(RARITY_CONFIG).map(([key, cfg]) => (
                <button
                  key={key}
                  type="button"
                  className={`rarity-btn ${rarity === key ? cfg.activeClass : ""}`}
                  onClick={() => setRarity((prev) => (prev === key ? "" : key))}
                >
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="coin-form-actions">
            <button type="submit" className="coin-add-btn">
              {editingId ? "Update Coin" : "Add Coin"}
            </button>
            {editingId && (
              <button
                type="button"
                className="coin-cancel-btn"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              className="coin-page-btn"
              onClick={handleAddPage}
            >
              Add Blank Page
            </button>
            {pageCount > autoPages && (
              <button
                type="button"
                className="coin-remove-page-btn"
                onClick={handleRemovePage}
              >
                Remove Blank Page
              </button>
            )}
          </div>
        </form>

        <div className="coin-builder-footer">
          <div>
            {totalPages} page{totalPages !== 1 ? "s" : ""} in preview
          </div>
          <div>{coinsPerPage} coin slots per page</div>
          <div>Each coin = 2 stacked labels (top + bottom)</div>
        </div>

        {/* ── Coin List ── */}
        {coins.length > 0 && (
          <div className="coin-label-list">
            {coins.map((c) => (
              <div className="coin-label-item" key={c.id}>
                <div className="coin-label-item-info">
                  <span className="coin-item-title">
                    {[c.ruler, c.denomination].filter(Boolean).join(" · ")}
                  </span>
                  <small>
                    {[c.year, c.mint, c.metal, c.shape, c.diameter, c.weight]
                      .filter(Boolean)
                      .join(" | ")}
                  </small>
                </div>
                {c.rarity && (
                  <div
                    className="coin-item-rarity-badge"
                    style={rarityBadgeStyle(c.rarity)}
                  >
                    {c.rarity}
                  </div>
                )}
                {/* ── NEW: Duplicate button ── */}
                <button
                  type="button"
                  className="coin-item-btn coin-item-duplicate-btn"
                  onClick={() => handleDuplicateCoin(c.id)}
                  title="Duplicate this coin label"
                >
                  ⧉ Duplicate
                </button>
                <button
                  type="button"
                  className="coin-item-btn coin-item-edit-btn"
                  onClick={() => handleEditCoin(c.id)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="coin-item-btn coin-item-remove-btn"
                  onClick={() => handleRemoveCoin(c.id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {/* PDF Name */}
        <div className="coin-form-field coin-pdf-name-field">
          <label>PDF File Name</label>
          <input
            type="text"
            value={pdfName}
            onChange={(e) => setPdfName(e.target.value)}
            placeholder="indian-coins"
          />
        </div>

        <div className="coin-label-actions">
          <button
            type="button"
            className="coin-pdf-btn"
            onClick={handleMakePdf}
            disabled={isGenerating}
            style={{ opacity: isGenerating ? 0.7 : 1 }}
          >
            {isGenerating ? "Generating PDF…" : "Generate PDF"}
          </button>
          <Link
            to={`${process.env.PUBLIC_URL || ""}/Coin-Label-Generator`}
            className="coin-back-link"
          >
            Back to Home
          </Link>
        </div>
      </div>

      {/* ══ A4 PREVIEW ══ */}
      <div className="coin-preview-panel" ref={contentRef}>
        {pages.map((pageCoins, pageIndex) => (
          <div className="coin-a4-page" key={pageIndex}>
            <div className="coin-page-header">
              <div>Page {pageIndex + 1}</div>
              <div>{pageCoins.length} coins</div>
            </div>

            <div className="coin-page-inner">
              <div className="coin-page-grid">
                {getPageSlots(pageCoins).map((coin, slotIndex) => (
                  <div className="coin-slot" key={`${pageIndex}-${slotIndex}`}>
                    <BottomLabelRow coin={coin} />
                    <TopLabelRow coin={coin} />
                  </div>
                ))}
              </div>
            </div>

            <div className="coin-page-footer">
              Indian Coin Collection · Page {pageIndex + 1} of {totalPages}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default IndianCoinA4Page;