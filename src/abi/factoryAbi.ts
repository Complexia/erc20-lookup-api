export const FactoryAbi = () => {

    const getAbi = () => {
        return (
            //uniswapV2 factory abi
            [
                {
                    name: "NewExchange",
                    inputs: [
                        { type: "address", name: "token", indexed: true },
                        { type: "address", name: "exchange", indexed: true },
                    ],
                    anonymous: false,
                    type: "event",
                },
                {
                    name: "initializeFactory",
                    outputs: [],
                    inputs: [{ type: "address", name: "template" }],
                    constant: false,
                    payable: false,
                    type: "function",
                    gas: 35725,
                },
                {
                    name: "createExchange",
                    outputs: [{ type: "address", name: "out" }],
                    inputs: [{ type: "address", name: "token" }],
                    constant: false,
                    payable: false,
                    type: "function",
                    gas: 187911,
                },
                {
                    name: "getExchange",
                    outputs: [{ type: "address", name: "out" }],
                    inputs: [{ type: "address", name: "token" }],
                    constant: true,
                    payable: false,
                    type: "function",
                    gas: 715,
                },
                {
                    name: "getToken",
                    outputs: [{ type: "address", name: "out" }],
                    inputs: [{ type: "address", name: "exchange" }],
                    constant: true,
                    payable: false,
                    type: "function",
                    gas: 745,
                },
                {
                    name: "getTokenWithId",
                    outputs: [{ type: "address", name: "out" }],
                    inputs: [{ type: "uint256", name: "token_id" }],
                    constant: true,
                    payable: false,
                    type: "function",
                    gas: 736,
                },
                {
                    name: "exchangeTemplate",
                    outputs: [{ type: "address", name: "out" }],
                    inputs: [],
                    constant: true,
                    payable: false,
                    type: "function",
                    gas: 633,
                },
                {
                    name: "tokenCount",
                    outputs: [{ type: "uint256", name: "out" }],
                    inputs: [],
                    constant: true,
                    payable: false,
                    type: "function",
                    gas: 663,
                },
                {
                    name: "getPair",
                    outputs: [{ type: "address", name: "out" }],
                    inputs: [{ type: "address", name: "token1" }, { type: "address", name: "token2" }],
                    constant: true,                    
                    type: "function",
                    
                }
            ]
        )
        
    }
    return {
        getAbi: getAbi
    }
}