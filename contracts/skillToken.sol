// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SkillToken is ERC20, Ownable {
    address public eduPlatform;
    
    event EduPlatformSet(address indexed newPlatform);
    event StudentRewarded(address indexed student, uint256 amount);
    event TokensSpent(address indexed student, uint256 amount);
    
    constructor() ERC20("SkillToken", "SKILL") Ownable(msg.sender) {
        _mint(msg.sender, 1000000 * 10**decimals()); // 1 million tokens
    }
    
    modifier onlyEduPlatform() {
        require(msg.sender == eduPlatform, "Only EduPlatform can call this");
        require(eduPlatform != address(0), "EduPlatform not set");
        _;
    }
    
    function setEduPlatform(address _eduPlatform) external onlyOwner {
        require(_eduPlatform != address(0), "Invalid address");
        eduPlatform = _eduPlatform;
        emit EduPlatformSet(_eduPlatform);
    }
    
    function rewardStudent(address student, uint256 amount) external onlyEduPlatform {
        require(student != address(0), "Invalid student address");
        require(amount > 0, "Amount must be greater than 0");
        
        _mint(student, amount * 10**decimals());
        emit StudentRewarded(student, amount);
    }
    
    function spendTokens(address student, uint256 amount) external onlyEduPlatform {
        require(student != address(0), "Invalid student address");
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(student) >= amount * 10**decimals(), "Insufficient balance");
        
        _burn(student, amount * 10**decimals());
        emit TokensSpent(student, amount);
    }
    
    function getStudentBalance(address student) external view returns (uint256) {
        return balanceOf(student) / 10**decimals();
    }
}