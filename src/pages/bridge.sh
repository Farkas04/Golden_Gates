#!/bin/bash
action=$1
amount=$2
receiver_address=$3
coin_object_id=$4

ETH_RPC_URL="http://127.0.0.1:8545"  #
ETH_CONTRACT_ADDRESS="0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9" 
DEPLOYER_PRIVATE_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"


SUI_PACKAGE_ID="0xc22dc0e937cda4b1c3bb9295edfa4c1c1d8beea553c34a8f2117ecd9876bac87"
SUI_ADMIN_CAP_OBJECT_ID="0x404b37d8b8530180197839f394d1c5efc413494f8f88ce3a6f94ef0463589886"

echo "Received Address: $receiver_address"

if [ "$action" == "mint" ]; then
    echo "Minting $amount IBT on Sui for Ethereum"
    sui client call --package "$SUI_PACKAGE_ID" --module IBTToken --function mint_to_destination --args "$SUI_ADMIN_CAP_OBJECT_ID" "$receiver_address" "$amount" --gas-budget 10000000
elif [ "$action" == "burn" ]; then
    echo "Switching to the connected account address: $receiver_address"
    sui client switch --address $receiver_address
    echo "Admin Cap ID: $SUI_ADMIN_CAP_OBJECT_ID"
    echo "Coin Object ID: $coin_object_id"
    echo "Amount: $(echo "$amount")"
    echo "Destination Chain: Ethereum"
    echo "Burning $amount IBT on Sui for Ethereum"
    sui client call --package "$SUI_PACKAGE_ID" --module IBTToken --function burn_exact_for_bridge --args "$SUI_ADMIN_CAP_OBJECT_ID" "$coin_object_id" "$amount" "\"Ethereum\"" --gas-budget 10000000
elif [ "$action" == "eth" ]; then
    echo "Minting $amount IBT on Ethereum for $receiver_address"
    wei_amount=$(cast --to-wei $amount ether)
    cast send --rpc-url $ETH_RPC_URL --private-key $DEPLOYER_PRIVATE_KEY $ETH_CONTRACT_ADDRESS "mintForBridge(address,uint256,string)" $receiver_address $wei_amount "\"Sui\""
else
    echo "Invalid action. Use 'mint', 'burn', or 'eth'."
    exit 1
fi