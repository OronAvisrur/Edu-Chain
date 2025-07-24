// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// ERC20 token contract for rewarding student achievements
contract SkillToken {
    string public name = "SkillToken";     
    string public symbol = "SKILL";        
    uint8 public decimals = 18;            
    uint256 public totalSupply;           
    
    // ERC20 standard mappings
    // Address to token balance
    mapping(address => uint256) public balanceOf;   
    // Approval mappings
    mapping(address => mapping(address => uint256)) public allowance; 

    // ERC20 standard events
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Mint(address indexed to, uint256 value);

    // Initialize contract with zero supply
    constructor() {
        totalSupply = 0; 
    }

    // Mint new tokens to specified address
    function mint(address to, uint256 value) public {
        // Validate minting parameters
        require(to != address(0), "Cannot mint to zero address");
        require(value > 0, "Cannot mint 0 tokens");

        // Increase total supply and recipient balance
        totalSupply += value;
        balanceOf[to] += value;

        // Events for tracking
        emit Mint(to, value);                    
        emit Transfer(address(0), to, value);    
    }

    // Transfer tokens from sender to recipient
    function transfer(address to, uint256 value) public returns (bool) {
        // Check sender has enough balance
        require(balanceOf[msg.sender] >= value, "Not enough balance");
        require(to != address(0), "Cannot transfer to zero address");

        // Update balances
        balanceOf[msg.sender] -= value; 
        balanceOf[to] += value;         

        // Transfer event
        emit Transfer(msg.sender, to, value);
        
        return true;
    }

    // Approve spender to use tokens on behalf of owner
    function approve(address spender, uint256 value) public returns (bool) {
        // Set allowance amount
        allowance[msg.sender][spender] = value;
        
        // Approval event
        emit Approval(msg.sender, spender, value);
        
        return true; 
    }

    // Transfer tokens from one address to another using allowance
    function transferFrom(address from, address to, uint256 value) public returns (bool) {
        // Check all required conditions
        require(balanceOf[from] >= value, "Not enough balance");         
        require(allowance[from][msg.sender] >= value, "Not enough allowance"); 
        require(to != address(0), "Cannot transfer to zero address");     

        // Update balances and allowance
        balanceOf[from] -= value;                   
        balanceOf[to] += value;                      
        allowance[from][msg.sender] -= value;        

        // Transfer event
        emit Transfer(from, to, value);
        
        return true; 
    }
}