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
const axios = require('axios').default;

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
  let uniswapV2FactoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
  let uniswapV2Factory = new web3.eth.Contract(uniswapV2FactoryAbi, uniswapV2FactoryAddress);
  let uniswapV2FactoryCreationBlock = 10000835;
  let uniswapV3FactoryCreationBlock = 12369621;
  let currentBlock = await web3.eth.getBlockNumber();
  //let currentBlock = uniswapV3FactoryCreationBlock;
  console.log("here we are");
  let poolAddresses: any = [];
  let eventsRecorded: any = [];
  let blockIncrementV2 = 2000;
  let fromBlockV2 = uniswapV2FactoryCreationBlock;
  while(fromBlockV2 + blockIncrementV2 < currentBlock) {
    
    let events = await uniswapV2Factory.getPastEvents("PairCreated", { fromBlock: fromBlockV2, toBlock: fromBlockV2 + blockIncrementV2 });
    eventsRecorded = eventsRecorded.concat(events);
    console.log(fromBlockV2, events.length, eventsRecorded.length);
    
    fromBlockV2 += blockIncrementV2;
    blockIncrementV2 += 2000;
    
  }
  
  console.log(eventsRecorded.length);
  let blockNumbers: any = [];
  for(let i = 0; i < eventsRecorded.length; i++) {
    if(eventsRecorded[i].returnValues.token0.toLowerCase() == address.toLowerCase() || eventsRecorded[i].returnValues.token1.toLowerCase() == address.toLowerCase()) {
      
      console.log("found");
      //let token0Name = await contractFunctions.getTokenName(events[i].returnValues.token0);
      //let token1Name = await contractFunctions.getTokenName(events[i].returnValues.token1);
      //console.log(token0Name, token1Name);
      blockNumbers.push(eventsRecorded[i].blockNumber);

      // console.log(eventsRecorded[i].returnValues.pair);
      // poolAddresses.push(eventsRecorded[i].returnValues.pair);
      // let poolContract = new web3.eth.Contract(uniswapV3PoolAbi, poolAddress);
      // poolContracts.push(poolContract);
        
            
    }
  }
  blockNumbers = blockNumbers.reverse();
  console.log("Earliest block", blockNumbers[0]);


  
  let txnFound = false;
  currentBlock = blockNumbers[0];
  while(currentBlock >= uniswapV2FactoryCreationBlock && !txnFound) {
    const block = await web3.eth.getBlock(currentBlock, true);
    const txns = block.transactions;

    for(let i = 0; i < txns.length; i++) {
      if(!txns[i].to) {
        const receipt = await web3.eth.getTransactionReceipt(txns[i].hash);
        if(receipt.contractAddress && receipt.contractAddress.toLowerCase() === address.toLowerCase()) {
          txnFound = true;
          console.log(`Contract Creator Address: ${txns[i].from}`);
          console.log("Creation block: ", currentBlock);
        }
      }
    }
    currentBlock--;
    console.log(currentBlock);
  }
}

async function getTokenPriceETH(address: string) {
  let currentBlock = await web3.eth.getBlockNumber();
  let addressUSDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
  let addressUSDT = "0xdac17f958d2ee523a2206206994597c13d831ec7";
  let contractUSDC = new web3.eth.Contract(tokenAbi, addressUSDC);
  let contractUSDT = new web3.eth.Contract(tokenAbi, addressUSDT);
  let contract = new web3.eth.Contract(tokenAbi, address);

  let uniswapV3FactoryAddress = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
  let uniswap = new web3.eth.Contract(uniswapV3FactoryAbi, uniswapV3FactoryAddress);
  let uniswapV3FactoryCreationBlock = 12369621; 

  let uniswapV2FactoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
  let uniswapV2Factory = new web3.eth.Contract(uniswapV2FactoryAbi, uniswapV2FactoryAddress);
  let uniswapV2FactoryCreationBlock = 10000835;

  let wethAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
  let poolAddresses: any = [];


  //simulating cached pools reduces time by about 5secs
  // let pool1 = '0xa6Cc3C2531FdaA6Ae1A3CA84c2855806728693e8';
  // let pool2 = '0x5d4F3C6fA16908609BAC31Ff148Bd002AA6b8c83';
  // let pool3 = '0x3A0f221eA8B150f3D3d27DE8928851aB5264bB65';
  
  // poolAddresses.push(pool1);
  // poolAddresses.push(pool2);
  // poolAddresses.push(pool3);

  let events = await uniswap.getPastEvents("PoolCreated", { fromBlock: uniswapV3FactoryCreationBlock, toBlock: currentBlock });
  
  
  let fromBlockV2 = uniswapV2FactoryCreationBlock;
  
  let blockIncrementV2 = 2000;
  while (poolAddresses.length == 0) {

    for(let i = 0; i < events.length; i++) {
      if(events[i].returnValues.token0.toLowerCase() == address.toLowerCase() || events[i].returnValues.token1.toLowerCase() == address.toLowerCase()) {
        if(events[i].returnValues.token0.toLowerCase() == wethAddress.toLowerCase() || events[i].returnValues.token1.toLowerCase() == wethAddress.toLowerCase()) {
          console.log("found");
          let token0Name = await contractFunctions.getTokenName(events[i].returnValues.token0);
          let token1Name = await contractFunctions.getTokenName(events[i].returnValues.token1);
          console.log(token0Name, token1Name);
          if(blockIncrementV2 == 10000){

            console.log(events[i].returnValues.pool);
            poolAddresses.push(events[i].returnValues.pool);
          }
          else {
            console.log(events[i].returnValues.pair);
            poolAddresses.push(events[i].returnValues.pair);
          }
          // let poolContract = new web3.eth.Contract(uniswapV3PoolAbi, poolAddress);
          // poolContracts.push(poolContract);
          
        }      
      }
    }
    //in case uniswap v3 does not have transactions
    if(poolAddresses.length == 0) {
      console.log("UniswapV3 has no pools for this token...Searching V2...");
      
      events = await uniswapV2Factory.getPastEvents("PairCreated", { fromBlock: fromBlockV2, toBlock: fromBlockV2 + blockIncrementV2 });
      fromBlockV2 += blockIncrementV2;
      blockIncrementV2 += 2000;
      //console.log(12500000 + blockIncrementV2);
  }
    
  }


  //console.log(poolContracts);
  //let balanceToken = await poolContracts[0].methods.token0().call();
  //let balanceWeth = await poolContracts[0].methods.token1.call();
  //console.log("HOHOHEY", balanceToken);
  let contractToken = new web3.eth.Contract(tokenAbi, address);
  let contractWeth = new web3.eth.Contract(minAbi, wethAddress);
  let totalBalanceToken = 0;
  let totalBalanceWeth = 0;
  
  for(let i = 0; i < poolAddresses.length; i++) {
    console.log(poolAddresses[i]);
    let balanceToken1 = await contractToken.methods.balanceOf(poolAddresses[i]).call();
    let balanceToken2 = await contractWeth.methods.balanceOf(poolAddresses[i]).call();
    
    
    
    totalBalanceToken = totalBalanceToken + parseFloat(balanceToken1);
    totalBalanceWeth = totalBalanceWeth + parseFloat(balanceToken2);
    
    console.log(balanceToken1, balanceToken2);
    
  }
  let token1Decimal = await contractToken.methods.decimals().call();

  if(totalBalanceToken == 0) {
    return 0;
  }
  totalBalanceToken = totalBalanceToken / Math.pow(10, token1Decimal);
  
  totalBalanceWeth = totalBalanceWeth / Math.pow(10, 18); //weth decimal is 18
  console.log(totalBalanceToken, totalBalanceWeth);
  
  let tokenPriceEth = 0;
  let tokenPriceInEth = 0;
  if(totalBalanceToken > totalBalanceWeth) {

    tokenPriceEth = (totalBalanceToken / totalBalanceWeth) / poolAddresses.length;
    tokenPriceInEth = 1/tokenPriceEth;
  }
  else {
    tokenPriceEth = (totalBalanceWeth / totalBalanceToken); 
    tokenPriceInEth = tokenPriceEth;
  }
  
  
  
  
  //console.log("Price: ", tokenPriceEth);
  //let ethPrice = await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=Ethereum&vs_currencies=usd");
  //console.log(ethPrice.data.ethereum.usd);
  //console.log("Price: ", tokenPriceInEth);
  //let tokenPriceUSD = tokenPriceInEth * parseFloat(ethPrice.data.ethereum.usd);
  //console.log("Price in USD:", tokenPriceUSD);
  // console.log(events[0].returnValues.token0, events[0].blockNumber);
  // console.log(events.length);
  return tokenPriceInEth
}

async function getTokenPriceUSD(address: string) {
  let tokenPriceEth = await getTokenPriceETH(address);
  let ethPrice = await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=Ethereum&vs_currencies=usd");
  let tokenPriceUSD = tokenPriceEth * parseFloat(ethPrice.data.ethereum.usd);
  return tokenPriceUSD;
}









async function main() {
  
  // const blockNumber = await web3.eth.getBlockNumber();
  
  // console.log("The latest block number is " + blockNumber);
  // console.log("hi");
  // let addressU = "0xbbca2b6b6e8c76ba2d53f8d3cbab00a9e5535fe3";
  
  // let tokenName = await contractFunctions.getTokenName(addressU);
  // console.log(tokenName);
  // let totalSupply = await contractFunctions.getTotalSupply(addressU);
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
  let addressUSDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
  let addressWBTC = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599";
  let addressAAVE = "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9";
  let addressUNI = "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984";
  
  getContractCreationDate(addressBabyDoge);
  // let price = await getTokenPriceETH(addressBabyDoge);
  // console.log(price);
  //getContractCreationDate(addressLink);


}

main();




