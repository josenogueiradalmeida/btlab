/**
 * Require the credentials that you entered in the .env file
 */
require('dotenv').config()

const Web3 = require('web3')
const axios = require('axios')
const EthereumTx = require('ethereumjs-tx').Transaction 
const log = require('ololog').configure({ time: true })
const ansi = require('ansicolor').nice

//var testnet = "http://localhost:6545"
//var testnet = `${process.env.INFURA_URL}/${process.env.INFURA_ACCESS_TOKEN}`
var testnet = "http://localhost:9545"
const web3 = new Web3( new Web3.providers.HttpProvider(testnet) )

//const privateKey = process.env.WALLET_PRIVATE_KEY
const privateKey = "089e59d0be3e74b9deaead1c50560f3b98a873fce7ec6d677354986b8a7c147b"
const account = web3.eth.accounts.privateKeyToAccount('0x' + privateKey);
web3.eth.accounts.wallet.add(account);
const wallet_address = "0x02525ddbda7e0eca3b69846246766c96fb2f9cff"
web3.eth.defaultAccount = wallet_address

async function main () {

  log('testnet: ' + testnet)
  log('testnet: ' + wallet_address)

  var contract_abi = [{"constant":true,"inputs":[],"name":"getValue","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"value","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"setValue","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}]
//  var contract_address = "0x81075a75581ec20034c55f4247fe9a9e19a87313"
  var contract_address = "0xDa36BEcf3D78e082AE2147E54609f068AaD7f762"

  var myContract = new web3.eth.Contract(contract_abi, contract_address, {
    from: wallet_address, 
    gasPrice: '20000000000' // default gas price in wei, 20 gwei in this case
  });

  await myContract.methods.getValue().call({from: wallet_address}, function(error, result){
    if (error) log (error);
    if (result) log ('The value is : ' + result);
  });


  await myContract.methods.setValue(5).send({from: wallet_address, gas: 210000}, function(error, result){
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
