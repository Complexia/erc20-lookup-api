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
import { UniswapV2PoolAbi } from "./abi/uniswapV2PoolAbi";
import { UniswapV3RouterAbi } from "./abi/uniswapV3RouterAbi";
import { UniswapV2RouterAbi } from "./abi/uniswapV2RouterAbi";
import { UniswapFunctions } from "./functions/uniswapFunctions";
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
const uniswapV2PoolAbiModule = UniswapV2PoolAbi();
const uniswapV3RouterAbiModule = UniswapV3RouterAbi();
const uniswapV2RouterAbiModule = UniswapV2RouterAbi();

const erc20Abi = erc20.getAbi();
const minAbi = minAbiModule.getAbi();
const factoryAbi = factoryAbiModule.getAbi();
const exchangeAbi = exchangeAbiModule.getAbi();
const tokenAbi = tokenAbiModule.getAbi();
const uniswapV2FactoryAbi = uniswapV2FactoryAbiModule.getAbi();
const uniswapV3FactoryAbi = uniswapV3FactoryAbiModule.getAbi();
const uniswapV3PoolAbi = uniswapV3PoolAbiModule.getAbi();
const uniswapV2PoolAbi = uniswapV2PoolAbiModule.getAbi();
const uniswapV3RouterAbi = uniswapV3RouterAbiModule.getAbi();
const uniswapV2RouterAbi = uniswapV2RouterAbiModule.getAbi();

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

let uniswapFunctions = UniswapFunctions(web3);
let ethFunctions = EthFunctions(web3);











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

async function getTransferEvents(address: string) {
  let currentBlock = await web3.eth.getBlockNumber();
  let fromBlock = await uniswapFunctions.getEarliestUniswapPool(address);
  let toBlock = fromBlock + 2000;
  let txnsDataRecorded: any = [];
  // watch for an event with {some: 'args'}
  //let transferEvent = await contract.events.Transfer({}, {fromBlock: currentBlock - 20, toBlock: currentBlock});
  while(toBlock < currentBlock) {

    let txnsData = await contract.getPastEvents('Transfer', { fromBlock: fromBlock, toBlock: toBlock });
    txnsDataRecorded.concat(txnsData);
    fromBlock = toBlock;
    toBlock += 2000;
    console.log(toBlock);
  }
  
  // transferEvent.watch(function(error, result){
  //   console.log(result)
  // });
  console.log(txnsDataRecorded.length);
}


async function getAllTxnsListAllTokens() {
  let address = "0x43f11c02439e2736800433b4594994bd43cd066d"; //iterate through a list of all tokens and set address to each one
  let currentBlock = await web3.eth.getBlockNumber();
  let earliestBlock = 12987858// await uniswapFunctions.getEarliestUniswapPool(address);
  let txnsList: any = [];
  for(let i = currentBlock; i > earliestBlock; i-=2000) {
    let txns = await ethFunctions.getAllTxns(address, i - 2000, i, 10);
    txnsList = txnsList.concat(txns);
    console.log(i);
    console.log(txns);
    console.log(txnsList.length);
  }
  console.log(txnsList);

}




async function getAllPoolsV2() {

  let minAbiBytes = [  
    // balanceOf
    {    
      constant: true,
      inputs: [{ name: "_owner", type: "address" }],
      name: "balanceOf",
      outputs: [{ name: "balance", type: "uint256" }],
      type: "function",
    },
    //name
    { 
      constant: true, 
      inputs:[],
      name: "name",
      outputs: [{name: "", type: "bytes32"}],
      payable: false, 
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "totalSupply",
      outputs:[{name: "totalSupply", type: "uint256"}],
      type: "function",
  
    },
    
  
  ];

  let uniswapV2FactoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
  let uniswapV2Factory = new web3.eth.Contract(uniswapV2FactoryAbi, uniswapV2FactoryAddress);
  let allPairsLength = await uniswapV2Factory.methods.allPairsLength().call();
  console.log(allPairsLength);
  let poolArray: any = [];

  // for(let i = 0; i < allPairsLength; i++) {

  //   let poolAddress = await uniswapV2Factory.methods.allPairs(i).call();
  
  //   let pairContract = new web3.eth.Contract(uniswapV2PoolAbi, poolAddress);
  //   let token0Address = await pairContract.methods.token0().call();
  //   let token0Contract = new web3.eth.Contract(minAbi, token0Address);
  //   let token0Name = "";
  //   try {
  //     token0Name = await token0Contract.methods.name().call();
  //   }
  //   catch {
  //     token0Contract = new web3.eth.Contract(minAbiBytes, token0Address);
  //     token0Name = web3.utils.toAscii(await token0Contract.methods.name().call());
  //   }
    
  //   let token1Address = await pairContract.methods.token1().call();
  //   let token1Contract = new web3.eth.Contract(minAbi, token1Address);
  //   let token1Name = "";
  //   try {
  //     token1Name = await token1Contract.methods.name().call();
  //   }
  //   catch {
  //     token1Contract = new web3.eth.Contract(minAbiBytes, token1Address);
  //     token1Name = await token1Contract.methods.name().call();
  //   }

    
  //   let pool = {
  //     token0Name: token0Name,
  //     token1Name: token1Name,
  //     token0Address: token0Address,
  //     token1Address: token1Address,
  //     poolAddress: poolAddress
  //   }
  //   console.log(pool);
  //   console.log(i);
  //   poolArray.push(pool);

  // }



    let poolAddress = await uniswapV2Factory.methods.allPairs(58).call();
    
    
    let pairContract = new web3.eth.Contract(uniswapV2PoolAbi, poolAddress);
    let token0Address = await pairContract.methods.token0().call();
    let token0Contract = new web3.eth.Contract(minAbi, token0Address);
    console.log("here");
    console.log(token0Address);
    let token0Name = "";
    try {
      token0Name = await token0Contract.methods.name().call();
    }
    catch {
      token0Contract = new web3.eth.Contract(minAbiBytes, token0Address);
      

      token0Name = web3.utils.toAscii(await token0Contract.methods.name().call());
      
      
    }
    
    let token1Address = await pairContract.methods.token1().call();
    let token1Contract = new web3.eth.Contract(minAbi, token1Address);
    let token1Name = "";
    try {
      token1Name = await token1Contract.methods.name().call();
    }
    catch {
      token1Contract = new web3.eth.Contract(minAbiBytes, token1Address);
      token1Name = await token1Contract.methods.name().call();
    }


      let pool = {
        token0Name: token0Name,
        token1Name: token1Name,
        token0Address: token0Address,
        token1Address: token1Address,
        poolAddress: poolAddress
      }
      console.log(pool);
      
      









  // let poolAddress = await uniswapV2Factory.methods.allPairs(25).call();
  // console.log(poolAddress, 25);
  // let pairContract = new web3.eth.Contract(uniswapV2PoolAbi, poolAddress);
  // let token0Address = await pairContract.methods.token0().call();
  // console.log(token0Address);
  // let token0Contract = new web3.eth.Contract(minAbi, token0Address);
  // try {
  //   let token0Name = web3.utils.toAscii(await token0Contract.methods.name().call());
  // }
  // catch {
  //   console.log("caught");
  //   token0Contract = new web3.eth.Contract(minAbiBytes, token0Address);
  //   let token0Name = web3.utils.toAscii(await token0Contract.methods.name().call());
  //   console.log(token0Name);
  // }
  
  // let token1Address = await pairContract.methods.token1().call();
  // let token1Contract = new web3.eth.Contract(minAbi, token1Address);
  // let token1Name = await token1Contract.methods.name().call();
  // console.log(token1Name);

  
  // let pool = {
  //   token0Name: token0Name,
  //   token1Name: token1Name,
  //   token0Address: token0Address,
  //   token1Address: token1Address,
  //   poolAddress: poolAddress
  // }
  // //poolArray.push(pool);


  // console.log(pool);



  
  
  let data = JSON.stringify(poolArray);
  
  //console.log(token1Name);
  //token0Name, token1Name, token0Address, token1Address, poolAddress, 

  // const fs = require('fs');

  // // write JSON string to a file
  // fs.writeFile('uniswapV2Pools.json', data, (err) => {
  //   if (err) {
  //       throw err;
  //   }
  //   console.log("JSON data is saved.");
  // });

}

async function getPopularPools(address: string) {

    const addressUSDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; //USDC 
    const addressWETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; //WETH 
    const addressUSDT = "0xdAC17F958D2ee523a2206206994597C13D831ec7"; //USDT 

    let uniswapV2FactoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
    let uniswapV2Factory = new web3.eth.Contract(uniswapV2FactoryAbi, uniswapV2FactoryAddress);

    let uniswapV3FactoryAddress = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
    let uniswapV3Factory = new web3.eth.Contract(uniswapV3FactoryAbi, uniswapV3FactoryAddress);

    let poolAddressWETHV3 = await uniswapV3Factory.methods.getPool(address, addressWETH, 3000).call();
    let poolAddressUSDCV3 = await uniswapV3Factory.methods.getPool(address, addressUSDC, 3000).call(); 
    let poolAddressUSDTV3 = await uniswapV3Factory.methods.getPool(address, addressUSDT, 3000).call();

    let poolAddressWETHV2 = await uniswapV2Factory.methods.getPair(address, addressWETH).call();
    let poolAddressUSDCV2 = await uniswapV2Factory.methods.getPair(address, addressUSDC).call(); 
    let poolAddressUSDTV2 = await uniswapV2Factory.methods.getPair(address, addressUSDT).call();

    // let pairContractWETHV3 = new web3.eth.Contract(uniswapV3PoolAbi, poolAddressWETHV3);
    // let pairContractUSDCV3 = new web3.eth.Contract(uniswapV3PoolAbi, poolAddressUSDCV3);
    // let pairContractUSDTV3 = new web3.eth.Contract(uniswapV3PoolAbi, poolAddressUSDTV3);

    // let pairContractWETHV2 = new web3.eth.Contract(uniswapV2PoolAbi, poolAddressWETHV2);
    // let pairContractUSDCV2 = new web3.eth.Contract(uniswapV2PoolAbi, poolAddressUSDCV2);
    // let pairContractUSDTV2 = new web3.eth.Contract(uniswapV2PoolAbi, poolAddressUSDTV2);

    let tokenContract = new web3.eth.Contract(minAbi, address);
    //let tokenName = web3.utils.toAscii(await tokenContract.methods.name().call());
    let tokenName = await tokenContract.methods.name().call();
    //let tokenSymbol = web3.utils.toAscii(await tokenContract.methods.symbol().call());
    let tokenSymbol = await tokenContract.methods.symbol().call();

    let pools: any = [];
    
    let poolWETHV3 = {
        token0Name: tokenName,
        token0Symbol: tokenSymbol,
        token0Address: address,       
        token1Name: "Wrapped ETH",
        token1Symbol: "WETH",
        token1Address: addressWETH,
        poolAddress: poolAddressWETHV3,
        exchange: "Uniswap V3"
    }

    let poolUSDCV3 = {
      token0Name: tokenName,
      token0Symbol: tokenSymbol,
      token0Address: address,       
      token1Name: "USD Coin",
      token1Symbol: "USDC",
      token1Address: addressUSDC,
      poolAddress: poolAddressUSDCV3,
      exchange: "Uniswap V3"
    }

    let poolUSDTV3 = {
      token0Name: tokenName,
      token0Symbol: tokenSymbol,
      token0Address: address,       
      token1Name: "USD Tether",
      token1Symbol: "USDT",
      token1Address: addressUSDT,
      poolAddress: poolAddressUSDTV3,
      exchange: "Uniswap V3"
    }

    let poolWETHV2 = {
      token0Name: tokenName,
      token0Symbol: tokenSymbol,
      token0Address: address,       
      token1Name: "Wrapped ETH",
      token1Symbol: "WETH",
      token1Address: addressWETH,
      poolAddress: poolAddressWETHV2,
      exchange: "Uniswap V2"
    }

    let poolUSDCV2 = {
      token0Name: tokenName,
      token0Symbol: tokenSymbol,
      token0Address: address,       
      token1Name: "USD Coin",
      token1Symbol: "USDC",
      token1Address: addressUSDC,
      poolAddress: poolAddressUSDCV2,
      exchange: "Uniswap V2"
    }

    let poolUSDTV2 = {
      token0Name: tokenName,
      token0Symbol: tokenSymbol,
      token0Address: address,       
      token1Name: "USD Tether",
      token1Symbol: "USDT",
      token1Address: addressUSDT,
      poolAddress: poolAddressUSDTV2,
      exchange: "Uniswap V2"
    }

    if(poolAddressWETHV3 || !(poolAddressWETHV3 == "0x0000000000000000000000000000000000000000")) {
      pools.push(poolWETHV3)
    }
    if(poolAddressUSDCV3 || !(poolAddressUSDCV3 == "0x0000000000000000000000000000000000000000")) {
      pools.push(poolUSDCV3)
    }
    if(poolAddressUSDTV3 || !(poolAddressUSDTV3 == "0x0000000000000000000000000000000000000000")) {
      pools.push(poolUSDTV3)
    }
    if(poolAddressWETHV2 || !(poolAddressWETHV2 == "0x0000000000000000000000000000000000000000")) {
      pools.push(poolWETHV2)
    }
    if(poolAddressUSDCV2 || !(poolAddressUSDCV2 == "0x0000000000000000000000000000000000000000")) {
      pools.push(poolUSDCV2)
    }
    if(poolAddressUSDTV2 || !(poolAddressUSDTV2 == "0x0000000000000000000000000000000000000000")) {
      pools.push(poolUSDTV2)
    }

    return pools;

    
    

}

async function getDailyVolume(poolAddress: string, uniswapVersion: string) {

    let uniswapV2FactoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
    let uniswapV2Factory = new web3.eth.Contract(uniswapV2FactoryAbi, uniswapV2FactoryAddress);

    let uniswapV3FactoryAddress = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
    let uniswapV3Factory = new web3.eth.Contract(uniswapV3FactoryAbi, uniswapV3FactoryAddress);


    let currentBlock = await web3.eth.getBlockNumber();
    let blockNumber24hago = currentBlock - 5760; //average ethereum blocks produced per day

    let poolContract: any;

    if(uniswapVersion == "V3") {
      poolContract = new web3.eth.Contract(uniswapV3PoolAbi, poolAddress);
    }
    else if(uniswapVersion == "V2") {
      poolContract = new web3.eth.Contract(uniswapV2PoolAbi, poolAddress);
    }
    else {
      console.log("Invalid Uniswap version passed...");
      return 0;
    }

    let token0Address = await poolContract.methods.token0().call();
    let token1Address = await poolContract.methods.token1().call();
    console.log(token0Address, token1Address);

    let token0Contract = new web3.eth.Contract(minAbi, token0Address);
    let token1Contract = new web3.eth.Contract(minAbi, token1Address);

    let token0Name = await token0Contract.methods.name().call();
    let token1Name = await token1Contract.methods.name().call();

    let token0Decimal = await token0Contract.methods.decimals().call();
    let token1Decimal = await token1Contract.methods.decimals().call();

    let token0BalanceNow = await token0Contract.methods.balanceOf(poolAddress).call();
    let token1BalanceNow  = await token1Contract.methods.balanceOf(poolAddress).call();
    token0BalanceNow = parseFloat(token0BalanceNow) / Math.pow(10, token0Decimal);
    token1BalanceNow = parseFloat(token1BalanceNow) / Math.pow(10, token1Decimal);

    //balance ~24h ago
    let token0Balance24h = await token0Contract.methods.balanceOf(poolAddress).call(blockNumber24hago);
    let token1Balance24h  = await token1Contract.methods.balanceOf(poolAddress).call(blockNumber24hago);
    token0Balance24h = parseFloat(token0Balance24h) / Math.pow(10, token0Decimal);
    token1Balance24h = parseFloat(token1Balance24h) / Math.pow(10, token1Decimal);

    let token0Volume = 0;
    if(token0BalanceNow > token0Balance24h) {
      token0Volume = token0BalanceNow - token0Balance24h;
    }
    else {
      token0Volume = token0Balance24h - token0BalanceNow;
    }

    let token1Volume = 0;
    if(token1BalanceNow > token1Balance24h) {
      token1Volume = token1BalanceNow - token1Balance24h;
    }
    else {
      token1Volume = token1Balance24h - token1BalanceNow;
    }


    let dailyVolume = {
      token0Name: token0Name,
      token0Volume: token0Volume,
      token1Name: token1Name,
      token1Volume: token1Volume
    }

    return dailyVolume;



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


  const contractFunctions = ContractFunctions(web3);
  // let totalSupply = await contractFunctions.getTotalSupply(address);
  // console.log(totalSupply);

  //await getTransferEvent(10,20);

  const ethFunctions = EthFunctions(web3);

  // let txnsList = await ethFunctions.getAllTxns(addressLink, 20);
  // console.log(txnsList);
  let addressBabyDoge = "0xAC8E13ecC30Da7Ff04b842f21A62a1fb0f10eBd5";
  let addressKishu = "0xA2b4C0Af19cC16a6CfAcCe81F192B024d625817D";
  //0xc85FeA5c8DB5bfc80E40DD9D5999C239C1d6DA07
  let addressUSDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
  let addressWBTC = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599";
  let addressAAVE = "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9";
  let addressUNI = "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984";
  let addressWeth = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
  let addressFloki = "0x43f11c02439e2736800433b4594994bd43cd066d";
  
  //getContractCreationDate(addressKishu);
  //getTransferEvents(addressKishu);
  
  // let price = await getTokenPriceUSD(addressBabyDoge);
  // console.log(price);
  //getContractCreationDate(addressLink);
  let addressDextPoolV2 = "0xa29fe6ef9592b5d408cca961d0fb9b1faf497d6d";
  let addressLinkPoolV2 = "0xd8c8a2b125527bf97c8e4845b25de7e964468f77";
  let addressBabyDogePool = "0xaBa7AF37dBDC67b7463917e483B55340d153928A";
  let addressV3Router = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
  let addressV2Router = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
  let uniswapV2FactoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
  let uniswapV3FactoryAddress = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
  let contractPoolV2 = new web3.eth.Contract(uniswapV2PoolAbi, addressLinkPoolV2);
  let contract1PoolV2 = new web3.eth.Contract(uniswapV2PoolAbi, addressDextPoolV2);
  let uniswapV3Router = new web3.eth.Contract(uniswapV3RouterAbi, addressV3Router)
  let uniswapV2Router = new web3.eth.Contract(uniswapV2RouterAbi, addressV2Router);
  let uniswapV2Factory = new web3.eth.Contract(uniswapV2FactoryAbi, uniswapV2FactoryAddress);
  let uniswapV3Factory = new web3.eth.Contract(uniswapV3FactoryAbi, uniswapV3FactoryAddress);
  //console.log(uniswapV2Router);
  //console.log(await uniswapV2Router.methods.getAmountsOut(1.0, [addressLink, addressWeth]).call());
  //console.log(await uniswapV2Router.methods.getReserves(uniswapV2FactoryAddress, addressBabyDoge, addressWETH).call());
  //console.log(await uniswapV3Router.methods.amountOutMinimum().call());
  // console.log(await contractPoolV2.methods.price0CumulativeLast().call());
  // console.log(await contractPoolV2.methods.price1CumulativeLast().call());
  // let reserves = await contractPoolV2.methods.getReserves().call();
  //let price1 = await contract1PoolV2.methods.price0CumulativeLast().call();
  //let price1 = await contract1PoolV2.methods.price0CumulativeLast().call();
  // let price2 = await contractPoolV2.methods.price1CumulativeLast().call();
  // let cumLast = 211885767449625890864844894690025413968166159;

  // let fromBlockSample = await web3.eth.getBlockNumber();
  // let cumPrice0 = await contractPoolV2.methods.price0CumulativeLast().call();
  // let toBlockSample = await web3.eth.getBlockNumber();
  // console.log(fromBlockSample);
  // console.log(toBlockSample);
  // while(!(toBlockSample > fromBlockSample + 1)) {
  //   toBlockSample = await web3.eth.getBlockNumber();
  //   console.log(toBlockSample);
  // }
  // let cumPrice1 = await contractPoolV2.methods.price0CumulativeLast().call();
  // console.log(cumPrice0, cumPrice1);
  // let fromBlock = await web3.eth.getBlock(fromBlockSample);
  // let toBlock = await web3.eth.getBlock(toBlockSample);
  // //console.log(fromBlock);
  // let fromBlockTime = fromBlock.timestamp;
  // let toBlockTime = toBlock.timestamp;
  // console.log("Times", toBlockTime, fromBlockTime);

  // let price = (parseFloat(cumPrice1) - parseFloat(cumPrice0)) / (parseFloat(toBlockTime) - parseFloat(fromBlockTime));
  // console.log(price);
  




  //console.log(price1, price2);
  //price1 = parseFloat(price1) / Math.pow(10,18);
  //console.log(price1);
  //console.log(await uniswapV2Router.methods.getAmountOut(1, reserves._reserve0, reserves._reserve1).call());



  // let contractToken = new web3.eth.Contract(tokenAbi, addressBabyDoge);
  // let contractWeth = new web3.eth.Contract(tokenAbi, addressWETH);


  // let balanceToken = await contractToken.methods.balanceOf(addressBabyDogePool).call();
  // console.log(balanceToken);
  
  // let balanceWeth = await contractWeth.methods.balanceOf(addressBabyDogePool).call();
  // console.log(balanceWeth);
  // let token1Decimal = await contractToken.methods.decimals().call();
  // balanceToken = parseFloat(balanceToken) / Math.pow(10, 9)
  // balanceWeth = parseFloat(balanceWeth) / Math.pow(10, 18);

  // let tokenPriceETH = balanceToken / (balanceWeth + 1)

  //console.log(tokenPriceETH);

  //let pool = await uniswapV3Factory.methods.getPool(addressLink, addressWeth, 500).call();
  // console.log(pool);
  //console.log(await getTokenPriceUSD(addressFloki));
  // let poolAddress = await uniswapV3Factory.methods.getPool(addressUSDC, addressWeth, 10000).call();
  // console.log(poolAddress);
  // let pairAddress = await uniswapV2Factory.methods.getPair(addressLink, addressWETH).call();
  // console.log(pairAddress);

  //console.log(await getEarliestUniswapPool(addressLink));

  //let pairAddress = await uniswapV2Factory.methods.getPair(addressLink, addressWeth).call();
  //let pairPool = new web3.eth.Contract(uniswapV2PoolAbi, pairAddress);
  //console.log(pairPool);
  //  let ethFunctions = EthFunctions(web3);
  // // let uniswapFunctions  = UniswapFunctions(web3);
  // // console.log(await uniswapFunctions.getTokenPriceUSD(addressAAVE));
  // let currentBlock = await web3.eth.getBlockNumber();
  // // let txnsData = await ethFunctions.getAllTxns(addressLink, currentBlock-20, currentBlock );
  // // console.log(txnsData);

  // let txn = await web3.eth.getTransaction("0xc29bdcddf1d85a0409081da2585b2d4bb940ec20707cafd20bac1ec0798dc6aa");
  // console.log(txn);
  // let input = txn.input;
  // let amountHex = input.slice(74, input.length)
  // let amountTransferred = parseInt(amountHex, 16);
  // //let amountTransferred = web3.utils.toDecimal(amountHex);
  // amountTransferred = amountTransferred / Math.pow(10,18);
  // console.log(amountTransferred);
  //let currentBlock: number = await web3.eth.getBlockNumber();
  //console.log(await web3.eth.getTransactionCount(addressLink));
  //console.log(await ethFunctions.getAllTxns(addressLink, currentBlock - 10, currentBlock ));

 
  

  // for(let i = 0; i < allPairsLength; i++) {
  //   let pair = await uniswapV2Factory.methods.allPairs(i).call();
  //   console.log(pair);
  // }
  
  let qwertAddress = "0x6509f9cdcd547b06482fc79209c71c7c7493d5f1";
  let someAddress = "0x8b3192f5eebd8579568a2ed41e6feb402f93f73f";
  let addressXBE = "0x5de7cc4bcbca31c473f6d2f27825cfb09cc0bb16";
  //console.log(await uniswapFunctions.getTokenPriceUSD(addressBabyDoge));
  //await getAllTxnsListAllTokens();
  // let txnCount = await ethFunctions.getTxnsCount(addressBabyDoge, 12785828);
  // console.log(txnCount);

  // let pools = await getPopularPools(addressLink);
  // console.log(pools);

  //getAllPoolsV2();

  //let contractLink = new web3.eth.Contract(minAbi, addressLink);
  let linkPool = await uniswapV3Factory.methods.getPool(addressLink, addressWETH, 3000).call();
  let babyDogePool = await uniswapV2Factory.methods.getPair(addressBabyDoge, addressWETH).call();
  // let balanceLink = await contractLink.methods.balanceOf(linkPool).call(13000000);
  // console.log(balanceLink);
  console.log(linkPool);
  let volume = await getDailyVolume(babyDogePool, "V3");
  console.log(volume);



}



main();




