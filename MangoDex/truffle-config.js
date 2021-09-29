const HDWalletProvider = require("@truffle/hdwallet-provider");
const path = require("path");
const mnemonic = "comic wonder member caution insect goat metal above blanket reward game close";

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    ropsten:{
      provider: function() {
      return new HDWalletProvider(mnemonic,
      "https://ropsten.infura.io/v3/3a32d121ce824fc6be26b402c7342378")
      },
      network_id: 3
    },
  },
  compilers: {
    solc: {
      version: "^0.8.0"
    }
  }
};