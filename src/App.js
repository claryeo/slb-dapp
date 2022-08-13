import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import {Routes, Route} from 'react-router-dom';

import Home from './pages/home';
import Investor from './pages/investor';
import Issuer from "./pages/issuer";
import Verifier from "./pages/verifier";
import Regulator from "./pages/regulator";

import BondSearch from "./pages/bond_search";
import BondBalance from "./pages/bond_balance";
import BondIssue from "./pages/bond_issue";
import BondStatus from "./pages/bond_status";
import ReportImpact from "./pages/report_impact";
import RegulatorSearch from "./pages/regulator_search";

const App = () => {

  return (
    <div className='main-app'>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/issuer" element={<Issuer />} />
          <Route path="/issuer/balance" element={<BondBalance />} />
          <Route path="/issuer/bond_issue" element={<BondIssue />} />
          <Route path="/issuer/bond_status" element={<BondStatus />} />
          <Route path="/issuer/report_impact" element={<ReportImpact />} />
          <Route path="/investor" element={<Investor />} />
          <Route path="/investor/results" element={<BondSearch />} />
          <Route path="/verifier" element={<Verifier />} />
          <Route path="/regulator" element={<Regulator />} />
          <Route path="/regulator/results" element={<RegulatorSearch />} />
        </Routes>
    </div>
  );

}

export default App;