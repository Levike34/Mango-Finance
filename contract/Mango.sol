pragma solidity ^0.8.0;

import "../client/node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Mango is ERC20 {
    constructor() ERC20("Mango", "MANG"){
        _mint(msg.sender, 10000000000000000000000000);
    }
}