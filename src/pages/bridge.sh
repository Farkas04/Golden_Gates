#!/bin/bash





action=$1
amount=$2
receiver_address=$3
coin_object_id=$4

ETH_RPC_URL="http://127.0.0.1:8545"  #
ETH_CONTRACT_ADDRESS="0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512" 
DEPLOYER_PRIVATE_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"


SUI_PACKAGE_ID="0x160d355df1f1b99e2823a2e5266f41d0a080b410adcb61f63b42bc79fc99fb42"
SUI_ADMIN_CAP_OBJECT_ID="0xee4cf5e0be8c9048104817af9a4bd80a3711413c9fa5b35c329ab97ff624e934"

echo "Received Address: $receiver_address"

if [ "$action" == "mint" ]; then
    echo "Minting $amount IBT on Sui for Ethereum"
    sui client call --package "$SUI_PACKAGE_ID" --module IBTToken --function mint_to_destination --args "$SUI_ADMIN_CAP_OBJECT_ID" "$receiver_address" "$amount" --gas-budget 10000000
elif [ "$action" == "burn" ]; then
    echo "Switching to account address: $receiver_address"
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
    echo "Invalid action."
    exit 1
fi