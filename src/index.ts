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
  let fromBlock = await getEarliestUniswapPool(address);
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

async function getEarliestUniswapPool(address: string) {

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
      console.log(eventsRecorded[i].blockNumber)
      blockNumbers.push(eventsRecorded[i].blockNumber);

      // console.log(eventsRecorded[i].returnValues.pair);
      // poolAddresses.push(eventsRecorded[i].returnValues.pair);
      // let poolContract = new web3.eth.Contract(uniswapV3PoolAbi, poolAddress);
      // poolContracts.push(poolContract);
        
            
    }
  }
  blockNumbers = blockNumbers.sort();
  console.log(blockNumbers, "Earliest block", blockNumbers[0]);
  return blockNumbers[0];

}

async function getContractCreationDate(address: string) {
  

  let uniswapV2FactoryCreationBlock = 10000835;
  let uniswapV3FactoryCreationBlock = 12369621;

  let currentBlock = await getEarliestUniswapPool(address);
  let txnFound = false;
  
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
   

  let uniswapV2FactoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
  let uniswapV3FactoryAddress = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
  
  let uniswapV2Factory = new web3.eth.Contract(uniswapV2FactoryAbi, uniswapV2FactoryAddress);
  let uniswapV3Factory = new web3.eth.Contract(uniswapV3FactoryAbi, uniswapV3FactoryAddress);

  let wethAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
  let poolAddresses: any = [];

  let versionIndicator = 3;
  
  //let events = await uniswap.getPastEvents("PoolCreated", { fromBlock: uniswapV3FactoryCreationBlock, toBlock: currentBlock });
  let poolAddress = await uniswapV3Factory.methods.getPool(address, wethAddress, 3000).call();
  
  if(!poolAddress || poolAddress == "0x0000000000000000000000000000000000000000") {
    
    poolAddress = await uniswapV3Factory.methods.getPool(address, wethAddress, 10000).call();
    
  }
  if(!poolAddress || poolAddress == "0x0000000000000000000000000000000000000000") {
    
    poolAddress = await uniswapV3Factory.methods.getPool(address, wethAddress, 500).call();
  }
  
  
  if(!poolAddress || !(poolAddress == "0x0000000000000000000000000000000000000000")) {
    poolAddresses.push(poolAddress);
  }

  if(poolAddresses.length == 0) {
    console.log("UniswapV3 has no pools for this token...Searching V2...");
    let pairAddress = await uniswapV2Factory.methods.getPair(address, wethAddress).call();
    if(pairAddress && !(pairAddress == "0x0000000000000000000000000000000000000000")) {
      poolAddresses.push(pairAddress);
      versionIndicator = 2;
    }
       
  }
  if(poolAddresses.length == 0) {
    console.log("Uniswap V2 does not have pools for this token...");
    versionIndicator = 0;
    return 0;
  }
  let tokenPriceETH = 0;
  if(versionIndicator == 3) {
    let contractPoolV3 = new web3.eth.Contract(uniswapV3PoolAbi, poolAddresses[0]);
    let contractToken = new web3.eth.Contract(tokenAbi, address);
    let n = await contractPoolV3.methods.slot0().call();
    
    tokenPriceETH = (Math.pow(parseFloat(n.sqrtPriceX96), 2) / (Math.pow(2, 192)));
    let tokenDecimal = await contractToken.methods.decimals().call();
    tokenPriceETH = tokenPriceETH / Math.pow(10,(18 - tokenDecimal));
  }
  else if(versionIndicator = 2) {
    //let contractPoolV2 = new web3.eth.Contract(uniswapV2PoolAbi, poolAddresses[0]);
    let contractToken = new web3.eth.Contract(tokenAbi, address);
    let contractWeth = new web3.eth.Contract(minAbi, wethAddress);
    let balanceToken = await contractToken.methods.balanceOf(poolAddresses[0]).call();
    let balanceWeth = await contractWeth.methods.balanceOf(poolAddresses[0]).call();
    let token1Decimal = await contractToken.methods.decimals().call();
    balanceToken = parseFloat(balanceToken) / Math.pow(10, token1Decimal)
    balanceWeth = parseFloat(balanceWeth) / Math.pow(10, 18);

    tokenPriceETH = 1/ (balanceToken / (balanceWeth + 1));
  }
  else {
    tokenPriceETH = 0;
  }
  return tokenPriceETH;

}


async function getTokenPriceUSD(address: string) {


  // let addressUSDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; 
  // let contractUSDC = new web3.eth.Contract(tokenAbi, addressUSDC);
  let addressUSDCPoolAddress = "0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8"

  let contractPoolV3 = new web3.eth.Contract(uniswapV3PoolAbi, addressUSDCPoolAddress);
  //let tokenDecimal = await contractUSDC.methods.decimals().call();
  
  let USDCdecimal = 6;
  
  let n = await contractPoolV3.methods.slot0().call();
  
  let ethPrice = (Math.pow(parseFloat(n.sqrtPriceX96), 2) / (Math.pow(2, 192)));
  ethPrice = 1/(ethPrice / Math.pow(10,(18 - USDCdecimal)));
  
  
  //let ethPriceGecko = await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=Ethereum&vs_currencies=usd");
  
  let tokenPriceEth = await getTokenPriceETH(address);
  //let tokenPriceUSD = tokenPriceEth * parseFloat(ethPriceGecko.data.ethereum.usd);
  let tokenPriceUSD = tokenPriceEth * ethPrice;
  
  //let ethPrice = await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=Ethereum&vs_currencies=usd");
  
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
  let addressBabyDoge = "0xAC8E13ecC30Da7Ff04b842f21A62a1fb0f10eBd5";
  let addressKishu = "0xA2b4C0Af19cC16a6CfAcCe81F192B024d625817D";
  //0xc85FeA5c8DB5bfc80E40DD9D5999C239C1d6DA07
  let addressUSDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
  let addressWBTC = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599";
  let addressAAVE = "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9";
  let addressUNI = "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984";
  let addressWeth = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
  
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

  // let pool = await uniswapV3Factory.methods.getPool(addressLink, addressWeth, 500).call();
  // console.log(pool);
  //console.log(await getTokenPriceUSD(addressWBTC));
  // let poolAddress = await uniswapV3Factory.methods.getPool(addressUSDC, addressWeth, 10000).call();
  // console.log(poolAddress);
  // let pairAddress = await uniswapV2Factory.methods.getPair(addressLink, addressWETH).call();
  // console.log(pairAddress);
}

main();




