import React, { useEffect } from "react";
import {useState} from 'react';
import { useNavigate } from "react-router-dom";

import Button from 'react-bootstrap/Button';
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Table from 'react-bootstrap/Table';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Modal from 'react-bootstrap/Modal';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';

// import { Formik } from 'formik';
// import * as yup from 'yup';

import NavBarHome from '../components/NavBarHome.js';
import verifier_bg from '../assets/verifier-background.jpg';

import {contractData} from "../util/contractData"

import Web3 from 'web3';

const Verifier = () => {
    const navigate = useNavigate();
  
    const [isConnected, setConnected] = useState(false);
    const [walletAddress, setWallet] = useState("");
    const [status, setStatus] = useState("");

    const web3 = new Web3(new Web3.providers.HttpProvider("https://babel-api.testnet.iotex.io"));
    const contractDataArray = [];
    const contractArray = [];
    const bondDetails = [];

    const handleBondStatus = (status, suspend) => {
      if(suspend == true){
        return 'SUSPENDED ⚫';
      }
      else if (status == '0'){
        return 'PRE-ISSUE ⚪';
      }
      else if(status == '1'){
        return 'ISSUED 🟡';
      }
      else if(status == '2'){
        return 'ACTIVE 🟢';
      }
      else if(status == '3'){
        return 'BANKRUPT 🔴';
      }
      else{
        return 'REDEEMED 🔵';
      }
    }


    const loadBondDetails = async () => {
        for(let i = 0; i < contractArray.length; i++){
          let eachBond = [];

          eachBond.push(i+1);
          eachBond.push(contractArray[i]._address); //add address
          eachBond.push(await contractArray[i].methods.description().call());
          eachBond.push(handleBondStatus(await contractArray[i].methods.status().call(),
                                        await contractArray[i].methods.paused().call()));
          eachBond.push(await contractArray[i].methods.currentPeriod().call()); //to find %
          eachBond.push(await contractArray[i].methods.isReported().call());
          eachBond.push(await contractArray[i].methods.isVerified().call());
          eachBond.push(await contractArray[i].methods.verifier().call());

          bondDetails.push(eachBond);
        }
    };


    const [bondObjects, setBondObjects] = useState([]);
    const [selectedBondAddress, setSelectedBondAddress] = useState("");
    const [selectedBondABI, setSelectedBondABI] = useState("");
    const [selectedAction, setAction] = useState("");

    useEffect(() => {
        contractData.map((d) => {
            contractDataArray.push(Object.values(d));
        });
    
        for (let i = 0; i < contractDataArray.length; i++){
            let bondContract = new web3.eth.Contract(contractDataArray[i][1], contractDataArray[i][0]);
            contractArray.push(bondContract);
        }
        
        async function getBonds(){
            await loadBondDetails();
            setBondObjects(bondDetails.map(([id, address, description, state, current_period, is_reported, is_verified, verifier]) => 
            ({id, address, description, state, current_period, is_reported, is_verified, verifier})));
        }
        getBonds();
        
    });

    const [isVerifier, setVerifier] = useState(false);

    const checkVerifier = async(id) => {
      const addressArray = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      // console.log(addressArray[0]);
      // console.log(bondObjects[id-1].verifier);

      if(addressArray[0] === bondObjects[id-1].verifier.toLowerCase()){
        // console.log("true");
        setVerifier(true);
      }
    }

    function print(){
        console.log(bondObjects[0].is_verified);
    }

    // function printBondID(){
    //     console.log(selectedBond);
    // }
    
    useEffect(() => {
        if(selectedBondAddress.length > 0 && selectedBondABI.length > 0){
            console.log(selectedBondAddress);
            console.log(selectedBondABI);

            const bondContract = new web3.eth.Contract(
              selectedBondABI,
              selectedBondAddress
            );

            if(selectedAction === "pass"){
                metKPIs(bondContract);
            }
            else if(selectedAction === "fail"){
                didNotMeetKPIs(bondContract);
            }
        }
    }, [selectedBondAddress, selectedBondABI, selectedAction])


    const [show, setShow] = useState(false);
    
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const [fileID, setFileID] = useState('');

    const inputHandlerFileID = event => {
      event.preventDefault();
      setFileID(event.target.value);
    }

    const handleClickFile = () => {
      if(fileID != ''){
      const url = `https://dweb.link/ipfs/${fileID}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      // showMessage(<span>&gt; 🔗 <a href={url}>{url}</a></span>)
      }
    }

    // const schema = yup.object().shape({
    //   fileID: yup.string().required(),
    // })

    const handleClickMetKPI = (id) => {
        setSelectedBondAddress(contractArray[id-1]._address);
        setSelectedBondABI(contractArray[id-1]._jsonInterface);
        setAction("pass");
    }

    //set KPI status functions
    
    const handleClickDidNotMeetKPI = (id) => {
        setSelectedBondAddress(contractArray[id-1]._address);
        setSelectedBondABI(contractArray[id-1]._jsonInterface);
        setAction("fail");
    }

    const metKPIs = (async (bondContract) => {
      const iotexChainID = await web3.eth.net.getId();
  
      const transactionParameters = {
        to: bondContract._address, // Required except during contract publications.
        from: walletAddress, // must match user's active address.
        data: bondContract.methods.verifyImpact(true).encodeABI(),
        // gasPrice: "1000000000000",
        // gas: "85000",
        chainId: iotexChainID
      };
  
      await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [transactionParameters],
      });
  
    })

    const didNotMeetKPIs = (async (bondContract) => {
      const iotexChainID = await web3.eth.net.getId();
  
      const transactionParameters = {
        to: bondContract._address, // Required except during contract publications.
        from: walletAddress, // must match user's active address.
        data: bondContract.methods.verifyImpact(false).encodeABI(),
        // gasPrice: "1000000000000",
        // gas: "85000",
        chainId: iotexChainID
      };
  
      await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [transactionParameters],
      });
  
    })

    const checkInput = () => {
      if(fileID == ''){
        return false;
      }
      else{
        return true;
      }
    }
    
    return (
        <>
            <div
            style={{
            backgroundImage: `url(${verifier_bg})`,
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
    
          <br></br>
    
          <div className="content-container-sub">
            <br></br>
            <h1 className="fw-bold" >Verifier dashboard</h1>
          </div>

          <Container>
          <br></br>
    
            <Table striped bordered hover variant = "success">
            <thead>
            <tr>
            <th>ID</th>
            {/* <th>Address</th> */}
            <th>Description</th>
            <th>Bond state</th>
            <th>Current coupon period</th>
            <th>Reported?</th>
            <th>Verified?</th>
            <th>Action</th>
            </tr>
            </thead>   

            <tbody>
            
            {bondObjects.map(item => (
                 <tr key={item.id}>
                 <td>{item.id}</td>
                 {/* <td>{item.address}</td> */}
                 <td>{item.description}</td>
                 <td>{item.state}</td>
                 <td>{item.current_period}</td>
                 <td>{item.is_reported.toString()}</td>
                 <td>{item.is_verified.toString()}</td>
                <td>
                <Dropdown>
                  
                <DropdownButton onClick = {()=> checkVerifier(item.id)} variant="success" title="Select.." size = "sm">
                  <Dropdown.Item onClick={handleShow} disabled = {!isVerifier}>📂 Retrieve IoT Data </Dropdown.Item>
                  <Dropdown.Item onClick={()=> handleClickMetKPI(item.id)} disabled = {!isVerifier}>✅ Met KPIs </Dropdown.Item>
                  <Dropdown.Item onClick={()=> handleClickDidNotMeetKPI(item.id)} disabled = {!isVerifier}>❌ Did not meet KPIs</Dropdown.Item>
                </DropdownButton>

                </Dropdown></td>
              </tr>
            ))}
            </tbody> 

            </Table>

            <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>Download IoT data</Modal.Title>
            </Modal.Header>

    
            <Form>

            <Modal.Body>
                Obtain the latest IoT data uploaded by issuer.
                <br></br>
                <br></br>
                
                <FloatingLabel
                controlId="floatingInput"
                label="Enter file ID"
                className="mb-1"
                
                >
                <Form.Control 
                  required
                  type="textarea"
                  name="fileID"
                  onChange={inputHandlerFileID}/>

                </FloatingLabel>

            </Modal.Body>
            <Modal.Footer>
                <Button onClick={handleClickFile} type = "submit" className="cta-button search-button" variant="success">
                  Submit
                </Button>

            </Modal.Footer>

            </Form>

            </Modal>

            {/* <td><Button onClick={printBondID}> test </Button></td> */}

            </Container>

            <br></br>
        </div>
        </>
      );

};

export default Verifier;