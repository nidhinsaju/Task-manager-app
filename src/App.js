import Taskmanager from "./Components/Taskmanager";
import A4Page from "./Components/A4Page";
import LandingPage from "./Components/LandingPage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
//import UserList from "./Components/Api_Demo";
import IndianCoinA4Page from "./Components/indiancoina4page";
import AKAMCoinA4Page from "Components/AkamCoinsA4";
import CommemorativeCoinA4Page from "Components/CommemorateCoinLabel";
import CoinLandingPage from "Components/CoinLandingPage";

function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route
            path={`${process.env.PUBLIC_URL + "/"}`}
            element={<LandingPage />}
          />
          <Route
            path={`${process.env.PUBLIC_URL + "/task-manager"}`}
            element={<Taskmanager />}
          />
          <Route
            path={`${process.env.PUBLIC_URL + "/A4-page"}`}
            element={<A4Page />}
          />
          {/*  <Route
            path={`${process.env.PUBLIC_URL + "/Api-demo"}`}
            element={<UserList />}
          /> */}
          <Route
            path={`${process.env.PUBLIC_URL + "/Indian-Coin-Labels"}`}
            element={<IndianCoinA4Page />}
          />
          <Route
            path={`${process.env.PUBLIC_URL + "/AKAM-Coin-Labels"}`}
            element={<AKAMCoinA4Page />}
          />
          <Route
            path={`${process.env.PUBLIC_URL + "/Commemorative-Coin-Labels"}`}
            element={<CommemorativeCoinA4Page />}
          />
          <Route
            path={`${process.env.PUBLIC_URL + "/Coin-Label-Generator"}`}
            element={<CoinLandingPage />}
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
