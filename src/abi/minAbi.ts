export const MinAbi = () => {
    const getAbi = () => {
        return (
            [  
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
                  outputs: [{name: "", type: "string"}],
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
                
              
              ]
        )
    }

    return {
        getAbi: getAbi
    }
}