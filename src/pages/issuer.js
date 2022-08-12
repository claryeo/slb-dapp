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


import NavBarHome from '../components/NavBarHome.js';
import issuer_bg from '../assets/issuer-background.jpg';

import {contractData} from "../util/contractData"

import Web3 from 'web3';



const Issuer = () => {
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

          const totalPurchasedBonds = await contractArray[i].methods.getTotalPurchasedBonds().call();
          const totalBonds = await contractArray[i].methods.totalBondsIssued().call();

          var percentageBondsPurchased = (totalPurchasedBonds/totalBonds) * 100;

          if(totalBonds == 0){
            percentageBondsPurchased = 0;
          }

          eachBond.push(i+1);
          eachBond.push(contractArray[i]._address); //add address
          eachBond.push(await contractArray[i].methods.description().call());
          eachBond.push(handleBondStatus(await contractArray[i].methods.status().call(),
                                        await contractArray[i].methods.paused().call()));
          eachBond.push(percentageBondsPurchased);
          eachBond.push(web3.utils.fromWei(await contractArray[i].methods.bondPrice().call()));
          eachBond.push(web3.utils.fromWei(await contractArray[i].methods.coupon().call()));
          eachBond.push(await contractArray[i].methods.issuer().call());
          // eachBond.push(await contractArray[i].methods.interestPenalty().call()); //if necessary

          bondDetails.push(eachBond);
        }
    };


    const [bondObjects, setBondObjects] = useState([]);
    const [selectedBondAddress, setSelectedBondAddress] = useState("");
    const [selectedBondABI, setSelectedBondABI] = useState("");
    const [selectedAction, setAction] = useState("");
    // const [isIssuer, setIssuer] = useState(false);

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
            setBondObjects(bondDetails.map(([id, address, description, state, bonds_purchased, bond_price, coupon, issuer]) => 
            ({id, address, description, state, bonds_purchased, bond_price, coupon, issuer})));
        }
        getBonds();
        
    }); //should not have callback here

    const [isIssuer, setIssuer] = useState(false);

    const checkIssuer = async(id) => {
      const addressArray = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log(addressArray[0]);
      console.log(bondObjects[id-1].issuer);

      if(addressArray[0] === bondObjects[id-1].issuer.toLowerCase()){
        console.log("true");
        setIssuer(true);
      }
    }

    function print(){
        console.log(bondObjects[0].address);
    }

    // function printBondID(){
    //     console.log(selectedBond);
    // }
    
    useEffect(() => {
        if(selectedBondAddress.length > 0 && selectedBondABI.length > 0){
            console.log(selectedBondAddress);
            console.log(selectedBondABI);
            if(selectedAction === "balance"){
                navigateBalance();
            }
            else if(selectedAction === "issue"){
                navigateIssue();
            }
            else if(selectedAction === "status"){
                navigateStatus();
            }
            else if(selectedAction === "impact"){
                navigateImpact();
            }
        }
    }, [selectedBondAddress, selectedBondABI, selectedAction])

    const handleClickBalance = (id) => {
        setSelectedBondAddress(contractArray[id-1]._address);
        setSelectedBondABI(contractArray[id-1]._jsonInterface);
        setAction("balance");
    }
    
    
    const navigateBalance = () => {
        navigate('/issuer/balance', {state: {selectedBondAddress, selectedBondABI}});
    }

    const handleClickIssue = (id) => {
        setSelectedBondAddress(contractArray[id-1]._address);
        setSelectedBondABI(contractArray[id-1]._jsonInterface);
        setAction("issue");
    }

    const navigateIssue = () => {
        navigate('/issuer/bond_issue', {state: {selectedBondAddress, selectedBondABI}});
    }

    const handleClickStatus = (id) => {
        setSelectedBondAddress(contractArray[id-1]._address);
        setSelectedBondABI(contractArray[id-1]._jsonInterface);
        setAction("status");
    }

    const navigateStatus= () => {
        navigate('/issuer/bond_status', {state: {selectedBondAddress, selectedBondABI}});
    }
    
    const handleClickImpact = (id) => {
        setSelectedBondAddress(contractArray[id-1]._address);
        setSelectedBondABI(contractArray[id-1]._jsonInterface);
        setAction("impact");
    }

    const navigateImpact= () => {
        navigate('/issuer/report_impact', {state: {selectedBondAddress, selectedBondABI}});
    }

    return (
        <>
            <div
            style={{
            backgroundImage: `url(${issuer_bg})`,
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
            <h1 className="fw-bold" >Issuer dashboard</h1>
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
            <th>Bonds purchased (%)</th>
            <th>Bond price (IOTX)</th>
            <th>Coupon (IOTX)</th>
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
                 <td>{item.bonds_purchased}</td>
                 <td>{item.bond_price}</td>
                 <td>{item.coupon}</td>
                <td>
                <Dropdown>
                  
                <DropdownButton onClick = {()=> checkIssuer(item.id)} variant="success" title="Select.." size = "sm">
                    <Dropdown.Item onClick={()=> handleClickIssue(item.id)} disabled = {!isIssuer}>📃 Issue bond</Dropdown.Item>
                    <Dropdown.Item onClick={()=> handleClickBalance(item.id)} disabled = {!isIssuer}>💷 Bond balance</Dropdown.Item>
                    <Dropdown.Item onClick={()=> handleClickStatus(item.id)} disabled = {!isIssuer}>📌 Set bond status</Dropdown.Item>
                    <Dropdown.Item onClick={()=> handleClickImpact(item.id)} disabled = {!isIssuer}>📊 Report impact</Dropdown.Item>

                </DropdownButton>
                </Dropdown></td>
              </tr>
            ))}
            </tbody> 

            </Table>

            {/* <td><Button onClick={printBondID}> test </Button></td> */}

            </Container>

            <br></br>
        </div>
        </>
      );

};

export default Issuer;