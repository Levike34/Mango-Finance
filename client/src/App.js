import React, { Component } from "react";
import MangoJuice from "./contracts/MangoJuice.json";
import Mango from "./contracts/Mango.json";
import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
  state = { 
     loaded:false,
     balance: 0, 
     juice: 0, 
     amount: 0, 
     mJusAddr: '', 
     mangoAddr: '', 
     owner: '', 
     interestRate: 0, 
     interestInterval: 0,
     reward: '___',
     stake: 0,
     interest: '',
     minutes: ''
    };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      this.web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      this.accounts = await this.web3.eth.getAccounts();

      // Get the contract instance.
      this.networkId = await this.web3.eth.getChainId();
      
      this.mangoJuice = new this.web3.eth.Contract(
        MangoJuice.abi,
        MangoJuice.networks[this.networkId] && MangoJuice.networks[this.networkId].address,
      );

      this.mango = new this.web3.eth.Contract(
        Mango.abi,
        Mango.networks[this.networkId] && Mango.networks[this.networkId].address,
      );

      

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ loaded:true }, this.getState);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };
  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value
    });
  }

  getState = async() => {
    let result = await this.mangoJuice.methods.balance().call();
    let result2 = await this.mangoJuice.methods.juiceBalance().call({from:this.accounts[0]});
    let result3 = await this.mangoJuice.methods.mango().call();
    let result4 = await this.mangoJuice.methods.mJus().call();
    let result5 = await this.mangoJuice.methods.getOwner().call();
    let result6 = await this.mangoJuice.methods.getInterestRate().call();
    let result7 = await this.mangoJuice.methods.getInterestInterval().call();
    let result8 = await this.mangoJuice.methods.getStake().call({from:this.accounts[0]});
    this.setState({
      balance: this.web3.utils.fromWei(result, 'ether'),
      juice: this.web3.utils.fromWei(result2, 'ether'),
      mangoAddr: result3,
      mJusAddr: result4,
      owner: result5,
      interestRate: 100 / result6,
      interestInterval: result7 / 60,
      stake: this.web3.utils.fromWei(result8, 'ether')
    })
  }

  seeReward = async() => {
    const{reward} = this.state;
    await this.mangoJuice.methods.calculateReward(this.accounts[0]).send({from:this.accounts[0]});
    let result = await this.mangoJuice.methods.viewReward(this.accounts[0]).call();
    console.log(result);
    this.setState({
      reward: this.web3.utils.fromWei(result, 'ether')
    })
  }

  collectReward = async() => {
    let result = await this.mangoJuice.methods.collectReward().send({from:this.accounts[0]});
    console.log(result);
    let upDateAmount = this.web3.utils.fromWei(result.events.RewardChanged.returnValues._totalMangoJuice);
    this.setState({
      juice: upDateAmount
    });
    alert("Your reward has been converted to MangoJuice🍹🍹🍹");
  }

  handleDeposit = async() => {
    const {amount} = this.state;
    let result = await this.mango.methods.approve(this.state.mJusAddr, this.web3.utils.toWei(amount, 'ether')).send({from:this.accounts[0]});
    console.log(result);
    let result2 = await this.mangoJuice.methods.deposit(this.web3.utils.toWei(amount, 'ether')).send({from:this.accounts[0]});
    console.log(result2);
  }

  handleWithdraw = async() => {
    const {amount} = this.state;
    let result = await this.mangoJuice.methods.withdraw(this.web3.utils.toWei(amount, 'ether')).send({from:this.accounts[0]});
    console.log(result);
    this.setState({
      balance: this.web3.utils.fromWei(result.events.StakeChanged.returnValues._total, 'ether'),
      juice: this.state.juice -= this.web3.utils.fromWei(result.events.StakeChanged.returnValues._amount, 'ether')
    })
  }

  setInterest_Interval = async() => {
    const {interest, minutes} = this.state;
    let result = await this.mangoJuice.methods.setInterest_Interval(interest, minutes).send({from:this.accounts[0]});
    console.log(result);
    let newRate = result.events.RateChanged.returnValues._newRate / 100;
    this.setState({
      interestRate: newRate,
      interestInterval: minutes
    })
  }

  render() {
    if (!this.state.loaded) {
        return (
          <div className="App">
             <h1>MangoStake 🥭</h1>
              <p>Buy juicy Mango, and stake it for some MangoJuice. <button type='button'onClick={this.buyMango}>🥭Get Mango🥭</button></p>
            <div className="Main">
              <h2>Mango Staked: 27568🥭</h2>
              <h3>Your Stake: {this.state.stake}</h3>
              <h3>Interest Rate: 2% 🍹 per {this.state.interestInterval} minute</h3>
              <h3>Your earnings: {this.state.reward}  MangoJuice🍹</h3>
              <button type='button' onClick={this.seeReward}>Calculate Interest Earned</button>
              <button type='button' onClick={this.collectReward}>Convert reward to MJUS🍹</button>
              <h3>Your MJUS: {this.state.juice}🍹</h3>
              <input type='text' name='amount'value={this.state.amount} onChange={this.handleInputChange}/>
              <button type='button' onClick={this.handleDeposit}>Stake Mango🥭</button>
              <button type='button' onClick={this.handleWithdraw}>Unstake</button>
              </div>
            <div className='InfoBox'>
              <p>Mango(MANG)🥭: 0x410e4bf19Ff0c56EeDb6B44Db8F86c195a6fBE3D</p>
              <p>MangoJuice(MJUS)🍹: 0x2ae47cf8f23Af31829B43046cA77f337e310c549</p>
              <p>Owner: 0x243dbdcA53AAdb430a43877Ae7944d5F9Cd46065</p>
              </div>
              <div className='OwnerFunctions'>
                <input type='text'name='interest'value={this.state.interest} onChange={this.handleInputChange}/>
                <button type='button' onClick={this.setInterestRate}>SET</button>
              </div>
              
            </div>
      );
    }
    return (
    <div className="App">
       <h1>MangoStake 🥭</h1>
        <p>Buy juicy Mango, and stake it for some MangoJuice. <button type='button'onClick={this.buyMango}>🥭Get Mango🥭</button></p>
      <div className="Main">
        <h2>Mango Staked: {this.state.balance}🥭</h2>
        <h3>Your Stake: {this.state.stake}</h3>
        <h3>Interest Rate: {this.state.interestRate}% 🍹 per {this.state.interestInterval} minutes</h3>
        <h3>Your earnings: {this.state.reward}  MangoJuice🍹</h3>
        <button type='button' onClick={this.seeReward}>Calculate Interest Earned</button>
        <button type='button' onClick={this.collectReward}>Convert reward to MJUS🍹</button>
        <h3>Your MJUS: {this.state.juice}🍹</h3>
        <input type='text' name='amount'value={this.state.amount} onChange={this.handleInputChange}/>
        <button type='button' onClick={this.handleDeposit}>Stake Mango🥭</button>
        <button type='button' onClick={this.handleWithdraw}>Unstake</button>
        </div>
      <div className='InfoBox'>
        <p>Mango(MANG)🥭: {this.state.mangoAddr}</p>
        <p>MangoJuice(MJUS)🍹: {this.state.mJusAddr}</p>
        <p>Owner: {this.state.owner}</p>
        </div>
        <div className='OwnerFunctions'>
          <input type='text'name='interest'placeholder='100/(this)= %'value={this.state.interest} onChange={this.handleInputChange}/>
          <input type='text'name='minutes' placeholder="minutes" value={this.state.minutes} onChange={this.handleInputChange}/>
          <button type='button' onClick={this.setInterest_Interval}>SET</button>
        </div>
        
      </div>
    );
  }
}

export default App;
