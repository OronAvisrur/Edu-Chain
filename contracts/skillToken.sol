// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SkillToken is ERC20, Ownable {
    address public eduPlatform;
    
    constructor() ERC20("SkillToken", "SKILL") Ownable(msg.sender) {
        _mint(msg.sender, 1000000 * 10**decimals()); // 1 million tokens
    }
    
    modifier onlyEduPlatform() {
        require(msg.sender == eduPlatform, "Only EduPlatform can call this");
        _;
    }
    
    function setEduPlatform(address _eduPlatform) external onlyOwner {
        eduPlatform = _eduPlatform;
    }
    
    function rewardStudent(address student, uint256 amount) external onlyEduPlatform {
        _mint(student, amount * 10**decimals());
    }
    
    function spendTokens(address student, uint256 amount) external onlyEduPlatform {
        _burn(student, amount * 10**decimals());
    }
}