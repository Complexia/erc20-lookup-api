//functions of the smart contract (query smart contract)
export const ContractFunctions = () => {

    //token name
    const getTokenName = async(contract: any) => {
        let tokenName = await contract.methods.name().call();        
        return tokenName;
    }

    //total supply of a token
    const getTotalSupply = async(contract: any) => {
        let totalSupply = await contract.methods.totalSupply().call();
        return totalSupply;
    }

    return {
        getTokenName: getTokenName,
        getTotalSupply: getTotalSupply
    }
}