//functions which query the blockchain
export const EthFunctions = () => {

    //gets transactions from last #block blocks (10k limit on alchemy per call) if logs are available (most contracts)
    const getAllTxns = async( address: string, blocks: number, web3: any ) => {
        let currentBlock = await web3.eth.getBlockNumber();
        //gets data from the last 10k blocks
        let txnsData = await web3.eth.getPastLogs({ fromBlock: currentBlock - blocks, toBlock: currentBlock, address: address });
        //let transactionData = await web3.eth.getTransaction("0xf66ad6c21118da5bc8e79cb0912b98cc7a3e30826000bbb419b617417909a5f2");
        let txnsList: any = []; //all txns
        
        txnsData.forEach( rec => {
            txnsList.push({ txnHash: rec.transactionHash, blockNumber: rec.blockNumber, topics: rec.topics });
        });
        //to get txnsCount get length of txnsList
        return txnsList;
    }

    //get txns count if no logs on contract from last #block blocks. No cap but very slow
    const getTxnsCount = async(address: string, block: number, web3: any) => {

        let currentBlock = await web3.eth.getBlockNumber();
        let txnsCount = 0; //await web3.eth.getTransactionCount(address, currentBlock);
    
        for(let i = currentBlock; i > currentBlock - block; i--) {
            let txnsCountThisBlock = await web3.eth.getTransactionCount(address, i);
            txnsCount += txnsCountThisBlock;
        }
    
        return txnsCount;
    }

    //gets all txns from #block when no logs are available on contract
    const getAllTxnsNoLogs = async(address: string, block: number, web3: any) => {

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
                                hash: e.hash
                            }
                            txnsList.push(txn);
                            console.log(i, e.from, e.to, e.hash, e.value.toString(10));
                        
                        }
                        if(address == e.to) {
                            let txn = {
                                from: e.from,
                                to: e.to,
                                hash: e.hash
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