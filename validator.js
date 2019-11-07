const web3 = require('web3');
const express = require('express');
const EthereumTx = require('ethereumjs-tx').Transaction 

const app = express();

let port = 3000;
//let PROVIDER_URL = "https://rinkeby.infura.io/YOUR_API_KEY"
let PROVIDER_URL = "http://localhost:9545"
let PRIVATE_KEY = "089e59d0be3e74b9deaead1c50560f3b98a873fce7ec6d677354986b8a7c147b"
let ADDRESS_THAT_SENDS_TRANSACTION = "0x02525ddbda7e0eca3b69846246766c96fb2f9cff"
let ADRESS_TO_SEND_TRANSACTION = "0x0"
let YOUR_CONTRACT_ADDRESS = "0xDa36BEcf3D78e082AE2147E54609f068AaD7f762"
let YOUR_CONTRACT_ABI = [{"constant":true,"inputs":[],"name":"getValue","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"value","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"setValue","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}]

web3js = new web3(new web3.providers.HttpProvider( PROVIDER_URL ));

app.get('/set/:id',function(req,res){

        var myAddress = ADDRESS_THAT_SENDS_TRANSACTION;
        var privateKey = Buffer.from(PRIVATE_KEY, 'hex')        

        //contract abi is the array that you can get from the ethereum wallet or etherscan
        var contractABI = YOUR_CONTRACT_ABI;
        var contractAddress = YOUR_CONTRACT_ADDRESS;
        //creating contract object        
        var contract = new web3js.eth.Contract(contractABI,contractAddress);

        var param = req.params.id;
        console.log('user parameter: ' + param);

        var count;        
        // get transaction count, later will used as nonce
        web3js.eth.getTransactionCount(myAddress).then(function(v){
            console.log("Count: "+v);
            count = v;
            var amount = web3js.utils.toHex(1e16);
            //creating raw transaction
            var rawTransaction = { 
                "from":myAddress, 
                "gasPrice":web3js.utils.toHex(20* 1e9),
                "gasLimit":web3js.utils.toHex(210000),
                "to":contractAddress,
                "value":"0x0",
                "data":contract.methods.setValue(param).encodeABI(),
                "nonce":web3js.utils.toHex(count)
            }
            console.log(rawTransaction);
            //creating tranaction via ethereumjs-tx
            var transaction = new EthereumTx(rawTransaction);
            //signing transaction with private key
            transaction.sign(privateKey);
            //sending transacton via web3js module
            web3js.eth.sendSignedTransaction('0x'+transaction.serialize().toString('hex'))
            .on('transactionHash',console.log);
                
        })
        res.send("escreveu " + param);
        res.end();
        console.log(param)

});

app.get('/get',function(req,res){

    //contract abi is the array that you can get from the ethereum wallet or etherscan
    var contractABI = YOUR_CONTRACT_ABI;
    var contractAddress = YOUR_CONTRACT_ADDRESS;
    //creating contract object        
    var contract = new web3js.eth.Contract(contractABI,contractAddress);

    //calls the smartcontract to check its value
    contract.methods.getValue().call()
    .then(
        function(result){
            res.send("leu " + result);
            res.end();
            console.log(result)
        }
    );
});


app.listen(port, () => console.log('App listening on port ' + port + '!'))