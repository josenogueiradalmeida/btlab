/**
 * Require the credentials that you entered in the .env file
 */
require('dotenv').config()

const Web3 = require('web3')
const axios = require('axios')
const EthereumTx = require('ethereumjs-tx').Transaction 
const log = require('ololog').configure({ time: true })
const ansi = require('ansicolor').nice

var testnet = "http://localhost:6545"
const web3 = new Web3( new Web3.providers.HttpProvider(testnet) )

const privateKey = process.env.WALLET_PRIVATE_KEY
const account = web3.eth.accounts.privateKeyToAccount('0x' + privateKey);
web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = process.env.WALLET_ADDRESS

async function main () {

  log('testnet: ' + testnet)
  log('testnet: ' + process.env.WALLET_ADDRESS)

  var contract_abi = [{"constant":true,"inputs":[],"name":"getValue","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"value","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"setValue","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}]
  var contract_address = "0x81075a75581ec20034c55f4247fe9a9e19a87313"

  var myContract = new web3.eth.Contract(contract_abi, contract_address, {
    from: process.env.WALLET_ADDRESS, 
    gasPrice: '20000000000' // default gas price in wei, 20 gwei in this case
  });

  await myContract.methods.getValue().call({from: process.env.WALLET_ADDRESS}, function(error, result){
    if (error) log (error);
    if (result) log ('The value is : ' + result);
  });


  await myContract.methods.setValue(5).send({from: process.env.WALLET_ADDRESS, gas: 210000}, function(error, result){
    if (error) log (error);
    if (result) log ('The value is : ' + result);
  });  

  process.exit()
}

try {
  main();
} catch (e) {
  //console.error(e);
} finally {
  //console.log('We do cleanup here');
}
