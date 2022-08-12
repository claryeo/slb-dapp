// import Button from 'react-bootstrap/Button';
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Dropdown from 'react-bootstrap/Dropdown';

import { useState} from 'react';

import NavBarHome from '../components/NavBarHome';
import background from '../assets/background.jpg';
import Container from 'react-bootstrap/esm/Container.js';


function Home() {

    const [isConnected, setConnected] = useState(false);
    const [walletAddress, setWallet] = useState("");
    const [status, setStatus] = useState("");


    const [showAlert, setShowAlert] = useState(true);
    const toggleShowAlert = () => setShowAlert(!showAlert);

      
  return (

    <>
        <div
        style={{
        backgroundImage: `url(${background})`,
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        width: "100vw",
        height: "100vh",
        }}
        >

        <NavBarHome
          isConnected={isConnected}                        // props
          setConnected = {setConnected}                  // props
          walletAddress = {walletAddress}
          setWallet = {setWallet}
          status = {status}
          setStatus = {setStatus}
        />

        <Row>
        <Col md={5} className="mb-6">
        <ToastContainer className="p-3" position= 'bottom-start'>
        <Toast show={showAlert} onClose={toggleShowAlert}>
            <Toast.Header>
            <strong className="me-auto">Notification</strong>
            </Toast.Header>
            <Toast.Body>{status}</Toast.Body>
        </Toast>
        </ToastContainer>
        </Col>
        </Row>
    
        <Container>

        <br></br>
        <br></br>
        <br></br>
        
        <Row>
        <Col md={{ span: 4, offset: 8 }}> 
            <Card style={{ width: '23rem', height: '26rem' }} border="success">
            <div className="card-body">
                <h2 className="card-title">Login</h2>
                <br></br>
                <p className="card-text">💵 Purchase sustainability-linked bonds on the IoTeX blockchain.</p>
                <p className="card-text">📝 Issue and monitor the status of bonds.</p>
                <p className="card-text"> 🌱 Verify IoT data based on Key Performance Indicators.</p>
                <p className="card-text"> ✅ Monitor transactions.</p>

                <br></br>
                <br></br>

                <Dropdown>
                <Dropdown.Toggle variant="success" id="dropdown-basic" className="cta-button login-button" disabled = {!isConnected}>
                Log in as
                </Dropdown.Toggle>

                <Dropdown.Menu>
                <Dropdown.Item href="/investor">Investor</Dropdown.Item>
                <Dropdown.Item href="/issuer">Issuer</Dropdown.Item>
                <Dropdown.Item href="/verifier">Verifier</Dropdown.Item>
                <Dropdown.Item href="/regulator">Regulator</Dropdown.Item>

                </Dropdown.Menu>
                </Dropdown>

                <br></br>
                
            </div>
            </Card>
        </Col>
        </Row>

        </Container>


        </div>


    </>

  );
}

export default Home;