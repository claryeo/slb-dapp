import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import {Routes, Route, useNavigate, Router} from 'react-router-dom';

import Home from './pages/home';
import Investor from './pages/investor';
import Issuer from "./pages/issuer";
import Verifier from "./pages/verifier";
import Regulator from "./pages/regulator";

import Bond_Search from "./pages/bond_search";
import Bond_Balance from "./pages/bond_balance";
import Bond_Issue from "./pages/bond_issue";
import Bond_Status from "./pages/bond_status";
import Report_Impact from "./pages/report_impact";
import Regulator_Search from "./pages/regulator_search";

const App = () => {

  return (
    <div className='main-app'>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/issuer" element={<Issuer />} />
          <Route path="/issuer/balance" element={<Bond_Balance />} />
          <Route path="/issuer/bond_issue" element={<Bond_Issue />} />
          <Route path="/issuer/bond_status" element={<Bond_Status />} />
          <Route path="/issuer/report_impact" element={<Report_Impact />} />
          <Route path="/investor" element={<Investor />} />
          <Route path="/investor/results" element={<Bond_Search />} />
          <Route path="/verifier" element={<Verifier />} />
          <Route path="/regulator" element={<Regulator />} />
          <Route path="/regulator/results" element={<Regulator_Search />} />
        </Routes>
    </div>
  );

}

export default App;