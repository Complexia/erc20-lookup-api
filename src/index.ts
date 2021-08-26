import { ERC20abi } from "./abi/erc20abi";
import { MinAbi } from "./abi/minAbi";
import { FactoryAbi } from "./abi/factoryAbi";
import { ExchangeAbi } from "./abi/exchangeAbi";
import { TokenAbi } from "./abi/tokenAbi";
import { UniswapV2FactoryAbi } from "./abi/uniswapV2FactoryAbi";
import { ContractFunctions } from "./functions/contractFunctions";
import { EthFunctions } from "./functions/ethFunctions";
import dotenv = require('dotenv');
import * as express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { importSchema } from 'graphql-import'
import * as path from 'path'
import { resolvers } from './resolvers/resolvers'

dotenv.config();

const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const uri = `https://eth-mainnet.alchemyapi.io/v2/${process.env.API_KEY}`;
const web3 = createAlchemyWeb3(uri);

const erc20 = ERC20abi();
const minAbiModule = MinAbi();
const factoryAbiModule = FactoryAbi();
const exchangeAbiModule = ExchangeAbi();
const tokenAbiModule = TokenAbi();
const uniswapV2FactoryAbiModule = UniswapV2FactoryAbi();

const erc20Abi = erc20.getAbi();
const minAbi = minAbiModule.getAbi();
const factoryAbi = factoryAbiModule.getAbi();
const exchangeAbi = exchangeAbiModule.getAbi();
const tokenAbi = tokenAbiModule.getAbi();
const uniswapV2FactoryAbi = uniswapV2FactoryAbiModule.getAbi();


const app  = express();
const typeDefs = importSchema(path.join(__dirname, 'schema/schema.graphql'))

const server = new ApolloServer({ typeDefs, resolvers });

const startServer = async() => {
  console.log("hi");
  await server.start();
  server.applyMiddleware({ app });
  app.listen({ port: 4000 }, () =>
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
  )
  
}
startServer();

console.log("hey");




//Launches Express server, to which Apollo is integrated





// uniswapV2 mainnet factory
const factory = "0xc0a47dFe034B400B47bDaD5FecDa2621de6c4d95";

//function getPair(address tokenA, address tokenB) external view returns (address pair);

const addressLink = "0x514910771af9ca656af840dff83e8264ecf986ca"; //user inputs addresses
const address = "0xd26114cd6EE289AccF82350c8d8487fedB8A0C07";

const addressUSDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; //USDC uniswap
const addressWETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; //WETH uniswap

const contract = new web3.eth.Contract(minAbi, address);
const factoryContract = new web3.eth.Contract(uniswapV2FactoryAbi, factory);

// const pairAddress = factoryContract.methods.getPair(addressUSDC, addressWETH).call((err, result) => {
  
//   console.log("pair", result);
// });


// const exchangeAddress = factoryContract.methods.getExchange(addressWETH).call((err, result) => {
  
//   console.log("hereresults", result);

//   const exchangeContract = new web3.eth.Contract(exchangeAbi, result);
//   const tokenAddress = factoryContract.methods.getToken(result).call((err, result) => {
//     console.log(result);
//     const tokenContract = new web3.eth.Contract(tokenAbi, result);

//     const tokenBalance = tokenContract.methods.balanceOf(result).call((err, result) => {
//       console.log("THis balance: ", result);
//     })

//   });
  
//   //const contract = new web3.eth.Contract(minAbi, result);
//   exchangeContract.methods.balanceOf(result).call((err, result) =>  {
//     console.log("Balance:", result);
//   });
  
// });

//console.log(exchangeAddress);

// contract.methods.name().call((err, result) =>  {
//   console.log(result);
// })

// contract.methods.totalSupply().call((err, result) =>  {
//   console.log("TotalSupply: ", result);
// })

// contract.methods.balanceOf(address).call((err, result) =>  {
//   console.log("Balance:", result);
// })













async function main() {
  
  // const blockNumber = await web3.eth.getBlockNumber();
  
  // console.log("The latest block number is " + blockNumber);
  // console.log("hi");

  // let tokenName = await getTokenName(contract);
  // console.log(tokenName);
  // let totalSupply = await getTotalSupply(contract);
  // console.log(totalSupply);

  // let txnsList = await getAllTxns(addressLink, 100);
  // //console.log(txnsList);
  // console.log(txnsList.length);

  // let txnsCount = await getTxnsCount(address);
  // console.log(txnsCount);


  const contractFunctions = ContractFunctions(web3);
  let totalSupply = await contractFunctions.getTokenName(address);
  console.log(totalSupply);

  const ethFunctions = EthFunctions(web3);

  let txnsList = await ethFunctions.getAllTxns(addressLink, 20);
  console.log(txnsList);


}

//main();




