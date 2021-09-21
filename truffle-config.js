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
      "https://ropsten.infura.io/v3/da4be4abcb0b44168188da6d8e846b72")
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
