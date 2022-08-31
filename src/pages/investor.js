import React, { useEffect } from "react";
import {useState} from 'react';
import { useNavigate } from "react-router-dom";

import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Table from 'react-bootstrap/Table';


import NavBarHome from '../components/NavBarHome.js';
import investor_bg from '../assets/investor-background.jpg';

import {contractData} from "../util/contractData"

import Web3 from 'web3';



const Investor = () => {
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
            let eachBond = []; //should be in for loop

            const totalPurchasedBonds = await contractArray[i].methods.getTotalPurchasedBonds().call();
            const totalBonds = await contractArray[i].methods.totalBondsIssued().call();

            var percentageBondsPurchased = (totalPurchasedBonds/totalBonds) * 100;

            if(totalBonds === '0'){
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
            // eachBond.push(await contractArray[i].methods.interestPenalty().call()); //if necessary

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
        console.log(contractArray);
        
        async function getBonds(){
            await loadBondDetails();
            setBondObjects(bondDetails.map(([id, address, description, state, bonds_purchased, bond_price, coupon]) => 
            ({id, address, description, state, bonds_purchased, bond_price, coupon})));
        }
        getBonds();
        
    }); 

    
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
        navigate('/investor/results', {state: {selectedBondAddress, selectedBondABI}});
    }

    return (
        <>
            <div
            style={{
            backgroundImage: `url(${investor_bg})`,
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
            <h1 className="fw-bold text-light" >Investor dashboard</h1>
          </div>

          <Container>
          <br></br>
            <div style={{height: 465, overFlowX: 'auto', overflowY : 'auto'}}> 
            <Table striped bordered hover variant = "success" responsive>
            <thead>
            <tr>
            <th>ID</th>
            {/* <th>Address</th> */}
            <th>Description</th>
            <th>Bond state</th>
            <th>Bond units purchased (%)</th>
            <th>Bond price per unit (IOTX)</th>
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
                <Button onClick={()=> handleClickView(item.id)} variant="success" className="cta-button search-button small btn-space">
                View more
                </Button>
                </td>
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

export default Investor;