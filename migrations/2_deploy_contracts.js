const SkillToken = artifacts.require("SkillToken");
const CourseCertificate = artifacts.require("CourseCertificate");
const EduPlatform = artifacts.require("EduPlatform");

module.exports = async function (deployer, network, accounts) {
  console.log("=== Starting EduChain Deployment ===");
  console.log("Deployer account:", accounts[0]);
  
  try {
    console.log("1. Deploying SkillToken...");
    await deployer.deploy(SkillToken);
    const skillToken = await SkillToken.deployed();
    console.log("SkillToken deployed at:", skillToken.address);
    
    console.log("2. Deploying CourseCertificate...");
    await deployer.deploy(CourseCertificate, accounts[0]); 
    const courseCertificate = await CourseCertificate.deployed();
    console.log("CourseCertificate deployed at:", courseCertificate.address);
    
    console.log("3. Deploying EduPlatform...");
    await deployer.deploy(EduPlatform, skillToken.address, courseCertificate.address);
    const eduPlatform = await EduPlatform.deployed();
    console.log("EduPlatform deployed at:", eduPlatform.address);
    
    console.log("4. Connecting contracts...");
    await skillToken.setEduPlatform(eduPlatform.address);
    console.log("SkillToken connected to EduPlatform");
    
    await courseCertificate.setEduPlatform(eduPlatform.address);
    console.log("CourseCertificate connected to EduPlatform");
    
    console.log("All contracts deployed and connected successfully!");
    console.log("\n=== Contract Addresses ===");
    console.log("EduPlatform:", eduPlatform.address);
    console.log("SkillToken:", skillToken.address);
    console.log("CourseCertificate:", courseCertificate.address);
    
  } catch (error) {
    console.error("Deployment failed:", error.message);
    throw error;
  }
};