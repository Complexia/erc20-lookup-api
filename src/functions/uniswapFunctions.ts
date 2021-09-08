import { MinAbi } from "../abi/minAbi";
import { TokenAbi } from "../abi/tokenAbi";
import { UniswapV2FactoryAbi } from "../abi/uniswapV2FactoryAbi";
import { UniswapV2PoolAbi } from "../abi/uniswapV2PoolAbi";
import { UniswapV3FactoryAbi } from "../abi/uniswapV3FactoryAbi";
import { UniswapV3PoolAbi } from "../abi/uniswapV3PoolAbi";

export const UniswapFunctions = (web3: any) => {

    
    const minAbiModule = MinAbi();   
    const tokenAbiModule = TokenAbi();
    const uniswapV2FactoryAbiModule = UniswapV2FactoryAbi();
    const uniswapV3FactoryAbiModule = UniswapV3FactoryAbi();
    const uniswapV3PoolAbiModule = UniswapV3PoolAbi();
    const uniswapV2PoolAbiModule = UniswapV2PoolAbi();
    

    
    const minAbi = minAbiModule.getAbi();  
    const tokenAbi = tokenAbiModule.getAbi();
    const uniswapV2FactoryAbi = uniswapV2FactoryAbiModule.getAbi();
    const uniswapV3FactoryAbi = uniswapV3FactoryAbiModule.getAbi();
    const uniswapV3PoolAbi = uniswapV3PoolAbiModule.getAbi();
    const uniswapV2PoolAbi = uniswapV2PoolAbiModule.getAbi();
    

    const getTokenPriceETH = async(address: string) => {
   

        let uniswapV2FactoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
        let uniswapV3FactoryAddress = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
        
        let uniswapV2Factory = new web3.eth.Contract(uniswapV2FactoryAbi, uniswapV2FactoryAddress);
        let uniswapV3Factory = new web3.eth.Contract(uniswapV3FactoryAbi, uniswapV3FactoryAddress);

        let wethAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
        let poolAddresses: any = [];

        let versionIndicator = 3;

        let contractToken = new web3.eth.Contract(tokenAbi, address);
        let contractWeth = new web3.eth.Contract(minAbi, wethAddress);
        
        //let events = await uniswap.getPastEvents("PoolCreated", { fromBlock: uniswapV3FactoryCreationBlock, toBlock: currentBlock });
        let poolAddress = await uniswapV3Factory.methods.getPool(address, wethAddress, 3000).call();
        
        if(!poolAddress || poolAddress == "0x0000000000000000000000000000000000000000") {
            
            poolAddress = await uniswapV3Factory.methods.getPool(address, wethAddress, 10000).call();
            
        }
        if(!poolAddress || poolAddress == "0x0000000000000000000000000000000000000000") {
            
            poolAddress = await uniswapV3Factory.methods.getPool(address, wethAddress, 500).call();
        }
        
        
        if(!poolAddress || !(poolAddress == "0x0000000000000000000000000000000000000000")) {
            let balanceWeth = await contractWeth.methods.balanceOf(poolAddress).call();
            //balanceWeth = parseFloat(balanceWeth) / Math.pow(10,18);
            
            if(!(balanceWeth < 95000000000016)) {
                poolAddresses.push(poolAddress);
            
            }
            
            
        }

        if(poolAddresses.length == 0) {
            console.log("UniswapV3 has no pools for this token...Searching V2...");
            let pairAddress = await uniswapV2Factory.methods.getPair(address, wethAddress).call();
            if(pairAddress && !(pairAddress == "0x0000000000000000000000000000000000000000")) {
            poolAddresses.push(pairAddress);
            versionIndicator = 2;
            }
            
        }

        console.log(poolAddresses[0]);
        if(poolAddresses.length == 0) {
            console.log("Uniswap V2 does not have pools for this token...");
            versionIndicator = 0;
            return 0;
        }
        let tokenPriceETH = 0;
        if(versionIndicator == 3) {
            let contractPoolV3 = new web3.eth.Contract(uniswapV3PoolAbi, poolAddresses[0]);
            console.log(poolAddresses[0]);
            let n = await contractPoolV3.methods.slot0().call();
            console.log(n);
            let tokenDecimal = await contractToken.methods.decimals().call();
            
            tokenPriceETH = (Math.pow(parseFloat(n.sqrtPriceX96), 2)) / Math.pow(2, 192);
            
            
            
            tokenPriceETH = tokenPriceETH / Math.pow(10,(18 - tokenDecimal));
            console.log("Price ETH", tokenPriceETH);

            ////////////////////////

            
            



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

            

            tokenPriceETH = 1/ (balanceToken / balanceWeth);
        }
        else {
            tokenPriceETH = 0;
        }
        console.log("Price ETH", tokenPriceETH);
        return tokenPriceETH;
      
      }

      const getTokenPriceUSD = async(address: string) => {


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

      const getEarliestUniswapPool = async(address: string) => {

        let uniswapV2FactoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
        let uniswapV2Factory = new web3.eth.Contract(uniswapV2FactoryAbi, uniswapV2FactoryAddress);
        //console.log(uniswapV2Factory);
        let uniswapV2FactoryCreationBlock = 10000835;
        let uniswapV3FactoryCreationBlock = 12369621;
        let currentBlock = await web3.eth.getBlockNumber();
        //let currentBlock = uniswapV3FactoryCreationBlock;
        // let addressWeth = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";


        // let pairAddress = await uniswapV2Factory.methods.getPair(addressLink, addressWeth).call();
        // let pairPool = new web3.eth.Contract(uniswapV2PoolAbi, pairAddress);
        
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

      return {
          getTokenPriceETH: getTokenPriceETH,
          getTokenPriceUSD: getTokenPriceUSD,
          getEarliestUniswapPool: getEarliestUniswapPool,
          getContractCreationDate: getContractCreationDate
      }
}