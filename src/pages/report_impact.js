import React from "react";
import { useLocation } from "react-router-dom";
import {useState, useEffect, useReducer } from 'react';
import Web3 from 'web3';
import Papa from "papaparse";
import { Web3Storage } from 'web3.storage';  //see troubleshoot guide

import Button from 'react-bootstrap/Button';
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Table from 'react-bootstrap/Table';

import NavBarHome from '../components/NavBarHome';
import {IssuerButton} from '../components/BackButton';
import {KPIButtonGood, KPIButtonBad} from '../components/KPIButton';
import upload from '../assets/upload.svg';
import check from '../assets/impact-list.svg';
import device from '../assets/device.svg';
import bar from '../assets/bar.png';

import web3StorageToken from '../util/web3StorageToken';


const ReportImpact = (props) => {

  const location = useLocation();

  const [isConnected, setConnected] = useState(false);
  const [walletAddress, setWallet] = useState("");
  const [status, setStatus] = useState("");

  const [showAlert, setShowAlert] = useState(false);
  const toggleShowAlert = () => setShowAlert(!showAlert);

  // const [showAlertField, setShowAlertField] = useState(false);
  // const toggleShowAlertField = () => setShowAlertField(!showAlertField);

  // const [notif, setNotif] = useState(" "); 

  const [message, setMessage] = useState(" "); //default message

  const web3 = new Web3(new Web3.providers.HttpProvider("https://babel-api.testnet.iotex.io"));

  const contractABI = location.state.selectedBondABI; 

  const contractAddress = location.state.selectedBondAddress;
  
  const bondContract = new web3.eth.Contract(
    contractABI,
    contractAddress 
  );


  const [KPIs, setKPIs] = useState([]);

  const loadCurrentMessage = async () => {
    const message = [];
    message[0] = await bondContract.methods.owner().call();
    message[1] = await bondContract.methods.status().call();
    message[2] = await bondContract.methods.activeDate().call();
    message[3] = await bondContract.methods.maturityDate().call();
    message[4] = await bondContract.methods.finalRedemptionDate().call();
    message[5] = await bondContract.methods.periods().call();  
    message[6] = await bondContract.methods.currentPeriod().call();
    message[7] = await bondContract.methods.paused().call();
    message[8] = await bondContract.methods.isVerified().call();
    message[9] = await bondContract.methods.impactData_1().call();
    message[10] = await bondContract.methods.impactData_2().call();
    message[11] = await bondContract.methods.impactData_3().call();

    //what happens if not verified - loop needs to change

    let arrayLength = 0;

    if(parseInt(message[6]) > 0 && message[8] === true){
      arrayLength = parseInt(message[6]);
      for (let i = 0; i < arrayLength; i++){
        message.push(await bondContract.methods.metKPIs(i).call());
      } 
    }
    else if (parseInt(message[6]) > 0 && message[8] === false){
      arrayLength = parseInt(message[6]) - 1;
      for (let i = 0; i < arrayLength; i++){
        message.push(await bondContract.methods.metKPIs(i).call());
      } 
    }

    return message;
  };

  useEffect(() => {
    const getMessage = async() => {
      const message = await loadCurrentMessage();
      setMessage(message); 
      const KPIArray = [];
      for (let i = 12; i < message.length; i++){
        KPIArray.push(message[i]);
      } 
      // console.log(KPIArray[0]);
      // console.log(KPIArray[1]);
      setKPIs(KPIArray);
    }

    getMessage();

  });

  
  const handleBondStatus = () => {
    if(message[7] === true){
      return 'SUSPENDED ⚫';
    }
    else if(message[1] === '0'){
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


  /*---------------------------------DATA PARSING FROM FILE (TUTORIAL)------------------------------------------*/
  // State to store parsed data
  // const [parsedData, setParsedData] = useState([]);

  //State to store table Column name
  const [tableRows, setTableRows] = useState([]);

  //State to store the values
  const [values, setValues] = useState([]);

  //Updated: State to store KPI averages
  const [averages, setAverages] = useState([]);

  //Updated: State to store device imei
  const [deviceIMEI, setDeviceIMEI] = useState("");

  //Updated: State to store signature
  const [signature, setSignature] = useState("");

  //Updated: Set Files - HAS TO BE AN ARRAY OF FILES
  const [file, setFile] = useState([]);

  const changeHandler = (event) => {
    setFile(event.target.files);

    // Passing file data (event.target.files[0]) to parse using Papa.parse
    Papa.parse(event.target.files[0], {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        const rowsArray = [];
        const valuesArray = [];

        // Iterating data to get column name and their values
        results.data.forEach((d) => {
          rowsArray.push(Object.keys(d));
          valuesArray.push(Object.values(d));
        });

        // Parsed Data Response in array format
        // setParsedData(results.data);

        // Filtered Column Names
        setTableRows(rowsArray[0]);

        // Filtered Values
        setValues(valuesArray);
        
        //Filtered averages
        setAverages(valuesArray[valuesArray.length - 3]);

        //Filtered device imei
        setDeviceIMEI(valuesArray[valuesArray.length - 2][1]);

        //Filtered signature
        setSignature(valuesArray[valuesArray.length - 1][1]);

        console.log(typeof valuesArray[valuesArray.length-1][1]);
      },
    });
  };
  /*----------------------------------------------------------------------------------------------------------*/

  const [messages, showMessage] = useReducer((msgs, m) => msgs.concat(m), []);

  const uploadFile = (async (event) => {
    setShowAlert(true);
    event.preventDefault()

    showMessage('> 📦 creating web3.storage client')
    
    const client = new Web3Storage({ token: web3StorageToken })

    showMessage('> 🤖 chunking and hashing the files (in your browser!) to calculate the Content ID')

    console.log(file);

    const cid = await client.put(file, {
      onRootCidReady: localCid => {
        showMessage(`> 🔑 locally calculated Content ID: ${localCid} `)
        showMessage('> 📡 sending files to web3.storage ')
      },
      onStoredChunk: bytes => showMessage(`> 🛰 sent ${bytes.toLocaleString()} bytes to web3.storage`)
    })
    showMessage(`> ✅ web3.storage now hosting ${cid}`)
    showLink(`https://dweb.link/ipfs/${cid}`)

    // showMessage('> 📡 fetching the list of all unique uploads on this account')
    // let totalBytes = 0
    // for await (const upload of client.list()) {
    //   showMessage(`> 📄 ${upload.cid}  ${upload.name}`)
    //   totalBytes += upload.dagSize || 0
    // }
    // showMessage(`> ⁂ ${totalBytes.toLocaleString()} bytes stored!`)
  
  })

  const showLink = (url) => {
    showMessage(<span>&gt; 🔗 <a href={url}>{url}</a></span>)
  }

  // TODO: Uncomment when new contract is deployed

  const handleReportImpact = (async () => {
    const iotexChainID = await web3.eth.net.getId();

    const transactionParameters = {
      to: contractAddress, // Required except during contract publications.
      from: walletAddress, // must match user's active address.
      data: bondContract.methods.reportImpact(averages[1],averages[2],averages[3],
        deviceIMEI, signature).encodeABI(), //consider web3.utils.asciiToHex()
      // gasPrice: "1000000000000",
      // gas: "85000",
      chainId: iotexChainID
    };

    await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    });

  })

  const [newDevice, setNewDevice] = useState(""); 

  const handleRegister = event => {
    setNewDevice(event.target.value);
  }

  const handleRegisterDevice = (async (event) => {
    event.preventDefault();

    // if(newDevice.length !== 15 || isNaN(newDevice) === true){
    //   setNotif('Invalid device ID. Only numerical values are allowed (15 digits).');
    //   setShowAlertField(true);
    //   return;
    // }

    const iotexChainID = await web3.eth.net.getId();

    const transactionParameters = {
      to: contractAddress, // Required except during contract publications.
      from: walletAddress, // must match user's active address.
      data: bondContract.methods.registerDevice(newDevice).encodeABI(),
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
            <Toast.Body>
            <div id='output'>
              &gt; ⁂ waiting for form submission...
              {messages.map((m, i) => <div key={m + i}>{m}</div>)}
            </div>
            </Toast.Body>
        </Toast>

        {/* <Toast show={showAlertField} onClose={toggleShowAlertField} delay={3000} autohide>
            <Toast.Header>
            <strong className="me-auto">Notification</strong>
            </Toast.Header>
            <Toast.Body>{notif}</Toast.Body>
        </Toast> */}
        
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
      <br />  
      <h1 className="fw-bold">
      Report impact
      </h1>
      </div>

        <br />  
        <br></br>
        <br />  
        <br />  
      <Container >
        
      <Row>

      <Col xs={6} className="text-center">

      <img src={device} alt="upload"  width={60} height={60} />
      <br></br>     
      <h5 >Register IoT device</h5>
      <br></br>

      <Form onSubmit = {handleRegisterDevice} >
        <InputGroup className="mb-3">
        <Form.Control
          required
          placeholder="Device ID"
          type="textarea"
          name="registerDevice"
          onChange = {handleRegister}
        />
        <Button 
          type = "submit"
          className="cta-button search-button" variant="outline-success" id="button-addon">
          Register
        </Button>
        </InputGroup>
        
      </Form>


      <br></br>
      <br></br>
      <br></br>
      </Col>

      <Col xs={6} className="text-center">
      <img src={upload} alt="upload"  width={60} height={60} />

      <br></br>     
      <h5 >Upload IoT data file (.csv) </h5>

      <br></br>
      <Form.Group controlId="formFile" className="mb-3 text-start">
        <Form.Control type="file" accept=".csv"  onChange={changeHandler}/>
      </Form.Group>


      <Button onClick={handleReportImpact} className="cta-button search-button btn-space" variant="outline-success" id="button-addon">
        Report impact
      </Button>

      <Button onClick={uploadFile} className="cta-button search-button btn-space" variant="outline-success" id="button-addon">
        Upload to IPFS
      </Button>
      <br></br>
      <br></br>
      <br></br>

      </Col>

      <Col xs={6} className="text-center">
    
      <img src={check} alt="check"  width={60} height={60} />
      <br></br>     
      <h5 >KPI status </h5>

      <br></br>


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
          <td>{message[9]}</td>
        </tr>

        <tr>
          <td>Average impact data (KPI 2)</td>
          <td>{message[10]}</td>
        </tr>

        <tr>
          <td>Average impact data (KPI 3)</td>
          <td>{message[11]}</td>
        </tr>

        </tbody>
    </Table>

    <br></br>
    <br></br>

    </Col>

      <Col xs={6} className="text-center">
      <br></br>
      <div style={{height: 400, overFlowX: 'auto', overflowY : 'auto'}}> 
      <Table striped bordered hover variant = "success" responsive>
        <thead>
          <tr>
            {tableRows.map((rows, index) => {
              return <th key={index}>{rows}</th>;
            })}
          </tr>
        </thead>
        <tbody>
          {values.map((value, index) => {
            return (
              <tr key={index}>
                {value.map((val, i) => {
                  return <td key={i}>{val}</td>;
                })}
              </tr>
            );
          })}
        </tbody>
      </Table>
      </div>

      <br></br>
      <br></br>
      </Col>


    
    </Row>



      </Container>


      
      
    </>
  );
};
  

export default ReportImpact;

  
  


