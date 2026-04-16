import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./AkamCoinsA4.css";

/* ─── localStorage key ─── */
const LS_KEY = "akam_coin_session_v1";

/* ─── Rarity colour mapping ─── */
const RARITY_CONFIG = {
  C: { label: "C — Common", activeClass: "active-C" },
  S: { label: "S — Scarce", activeClass: "active-S" },
  R: { label: "R — Rare", activeClass: "active-R" },
  X: { label: "X — Extra Rare", activeClass: "active-X" },
};

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
      <div className="akam-white-col">
        <div className="akam-stripe-top" />
        <div className="akam-label-middle">
          {/* Two explicit rows: row1 = Shape+Weight, row2 = Metal+Dia */}
          <div className="akam-top-right">
            <div className="akam-spec-row">
              <div className="akam-spec-pair">
                <span className="akam-spec-key">Shape:</span>
                <span className="akam-spec-val">{shape || "—"}</span>
              </div>
              <div className="akam-spec-pair">
                <span className="akam-spec-key">Weight:</span>
                {/* FIX: wrap value in a span with explicit overflow visible so 'g' tail shows */}
                <span
                  className="akam-spec-val"
                  style={{ overflow: "visible", paddingRight: "4px" }}
                >
                  {weight || "—"}
                </span>
              </div>
            </div>
            <div className="akam-spec-row">
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
        </div>
        <div className="akam-stripe-bottom" />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   BOTTOM LABEL
   ════════════════════════════════════════════ */
function LogoBorder() {
  return (
    <>
      <div className="akam-logo-border-top" />
      <div className="akam-logo-border-bottom" />
      <div className="akam-logo-border-left">
        <div className="akam-logo-border-side-top" />
        <div className="akam-logo-border-side-shadow" />
        <div className="akam-logo-border-side-bottom" />
      </div>
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
      <div
        className={`akam-logo-img-box${logoDataUrl ? "" : " akam-logo-placeholder"}`}
      >
        <LogoBorder />
        {logoDataUrl && <img src={logoDataUrl} alt="AKAM Logo" />}
      </div>
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
  const sessionInputRef = useRef(null);

  const [logoDataUrl, setLogoDataUrl] = useState(null);
  const [logoFileName, setLogoFileName] = useState("");
  const [denomination, setDenomination] = useState("");
  const [year, setYear] = useState("");
  const [mint, setMint] = useState("");
  const [metal, setMetal] = useState("");
  const [shape, setShape] = useState("");
  const [diameter, setDiameter] = useState("");
  const [weight, setWeight] = useState("");
  const [rarity, setRarity] = useState("");
  const [coins, setCoins] = useState([]);
  const [pageCount, setPageCount] = useState(1);
  const [pdfName, setPdfName] = useState("akam-coins");
  const [editingId, setEditingId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [saveMsgType, setSaveMsgType] = useState("success"); // "success" | "warning"

  /* ── localStorage restore ── */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const s = JSON.parse(raw);
      if (s.coins) setCoins(s.coins);
      if (s.pageCount) setPageCount(s.pageCount);
      if (s.pdfName) setPdfName(s.pdfName);
      if (s.logoDataUrl) setLogoDataUrl(s.logoDataUrl);
      if (s.logoFileName) setLogoFileName(s.logoFileName);
    } catch (e) {
      console.warn("Restore failed:", e);
    }
  }, []);

  /* ── localStorage auto-save ── */
  useEffect(() => {
    try {
      localStorage.setItem(
        LS_KEY,
        JSON.stringify({
          coins,
          pageCount,
          pdfName,
          logoDataUrl,
          logoFileName,
        }),
      );
    } catch (e) {
      console.warn("Save failed:", e);
    }
  }, [coins, pageCount, pdfName, logoDataUrl, logoFileName]);

  /* ── Session export ── */
  const handleSaveSession = () => {
    const blob = new Blob(
      [
        JSON.stringify(
          { coins, pageCount, pdfName, logoDataUrl, logoFileName },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${pdfName.trim() || "akam-coins"}-session.json`;
    a.click();
    URL.revokeObjectURL(url);
    showMsg("Session saved!", "success");
  };

  /* ── Session import ── */
  const handleLoadSession = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const s = JSON.parse(ev.target.result);
        if (s.coins) setCoins(s.coins);
        if (s.pageCount) setPageCount(s.pageCount);
        if (s.pdfName) setPdfName(s.pdfName);
        if (s.logoDataUrl) setLogoDataUrl(s.logoDataUrl);
        if (s.logoFileName) setLogoFileName(s.logoFileName);
        showMsg("Session loaded!", "success");
      } catch {
        showMsg("Invalid session file.", "warning");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  /* ── NEW: Close / Clear Session ── */
  const handleCloseSession = () => {
    if (
      coins.length > 0 &&
      !window.confirm(
        "This will clear all coins and reset the session. Are you sure?",
      )
    ) {
      return;
    }
    // Reset all state to defaults
    setCoins([]);
    setPageCount(1);
    setPdfName("akam-coins");
    setLogoDataUrl(null);
    setLogoFileName("");
    resetForm();
    // Clear localStorage
    try {
      localStorage.removeItem(LS_KEY);
    } catch (e) {
      console.warn("Clear failed:", e);
    }
    showMsg("Session cleared.", "warning");
  };

  const showMsg = (msg, type = "success") => {
    setSaveMsg(msg);
    setSaveMsgType(type);
    setTimeout(() => setSaveMsg(""), 2500);
  };

  /* ── Pagination ── */
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

  /* ── Logo ── */
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

  /* ── Form ── */
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
  const handleDuplicateCoin = (id) => {
    setCoins((prev) => {
      const idx = prev.findIndex((c) => c.id === id);
      if (idx === -1) return prev;
      const duplicate = { ...prev[idx], id: Date.now() };
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

  /* ── PDF ── */
  const handleMakePdf = async () => {
    if (!contentRef.current || isGenerating) return;
    const pageEls = Array.from(
      contentRef.current.querySelectorAll(".akam-a4-page"),
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
        });
        const imgData = canvas.toDataURL("image/png");
        const imgH = (canvas.height * pdfWidth) / canvas.width;
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, imgH);
      }
      pdf.save(`${pdfName.trim() || "akam-coins"}.pdf`);
    } finally {
      setIsGenerating(false);
    }
  };

  const rarityBadgeStyle = (r) => {
    const map = {
      C: { background: "#94e70f", color: "#fff" },
      S: { background: "#caca36", color: "#fff" },
      R: { background: "#ff8400", color: "#fff" },
      X: { background: "#ef4444", color: "#fff" },
    };
    return map[r] || { background: "#e2e8f0", color: "#475569" };
  };

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

        <div className="akam-form-field akam-pdf-name-field">
          <label>PDF File Name</label>
          <input
            type="text"
            value={pdfName}
            onChange={(e) => setPdfName(e.target.value)}
            placeholder="akam-coins"
          />
        </div>

        {/* ══ SESSION BAR ══ */}
        <div className="akam-session-bar">
          <div className="akam-session-info">
            <span className="akam-session-dot" title="Auto-saved" />
            Auto-saved to browser — your data is safe on reload
          </div>
          <div className="akam-session-btns">
            {/* Save Session */}
            <button
              type="button"
              className="akam-session-save-btn"
              onClick={handleSaveSession}
            >
              💾 Save Session
            </button>

            {/* Load Session */}
            <label className="akam-session-load-btn">
              📂 Load Session
              <input
                type="file"
                accept=".json,application/json"
                ref={sessionInputRef}
                onChange={handleLoadSession}
              />
            </label>

            {/* NEW: Close / Clear Session */}
            <button
              type="button"
              className="akam-session-close-btn"
              onClick={handleCloseSession}
              title="Clear all coins and reset the session"
            >
              ✕ Close Session
            </button>

            {/* Status message */}
            {saveMsg && (
              <span
                className={`akam-session-msg${
                  saveMsgType === "warning" ? " akam-session-msg--warning" : ""
                }`}
              >
                {saveMsg}
              </span>
            )}
          </div>
        </div>

        <div className="akam-label-actions">
          <button
            type="button"
            className={`akam-pdf-btn${isGenerating ? " akam-pdf-btn--generating" : ""}`}
            onClick={handleMakePdf}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <span className="akam-pdf-spinner" />
                Generating…
              </>
            ) : (
              "Generate PDF"
            )}
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
                    <AKAMBottomLabelRow coin={coin} logoDataUrl={logoDataUrl} />
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
