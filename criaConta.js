var Web3 = require("web3");

const testnet = `${process.env.INFURA_URL}/${process.env.INFURA_ACCESS_TOKEN}`

var web3 = new Web3('http://localhost:6545'); // your geth
//var web3 = new Web3(testnet); // your geth

var account = web3.eth.accounts.create();

console.log (account)
