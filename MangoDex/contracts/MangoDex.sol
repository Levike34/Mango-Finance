pragma solidity ^0.8.0;

import "./Mango.sol";

contract MangoDex {
    
    IERC20 public mango;
    
    
    event Bought(uint _amount);
    event Sold(uint _amount);
    
    constructor (address _token) {
        mango = IERC20(_token);
    }
    
    function getMangoSupply() public view returns(uint) {
        return mango.balanceOf(address(this));
    }
    
    function getETHBalance() public view returns(uint) {
        return address(this).balance;
    }
    
    //Send mango to the Dex from owner of ERC20 token.
    function fundMangoSugar(uint _amount) public {
        mango.transferFrom(msg.sender, address(this), _amount);
    }
    
    function buyMango() payable public {
        uint amountToBuy = msg.value * 1000; //For 1 eth, you get 1000 Mango.
        uint dexBalance = mango.balanceOf(address(this));
        require(amountToBuy > 0, "Buy more.");
        require(dexBalance >= amountToBuy, "The exchange is out of Mango.");
        mango.transfer(msg.sender, amountToBuy); 
        emit Bought(amountToBuy);
    }
    
    function sellMango(uint _amount) public {
        require(_amount > 0, "Sell something.");
        mango.transferFrom(msg.sender, address(this), _amount);
        payable(msg.sender).transfer(_amount / 1000); //For 1000 Mango, you get 1 eth.
        emit Sold(_amount);
    }
    
}