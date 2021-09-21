pragma solidity ^0.8.0;

contract Owned {
    address public owner;
    
    constructor() {
        owner = msg.sender;
    }
 
    function getOwner() public view returns(address) {
        return owner;
    }
    
    modifier onlyOwner () {
        require(msg.sender == owner, "You are not allowed.");
        _;
    }
}