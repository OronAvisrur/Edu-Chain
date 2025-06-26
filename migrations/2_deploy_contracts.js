const SkillToken = artifacts.require("SkillToken");
const CourseCertificate = artifacts.require("CourseCertificate");
const EduPlatform = artifacts.require("EduPlatform");

module.exports = async function (deployer, network, accounts) {
  // Deploy SkillToken
  await deployer.deploy(SkillToken);
  const skillToken = await SkillToken.deployed();
  
  // Deploy CourseCertificate
  await deployer.deploy(CourseCertificate);
  const courseCertificate = await CourseCertificate.deployed();
  
  // Deploy EduPlatform
  await deployer.deploy(EduPlatform, skillToken.address, courseCertificate.address);
  const eduPlatform = await EduPlatform.deployed();
  
  // Set EduPlatform address in other contracts
  await skillToken.setEduPlatform(eduPlatform.address);
  await courseCertificate.setEduPlatform(eduPlatform.address);
  
  console.log("SkillToken deployed at:", skillToken.address);
  console.log("CourseCertificate deployed at:", courseCertificate.address);
  console.log("EduPlatform deployed at:", eduPlatform.address);
};