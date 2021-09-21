const Mango = artifacts.require("./Mango.sol");
const MangoJuice = artifacts.require("./MangoJuice.sol");

module.exports = async function (deployer) {
  // Deploy MyToken
  await deployer.deploy(Mango);
  const mango = await Mango.deployed();

  // Deploy Farm Token
  await deployer.deploy(MangoJuice, mango.address);
  const mangoJuice = await MangoJuice.deployed();
}