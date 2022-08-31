import React from "react";
import { useLocation } from "react-router-dom";
import {useState, useEffect } from 'react';
import Web3 from 'web3';

import Button from 'react-bootstrap/Button';
// import Toast from 'react-bootstrap/Toast';
// import ToastContainer from 'react-bootstrap/ToastContainer';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Table from 'react-bootstrap/Table';

import NavBarHome from '../components/NavBarHome';
import {IssuerButton} from '../components/BackButton';
import setting from '../assets/tools.svg';
import timing from '../assets/time.svg'

const BondStatus = (props) => {

  const location = useLocation();

  const [isConnected, setConnected] = useState(false);
  const [walletAddress, setWallet] = useState("");
  const [status, setStatus] = useState("");

  // const [showAlert, setShowAlert] = useState(false);
  // const toggleShowAlert = () => setShowAlert(!showAlert);

  // const [notif, setNotif] = useState(" "); 

  const [message, setMessage] = useState(" "); //default message

  const web3 = new Web3(new Web3.providers.HttpProvider("https://babel-api.testnet.iotex.io"));

  const contractABI = location.state.selectedBondABI; 

  const contractAddress = location.state.selectedBondAddress;
  
  const bondContract = new web3.eth.Contract(
    contractABI,
    contractAddress 
  );

  const loadCurrentMessage = async () => {
    const message = [];
    message[0] = await bondContract.methods.owner().call();
    message[1] = await bondContract.methods.status().call();
    message[2] = formatTime(await bondContract.methods.activeDate().call());
    message[3] = formatTime(await bondContract.methods.maturityDate().call());
    message[4] = formatTime(await bondContract.methods.finalRedemptionDate().call());
    message[5] = await bondContract.methods.periods().call(); 
    message[6] = await bondContract.methods.currentPeriod().call(); 
    message[7] = await bondContract.methods.paused().call();

    return message;
  };


  function formatTime(s) {    
    var dateTime = new Date(s * 1e3).toLocaleString("en-GB");
    return dateTime;
  }

  useEffect(() => {
    async function getMessage(){
      const message = await loadCurrentMessage();
      setMessage(message);  
    }

    getMessage();
  });

  
  const handleBondStatus = () => {
    if(message[7] === true){
      return 'SUSPENDED ⚫';
    }
    if(message[1] === '0'){
      return 'PRE-ISSUE ⚪';
    }
    else if(message[1] === '1'){
      return 'ISSUED 🟡';
    }
    else if(message[1] === '2'){
      return 'ACTIVE 🟢';
    }
    else if(message[1] === '3'){
      return 'BANKRUPT 🔴';
    }
    else{
      return 'REDEEMED 🔵';
    }
  }
  
  let bondStatus = handleBondStatus();


  const handleActive= (async () => {
    const iotexChainID = await web3.eth.net.getId();

    const transactionParameters = {
      to: contractAddress, // Required except during contract publications.
      from: walletAddress, // must match user's active address.
      data: bondContract.methods.setBondActive().encodeABI(), 
      gasPrice: web3.utils.toHex("1000000000000"),
      gas: web3.utils.toHex("85000"), //should be in hex format too
      chainId: iotexChainID
    };

    await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    });

  })

  const handleRedeemed= (async () => {
    const iotexChainID = await web3.eth.net.getId();

    const transactionParameters = {
      to: contractAddress, // Required except during contract publications.
      from: walletAddress, // must match user's active address.
      data: bondContract.methods.setBondRedeemed().encodeABI(), 
      gasPrice: web3.utils.toHex("1000000000000"),
      gas: web3.utils.toHex("85000"), //should be in hex format too
      chainId: iotexChainID
    };

    await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    });

  })

  return (
    <>
    
      <NavBarHome
          isConnected={isConnected}                        // props
          setConnected = {setConnected}                  // props
          walletAddress = {walletAddress}
          setWallet = {setWallet}
          status = {status}
          setStatus = {setStatus}
        />

    {/* <Row>
        <Col md={5} className="mb-6">
        <ToastContainer className="p-3" position= 'top-start'>
        <Toast show={showAlert} onClose={toggleShowAlert}>
            <Toast.Header>
            <strong className="me-auto">Notification</strong>
            </Toast.Header>
            <Toast.Body>{notif}</Toast.Body>
        </Toast>
        </ToastContainer>
        </Col>
      </Row> */}
      
      <Container>
      <Row>
        <Col xs={6} className = "text-start"> 
          <IssuerButton/>
        </Col>
      </Row>
      </Container>
      
      <div class = "content-container-sub" >
        
      <h1 class="fw-bold" style={{fontSize: '60px'}} >
        {bondStatus}
      </h1>
      </div>

        <br />  
        <br></br>
        <br />  
        <br />  
      <Container >
        
      <Row>

      <Col xs={6} className="text-center">
      <img src={setting} alt="setting"  width={60} height={60} />

      <br></br>     
      <h5 >Set status </h5>

      <br></br>
      <Button onClick = {handleActive} className="cta-button search-button" variant="outline-success" id="button-addon">
        Active
      </Button>

      <br></br>
      <br></br>
      <Button onClick = {handleRedeemed} className="cta-button search-button" variant="outline-success" id="button-addon">
        Redeemed
      </Button>



      </Col>
      <Col xs={6} className="text-center">
      <img src={timing} alt="timing"  width={60} height={60} />
      <br></br>     
      <h5 >Time metrics </h5>

      <br></br>

      <Table striped hover variant = "success">
      {/* <thead>
        <tr>
          <th width="120"></th>
          <th width="170">Values</th>
        </tr>
      </thead> */}
      <tbody>
        <tr>
          <td>Active Date</td>
          <td>{message[2]}</td>
        </tr>
        <tr>
          <td>Maturity Date</td>
          <td>{message[3]}</td>
        </tr>
        <tr>
          <td>Redemption Date</td>
          <td>{message[4]}</td>
        </tr>
        <tr>
          <td>Number of periods</td>
          <td>{message[5]}</td>
        </tr>
        <tr>
          <td>Current period</td>
          <td>{message[6]}</td>
        </tr>
      </tbody>
    </Table>
    
        <br />

      
        </Col>

      </Row>



      </Container>


      
      
    </>
  );
};
  

export default BondStatus;

  
  


