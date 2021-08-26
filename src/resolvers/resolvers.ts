import { ContractFunctions } from "../functions/contractFunctions"

import dotenv = require('dotenv');
import { EthFunctions } from "../functions/ethFunctions";

dotenv.config();

const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const uri = `https://eth-mainnet.alchemyapi.io/v2/${process.env.API_KEY}`;
const web3 = createAlchemyWeb3(uri);

export const resolvers = {

    Query: {
        getTokenName: async(_: any, { address }) => {
            const contractFunctions = ContractFunctions(web3);
            let tokenName = await contractFunctions.getTokenName(address);
            return tokenName;
        },
        getTotalSupply: async(_: any, { address }) => {
            const contractFunctions = ContractFunctions(web3);
            let totalSupply = await contractFunctions.getTotalSupply(address);
            return totalSupply;
        },

        getTxnsList: async(_: any, { address, block }) => {
            const ethFunctions = EthFunctions(web3);
            let txnsList = await ethFunctions.getAllTxns(address, block);
            //console.log(txnsList);
            return txnsList;
        }


        
    }

}