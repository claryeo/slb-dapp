import React, { useEffect } from "react";
import {useState} from 'react';
import { useNavigate } from "react-router-dom";

// import Toast from 'react-bootstrap/Toast';
// import ToastContainer from 'react-bootstrap/ToastContainer';
import Container from 'react-bootstrap/Container';
import Table from 'react-bootstrap/Table';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';

import NavBarHome from '../components/NavBarHome.js';
import regulator_bg from '../assets/regulator-background.jpg';

import {contractData} from "../util/contractData"

import Web3 from 'web3';



const Regulator = () => {
    const navigate = useNavigate();
  
    const [isConnected, setConnected] = useState(false);
    const [walletAddress, setWallet] = useState("");
    const [status, setStatus] = useState("");

    const web3 = new Web3(new Web3.providers.HttpProvider("https://babel-api.testnet.iotex.io"));
    const contractDataArray = [];
    const contractArray = [];
    const bondDetails = [];

    const handleBondStatus = (status, suspend) => {
      if(suspend === true){
        return 'SUSPENDED ⚫';
      }
      else if (status === '0'){
        return 'PRE-ISSUE ⚪';
      }
      else if(status === '1'){
        return 'ISSUED 🟡';
      }
      else if(status === '2'){
        return 'ACTIVE 🟢';
      }
      else if(status === '3'){
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
          eachBond.push(await contractArray[i].methods.issuer().call());
          eachBond.push(await contractArray[i].methods.verifier().call());
          eachBond.push(await contractArray[i].methods.description().call());
          eachBond.push(handleBondStatus(await contractArray[i].methods.status().call(),
                                        await contractArray[i].methods.paused().call()));
          eachBond.push(await contractArray[i].methods.owner().call());

          bondDetails.push(eachBond);
        }
    };


    const [bondObjects, setBondObjects] = useState([]);
    const [selectedBondAddress, setSelectedBondAddress] = useState("");
    const [selectedBondABI, setSelectedBondABI] = useState("");

    useEffect(() => {
        contractData.forEach((d) => {
            contractDataArray.push(Object.values(d));
        });
    
        for (let i = 0; i < contractDataArray.length; i++){
            let bondContract = new web3.eth.Contract(contractDataArray[i][1], contractDataArray[i][0]);
            contractArray.push(bondContract);
        }
        
        async function getBonds(){
            await loadBondDetails();
            setBondObjects(bondDetails.map(([id, address, issuer, verifier, description, state, owner]) => 
            ({id, address, issuer, verifier, description, state, owner})));
        }
        getBonds();
        
    });

    const [isRegulator, setRegulator] = useState(false);

    const checkRegulator = async(id) => {
      setRegulator(false);
      const addressArray = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log(addressArray[0]);
      console.log(bondObjects[id-1].owner);

      if(addressArray[0] === bondObjects[id-1].owner.toLowerCase()){
        console.log("true");
        setRegulator(true);
      }
    }

    useEffect(() => {
        if(selectedBondAddress.length > 0 && selectedBondABI.length > 0){
            console.log(selectedBondAddress);
            console.log(selectedBondABI);
            navigateBond();
        }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedBondAddress, selectedBondABI])

    const handleClickView = (id) => {
        setSelectedBondAddress(contractArray[id-1]._address);
        setSelectedBondABI(contractArray[id-1]._jsonInterface);
    }
    
    const navigateBond = () => {
        navigate('/regulator/results', {state: {selectedBondAddress, selectedBondABI}});
    }
    
    return (
        <>
            <div
            style={{
            backgroundImage: `url(${regulator_bg})`,
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
            <h1 className="fw-bold" >Regulator dashboard</h1>
          </div>

          <Container>
          <br></br>
    
          <div style={{height: 465, overFlowX: 'auto', overflowY : 'auto'}}> 
            <Table striped bordered hover variant = "success" responsive>
            <thead>
            <tr>
            <th>ID</th>
            {/* <th>Address</th> */}
            <th>Issuer</th>
            {/* <th>Verifier</th> */}
            <th>Description</th>
            <th>Bond state</th>
            <th>Action</th>
            </tr>
            </thead>   

            <tbody>
            
            {bondObjects.map(item => (
                 <tr key={item.id}>
                 <td>{item.id}</td>
                 {/* <td>{item.address}</td> */}
                 <td>{item.issuer}</td>
                 {/* <td>{item.verifier}</td> */}
                 <td>{item.description}</td>
                 <td>{item.state}</td>
                <td>
                <Dropdown>
                  
                <DropdownButton onClick = {()=> checkRegulator(item.id)} variant="success" title="Select.." size = "sm">
                  <Dropdown.Item onClick={()=> handleClickView(item.id)} disabled = {!isRegulator}>View more</Dropdown.Item>
                </DropdownButton>

                </Dropdown></td>
              </tr>
            ))}
            </tbody> 

            </Table>
            </div>

            </Container>

            <br></br>
        </div>
        </>
      );

};

export default Regulator;