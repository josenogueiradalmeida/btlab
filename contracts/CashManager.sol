pragma solidity ^0.5.0;

contract CashManager {
  
  uint256 public cashBalance = 0;  
  event cashTransferred(address, address, uint256);  
  event cashReceived(address, address, uint256); 
  
  function () payable external {
      cashBalance = msg.value;
      emit cashReceived(msg.sender, address(this), cashBalance);
  }
  
  function send(address payable to, uint256 valueInWei) public {
    require(to != address(0x0));
    require(to != address(this));
    require (address(this).balance >= valueInWei);
    address from = msg.sender;
		
 	to.transfer(valueInWei);

    cashBalance = address(this).balance;

    emit cashTransferred(from, to, valueInWei);
  }

}
