const MangoDex = artifacts.require("./MangoDex.sol");

module.exports = async function(deployer) {
  await deployer.deploy(MangoDex, "0x46ca4a30053662Fd0907eA5e412B09DE4c5e1128");
};
