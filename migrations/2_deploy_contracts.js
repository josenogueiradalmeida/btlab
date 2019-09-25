var Registrador = artifacts.require("./Registrador.sol");

module.exports = async (deployer) => {
	await deployer.deploy(Registrador)    
	RegistradorInstance = await Registrador.deployed();		
};
