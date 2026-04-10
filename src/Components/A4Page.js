import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./A4Page.css";

function A4Page() {
  const contentRef = useRef(null);
  const [country, setCountry] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [currencyName, setCurrencyName] = useState("");
  const [currencyCode, setCurrencyCode] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [filePreview, setFilePreview] = useState("");
  const [emblemPreview, setEmblemPreview] = useState("");
  const [labels, setLabels] = useState([]);
  const [pageCount, setPageCount] = useState(1);
  const [pdfName, setPdfName] = useState("Country-Labels");
  const [editingId, setEditingId] = useState(null);

  const labelsPerPage = 52;
  const autoPages = Math.max(1, Math.ceil(labels.length / labelsPerPage));
  const totalPages = Math.max(autoPages, pageCount);
  const pages = Array.from({ length: totalPages }, (_, pageIndex) =>
    labels.slice(pageIndex * labelsPerPage, (pageIndex + 1) * labelsPerPage),
  );

  const handleImageFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setFilePreview(reader.result || "");
      setImageUrl("");
    };
    reader.readAsDataURL(file);
  };

  const handleEmblemFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setEmblemPreview(reader.result || "");
    };
    reader.readAsDataURL(file);
  };

  const handleAddLabel = (event) => {
    event.preventDefault();
    const trimmedCountry = country.trim();
    const imageSource = filePreview || imageUrl.trim();
    if (!trimmedCountry || !imageSource) return;

    setLabels((current) => [
      ...current,
      {
        id: Date.now(),
        country: trimmedCountry,
        countryCode: countryCode.trim(),
        currencyName: currencyName.trim(),
        currencyCode: currencyCode.trim(),
        image: imageSource,
        emblem: emblemPreview,
      },
    ]);

    setCountry("");
    setCountryCode("");
    setCurrencyName("");
    setCurrencyCode("");
    setImageUrl("");
    setFilePreview("");
    setEmblemPreview("");
    event.target.reset();
  };

  const handleRemoveLabel = (id) => {
    setLabels((current) => current.filter((label) => label.id !== id));
  };

  const handleEditLabel = (id) => {
    const labelToEdit = labels.find((label) => label.id === id);
    if (labelToEdit) {
      setCountry(labelToEdit.country);
      setCountryCode(labelToEdit.countryCode || "");
      setCurrencyName(labelToEdit.currencyName || "");
      setCurrencyCode(labelToEdit.currencyCode || "");
      setImageUrl(labelToEdit.image);
      setFilePreview(labelToEdit.image);
      setEmblemPreview(labelToEdit.emblem || "");
      setEditingId(id);
    }
  };

  const handleUpdateLabel = (event) => {
    event.preventDefault();
    const trimmedCountry = country.trim();
    const imageSource = filePreview || imageUrl.trim();
    if (!trimmedCountry || !imageSource) return;

    setLabels((current) =>
      current.map((label) =>
        label.id === editingId
          ? {
              ...label,
              country: trimmedCountry,
              countryCode: countryCode.trim(),
              currencyName: currencyName.trim(),
              currencyCode: currencyCode.trim(),
              image: imageSource,
              emblem: emblemPreview,
            }
          : label,
      ),
    );

    setCountry("");
    setCountryCode("");
    setCurrencyName("");
    setCurrencyCode("");
    setImageUrl("");
    setFilePreview("");
    setEmblemPreview("");
    setEditingId(null);
    event.target.reset();
  };

  const handleCancelEdit = () => {
    setCountry("");
    setCountryCode("");
    setCurrencyName("");
    setCurrencyCode("");
    setImageUrl("");
    setFilePreview("");
    setEmblemPreview("");
    setEditingId(null);
  };

  const handleAddPage = () => setPageCount((c) => c + 1);

  const handleRemoveBlankPage = () => {
    if (pageCount > autoPages) setPageCount((c) => c - 1);
  };

  const getPageItems = (pageLabels) => {
    const emptyCount = labelsPerPage - pageLabels.length;
    return [...pageLabels, ...Array.from({ length: emptyCount }, () => null)];
  };

  const handleMakePdf = async () => {
    if (!contentRef.current) return;
    const pageElements = Array.from(
      contentRef.current.querySelectorAll(".a4-page"),
    );
    if (pageElements.length === 0) return;

    const pdf = new jsPDF("portrait", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();

    for (let index = 0; index < pageElements.length; index += 1) {
      const canvas = await html2canvas(pageElements[index], {
        scale: 5,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      if (index > 0) pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, imgHeight);
    }

    pdf.save(`${pdfName.trim() || "labels"}.pdf`);
  };

  return (
    <div className="a4-page-wrapper">
      <div className="label-form-panel">
        <div className="builder-top-bar">
          <div>
            <h2>Coin Holder Label Generator</h2>
            <p>
              Create printable A4 pages of 5cm × 2cm double-row labels with
              flag, country name, emblem, currency &amp; ISO code.
            </p>
          </div>
          <div className="stats-badge">
            <span>{labels.length}</span>
            labels ready
          </div>
        </div>

        <form
          className="label-form"
          onSubmit={editingId ? handleUpdateLabel : handleAddLabel}
        >
          <div className="form-field">
            <label>Country name</label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g., India"
            />
          </div>

          <div className="form-field">
            <label>Country ISO Code</label>
            <input
              type="text"
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              placeholder="e.g., IN"
            />
          </div>

          <div className="form-field">
            <label>Currency Name</label>
            <input
              type="text"
              value={currencyName}
              onChange={(e) => setCurrencyName(e.target.value)}
              placeholder="e.g., Indian Rupee"
            />
          </div>

          <div className="form-field">
            <label>Currency Code</label>
            <input
              type="text"
              value={currencyCode}
              onChange={(e) => setCurrencyCode(e.target.value)}
              placeholder="e.g., INR"
            />
          </div>

         {/*  <div className="form-field">
            <label>Flag image URL</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value);
                setFilePreview("");
              }}
              placeholder="Paste image URL"
            />
          </div> */}

          <div className="form-field upload-field">
            <label>Upload flag image</label>
            <label className="file-upload-placeholder">
              {filePreview ? (
                <img src={filePreview} alt="Flag preview" />
              ) : (
                <div className="upload-placeholder-content">
                  <span>Click to upload</span>
                  <small>PNG / JPG / SVG</small>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
              />
            </label>
          </div>

          <div className="form-field upload-field">
            <label>Upload country emblem</label>
            <label className="file-upload-placeholder">
              {emblemPreview ? (
                <img src={emblemPreview} alt="Emblem preview" />
              ) : (
                <div className="upload-placeholder-content">
                  <span>Click to upload</span>
                  <small>Emblem / CoA</small>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleEmblemFileChange}
              />
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="add-label-button">
              {editingId ? "Update Label" : "Add Label"}
            </button>
            {editingId && (
              <button
                type="button"
                className="add-page-button"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              className="add-page-button"
              onClick={handleAddPage}
            >
              Add Blank Page
            </button>
            {pageCount > autoPages && (
              <button
                type="button"
                className="remove-page-button"
                onClick={handleRemoveBlankPage}
              >
                Remove Blank Page
              </button>
            )}
          </div>
        </form>

        <div className="builder-footer">
          <div>
            {pageCount} page{pageCount === 1 ? "" : "s"} in preview
          </div>
          <div>{labelsPerPage} labels per page</div>
        </div>

        {labels.length > 0 && (
          <div className="label-list">
            {labels.map((label) => (
              <div className="label-item" key={label.id}>
                <img src={label.image} alt={label.country} />
                <div className="label-item-info">
                  <span className="label-country">{label.country}</span>
                  <small>
                    {label.countryCode} · {label.currencyName} (
                    {label.currencyCode})
                  </small>
                </div>
                <button
                  type="button"
                  className="edit-label-button"
                  onClick={() => handleEditLabel(label.id)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveLabel(label.id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="form-field pdf-name-field">
          <label>PDF file name</label>
          <input
            type="text"
            value={pdfName}
            onChange={(e) => setPdfName(e.target.value)}
            placeholder="labels"
          />
        </div>

        <div className="label-actions">
          <button type="button" className="pdf-button" onClick={handleMakePdf}>
            Generate PDF
          </button>
          <Link
            to={`${process.env.PUBLIC_URL || ""}/Coin-Label-Generator`}
            className="back-link"
          >
            Back to Home
          </Link>
        </div>
      </div>

      {/* ── A4 Preview ── */}
      <div className="preview-panel" ref={contentRef}>
        {pages.map((pageLabels, pageIndex) => (
          <div className="a4-page" key={pageIndex}>
            <div className="page-header">
              <div>Page {pageIndex + 1}</div>
              <div>{pageLabels.length} labels</div>
            </div>
            <div className="page-inner">
              <div className="page-grid">
                {getPageItems(pageLabels).map((labelItem, index) => (
                  <div
                    className={`label-country-block ${labelItem ? "filled" : "empty"}`}
                    key={`${pageIndex}-${index}`}
                  >
                    {/* ── TOP ROW: Flag + Country Name ── */}
                    <div className="label-row label-row-top">
                      {labelItem && (
                        <>
                          <div className="label-cell-left">
                            <img
                              src={labelItem.image}
                              alt={labelItem.country}
                            />
                          </div>
                          <div className="label-cell-center">
                            <div className="label-cell-country">
                              {labelItem.country}
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* ── BOTTOM ROW: Emblem | Currency Name | Black box ── */}
                    <div className="label-row label-row-bottom">
                      {labelItem && (
                        <>
                          {/* LEFT: Black box — ISO + currency code */}
                          <div className="label-bottom-black">
                            <div className="label-black-iso">
                              {labelItem.countryCode}
                            </div>
                            <div className="label-black-currency">
                              {labelItem.currencyCode}
                            </div>
                          </div>

                          {/* CENTER: Currency name */}
                          <div className="label-bottom-center">
                            <div className="label-cell-currency">
                              {labelItem.currencyName}
                            </div>
                          </div>

                          {/* Right: Emblem */}
                          <div className="label-bottom-emblem">
                            {labelItem.emblem ? (
                              <img
                                src={labelItem.emblem}
                                alt={`${labelItem.country} emblem`}
                              />
                            ) : (
                              <div className="emblem-placeholder">emblem</div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default A4Page;