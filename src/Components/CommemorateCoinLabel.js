import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./CommemorateCoinLabel.css";

/* ─── Rarity colour mapping ─── */
const COMMEM_RARITY_CONFIG = {
  C: { label: "C — Common", activeClass: "commem-active-C" },
  S: { label: "S — Scarce", activeClass: "commem-active-S" },
  R: { label: "R — Rare", activeClass: "commem-active-R" },
  X: { label: "X — Extra Rare", activeClass: "commem-active-X" },
};

/* Helper: derive per-cell rarity class for the mini grid */
function commemRarityCellClass(cellKey, selectedRarity) {
  if (selectedRarity === cellKey) return `commem-rarity-${cellKey}`;
  return "";
}

/* ─── Top Label ─── */
function CommemTopLabelRow({ coin }) {
  if (!coin) return <div className="commem-label-row commem-empty-row" />;
  const { metal, shape, diameter, weight, rarity } = coin;
  return (
    <div className="commem-label-row">
      <div className="commem-top-left">
        <div className="commem-rarity-label-title">RARITY INDEX</div>
        <div className="commem-rarity-grid-mini">
          {["C", "S", "R", "X"].map((key) => (
            <div
              key={key}
              className={`commem-rarity-cell-mini ${commemRarityCellClass(key, rarity)}`}
            >
              {key}
            </div>
          ))}
        </div>
      </div>
      <div className="commem-white-col">
        <div className="commem-stripe-top" />
        <div className="commem-label-middle">
          <div className="commem-top-right">
            <div className="commem-spec-pair">
              <span className="commem-spec-key">Shape:</span>
              <span className="commem-spec-val">{shape || "—"}</span>
            </div>
            <div className="commem-spec-pair">
              <span className="commem-spec-key">Weight:</span>
              <span className="commem-spec-val">{weight || "—"}</span>
            </div>
            <div className="commem-spec-pair">
              <span className="commem-spec-key">Metal:</span>
              <span className="commem-spec-val">{metal || "—"}</span>
            </div>
            <div className="commem-spec-pair">
              <span className="commem-spec-key">Dia:</span>
              <span className="commem-spec-val">{diameter || "—"}</span>
            </div>
          </div>
        </div>
        <div className="commem-stripe-bottom" />
      </div>
    </div>
  );
}

/* ─── Bottom Label ─── */
function CommemBottomLabelRow({ coin }) {
  if (!coin) return <div className="commem-label-row commem-empty-row" />;
  const { denomination, commemorateName, year, mint } = coin;
  return (
    <div className="commem-label-row">
      <div className="commem-white-col">
        <div className="commem-stripe-top" />
        <div className="commem-label-middle">
          <div className="commem-bottom-left">
            {denomination && (
              <div className="commem-bottom-denomination">{denomination}</div>
            )}
            {commemorateName && (
              <div className="commem-bottom-commemorate">{commemorateName}</div>
            )}
          </div>
        </div>
        <div className="commem-stripe-bottom" />
      </div>
      <div className="commem-bottom-right">
        {year && <div className="commem-year-text">{year}</div>}
        {mint && <div className="commem-mint-text">{mint}</div>}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
function CommemorativeCoinA4Page() {
  const contentRef = useRef(null);

  /* ─── Form state ─── */
  const [denomination, setDenomination] = useState("");
  const [commemorateName, setCommemorateNametate] = useState("");
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
  const [pdfName, setPdfName] = useState("commemorative-coins");
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
  const commemResetForm = () => {
    setDenomination("");
    setCommemorateNametate("");
    setYear("");
    setMint("");
    setMetal("");
    setShape("");
    setDiameter("");
    setWeight("");
    setRarity("");
    setEditingId(null);
  };

  const commemBuildCoin = (id) => ({
    id,
    denomination: denomination.trim(),
    commemorateName: commemorateName.trim(),
    year: year.trim(),
    mint: mint.trim(),
    metal: metal.trim(),
    shape: shape.trim(),
    diameter: diameter.trim(),
    weight: weight.trim(),
    rarity,
  });

  const commemHandleAddCoin = (e) => {
    e.preventDefault();
    setCoins((prev) => [...prev, commemBuildCoin(Date.now())]);
    commemResetForm();
  };

  const commemHandleUpdateCoin = (e) => {
    e.preventDefault();
    setCoins((prev) =>
      prev.map((c) => (c.id === editingId ? commemBuildCoin(editingId) : c)),
    );
    commemResetForm();
  };

  const commemHandleEditCoin = (id) => {
    const c = coins.find((x) => x.id === id);
    if (!c) return;
    setDenomination(c.denomination);
    setCommemorateNametate(c.commemorateName);
    setYear(c.year);
    setMint(c.mint);
    setMetal(c.metal);
    setShape(c.shape);
    setDiameter(c.diameter);
    setWeight(c.weight);
    setRarity(c.rarity);
    setEditingId(id);
  };

  const commemHandleRemoveCoin = (id) =>
    setCoins((prev) => prev.filter((c) => c.id !== id));

  /* ─── Duplicate coin — inserts copy right after the original ─── */
  const commemHandleDuplicateCoin = (id) => {
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

  const commemHandleAddPage = () => setPageCount((n) => n + 1);
  const commemHandleRemovePage = () => {
    if (pageCount > autoPages) setPageCount((n) => n - 1);
  };

  /* ─── PDF Generation ─── */
  const commemHandleMakePdf = async () => {
    if (!contentRef.current) return;
    const pageEls = Array.from(
      contentRef.current.querySelectorAll(".commem-a4-page"),
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

      pdf.save(`${pdfName.trim() || "commemorative-coins"}.pdf`);
    } finally {
      setIsGenerating(false);
    }
  };

  /* ─── Rarity badge style for list ─── */
  const commemRarityBadgeStyle = (r) => {
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
    <div className="commem-page-wrapper">
      {/* ══ FORM PANEL ══ */}
      <div className="commem-form-panel">
        <div className="commem-top-bar">
          <div>
            <h2>Commemorative Coin Label Generator</h2>
            <p>
              Generate printable A4 pages of paired coin labels — top label with
              rarity &amp; specs, bottom label with denomination, commemorate
              name, year &amp; mint.
            </p>
          </div>
          <div className="commem-stats-badge">
            <span>{coins.length}</span>
            coins ready
          </div>
        </div>

        <form
          className="commem-label-form"
          onSubmit={editingId ? commemHandleUpdateCoin : commemHandleAddCoin}
        >
          <div className="commem-form-field">
            <label>Denomination</label>
            <input
              type="text"
              value={denomination}
              onChange={(e) => setDenomination(e.target.value)}
              placeholder="e.g., 5 Rupees"
            />
          </div>
          <div className="commem-form-field">
            <label>Commemorate Name</label>
            <input
              type="text"
              value={commemorateName}
              onChange={(e) => setCommemorateNametate(e.target.value)}
              placeholder="e.g., 75 Years of Independence"
            />
          </div>
          <div className="commem-form-field">
            <label>Year</label>
            <input
              type="text"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="e.g., 2022"
            />
          </div>
          <div className="commem-form-field">
            <label>Mint</label>
            <input
              type="text"
              value={mint}
              onChange={(e) => setMint(e.target.value)}
              placeholder="e.g., BOM / CAL / HYD"
            />
          </div>
          <div className="commem-form-field">
            <label>Metal</label>
            <input
              type="text"
              value={metal}
              onChange={(e) => setMetal(e.target.value)}
              placeholder="e.g., Cu-Ni"
            />
          </div>
          <div className="commem-form-field">
            <label>Shape</label>
            <input
              type="text"
              value={shape}
              onChange={(e) => setShape(e.target.value)}
              placeholder="e.g., Round"
            />
          </div>
          <div className="commem-form-field">
            <label>Diameter</label>
            <input
              type="text"
              value={diameter}
              onChange={(e) => setDiameter(e.target.value)}
              placeholder="e.g., 26mm"
            />
          </div>
          <div className="commem-form-field">
            <label>Weight</label>
            <input
              type="text"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="e.g., 6g"
            />
          </div>

          {/* Rarity Selector */}
          <div className="commem-rarity-selector">
            <label>Rarity Index</label>
            <div className="commem-rarity-buttons">
              {Object.entries(COMMEM_RARITY_CONFIG).map(([key, cfg]) => (
                <button
                  key={key}
                  type="button"
                  className={`commem-rarity-btn ${rarity === key ? cfg.activeClass : ""}`}
                  onClick={() => setRarity((prev) => (prev === key ? "" : key))}
                >
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="commem-form-actions">
            <button type="submit" className="commem-add-btn">
              {editingId ? "Update Coin" : "Add Coin"}
            </button>
            {editingId && (
              <button
                type="button"
                className="commem-cancel-btn"
                onClick={commemResetForm}
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              className="commem-page-btn"
              onClick={commemHandleAddPage}
            >
              Add Blank Page
            </button>
            {pageCount > autoPages && (
              <button
                type="button"
                className="commem-remove-page-btn"
                onClick={commemHandleRemovePage}
              >
                Remove Blank Page
              </button>
            )}
          </div>
        </form>

        <div className="commem-builder-footer">
          <div>
            {totalPages} page{totalPages !== 1 ? "s" : ""} in preview
          </div>
          <div>{coinsPerPage} coin slots per page</div>
          <div>Each coin = 2 stacked labels (top + bottom)</div>
        </div>

        {/* ── Coin List ── */}
        {coins.length > 0 && (
          <div className="commem-label-list">
            {coins.map((c) => (
              <div className="commem-label-item" key={c.id}>
                <div className="commem-label-item-info">
                  <span className="commem-item-title">
                    {[c.denomination, c.commemorateName]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                  <small>
                    {[c.year, c.mint, c.metal, c.shape, c.diameter, c.weight]
                      .filter(Boolean)
                      .join(" | ")}
                  </small>
                </div>
                {c.rarity && (
                  <div
                    className="commem-item-rarity-badge"
                    style={commemRarityBadgeStyle(c.rarity)}
                  >
                    {c.rarity}
                  </div>
                )}
                <button
                  type="button"
                  className="commem-item-btn commem-item-duplicate-btn"
                  onClick={() => commemHandleDuplicateCoin(c.id)}
                  title="Duplicate this coin label"
                >
                  Duplicate
                </button>
                <button
                  type="button"
                  className="commem-item-btn commem-item-edit-btn"
                  onClick={() => commemHandleEditCoin(c.id)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="commem-item-btn commem-item-remove-btn"
                  onClick={() => commemHandleRemoveCoin(c.id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {/* PDF Name */}
        <div className="commem-form-field commem-pdf-name-field">
          <label>PDF File Name</label>
          <input
            type="text"
            value={pdfName}
            onChange={(e) => setPdfName(e.target.value)}
            placeholder="commemorative-coins"
          />
        </div>

        <div className="commem-label-actions">
          <button
            type="button"
            className="commem-pdf-btn"
            onClick={commemHandleMakePdf}
            disabled={isGenerating}
            style={{ opacity: isGenerating ? 0.7 : 1 }}
          >
            {isGenerating ? "Generating PDF…" : "Generate PDF"}
          </button>
          <Link
            to={`${process.env.PUBLIC_URL || ""}/Coin-Label-Generator`}
            className="commem-back-link"
          >
            Back to Home
          </Link>
        </div>
      </div>

      {/* ══ A4 PREVIEW ══ */}
      <div className="commem-preview-panel" ref={contentRef}>
        {pages.map((pageCoins, pageIndex) => (
          <div className="commem-a4-page" key={pageIndex}>
            <div className="commem-page-header">
              <div>Page {pageIndex + 1}</div>
              <div>{pageCoins.length} coins</div>
            </div>

            <div className="commem-page-inner">
              <div className="commem-page-grid">
                {getPageSlots(pageCoins).map((coin, slotIndex) => (
                  <div
                    className="commem-slot"
                    key={`${pageIndex}-${slotIndex}`}
                  >
                    <CommemBottomLabelRow coin={coin} />
                    <CommemTopLabelRow coin={coin} />
                  </div>
                ))}
              </div>
            </div>

            <div className="commem-page-footer">
              Commemorative Coin Collection · Page {pageIndex + 1} of{" "}
              {totalPages}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CommemorativeCoinA4Page;