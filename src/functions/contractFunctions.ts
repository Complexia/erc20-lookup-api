import { MinAbi } from "../abi/minAbi";

//functions of the smart contract (query smart contract)
export const ContractFunctions = (web3: any) => {

    //ABI for ERC-20 queries 
    const minAbiModule = MinAbi();
    const minAbi = minAbiModule.getAbi();
    
    //token name
    const getTokenName = async(address: any) => {
        //contract from address
        const contract = new web3.eth.Contract(minAbi, address);
        let tokenName = await contract.methods.name().call();        
        return tokenName;
    }

    //total supply of a token
    const getTotalSupply = async(address: any) => {
        //contract from address
        const contract = new web3.eth.Contract(minAbi, address);
        let totalSupply = await contract.methods.totalSupply().call();
        return totalSupply;
    }

    return {
        getTokenName: getTokenName,
        getTotalSupply: getTotalSupply
    }
}