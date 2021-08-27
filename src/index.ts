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
import { UniswapV3FactoryAbi } from "./abi/uniswapV3FactoryAbi";
import { UniswapV3PoolAbi } from "./abi/uniswapV3PoolAbi";

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
const uniswapV3FactoryAbiModule = UniswapV3FactoryAbi();
const uniswapV3PoolAbiModule = UniswapV3PoolAbi();

const erc20Abi = erc20.getAbi();
const minAbi = minAbiModule.getAbi();
const factoryAbi = factoryAbiModule.getAbi();
const exchangeAbi = exchangeAbiModule.getAbi();
const tokenAbi = tokenAbiModule.getAbi();
const uniswapV2FactoryAbi = uniswapV2FactoryAbiModule.getAbi();
const uniswapV3FactoryAbi = uniswapV3FactoryAbiModule.getAbi();
const uniswapV3PoolAbi = uniswapV3PoolAbiModule.getAbi();

const contractFunctions = ContractFunctions(web3);
const app  = express();
const typeDefs = importSchema(path.join(__dirname, 'schema/schema.graphql'))

const server = new ApolloServer({ typeDefs, resolvers });

//Launches Express server, to which Apollo is integrated
const startServer = async() => {
  console.log("hi");
  await server.start();
  server.applyMiddleware({ app });
  app.listen({ port: 4000 }, () =>
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
  )
  
}
startServer();












// uniswapV2 mainnet factory
const factory = "0xc0a47dFe034B400B47bDaD5FecDa2621de6c4d95";

//function getPair(address tokenA, address tokenB) external view returns (address pair);

const addressLink = "0x514910771af9ca656af840dff83e8264ecf986ca"; //user inputs addresses
const address = "0xd26114cd6EE289AccF82350c8d8487fedB8A0C07";

const addressUSDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; //USDC uniswap
const addressWETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; //WETH uniswap

const contract = new web3.eth.Contract(tokenAbi, addressLink);
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



async function getAllHolders() {
  let currentBlock = await web3.eth.getBlockNumber();
  //gets data from the last 10k blocks
  let txnsData = await web3.eth.getPastLogs({ fromBlock: currentBlock - 20, toBlock: currentBlock, address: addressLink });
  console.log(txnsData);
}

async function getTransferEvent(fromBlock: number, toBlock: number) {
  let currentBlock = await web3.eth.getBlockNumber();
  // watch for an event with {some: 'args'}
  //let transferEvent = await contract.events.Transfer({}, {fromBlock: currentBlock - 20, toBlock: currentBlock});
  let txnsData = await contract.getPastEvents('Transfer', { fromBlock: fromBlock, toBlock: toBlock });
  
  // transferEvent.watch(function(error, result){
  //   console.log(result)
  // });
  console.log(txnsData);
}

async function getContractCreationDate(address: string) {
  let currentBlock = await web3.eth.getBlockNumber();
  let txnFound = false;

  while(currentBlock >= 0 && !txnFound) {
    const block = await web3.eth.getBlock(currentBlock, true);
    const txns = block.transactions;

    for(let i = 0; i < txns.length; i++) {
      if(!txns[i].to) {
        const receipt = await web3.eth.getTransactionReceipt(txns[i].hash);
        if(receipt.contractAddress && receipt.contractAddress.toLowerCase() === address.toLowerCase()) {
          txnFound = true;
          console.log(`Contract Creator Address: ${txns[i].from}`);
          console.log(currentBlock);
        }
      }
    }
    currentBlock--;
    console.log(currentBlock);
  }
}

async function getTokenPrice(address: string) {
  let currentBlock = await web3.eth.getBlockNumber();
  let uniswapV3FactoryAddress = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
  let uniswap = new web3.eth.Contract(uniswapV3FactoryAbi, uniswapV3FactoryAddress);
  let events = await uniswap.getPastEvents("PoolCreated", { fromBlock: currentBlock - 13000000, toBlock: currentBlock });
  let wethAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
  let poolAddresses: any = [];
  let poolContracts: any = [];
  for(let i = 0; i < events.length; i++) {
    if(events[i].returnValues.token0.toLowerCase() == address.toLowerCase() || events[i].returnValues.token1.toLowerCase() == address.toLowerCase()) {
      if(events[i].returnValues.token0.toLowerCase() == wethAddress.toLowerCase() || events[i].returnValues.token1.toLowerCase() == wethAddress.toLowerCase()) {
        console.log("found");
        let token0Name = await contractFunctions.getTokenName(events[i].returnValues.token0);
        let token1Name = await contractFunctions.getTokenName(events[i].returnValues.token1);
        console.log(token0Name, token1Name);
        console.log(events[i].returnValues.pool);
        poolAddresses.push(events[i].returnValues.pool);
        // let poolContract = new web3.eth.Contract(uniswapV3PoolAbi, poolAddress);
        // poolContracts.push(poolContract);
        
      }      
    }
  }
  //console.log(poolContracts);
  //let balanceToken = await poolContracts[0].methods.token0().call();
  //let balanceWeth = await poolContracts[0].methods.token1.call();
  //console.log("HOHOHEY", balanceToken);
  let contractWeth = new web3.eth.Contract(minAbi, wethAddress);
  let totalBalanceToken = 0;
  let totalBalanceWeth = 0;
  for(let i = 0; i < poolAddresses.length; i++) {

    let balanceToken1 = await contract.methods.balanceOf(poolAddresses[i]).call();
    let balanceToken2 = await contractWeth.methods.balanceOf(poolAddresses[i]).call();
    balanceToken1 = web3.utils.fromWei(balanceToken1, 'ether')
    balanceToken2 = web3.utils.fromWei(balanceToken2, 'ether')
    totalBalanceToken = totalBalanceToken + parseFloat(balanceToken1);
    totalBalanceWeth = totalBalanceWeth + parseFloat(balanceToken2);
    console.log(balanceToken1, balanceToken2);
    
  }

  console.log(totalBalanceToken, totalBalanceWeth);
  let tokenPriceEth = (totalBalanceToken / totalBalanceWeth) / poolAddresses.length;
  console.log("Price: ", tokenPriceEth);
  // console.log(events[0].returnValues.token0, events[0].blockNumber);
  // console.log(events.length);
}









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


  // const contractFunctions = ContractFunctions(web3);
  // let totalSupply = await contractFunctions.getTotalSupply(address);
  // console.log(totalSupply);

  //await getTransferEvent(10,20);

  // const ethFunctions = EthFunctions(web3);

  // let txnsList = await ethFunctions.getAllTxns(addressLink, 20);
  // console.log(txnsList);
  let addressBabyDoge = "0xc85FeA5c8DB5bfc80E40DD9D5999C239C1d6DA07";
  //getContractCreationDate(addressBabyDoge);
  getTokenPrice(addressLink);


}

main();




