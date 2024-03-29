import { TokenAbi } from "../abi/tokenAbi";

//functions which query the blockchain
export const EthFunctions = (web3: any) => {

    let tokenAbiModule = TokenAbi();
    let tokenAbi = tokenAbiModule.getAbi();

    //gets transactions from last #block blocks (10k limit on alchemy per call) if logs are available (most contracts)
    const getAllTxns = async( address: string, fromBlock: number, toBlock: number, increment: number, numberOfTxns: number ) => {
        //if not specified, looks from latest block
        if(fromBlock == 0) {
            fromBlock =  await web3.eth.getBlockNumber();
        }
        //if not specified, checks last 100 blocks
        if(toBlock == 0) {
            toBlock = fromBlock - 100;
        }
        //if not specified, increment by 10 blocks at a time
        if(increment == 0) {
            increment = 10;
        }
        
        //gets data from k to n blocks. can be iterated form the front end for more txns
        let txnsData: any = [];
        //get at least n txns
        while(txnsData.length < numberOfTxns) {
            console.log(fromBlock, toBlock);
            let data = await web3.eth.getPastLogs({ address: address, fromBlock: fromBlock, toBlock: toBlock });
            txnsData = txnsData.concat(data);
            
            toBlock = fromBlock;
            fromBlock = fromBlock - increment;
        }
        
        //let transactionData = await web3.eth.getTransaction("0xf66ad6c21118da5bc8e79cb0912b98cc7a3e30826000bbb419b617417909a5f2");
        let txnsList: any = []; //all txns

        const contract = new web3.eth.Contract(tokenAbi, address);
        let tokenDecimal = await contract.methods.decimals().call();
        console.log("txnsDara", txnsData.length);
        for(let i = 0; i < txnsData.length; i++) {
            let txn = await web3.eth.getTransaction(txnsData[i].transactionHash);
            let valueEth = parseFloat(txn.value) / Math.pow(10, 18); //from wei
            let input = txn.input;
            let amountHex = input.slice(74, input.length)
            let amountTransferred = parseInt(amountHex, 16);
            
            amountTransferred = amountTransferred / Math.pow(10, tokenDecimal);
            
            
            let gasGwei: number = parseFloat(txn.gasPrice) / Math.pow(10, 9); //gas price in gwei
            let txnsFeeEth: number = ((gasGwei + (parseFloat(txn.maxFeePerGas) / Math.pow(10,9))) * (parseFloat(txn.gas) / 10)) / Math.pow(10, 9) ; //gas provided
            txnsList.push({ from: txn.from, to: txn.to, value: valueEth, amount: amountTransferred, gasPaid: gasGwei.toString(), txnFeeEth: txnsFeeEth.toString(), txnHash: txnsData[i].transactionHash, blockNumber: txn.blockNumber })
            console.log(i)
            console.log(txnsList.length);
        }

        
        return txnsList;
    }

    //get txns count if no logs on contract from last #block blocks. No cap but very slow
    // const getTxnsCount = async(address: string, block: number ) => {

    //     let currentBlock = await web3.eth.getBlockNumber();
    //     let txnsCount = 0; //await web3.eth.getTransactionCount(address, currentBlock);
    
    //     for(let i = currentBlock; i > currentBlock - block; i--) {
    //         let txnsCountThisBlock = await web3.eth.getTransactionCount(address, i);
    //         txnsCount += txnsCountThisBlock;
    //         console.log(i);
    //     }
    
    //     return txnsCount;
    // }

    const getTxnsCount = async(address: string) => {
        let currentBlock = await web3.eth.getBlockNumber();
        let txnsCount = 0;
        let probablyNoMoreIndicator = 0;
        for(let i = currentBlock; i > 1; i-=2000) {
            let contract = new web3.eth.Contract(tokenAbi, address);
            let data = await contract.getPastEvents('Transfer', { fromBlock: i-2000, toBlock: i });
            //probably no more txns
            if(data.length == 0) {
                probablyNoMoreIndicator++;
            }
            if(probablyNoMoreIndicator >= 2) {
                break;
            }
            //let data = await web3.eth.getPastLogs({ address: address, fromBlock: i - 2000, toBlock: i });
            txnsCount += data.length;
            console.log(txnsCount, i);
            
        }
        return txnsCount;

        
    }

    //gets all txns from #block when no logs are available on contract
    const getAllTxnsNoLogs = async(address: string, block: number ) => {

        let txnsList: any = []; //all txns
        
        //current block
        let currentBlock = await web3.eth.getBlockNumber();
        let txnsCount = await web3.eth.getTransactionCount(address, currentBlock);
        
        let balance = await web3.eth.getBalance(address, currentBlock);
        
        for(let i = currentBlock;i >= block && txnsCount > 0; i--) {
        
            try {
                let block = await web3.eth.getBlock(i, true);
                //console.log(block.transactions);
                if(block && block.transactions) {
                
                    block.transactions.forEach(function(e) {
                        if(address == e.from) {
                            let txn = {
                                from: e.from,
                                to: e.to,
                                hash: e.hash,
                                value: e.value.toString(10)
                            }
                            txnsList.push(txn);
                            console.log(i, e.from, e.to, e.hash, e.value.toString(10));
                        
                        }
                        if(address == e.to) {
                            let txn = {
                                from: e.from,
                                to: e.to,
                                hash: e.hash,
                                value: e.value.toString(10)
                            }
                            txnsList.push(txn);
                            console.log(i, e.from, e.to, e.hash, e.value.toString(10));
                        }
                    });
                }
            }
            catch(e) {
                console.log("Error in block ", i, e);
            }
        }
    
    
    }

    return {
        getAllTxns: getAllTxns,
        getAllTxnsNoLogs: getAllTxnsNoLogs,
        getTxnsCount: getTxnsCount
    }
}