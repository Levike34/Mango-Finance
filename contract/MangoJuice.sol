pragma solidity ^0.8.0;

import "../client/node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../client/node_modules/@openzeppelin/contracts/utils/Address.sol";
import "../client/node_modules/@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../client/node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./Owned.sol";

contract MangoJuice is ERC20, Owned {
    using Address for address;
    using SafeERC20 for IERC20;

    IERC20 public mango;
    IERC20 public mJus;
    
    
    uint public rewardInterval = 1 minutes;
    
    //The divsisor for reward calculation. 100 = 1%, 50 = 2%, etc.
    //See the calculateReward function.
    uint public interestRate = 50;
    
    event StakeChanged(address _who, uint _amount, uint _total);
    event RewardChanged(address _who, uint _amount, uint _totalMangoJuice);
    event RateChanged(uint _newRate);
    
    
    
    //Data structure to keep track of staker reward and stake total
    struct Staker {
        uint stake;
        uint reward;
        uint startTime;
        bool isStaking;
        
    }
    
    mapping(address => Staker) public stakers;

    constructor(address _token) ERC20("MangoJuice", "MJUS") {
        mango = IERC20(_token);
        mJus = IERC20(address(this));
    }
    
     //View functions for Front-End
    function balance() public view returns (uint256) {
        return mango.balanceOf(address(this));
}

    function juiceBalance() public view returns(uint256) {
        return mJus.balanceOf(msg.sender);
    }
    
    function getInterestRate() public view returns(uint256) {
        return interestRate;
    }
    function getInterestInterval() public view returns (uint256) {
        return rewardInterval;
    }
      function getStake() public view returns(uint256) {
        return stakers[msg.sender].stake;
    }
    
    //Modifiers for the interest in reward calculations
    function setInterest_Interval(uint _newRate, uint _newInterval) public onlyOwner {
        interestRate = _newRate;
        rewardInterval = _newInterval * 60;
        emit RateChanged(_newRate); 
    }


    function deposit(uint256 _amount)  public {
        // Amount must be greater than zero
         require(_amount > 0, "amount cannot be 0");
         if(stakers[msg.sender].isStaking == true) {
            collectReward(); 
         }

        // Transfer Mango to smart contract
         mango.safeTransferFrom(msg.sender, address(this), _amount);

         // Mint MangoJuice to msg sender
         _mint(msg.sender, _amount);
         
         // Calculate start of stake and time until reward distribution
         stakers[msg.sender].isStaking = true;
         stakers[msg.sender].stake += _amount;
         stakers[msg.sender].startTime = block.timestamp;
         emit StakeChanged(msg.sender, _amount, stakers[msg.sender].stake);

}

    function withdraw(uint256 _amount) public {
         // Burn MangoJuice from msg sender
        _burn(msg.sender, _amount);

        // Transfer Mango from this smart contract to msg sender
        mango.safeTransfer(msg.sender, _amount);
        stakers[msg.sender].stake -= _amount;
        if(_amount == stakers[msg.sender].stake) {
            stakers[msg.sender].isStaking = false;
        }
        emit StakeChanged(msg.sender, _amount, stakers[msg.sender].stake);

        
}

    function viewReward(address _staker) public view returns(uint256) {
        return stakers[_staker].reward; 
    }
    
     //Rewards stakeholder 2% in MangoJuice per day
    function calculateReward(address _staker) public {
        require(stakers[_staker].isStaking == true, "No rewards available yet.");
        uint256 daysCompleted = (block.timestamp - stakers[_staker].startTime) / rewardInterval;
        stakers[_staker].reward =  (daysCompleted * stakers[_staker].stake) / interestRate;
    }
    
    function collectReward() public {
        calculateReward(msg.sender);
        require(stakers[msg.sender].reward > 0, "No rewards yet.");
        uint _amount = stakers[msg.sender].reward;
        stakers[msg.sender].reward -= _amount;
        stakers[msg.sender].startTime = block.timestamp;
        _mint(msg.sender, _amount);
        emit RewardChanged(msg.sender, _amount, mJus.balanceOf(msg.sender));
    }
    
    //Withdraws all stake, cancels all pending reward
    function emergencyWithdraw() public {
        uint totalStake = stakers[msg.sender].stake;
        stakers[msg.sender].reward = 0;
        stakers[msg.sender].stake = 0;
        _burn(msg.sender, totalStake);
        mango.safeTransfer(msg.sender, totalStake);
        emit RewardChanged(msg.sender, totalStake, mJus.balanceOf(msg.sender));
    }
    




}