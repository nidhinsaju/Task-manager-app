import React from "react";
import { useNavigate } from "react-router-dom";
import "./CoinLandingPage.css";

const CoinLandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <div className="landing-header">
        <h1>Coin Label Generator</h1>
        <p>Create professional labels for your coin collection</p>
      </div>

      <div className="landing-grid">
        <div className="landing-card">
          <h2>🌍 World Country</h2>
          <p>Generate labels for coins from all countries</p>
          <button onClick={() => navigate(process.env.PUBLIC_URL + "/A4-page")}>
            Open
          </button>
        </div>

        <div className="landing-card">
          <h2>🇮🇳 Republic India</h2>
          <p>Create labels for Republic Indian coins</p>
          <button
            onClick={() =>
              navigate(process.env.PUBLIC_URL + "/Indian-Coin-Labels")
            }
          >
            Open
          </button>
        </div>

        <div className="landing-card">
          <h2>🏅 Commemorative</h2>
          <p>Design labels for Indian commemorative coins</p>
          <button
            onClick={() =>
              navigate(process.env.PUBLIC_URL + "/Commemorative-Coin-Labels")
            }
          >
            Open
          </button>
        </div>

        <div className="landing-card">
          <h2>🎉 AKAM</h2>
          <p>Azadi Ka Amrit Mahotsav special coin labels</p>
          <button
            onClick={() =>
              navigate(process.env.PUBLIC_URL + "/AKAM-Coin-Labels")
            }
          >
            Open
          </button>
          {/* <p style={{ color: "red", fontWeight: "bold" }}>Inprogress !</p> */}
        </div>
        <div className="landing-card">
          {/*  <h2>🎉 AKAM</h2>
          <p>Azadi Ka Amrit Mahotsav special coin labels</p> */}
          <button onClick={() => navigate(process.env.PUBLIC_URL + "/")}>
            Back ←
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoinLandingPage;
