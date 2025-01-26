import React, { useState, useEffect } from "react";
import { ConnectModal, useCurrentAccount } from "@mysten/dapp-kit";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

const Login = () => {
  const [metamaskConnected, setMetamaskConnected] = useState(false);
  const [suiWalletConnected, setSuiWalletConnected] = useState(false);
  const [metamaskAddress, setMetamaskAddress] = useState("");
  const [suiWalletAddress, setSuiWalletAddress] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const currentAccount = useCurrentAccount(); // For Sui Wallet
  const navigate = useNavigate();

  // Connect MetaMask Function
  const connectMetaMask = async () => {
    try {
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed. Please install MetaMask.");
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      if (accounts && accounts.length > 0) {
        setMetamaskAddress(accounts[0]);
        setMetamaskConnected(true);
        setErrorMessage("");
        console.log("MetaMask Connected:", accounts[0]);
      }
    } catch (error) {
      setErrorMessage(error.message || "Failed to connect MetaMask.");
    }
  };

  // Automatically detect Sui Wallet connection
  useEffect(() => {
    if (currentAccount?.address) {
      setSuiWalletAddress(currentAccount.address);
      setSuiWalletConnected(true);
      setErrorMessage("");
      console.log("Sui Wallet Connected:", currentAccount.address);
    }
  }, [currentAccount]);

  // Proceed to Dashboard
  const handleNavigateToDashboard = () => {
    if (metamaskConnected || suiWalletConnected) {
      navigate("/dashboard");
    } else {
      setErrorMessage("Please connect a wallet before proceeding.");
    }
  };

  return (
    <div className="container">
      <h1 className="heading">Welcome to the Golden Gates Centralized Bridge</h1>
      <p className="subheading">
        The greatest bridge of all time. Please go ahead and have fun with transactions, you are RICH here :D
      </p>

      {/* Connect to MetaMask */}
      <button className="button" onClick={connectMetaMask} disabled={metamaskConnected}>
        {metamaskConnected ? `MetaMask Connected: ${metamaskAddress}` : "Connect with MetaMask"}
      </button>

      {/* Connect to Sui Wallet */}
      <ConnectModal
        trigger={
          <button className="button" disabled={suiWalletConnected}>
            {suiWalletConnected ? `Sui Wallet Connected: ${suiWalletAddress}` : "Connect with Sui Wallet"}
          </button>
        }
      />

      {/* Error Message */}
      {errorMessage && <p className="error">{errorMessage}</p>}

      {/* Continue to Dashboard */}
      {(metamaskConnected || suiWalletConnected) && (
        <button className="button" onClick={handleNavigateToDashboard}>
          Continue to Dashboard
        </button>
      )}

      {/* Informational Section */}
      <div className="info-section">
        <h2>What are Centralized Bridges?</h2>
        <p>
          Centralized bridges are platforms that facilitate the transfer of assets between different blockchain networks.
          They maintain control over liquidity and security to enable seamless cross-chain transactions.
        </p>
        <h2>What is MetaMask?</h2>
        <p>
          MetaMask is a browser-based cryptocurrency wallet that allows users to interact with Ethereum-based applications.
          It's secure, easy to use, and widely supported.
        </p>
        <h2>What is Sui Wallet?</h2>
        <p>
          Sui Wallet is a blockchain wallet specifically designed for the Sui network. It enables users to store, transfer,
          and interact with Sui tokens and decentralized applications.
        </p>
      </div>
    </div>
  );
};

export default Login;
