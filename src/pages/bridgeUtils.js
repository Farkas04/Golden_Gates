import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import Web3 from "web3";

export async function bridgeTokens(
  walletType,
  recvAddress,
  amount,
  destinationChain,
  currentAccount
) {
  if (walletType === "MetaMask") {
    return burnTokensOnEth(amount, destinationChain);
  } else if (walletType === "SuiWallet") {
    const burnResult = await burnTokensOnSui(amount, currentAccount);
    console.log("Minting tokens on Ethereum");
    const mintResult = await mintTokensOnEth(recvAddress, amount);
    console.log("Minting complete:", mintResult);
    return { burnResult, mintResult };
  } else {
    throw new Error("Unsupported wallet");
  }
}

async function mintTokensOnEth(recvAddress, amount) {
  try {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed");
    }

    const mintResponse = await fetch("http://localhost:3000/api/mint", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recvAddress: recvAddress,
        amount: amount,
        destinationChain: "Ethereum", 
      }),
    });

    if (!mintResponse.ok) {
      throw new Error(await mintResponse.text());
    }

    const result = await mintResponse.json();
    console.log("Mint Successfull:", result);
    return result;
  } catch (error) {
    console.error("Error minting:", error);
    throw error;
  }
}

async function burnTokensOnEth(amount, destinationChain) {
  try {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed");
    }

    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    const userAddress = accounts[0];

    console.log("Connected Address (MetaMask):", userAddress);

    const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
    const web3 = new Web3(window.ethereum);

    const abi = [
      {
        constant: false,
        inputs: [
          { name: "amount", type: "uint256" },
          { name: "destinationChain", type: "string" },
        ],
        name: "burnForBridge",
        outputs: [],
        type: "function",
      },
    ];

    const contract = new web3.eth.Contract(abi, contractAddress);

    const weiAmount = web3.utils.toWei(amount.toString(), "ether");

    const gasEstimate = await contract.methods
      .burnForBridge(weiAmount, destinationChain)
      .estimateGas({
        from: userAddress,
      });

    console.log("Estimated Gas:", gasEstimate);

    const tx = await contract.methods.burnForBridge(weiAmount, destinationChain).send({
      from: userAddress,
      gas: Math.round(Number(gasEstimate) * 1.2), 
      gasPrice: web3.utils.toWei("20", "gwei"), 
    });

    console.log("Burn for Bridge Transaction Successful:", tx);
    return tx;
  } catch (error) {
    console.error("Error burning tokens:", error);

    
    if (error.message.includes("User denied transaction signature")) {
      console.error("Transaction rejected by the user.");
    } else if (error.message.includes("insufficient funds")) {
      console.error("Insufficient funds");
    } else if (error.message.includes("reverted")) {
      console.error("Transaction reverted.");
    }

    throw error; 
  }
}

export async function burnTokensOnSui(amount, currentAccount) {
  try {
    if (!currentAccount || !currentAccount.address) {
      throw new Error("No account connected to Sui Wallet");
    }

    const userAddress = currentAccount.address;
    const client = new SuiClient({ url: "http://127.0.0.1:9000" });
    const IBTTOKEN_TYPE =
      "0x160d355df1f1b99e2823a2e5266f41d0a080b410adcb61f63b42bc79fc99fb42::IBTToken::IBTToken";

    const coins = await client.getCoins({
      owner: userAddress,
      coinType: IBTTOKEN_TYPE,
    });

    if (!coins.data || coins.data.length === 0) {
      throw new Error("No IBTToken coins found");
    }

    const coinToBurn = coins.data[0].coinObjectId;

    
    const response = await fetch("http://localhost:3000/api/burn", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amount,
        userAddress: userAddress,
        coinObjectId: coinToBurn,
      }),
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return await response.json();
  } catch (error) {
    console.error("Error in burnTokensOnSui:", error);
    throw error;
  }
}
