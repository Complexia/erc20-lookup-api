import { ContractFunctions } from "../functions/contractFunctions"

import dotenv = require('dotenv');
import { EthFunctions } from "../functions/ethFunctions";
import { UniswapFunctions } from "../functions/uniswapFunctions";


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

        getTxnsList: async(_: any, { address, fromBlock, toBlock }) => {
            const ethFunctions = EthFunctions(web3);
            let txnsList = await ethFunctions.getAllTxns(address, fromBlock, toBlock);
            //console.log(txnsList);
            return txnsList;
        },

        getPriceETH: async(_:any, { address }) => {
            const uniswapFunctions = UniswapFunctions(web3);
            let tokenPriceETH = await uniswapFunctions.getTokenPriceETH(address);
            return tokenPriceETH;
        },

        getPriceUSD: async(_:any, { address }) => {
            const uniswapFunctions = UniswapFunctions(web3);
            let tokenPriceETH = await uniswapFunctions.getTokenPriceUSD(address);
            return tokenPriceETH;
        },

        getEarliestUniswapPool: async(_:any, { address }) => {
            const uniswapFunctions = UniswapFunctions(web3);
            let earliestPool = await uniswapFunctions.getEarliestUniswapPool(address);
            return earliestPool;
        }




        
    }

}