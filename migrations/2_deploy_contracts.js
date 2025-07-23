// Get files to deploy EduChain contracts
const SkillToken = artifacts.require("SkillToken");
const CertificateNFT = artifacts.require("CertificateNFT");
const EduChain = artifacts.require("EduChain");

module.exports = async function(deployer) {
  // Deploy SkillToken
  await deployer.deploy(SkillToken);
  const skillToken = await SkillToken.deployed();

  // Deploy CertificateNFT
  await deployer.deploy(CertificateNFT);
  const certificateNFT = await CertificateNFT.deployed();

  // Deploy main EduChain contract with token addresses
  await deployer.deploy(EduChain, skillToken.address, certificateNFT.address);
  const eduChain = await EduChain.deployed();

  console.log("All contracts deployed successfully!");
  console.log("\n Contract Addresses:");
  console.log("EduChain:", eduChain.address);
  console.log("SkillToken:", skillToken.address);
  console.log("CertificateNFT:", certificateNFT.address);
};