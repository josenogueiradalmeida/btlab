/**
 * Require the credentials that you entered in the .env file
 */
require('dotenv').config()

const Web3 = require('web3')
const axios = require('axios')
const EthereumTx = require('ethereumjs-tx').Transaction 
const log = require('ololog').configure({ time: true })
const ansi = require('ansicolor').nice

/**
 * Network configuration
 */
var testnet = `${process.env.INFURA_URL}/${process.env.INFURA_ACCESS_TOKEN}`
testnet = "http://localhost:6545"

/**
 * Change the provider that is passed to HttpProvider to `mainnet` for live transactions.
 */
const web3 = new Web3( new Web3.providers.HttpProvider(testnet) )


/**
 * Set the web3 default account to use as your public wallet address
 */
web3.eth.defaultAccount = process.env.WALLET_ADDRESS
//web3.eth.defaultAccount = "0xe7329d7df521bd433498399a5f208d57f374121b"

/**
 * The amount of ETH you want to send in this transaction
 * @type {Number}
 */
const amountToSend = 0.00000001


/**
 * Fetch the current transaction gas prices from https://ethgasstation.info/
 * 
 * @return {object} Gas prices at different priorities
 */
const getCurrentGasPrices = async () => {
  let response = await axios.get('https://ethgasstation.info/json/ethgasAPI.json')
  let prices = {
    low: response.data.safeLow / 10,
    medium: response.data.average / 10,
    high: response.data.fast / 10
  }

  console.log("\r\n")
  log (`Current ETH Gas Prices (in GWEI):`.cyan)
  console.log("\r\n")
  log(`Low: ${prices.low} (transaction completes in < 30 minutes)`.green)
  log(`Standard: ${prices.medium} (transaction completes in < 5 minutes)`.yellow)
  log(`Fast: ${prices.high} (transaction completes in < 2 minutes)`.red)
  console.log("\r\n")

  return prices
}

function toWei( val ) {
  return 1000000000000000000 * val;
}

function fromWei ( val ) {
  return val / 1000000000000000000;
}

/**
 * This is the process that will run when you execute the program.
 */
async function main () {

  /**
   * Fetch your personal wallet's balance
   */
  //let myBalanceWei = web3.eth.getBalance(web3.eth.defaultAccount).toNumber()
  let myBalanceWei = await web3.eth.getBalance(web3.eth.defaultAccount)

  let myBalance = fromWei(myBalanceWei)
  
  log(`Your wallet wei balance is currently ${myBalanceWei} ETH`.green)

  log(`Your wallet balance is currently ${myBalance} ETH`.green)


  /**
   * With every new transaction you send using a specific wallet address,
   * you need to increase a nonce which is tied to the sender wallet.
   */
  let nonce = await web3.eth.getTransactionCount(web3.eth.defaultAccount)
  log(`The outgoing transaction count for your wallet address is: ${nonce}`.magenta)


  /**
   * Fetch the current transaction gas prices from https://ethgasstation.info/
   */
  let gasPrices = await getCurrentGasPrices()

  log('wallet: ' + process.env.WALLET_ADDRESS)
  log('testnet: ' + testnet)
  log('chain id: ' +  process.env.CHAIN_ID)
  log('chain_name: ' +  process.env.CHAIN_NAME)
  log('chain_hardfork: ' +  process.env.CHAIN_HARDFORK)

  /**
   * Build a new transaction object and sign it locally.
   */
  let details = {
    "to": process.env.DESTINATION_WALLET_ADDRESS,
    "value": web3.utils.numberToHex( toWei(amountToSend) ),
    "gas": 21000,
    "gasPrice": gasPrices.low * 1000000000, // converts the gwei price to wei
    "nonce": nonce,
    "chainId": process.env.CHAIN_ID // EIP 155 chainId - mainnet: 1, rinkeby: 4
  }

  const transaction = new EthereumTx(details, {chain:process.env.CHAIN_NAME, hardfork: process.env.CHAIN_HARDFORK})

  /**
   * This is where the transaction is authorized on your behalf.
   * The private key is what unlocks your wallet.
   */
  transaction.sign( Buffer.from(process.env.WALLET_PRIVATE_KEY, 'hex') )


  /**
   * Now, we'll compress the transaction info down into a transportable object.
   */
  const serializedTransaction = transaction.serialize()

  /**
   * Note that the Web3 library is able to automatically determine the "from" address based on your private key.
   */

  const addr = transaction.from.toString('hex')
  log(`Based on your private key, your wallet address is ${addr}`.yellow)

  /**
   * We're ready! Submit the raw transaction details to the provider configured above.
   */
  await web3.eth.sendSignedTransaction('0x' + serializedTransaction.toString('hex') )
  .catch( error => { console.log (error) } )

  /*
  let transactionReceipt = await web3.eth.getTransactionReceipt() 
  console.log ("recibo"+ transactionReceipt)
  let transactionId = transactionReceipt.transactionHash
  console.log ("transactionId"+ transactionId)
  */

  /**
   * We now know the transaction ID, so let's build the public Etherscan url where
   * the transaction details can be viewed.
   */
  //const url = `https://rinkeby.etherscan.io/tx/${transactionId}`
  //log(url.cyan)

  let contract_abi = [    {      "constant": true,      "inputs": [        {          "internalType": "address",          "name": "addr",          "type": "address"        }      ],      "name": "isWaitingValidationAccount",      "outputs": [        {          "internalType": "bool",          "name": "",          "type": "bool"        }      ],      "payable": false,      "stateMutability": "view",      "type": "function"    },    {      "constant": true,      "inputs": [        {          "internalType": "address",          "name": "addr",          "type": "address"        }      ],      "name": "isReservedAccount",      "outputs": [        {          "internalType": "bool",          "name": "",          "type": "bool"        }      ],      "payable": false,      "stateMutability": "view",      "type": "function"    },    {      "constant": false,      "inputs": [        {          "internalType": "address",          "name": "rs",          "type": "address"        }      ],      "name": "setTokenAddress",      "outputs": [],      "payable": false,      "stateMutability": "nonpayable",      "type": "function"    },    {      "constant": true,      "inputs": [        {          "internalType": "address",          "name": "",          "type": "address"        }      ],      "name": "legalEntitiesInfo",      "outputs": [        {          "internalType": "uint64",          "name": "cnpj",          "type": "uint64"        },        {          "internalType": "uint64",          "name": "idFinancialSupportAgreement",          "type": "uint64"        },        {          "internalType": "uint32",          "name": "salic",          "type": "uint32"        },        {          "internalType": "string",          "name": "idProofHash",          "type": "string"        },        {          "internalType": "enum BNDESRegistry.BlockchainAccountState",          "name": "state",          "type": "uint8"        }      ],      "payable": false,      "stateMutability": "view",      "type": "function"    },    {      "constant": true,      "inputs": [        {          "internalType": "address",          "name": "addr",          "type": "address"        }      ],      "name": "isOwner",      "outputs": [        {          "internalType": "bool",          "name": "",          "type": "bool"        }      ],      "payable": false,      "stateMutability": "view",      "type": "function"    },    {      "constant": true,      "inputs": [        {          "internalType": "address",          "name": "addr",          "type": "address"        }      ],      "name": "isValidatedSupplier",      "outputs": [        {          "internalType": "bool",          "name": "",          "type": "bool"        }      ],      "payable": false,      "stateMutability": "view",      "type": "function"    },    {      "constant": true,      "inputs": [        {          "internalType": "uint64",          "name": "cnpj",          "type": "uint64"        },        {          "internalType": "uint64",          "name": "idFinancialSupportAgreement",          "type": "uint64"        }      ],      "name": "getBlockchainAccount",      "outputs": [        {          "internalType": "address",          "name": "",          "type": "address"        }      ],      "payable": false,      "stateMutability": "view",      "type": "function"    },    {      "constant": true,      "inputs": [        {          "internalType": "address",          "name": "addr",          "type": "address"        }      ],      "name": "isResponsibleForRegistryValidation",      "outputs": [        {          "internalType": "bool",          "name": "",          "type": "bool"        }      ],      "payable": false,      "stateMutability": "view",      "type": "function"    },    {      "constant": false,      "inputs": [        {          "internalType": "address",          "name": "rs",          "type": "address"        }      ],      "name": "enableChangeAccount",      "outputs": [],      "payable": false,      "stateMutability": "nonpayable",      "type": "function"    },    {      "constant": true,      "inputs": [        {          "internalType": "address",          "name": "rs",          "type": "address"        }      ],      "name": "isChangeAccountEnabled",      "outputs": [        {          "internalType": "bool",          "name": "",          "type": "bool"        }      ],      "payable": false,      "stateMutability": "view",      "type": "function"    },    {      "constant": true,      "inputs": [        {          "internalType": "address",          "name": "addr",          "type": "address"        }      ],      "name": "isSupplier",      "outputs": [        {          "internalType": "bool",          "name": "",          "type": "bool"        }      ],      "payable": false,      "stateMutability": "view",      "type": "function"    },    {      "constant": true,      "inputs": [        {          "internalType": "address",          "name": "addr",          "type": "address"        }      ],      "name": "isResponsibleForDisbursement",      "outputs": [        {          "internalType": "bool",          "name": "",          "type": "bool"        }      ],      "payable": false,      "stateMutability": "view",      "type": "function"    },    {      "constant": true,      "inputs": [        {          "internalType": "address",          "name": "",          "type": "address"        }      ],      "name": "legalEntitiesChangeAccount",      "outputs": [        {          "internalType": "bool",          "name": "",          "type": "bool"        }      ],      "payable": false,      "stateMutability": "view",      "type": "function"    },    {      "constant": true,      "inputs": [],      "name": "getResponsibleForDisbursement",      "outputs": [        {          "internalType": "address",          "name": "",          "type": "address"        }      ],      "payable": false,      "stateMutability": "view",      "type": "function"    },    {      "constant": true,      "inputs": [        {          "internalType": "address",          "name": "addr",          "type": "address"        }      ],      "name": "isValidatedAccount",      "outputs": [        {          "internalType": "bool",          "name": "",          "type": "bool"        }      ],      "payable": false,      "stateMutability": "view",      "type": "function"    },    {      "constant": true,      "inputs": [        {          "internalType": "string",          "name": "str",          "type": "string"        }      ],      "name": "isValidHash",      "outputs": [        {          "internalType": "bool",          "name": "",          "type": "bool"        }      ],      "payable": false,      "stateMutability": "pure",      "type": "function"    },    {      "constant": false,      "inputs": [],      "name": "renounceOwnership",      "outputs": [],      "payable": false,      "stateMutability": "nonpayable",      "type": "function"    },    {      "constant": true,      "inputs": [        {          "internalType": "address",          "name": "addr",          "type": "address"        }      ],      "name": "isRedemptionAddress",      "outputs": [        {          "internalType": "bool",          "name": "",          "type": "bool"        }      ],      "payable": false,      "stateMutability": "view",      "type": "function"    },    {      "constant": true,      "inputs": [],      "name": "getRedemptionAddress",      "outputs": [        {          "internalType": "address",          "name": "",          "type": "address"        }      ],      "payable": false,      "stateMutability": "view",      "type": "function"    },    {      "constant": false,      "inputs": [        {          "internalType": "uint64",          "name": "cnpj",          "type": "uint64"        },        {          "internalType": "uint64",          "name": "idFinancialSupportAgreement",          "type": "uint64"        },        {          "internalType": "uint32",          "name": "salic",          "type": "uint32"        },        {          "internalType": "address",          "name": "newAddr",          "type": "address"        },        {          "internalType": "string",          "name": "idProofHash",          "type": "string"        }      ],      "name": "changeAccountLegalEntity",      "outputs": [],      "payable": false,      "stateMutability": "nonpayable",      "type": "function"    },    {      "constant": false,      "inputs": [        {          "internalType": "address",          "name": "addr",          "type": "address"        },        {          "internalType": "string",          "name": "idProofHash",          "type": "string"        }      ],      "name": "validateRegistryLegalEntity",      "outputs": [],      "payable": false,      "stateMutability": "nonpayable",      "type": "function"    },    {      "constant": true,      "inputs": [        {          "internalType": "address",          "name": "addr",          "type": "address"        }      ],      "name": "isInvalidatedByValidatorAccount",      "outputs": [        {          "internalType": "bool",          "name": "",          "type": "bool"        }      ],      "payable": false,      "stateMutability": "view",      "type": "function"    },    {      "constant": true,      "inputs": [        {          "internalType": "address",          "name": "addr",          "type": "address"        }      ],      "name": "isClient",      "outputs": [        {          "internalType": "bool",          "name": "",          "type": "bool"        }      ],      "payable": false,      "stateMutability": "view",      "type": "function"    },    {      "constant": true,      "inputs": [        {          "internalType": "address",          "name": "addr",          "type": "address"        }      ],      "name": "isResponsibleForSettlement",      "outputs": [        {          "internalType": "bool",          "name": "",          "type": "bool"        }      ],      "payable": false,      "stateMutability": "view",      "type": "function"    },    {      "constant": true,      "inputs": [        {          "internalType": "address",          "name": "addr",          "type": "address"        }      ],      "name": "getIdLegalFinancialAgreement",      "outputs": [        {          "internalType": "uint64",          "name": "",          "type": "uint64"        }      ],      "payable": false,      "stateMutability": "view",      "type": "function"    },    {      "constant": false,      "inputs": [        {          "internalType": "address",          "name": "rs",          "type": "address"        }      ],      "name": "setResponsibleForRegistryValidation",      "outputs": [],      "payable": false,      "stateMutability": "nonpayable",      "type": "function"    },    {      "constant": true,      "inputs": [],      "name": "owner",      "outputs": [        {          "internalType": "address",          "name": "",          "type": "address"        }      ],      "payable": false,      "stateMutability": "view",      "type": "function"    },    {      "constant": true,      "inputs": [],      "name": "isOwner",      "outputs": [        {          "internalType": "bool",          "name": "",          "type": "bool"        }      ],      "payable": false,      "stateMutability": "view",      "type": "function"    },    {      "constant": false,      "inputs": [        {          "internalType": "address",          "name": "rs",          "type": "address"        }      ],      "name": "setResponsibleForDisbursement",      "outputs": [],      "payable": false,      "stateMutability": "nonpayable",      "type": "function"    },    {      "constant": true,      "inputs": [        {          "internalType": "address",          "name": "addr",          "type": "address"        }      ],      "name": "getAccountState",      "outputs": [        {          "internalType": "int256",          "name": "",          "type": "int256"        }      ],      "payable": false,      "stateMutability": "view",      "type": "function"    },    {      "constant": true,      "inputs": [        {          "internalType": "address",          "name": "addr",          "type": "address"        }      ],      "name": "getLegalEntityInfo",      "outputs": [        {          "internalType": "uint64",          "name": "",          "type": "uint64"        },        {          "internalType": "uint64",          "name": "",          "type": "uint64"        },        {          "internalType": "uint32",          "name": "",          "type": "uint32"        },        {          "internalType": "string",          "name": "",          "type": "string"        },        {          "internalType": "uint256",          "name": "",          "type": "uint256"        },        {          "internalType": "address",          "name": "",          "type": "address"        }      ],      "payable": false,      "stateMutability": "view",      "type": "function"    },    {      "constant": true,      "inputs": [        {          "internalType": "address",          "name": "addr",          "type": "address"        }      ],      "name": "isAvailableAccount",      "outputs": [        {          "internalType": "bool",          "name": "",          "type": "bool"        }      ],      "payable": false,      "stateMutability": "view",      "type": "function"    },    {      "constant": true,      "inputs": [        {          "internalType": "uint64",          "name": "cnpj",          "type": "uint64"        },        {          "internalType": "uint64",          "name": "idFinancialSupportAgreement",          "type": "uint64"        }      ],      "name": "getLegalEntityInfoByCNPJ",      "outputs": [        {          "internalType": "uint64",          "name": "",          "type": "uint64"        },        {          "internalType": "uint64",          "name": "",          "type": "uint64"        },        {          "internalType": "uint32",          "name": "",          "type": "uint32"        },        {          "internalType": "string",          "name": "",          "type": "string"        },        {          "internalType": "uint256",          "name": "",          "type": "uint256"        },        {          "internalType": "address",          "name": "",          "type": "address"        }      ],      "payable": false,      "stateMutability": "view",      "type": "function"    },    {      "constant": true,      "inputs": [        {          "internalType": "address",          "name": "",          "type": "address"        }      ],      "name": "novoCampo",      "outputs": [        {          "internalType": "uint64",          "name": "cnpj",          "type": "uint64"        },        {          "internalType": "uint64",          "name": "idFinancialSupportAgreement",          "type": "uint64"        },        {          "internalType": "uint32",          "name": "salic",          "type": "uint32"        },        {          "internalType": "string",          "name": "idProofHash",          "type": "string"        },        {          "internalType": "enum BNDESRegistry.BlockchainAccountState",          "name": "state",          "type": "uint8"        }      ],      "payable": false,      "stateMutability": "view",      "type": "function"    },    {      "constant": false,      "inputs": [        {          "internalType": "address",          "name": "addr",          "type": "address"        }      ],      "name": "invalidateRegistryLegalEntity",      "outputs": [],      "payable": false,      "stateMutability": "nonpayable",      "type": "function"    },    {      "constant": true,      "inputs": [],      "name": "getResponsibleForRegistryValidation",      "outputs": [        {          "internalType": "address",          "name": "",          "type": "address"        }      ],      "payable": false,      "stateMutability": "view",      "type": "function"    },    {      "constant": false,      "inputs": [        {          "internalType": "address",          "name": "rs",          "type": "address"        }      ],      "name": "setResponsibleForSettlement",      "outputs": [],      "payable": false,      "stateMutability": "nonpayable",      "type": "function"    },    {      "constant": true,      "inputs": [        {          "internalType": "address",          "name": "addr",          "type": "address"        }      ],      "name": "isInvalidatedByChangeAccount",      "outputs": [        {          "internalType": "bool",          "name": "",          "type": "bool"        }      ],      "payable": false,      "stateMutability": "view",      "type": "function"    },    {      "constant": true,      "inputs": [        {          "internalType": "address",          "name": "addr",          "type": "address"        }      ],      "name": "getCNPJ",      "outputs": [        {          "internalType": "uint64",          "name": "",          "type": "uint64"        }      ],      "payable": false,      "stateMutability": "view",      "type": "function"    },    {      "constant": true,      "inputs": [],      "name": "isTokenAddress",      "outputs": [        {          "internalType": "bool",          "name": "",          "type": "bool"        }      ],      "payable": false,      "stateMutability": "view",      "type": "function"    },    {      "constant": true,      "inputs": [        {          "internalType": "address",          "name": "addr",          "type": "address"        }      ],      "name": "isValidatedClient",      "outputs": [        {          "internalType": "bool",          "name": "",          "type": "bool"        }      ],      "payable": false,      "stateMutability": "view",      "type": "function"    },    {      "constant": false,      "inputs": [        {          "internalType": "address",          "name": "rs",          "type": "address"        }      ],      "name": "setRedemptionAddress",      "outputs": [],      "payable": false,      "stateMutability": "nonpayable",      "type": "function"    },    {      "constant": false,      "inputs": [        {          "internalType": "uint64",          "name": "cnpj",          "type": "uint64"        },        {          "internalType": "uint64",          "name": "idFinancialSupportAgreement",          "type": "uint64"        },        {          "internalType": "uint32",          "name": "salic",          "type": "uint32"        },        {          "internalType": "address",          "name": "addr",          "type": "address"        },        {          "internalType": "string",          "name": "idProofHash",          "type": "string"        }      ],      "name": "registryLegalEntity",      "outputs": [],      "payable": false,      "stateMutability": "nonpayable",      "type": "function"    },    {      "constant": false,      "inputs": [        {          "internalType": "address",          "name": "newOwner",          "type": "address"        }      ],      "name": "transferOwnership",      "outputs": [],      "payable": false,      "stateMutability": "nonpayable",      "type": "function"    },    {      "constant": true,      "inputs": [],      "name": "getResponsibleForSettlement",      "outputs": [        {          "internalType": "address",          "name": "",          "type": "address"        }      ],      "payable": false,      "stateMutability": "view",      "type": "function"    },    {      "inputs": [],      "payable": false,      "stateMutability": "nonpayable",      "type": "constructor"    },    {      "anonymous": false,      "inputs": [        {          "indexed": false,          "internalType": "address",          "name": "addr",          "type": "address"        },        {          "indexed": false,          "internalType": "uint64",          "name": "cnpj",          "type": "uint64"        },        {          "indexed": false,          "internalType": "uint64",          "name": "idFinancialSupportAgreement",          "type": "uint64"        },        {          "indexed": false,          "internalType": "uint32",          "name": "salic",          "type": "uint32"        },        {          "indexed": false,          "internalType": "string",          "name": "idProofHash",          "type": "string"        }      ],      "name": "AccountRegistration",      "type": "event"    },    {      "anonymous": false,      "inputs": [        {          "indexed": false,          "internalType": "address",          "name": "oldAddr",          "type": "address"        },        {          "indexed": false,          "internalType": "address",          "name": "newAddr",          "type": "address"        },        {          "indexed": false,          "internalType": "uint64",          "name": "cnpj",          "type": "uint64"        },        {          "indexed": false,          "internalType": "uint64",          "name": "idFinancialSupportAgreement",          "type": "uint64"        },        {          "indexed": false,          "internalType": "uint32",          "name": "salic",          "type": "uint32"        },        {          "indexed": false,          "internalType": "string",          "name": "idProofHash",          "type": "string"        }      ],      "name": "AccountChange",      "type": "event"    },    {      "anonymous": false,      "inputs": [        {          "indexed": false,          "internalType": "address",          "name": "addr",          "type": "address"        },        {          "indexed": false,          "internalType": "uint64",          "name": "cnpj",          "type": "uint64"        },        {          "indexed": false,          "internalType": "uint64",          "name": "idFinancialSupportAgreement",          "type": "uint64"        },        {          "indexed": false,          "internalType": "uint32",          "name": "salic",          "type": "uint32"        }      ],      "name": "AccountValidation",      "type": "event"    },    {      "anonymous": false,      "inputs": [        {          "indexed": false,          "internalType": "address",          "name": "addr",          "type": "address"        },        {          "indexed": false,          "internalType": "uint64",          "name": "cnpj",          "type": "uint64"        },        {          "indexed": false,          "internalType": "uint64",          "name": "idFinancialSupportAgreement",          "type": "uint64"        },        {          "indexed": false,          "internalType": "uint32",          "name": "salic",          "type": "uint32"        }      ],      "name": "AccountInvalidation",      "type": "event"    },    {      "anonymous": false,      "inputs": [        {          "indexed": true,          "internalType": "address",          "name": "previousOwner",          "type": "address"        },        {          "indexed": true,          "internalType": "address",          "name": "newOwner",          "type": "address"        }      ],      "name": "OwnershipTransferred",      "type": "event"    }  ]

  var myContract = new web3.eth.Contract(contract_abi, process.env.CONTRACT_ADDRESS, {
    from: addr, //  from address
    gasPrice: '20000000000' // default gas price in wei, 20 gwei in this case
});



// using the callback
  await myContract.methods.getResponsibleForDisbursement().call({from: addr}, function(error, result){
    if (error) log (error);
    if (result) log ('The disbursement responsible is : ' + result);
  });

  let outraABI = [    {      "constant": false,      "inputs": [        {          "internalType": "uint256",          "name": "amount",          "type": "uint256"        }      ],      "name": "decrease",      "outputs": [],      "payable": false,      "stateMutability": "nonpayable",      "type": "function"    },    {      "constant": false,      "inputs": [        {          "internalType": "uint256",          "name": "amount",          "type": "uint256"        }      ],      "name": "increase",      "outputs": [],      "payable": false,      "stateMutability": "nonpayable",      "type": "function"    },    {      "constant": false,      "inputs": [],      "name": "triple",      "outputs": [        {          "internalType": "uint256",          "name": "",          "type": "uint256"        }      ],      "payable": false,      "stateMutability": "nonpayable",      "type": "function"    },    {      "constant": false,      "inputs": [],      "name": "double",      "outputs": [],      "payable": false,      "stateMutability": "nonpayable",      "type": "function"    }  ]

  var counterContract = new web3.eth.Contract(outraABI, "0xB87b994174CA4af8FD7E9e7DED2036564Ba53829", {
    from: addr, //  from address
    gasPrice: '20000000000' // default gas price in wei, 20 gwei in this case
  });

// using the callback
// Infura has not activated the method eth_sendTransaction because this method needs unlocked accounts on the ethereum node. 
  await counterContract.methods.increase(1).send({from: addr},    function(error, result){
    if (error) log (error);
    if (result) log (result);
  })

  log(`Note: please allow for 30 seconds before transaction appears on Etherscan`.magenta)

  process.exit()
}

try {
  main();
} catch (e) {
  //console.error(e);
} finally {
  //console.log('We do cleanup here');
}
