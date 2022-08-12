import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';

import { useEffect } from 'react';

import {
    connectWallet,
    getCurrentWalletConnected,
} from '../util/connectWallet.js';

import logo from '../assets/sustainable-green-logo.svg';
  
const NavBarMain = ({isConnected, setConnected, walletAddress, setWallet, status, setStatus}) => {

  useEffect(() => {
      async function fetchData() {
      const {address, status, isConnected} = await getCurrentWalletConnected();
      setWallet(address);
      setStatus(status);
      setConnected(isConnected);
  
      addWalletListener();
      };

      fetchData();
  }, []);

  function addWalletListener() { //TODO: from tutorial
      if (window.ethereum) {
          window.ethereum.on("accountsChanged", (accounts) => {
            if (accounts.length > 0) {
              setWallet(accounts[0]);
              setStatus("🦊 Connected");
              setConnected(true);
            } else {
              setWallet("");
              setStatus("🦊 Connect to Metamask wallet.");
              setConnected(false);
            }
          });
        } else {
          setStatus(
            <p>
              {" "}
              🦊{" "}
              <a target="_blank" href={`https://metamask.io/download.html`}>
                You must install Metamask, a virtual Ethereum wallet, in your
                browser.
              </a>
            </p>
          );
        }
  }
  
  const connectWalletPressed = async () => { //TODO: from tutorial
      const walletResponse = await connectWallet();
      setStatus(walletResponse.status);
      setWallet(walletResponse.address);
  };

  const connectButton = () => {
    return(
        <Button variant="outline-dark" onClick={!isConnected ? connectWalletPressed : null} >
            {/* Connect Wallet */}
            {walletAddress.length > 0 ? (
            "Connected: " +
            String(walletAddress).substring(0, 6) +
            "..." +
            String(walletAddress).substring(38)
            ) : (
            <span>Connect Wallet</span>
            )}
        </Button>

    )
  }
  return (
    <Navbar bg="success" variant="dark">
    <Container>
    <Navbar.Brand href="../">
        <img
        alt=""
        src={logo}
        width="40"
        height="30"
        className="d-inline-block align-top"
        />{' '}
        Sustainability-Linked Bonds Platform
    </Navbar.Brand>

    <Navbar.Toggle />
    <Navbar.Collapse className="justify-content-end">
        {connectButton()}
    </Navbar.Collapse>
    
    </Container>
</Navbar>
  );
};
  
export default NavBarMain;