import React from "react";
import { useLocation } from "react-router-dom";
import {useState, useEffect } from 'react';
import Web3 from 'web3';

import Button from 'react-bootstrap/Button';
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Table from 'react-bootstrap/Table';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import Modal from 'react-bootstrap/Modal';

import NavBarHome from '../components/NavBarHome';
import {InvestorButton} from '../components/BackButton';
import tools from '../assets/pay-click.svg';
import {KPIButtonGood, KPIButtonBad} from '../components/KPIButton';
import bar from '../assets/bar.png';

const BondSearch = (props) => {

  const location = useLocation();

  const [isConnected, setConnected] = useState(false);
  const [walletAddress, setWallet] = useState("");
  const [status, setStatus] = useState("");

  const [message, setMessage] = useState(" "); //default message

  const [showAlertField, setShowAlertField] = useState(false);
  const toggleShowAlertField = () => setShowAlertField(!showAlertField);

  const [notif, setNotif] = useState(" "); 

  const web3 = new Web3(new Web3.providers.HttpProvider("https://babel-api.testnet.iotex.io"));

  const contractABI = location.state.selectedBondABI; //JSON parse required when string passed in

  const contractAddress = location.state.selectedBondAddress;
  
  const bondContract = new web3.eth.Contract(
    contractABI,
    contractAddress 
  );

  const [KPIs, setKPIs] = useState([]);
  const [defaultAmount, setDefaultAmount] = useState(0.0);

  const loadCurrentMessage = async () => {
    const message = [];
    message[0] = await bondContract.methods.owner().call();
    message[1] = await bondContract.methods.issuer().call();
    message[2] = await bondContract.methods.verifier().call();
    message[3] = await bondContract.methods.description().call();
    message[4] = web3.utils.fromWei(await bondContract.methods.bondPrice().call());
    message[5] = web3.utils.fromWei(await bondContract.methods.coupon().call());
    message[6] = await bondContract.methods.periods().call();
    message[7] = await bondContract.methods.totalBondsIssued().call();
    message[8] = formatTime(await bondContract.methods.activeDate().call());
    message[9] = formatTime(await bondContract.methods.maturityDate().call());
    message[10] = formatTime(await bondContract.methods.finalRedemptionDate().call()); 
    message[11] = await bondContract.methods.status().call();
    message[12] = web3.utils.fromWei(await bondContract.methods.interestPenalty().call());
    message[13] = await bondContract.methods.getUsersPurchasedBonds(walletAddress).call();
    message[14] = await bondContract.methods.currentPeriod().call();
    message[15] = await bondContract.methods.paused().call();
    message[16] = (await bondContract.methods.isVerified().call()).toString();
    message[17] = web3.utils.fromWei(await bondContract.methods.getBalance().call());
    message[18] = await bondContract.methods.impactData_1().call();
    message[19] = await bondContract.methods.impactData_2().call();
    message[20] = await bondContract.methods.impactData_3().call();
    message[21] = await bondContract.methods.bondsForSale().call();
    
    // console.log(message[16]);
    if(parseFloat(message[7]) > 0 && message[11] === '3'){
      setDefaultAmount((parseFloat(message[13])/ parseFloat(message[7])) * parseFloat(message[17]));
    }

    let arrayLength = 0;

    if(parseInt(message[14]) > 0 && message[16] === 'true'){
      arrayLength = parseInt(message[14]);
      for (let i = 0; i < arrayLength; i++){
        message.push(await bondContract.methods.metKPIs(i).call());
      } 
    }
    else if (parseInt(message[14]) > 0 && message[16] === 'false'){
      arrayLength = parseInt(message[14]) - 1;
      for (let i = 0; i < arrayLength; i++){
        message.push(await bondContract.methods.metKPIs(i).call());
      } 
    }

    return message;
  };
  
  function formatTime(s) {
    // const dtFormat = new Intl.DateTimeFormat('en-GB', {
    //   timeStyle: 'medium',
    //   timeZone: 'UTC'
    // });
    
    // return dtFormat.format(new Date(s * 1e3));
    
    var dateTime = new Date(s * 1e3).toLocaleString("en-GB");
    return dateTime;
  }

  useEffect(() => {
    async function getMessage(){
      const message = await loadCurrentMessage();
      setMessage(message);  
      const KPIArray = [];
      for (let i = 22; i < message.length; i++){
        KPIArray.push(message[i]);
      } 
      // console.log(KPIArray[0]);
      // console.log(KPIArray[1]);
      setKPIs(KPIArray);
    }

    // To resolve async error when walletAddress is not set
    if(walletAddress !== ""){
      getMessage();
    }
  });

  const handleBondStatus = () => {
    if(message[15] === true){
      return 'SUSPENDED ⚫';
    }
    else if(message[11] === '0'){
      return 'PRE-ISSUE ⚪';
    }
    else if(message[11] === '1'){
      return 'ISSUED 🟡';
    }
    else if(message[11] === '2'){
      return 'ACTIVE 🟢';
    }
    else if(message[11] === '3'){
      return 'BANKRUPT 🔴';
    }
    else{
      return 'REDEEMED 🔵';
    }
  }
  
  let bondStatus = handleBondStatus();
  const bondPrice = parseInt(message[4]);

  const [numberOfBonds, setBonds] = useState('');

  const handleBonds = event => {
    // 👇️ access textarea value
    setBonds(event.target.value);
  };

  const handleBondPurchase = (async (event) => {
    event.preventDefault();

    if(numberOfBonds > message[21] || isNaN(numberOfBonds) === true){
      setNotif('Invalid number of bonds purchased.');
      setShowAlertField(true);
      return;
    }

    const iotexChainID = await web3.eth.net.getId();
    const paymentAmount = (bondPrice * numberOfBonds).toString();
    // console.log(paymentAmount);

    const transactionParameters = {
      to: contractAddress, // Required except during contract publications.
      from: walletAddress, // must match user's active address.
      data: bondContract.methods.mintBond(numberOfBonds).encodeABI(),
      // gasPrice: "1000000000000",
      // gas: "85000",
      value: web3.utils.toHex(web3.utils.toWei(paymentAmount)), 
      chainId: iotexChainID
    };

    await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    });

  })

  const [couponPeriod, setCouponPeriod] = useState('');

  const handleCoupon = event => {
    // 👇️ access textarea value
    setCouponPeriod(event.target.value);
  };

  const handleCouponClaim = (async (event) => {
    event.preventDefault();

    if(couponPeriod > message[14] || isNaN(couponPeriod) === true){
      setNotif('Invalid coupon period.');
      setShowAlertField(true);
      return;
    }

    const iotexChainID = await web3.eth.net.getId();

    const transactionParameters = {
      to: contractAddress, // Required except during contract publications.
      from: walletAddress, // must match user's active address.
      data: bondContract.methods.claimCoupon(couponPeriod).encodeABI(),
      // gasPrice: "1000000000000",
      // gas: "85000",
      chainId: iotexChainID
    };

    await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    });

  })

  const handlePrincipalClaim = (async () => {
    const iotexChainID = await web3.eth.net.getId();

    const transactionParameters = {
      to: contractAddress, // Required except during contract publications.
      from: walletAddress, // must match user's active address.
      data: bondContract.methods.claimPrincipal().encodeABI(),
      // gasPrice: "1000000000000",
      // gas: "85000",
      chainId: iotexChainID
    };

    await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    });

  })

  const handleFundClaim = (async () => {
    const iotexChainID = await web3.eth.net.getId();

    const transactionParameters = {
      to: contractAddress, // Required except during contract publications.
      from: walletAddress, // must match user's active address.
      data: bondContract.methods.defaultClaim(web3.utils.toWei(defaultAmount.toString())).encodeABI(),
      // gasPrice: "1000000000000",
      // gas: "85000", 
      chainId: iotexChainID
    };

    await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    });

  })

  const [show, setShow] = useState(false);
    
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);


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
      
        <Row>
        <Col md={5} className="mb-6">
        <ToastContainer className="p-3" position= 'top-start'>

        <Toast show={showAlertField} onClose={toggleShowAlertField} delay={3000} autohide>
            <Toast.Header>
            <strong className="me-auto">Notification</strong>
            </Toast.Header>
            <Toast.Body>{notif}</Toast.Body>
        </Toast>
        
        </ToastContainer>
        </Col>
      </Row>

      <Container>
      <Row>
        <Col xs={6}>
          <InvestorButton/>
        </Col>
        <Col xs={6} className = "text-end"> 
        <Button variant = "outline" disabled> Bond Status: {bondStatus} </Button> 
        </Col>
      </Row>
      </Container>

      <div className="content-container-sub">

        <h1 className="fw-bold">Bond details</h1>
        <br />    
      </div>

      <Container>
      <Row>
        <Col xs={6}>

        <Table striped bordered hover variant = "success">
      <thead>
        <tr>
          <th>Attributes</th>
          <th>Values</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Issuer</td>
          <td>{message[1]}</td>
        </tr>
        <tr>
          <td>Verifier</td>
          <td>{message[2]}</td>
        </tr>
        <tr>
          <td>Description</td>
          <td>{message[3]}</td>
        </tr>
        <tr>
          <td>Bond Price (IOTX)</td>
          <td>{message[4]}</td>
        </tr>
        <tr>
          <td>Coupon (IOTX)</td>
          <td>{message[5]} + {message[12]}</td>
        </tr>
        <tr>
          <td>Periods</td>
          <td>{message[6]}</td>
        </tr>
        <tr>
          <td>Total bonds issued</td>
          <td>{message[7]}</td>
        </tr>
        <tr>
          <td>Active Date</td>
          <td>{message[8]}</td>
        </tr>
        <tr>
          <td>Maturity Date</td>
          <td>{message[9]}</td>
        </tr>
        <tr>
          <td>Redemption Date</td>
          <td>{message[10]}</td>
        </tr>
        <tr>
          <td>KPI status</td>
          <td><Button onClick={handleShow} className="cta-button small"  variant = "success" >
           View
          </Button></td>
        </tr>
      </tbody>
    </Table>

      <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>KPI status</Modal.Title>
          </Modal.Header>

          <Modal.Body>
          <p> ⬅             Progress bar       ➡</p>
          {KPIs.map((item, index) => (
            <Button key = {index} variant = "outline">
            {item ? <KPIButtonGood/> : <KPIButtonBad/>}
            </Button>
          ))}
          
            <br></br>

        <img src={bar} alt="bar"  width={400} height={65}/>

        <br></br>
        <br></br>


        <Table striped bordered hover variant = "success">
          <tbody>
          <tr>
            <td>Average impact data (KPI 1)</td>
            <td>{message[18]}</td>
          </tr>

          <tr>
            <td>Average impact data (KPI 2)</td>
            <td>{message[19]}</td>
          </tr>

          <tr>
            <td>Average impact data (KPI 3)</td>
            <td>{message[20]}</td>
          </tr>

          </tbody>
        </Table>

        </Modal.Body>

      </Modal>

      </Col>


      <Col xs={6} className = "text-center"> 
      <img src={tools} alt="tools"  width={60} height={60} />
      <br></br>     
      <h5 >Actions </h5>

      <br/><br/>
      <Form className = "text-start" onSubmit={handleBondPurchase}>
      <Form.Text className="text-muted">
        Number of bonds purchased: {message[13]}
        <br></br>
        Number of bonds available for sale: {message[21]}
      </Form.Text>
      <InputGroup className="mb-3">
      <Form.Control
      required
      placeholder="Amount"
      type="textarea"
      name="buyBonds"
      onChange = {handleBonds}
      />
      
      <Button type = "submit" className="cta-button search-button" variant="outline-success" id="button-addon">
      Buy Bonds
      </Button>
      </InputGroup>

      </Form>
      
      <Form className = "text-start" onSubmit={handleCouponClaim}>
      <Form.Text className="text-muted">
        Current period: {message[14]}
        <br></br>
        Verified: {message[16]}
      </Form.Text>
      <InputGroup className="mb-3">
      <Form.Control
      required
      placeholder="Coupon period"
      type="textarea"
      name="claimCoupon"
      onChange = {handleCoupon}
      />
      <Button type = "submit" className="cta-button search-button" variant="outline-success" id="button-addon">
      Claim coupon
      </Button>
      </InputGroup>
      
      </Form>

      <br/>

      <OverlayTrigger
        key="principal"
        placement="right"
        overlay={
          <Tooltip id={`principal`}>
            Available at maturity
          </Tooltip>
        }
      >
      <Button onClick = {handlePrincipalClaim} className="cta-button search-button" variant="outline-success" >
      Claim principal
      </Button>
      </OverlayTrigger>

      <br/><br/>

      <Form className = "text-start">
      <InputGroup className="mb-3">
      <Form.Control
      placeholder= {defaultAmount}
      aria-label="Claim coupon"
      aria-describedby="claim coupon bar"
      disabled
      />
      <OverlayTrigger
        key="default"
        placement="bottom"
        overlay={
          <Tooltip id={`default-funds`}>
            Available when bond is in BANKRUPT state
          </Tooltip>
        }
      >
      <Button onClick= {handleFundClaim} className="cta-button search-button" variant="outline-success" >
      Claim funds
      </Button>
      </OverlayTrigger>

      </InputGroup>
      </Form>
      
      <br/><br/>

      </Col>

      </Row>
      </Container>

      <br/>
      <br/>
        
      
    </>
  );
};
  

export default BondSearch;

  
  


