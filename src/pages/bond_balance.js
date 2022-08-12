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
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import InputGroup from 'react-bootstrap/InputGroup';
import AnimatedNumber from "animated-number-react";
import ProgressBar from 'react-bootstrap/ProgressBar';

import NavBarHome from '../components/NavBarHome';
import wallet from '../assets/wallet-money.svg';
import clipboard from '../assets/clipboard-list.svg'
import {IssuerButton} from '../components/BackButton';

const Bond_Balance = (props) => {

  const location = useLocation();

  const [isConnected, setConnected] = useState(false);
  const [walletAddress, setWallet] = useState("");
  const [status, setStatus] = useState("");

  const [showAlert, setShowAlert] = useState(false);
  const toggleShowAlert = () => setShowAlert(!showAlert);

  const [notif, setNotif] = useState(" "); 

  const [message, setMessage] = useState(" "); //default message

  const web3 = new Web3(new Web3.providers.HttpProvider("https://babel-api.testnet.iotex.io"));

  const contractABI = location.state.selectedBondABI; //JSON parse required when string passed in

  const contractAddress = location.state.selectedBondAddress;
  
  const bondContract = new web3.eth.Contract(
    contractABI,
    contractAddress 
  );

  // const bondContract = location.state.contract; //errors with passing state as entire contract

  const [bondsPurchased , setBondsPurchased] = useState(0);
  const [minBalance , setMinBalance] = useState(0);

  const [currentKPI, setKPI] = useState(true);
  const [couponRate, setCouponRate] = useState(0.0);
  const [couponPenaltyRate, setCouponPenaltyRate] = useState(0.0);

  const loadCurrentMessage = async () => {
    const message = [];
    message[0] = await bondContract.methods.owner().call();
    message[1] = web3.utils.fromWei(await bondContract.methods.getBalance().call());
    message[2] = web3.utils.fromWei(await bondContract.methods.coupon().call());
    message[3] = web3.utils.fromWei(await bondContract.methods.interestPenalty().call());
    message[4] = web3.utils.fromWei(await bondContract.methods.totalDebt().call()); //only appears when bond is active
    message[5] = await bondContract.methods.getTotalPurchasedBonds().call();
    message[6] = await bondContract.methods.totalBondsIssued().call();
    message[7] = await bondContract.methods.status().call();
    message[8] = await bondContract.methods.currentPeriod().call(); 
    message[9] = await bondContract.methods.paused().call();
    message[10] = await bondContract.methods.isVerified().call();
    message[11] = web3.utils.fromWei(await bondContract.methods.bondPrice().call());

    if(message[7] != '0'){
      setBondsPurchased((message[5]/message[6]) * 100);
    }
    setMinBalance((parseFloat(message[2]) + parseFloat(message[3])) * parseFloat(message[4]));

    //TODO: get metKPIs to calculate current period interest wrt penalty - DONE
    let arrayLength = 0;

    if(parseInt(message[8]) > 0 && message[10] == true){
      arrayLength = parseInt(message[8]);
      message.push(await bondContract.methods.metKPIs(arrayLength-1).call());
    }
    else if (parseInt(message[8]) > 0 && message[10] == false){
      arrayLength = parseInt(message[8]) - 1;
      if(arrayLength > 0){
        message.push(await bondContract.methods.metKPIs(arrayLength-1).call());
      }
      else{
      // KPI is set to coupon rate at first (before impact data is received and verified)
        message.push(true);
      }
    }

    if (parseFloat(message[11]) > 0){
      setCouponRate(((parseFloat(message[2])/parseFloat(message[11])) * 100).toFixed(2));
      setCouponPenaltyRate((((parseFloat(message[2]) + parseFloat(message[3]))/ parseFloat(message[11])) * 100).toFixed(2));
    }

    return message;
  };

  const [bondBalance, setBondBalance] = useState(0.0);

  useEffect(() => {
    async function getMessage(){
      const message = await loadCurrentMessage();
      setMessage(message); 
      setBondBalance(parseFloat(message[1]));
      // KPI is set to coupon rate at first (before impact data is received and verified)
      if(parseInt(message[8]) > 0 && message[10] == true){
        setKPI(message[12]);
      }
    }
    getMessage();
    
  });

  // PRE-ISSUE STATE - auto set to 0?
  // const checkSold = () => {
  //   console.log(message[6]);
  //   if(message[6] == '0'){
  //     return 0;
  //   }
  //   else{
  //     return now;
  //   }
  // }
  
  let formatValue = (bondBalance) => bondBalance.toFixed(5);
    
  const handleBondStatus = () => {
    if(message[9] == true){
      return 'SUSPENDED ⚫';
    }
    else if(message[7] == '0'){
      return 'PRE-ISSUE ⚪';
    }
    else if(message[7] == '1'){
      return 'ISSUED 🟡';
    }
    else if(message[7] == '2'){
      return 'ACTIVE 🟢';
    }
    else if(message[7] == '3'){
      return 'BANKRUPT 🔴';
    }
    else{
      return 'REDEEMED 🔵';
    }
  }
  
  let bondStatus = handleBondStatus();

  const handleBalance = () => {
    if(message[1] <= minBalance){
      setNotif('🚩Alert: Bond balance is low. Please top up.');
      setShowAlert(true);
    }
  }

  useEffect(() => {
    // console.log(message[1]);
    // console.log(minBalance);

    if(message[1] > 0 && minBalance > 0){
      // console.log(message[1]);
      // console.log(minBalance);
      handleBalance();
    }
  }, [minBalance]);


  const [topUpValue, setTopUpValue] = useState('');

  const handleTopUpValue = event => {
    // 👇️ access textarea value
    setTopUpValue(web3.utils.toWei(event.target.value));
  };

  const [withdrawValue, setWithdrawValue] = useState('');

  const handleWithdrawValue = event => {
    // 👇️ access textarea value
    setWithdrawValue(web3.utils.toWei(event.target.value));
  };


  const handleTopUp = (async () => {
    // console.log(topUpValue);
    const iotexChainID = await web3.eth.net.getId();

    // const hex_value = '0x'+parseInt(topUpValue, 10).toString(16); //need to get hex value

    const transactionParameters = {
      to: contractAddress, // Required except during contract publications.
      from: walletAddress, // must match user's active address.
      data: bondContract.methods.fundBond().encodeABI(),
      // gasPrice: "1000000000000",
      // gas: "85000",
      value: web3.utils.toHex(topUpValue), 
      chainId: iotexChainID
    };

    await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    });

  })

  const handleWithdraw= (async () => {
    // console.log(withdrawValue);
    const iotexChainID = await web3.eth.net.getId();
    
    const transactionParameters = {
      to: contractAddress, // Required except during contract publications.
      from: walletAddress, // must match user's active address.
      data: bondContract.methods.withdrawMoney(withdrawValue).encodeABI(), 
      //withdraw Value must be converted back to large number
      // gasPrice: "1000000000000",
      // gas: "85000",
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

    <Row>
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
      </Row>

      <Container>
      <Row>
        <Col xs={6} className = "text-start"> 
          <IssuerButton/>
        </Col>
        <Col xs={6} className = "text-end"> 
          <Button variant = "outline" disabled> Bond Status: {bondStatus} </Button> 
        </Col>
      </Row>
      </Container>
      
      
      <div className = "content-container-sub" >
      
        <h3 >Bond Balance (IOTX) </h3>
        <br />    
      
      
      <h1 className="fw-bold" style={{fontSize: '100px'}} >
        <AnimatedNumber
        value={bondBalance}
        formatValue={formatValue}
        duration={300} />

      </h1>
      </div>

        <br />  
        <br></br>
        <Container >
          
        <Row>

        <Col xs={6} className="text-center">
        <img src={wallet} alt="wallet"  width={60} height={60} />

        <br></br>     
        <h5 >Fund bond </h5>

        <br></br>
        <InputGroup className="mb-3">

        <Form.Control
          placeholder="Amount"
          aria-label="Top-up funds"
          aria-describedby="top-up bar"
          onChange={handleTopUpValue}
        />
        <Button onClick={handleTopUp} 
          className="cta-button search-button small btn-space" variant="outline-success" id="button-addon">
          Top-up
        </Button>
      </InputGroup>

      <InputGroup className="mb-3">
        <Form.Control
          placeholder="Amount"
          aria-label="Withdraw funds"
          aria-describedby="withdraw bar"
          onChange={handleWithdrawValue}
        />
        <Button onClick = {handleWithdraw} 
          className="cta-button search-button small btn-space" variant="outline-secondary" id="button-addon">
          Withdraw
        </Button>
      </InputGroup>



        </Col>
        <Col xs={6} className="text-center">
        <img src={clipboard} alt="clipboard"  width={60} height={60} />
        <br></br>     
        <h5 >Financial metrics </h5>

        <br></br>

        <Card className="text-start">
        {/* <Card.Header>Total debt</Card.Header> */}
        <ListGroup variant="flush">
          <ListGroup.Item>Percentage of bonds sold: 
            <ProgressBar variant="success" now={bondsPurchased} label={`${bondsPurchased}%`} /> </ListGroup.Item>

          <ListGroup.Item>Total bonds issued: {message[6]}</ListGroup.Item>
          
          <ListGroup.Item>Total debt (IOTX): {message[4]}</ListGroup.Item>

          <ListGroup.Item>Current period interest: {currentKPI ? couponRate : couponPenaltyRate}% </ListGroup.Item>

        </ListGroup>


        </Card>
    
        <br />

      
        </Col>

      </Row>



      </Container>


      
      
    </>
  );
};
  

export default Bond_Balance;

  
  


