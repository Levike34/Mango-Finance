import React, { Component } from "react";
import MangoDex from "./contracts/MangoDex.json";
import Mango from "./contracts/Mango.json";
import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
  state = { loaded:false, ethBal: 0, mangBal: 0, amount: 0 };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      this.web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      this.accounts = await this.web3.eth.getAccounts();

      // Get the contract instance.
      this.networkId = await this.web3.eth.getChainId();

      this.mangoDex = new this.web3.eth.Contract(
        MangoDex.abi,
        MangoDex.networks[this.networkId] && MangoDex.networks[this.networkId].address,
      );

      this.mango = new this.web3.eth.Contract(
        Mango.abi,
        Mango.networks[this.networkId] && Mango.networks[this.networkId].address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ loaded:true}, this.getState);
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
    let result = await this.mangoDex.methods.getETHBalance().call();
    let result2 = await this.mangoDex.methods.getMangoSupply().call();
    this.setState({
      ethBal: this.web3.utils.fromWei(result, 'ether'),
      mangBal: this.web3.utils.fromWei(result2, 'ether')

    })
  }

  buy = async() => {
    const {amount} = this.state;
    let result = await this.mangoDex.methods.buyMango().send({from:this.accounts[0], value:this.web3.utils.toWei(amount, 'ether')});
    console.log(result);
    let amountBought = this.web3.utils.fromWei(result.events.Bought.returnValues._amount);
    let amountEth = amountBought / 1000;
    this.setState({
      mangBal: this.state.mangBal -= amountBought
    })
    alert("You bought "+amountBought+" Mango(MANG)🥭.  Sweet~!");
  }

  sellMango = async() => {
    const {amount} = this.state;
    await this.mango.methods.approve("0x16Ea1832AA56cD3b546100C8f8764741BE253d59", this.web3.utils.toWei(amount, 'ether')).send({from:this.accounts[0]});
    let result = await this.mangoDex.methods.sellMango(this.web3.utils.toWei(amount, 'ether')).send({from:this.accounts[0]});
    console.log(result);
    let amountSold = this.web3.utils.fromWei(result.events.Sold.returnValues._amount, "ether");
    alert("You sold "+ amountSold+" Mango(MANG)🥭. Sweet~!");
  }


  render() {
    if (!this.state.loaded) {
      return (
        <div className="App">
          <h2>***Connect to the Ropsten testnet***</h2>
        <h1>Mango Exchange🥭</h1>
        <div className='Main'>
        <h3>Mango🥭: {this.state.mangBal}</h3>
        <h3>ETH ⧫: {this.state.ethBal}</h3>
        </div>
        <input type='text' name='amount'onChange={this.handleInputChange}/>
        <button type='button' onClick={this.buy}>BUY🥭</button>
        <button type='button' onClick={this.sellMango}>SELL🥭</button>
       <div className='link'>
        <p>Mango(MANG)🥭: 0x46ca4a30053662Fd0907eA5e412B09DE4c5e1128</p>
         <a target='_blank'href='mangosugar.org/MangoStake'><button type='button'>🍹Stake Mango🍹</button></a>
         </div>
      </div>
      );
    }
    return (
      <div className="App">
        <h1>Mango Exchange🥭</h1>
        <h4>Current Exchange Rate = 1 ETH for 1000 MANG.</h4>
        <div className='Main'>
        <h3>Mango🥭: {this.state.mangBal}</h3>
        <h3>ETH ⧫: {this.state.ethBal}</h3>
        </div>
        <input type='text' name='amount'onChange={this.handleInputChange}/>
        <button type='button' onClick={this.buy}>BUY🥭</button>
        <button type='button' onClick={this.sellMango}>SELL🥭</button>
       <div className='link'>
        <p>Mango(MANG)🥭: 0x46ca4a30053662Fd0907eA5e412B09DE4c5e1128</p>
         <a target=''href='http://mangosugar.org/MangoStake'><button type='button'>🍹Stake Mango🍹</button></a>
         </div>
      </div>
    );
  }
}

export default App;
