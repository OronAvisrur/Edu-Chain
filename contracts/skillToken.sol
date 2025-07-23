// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SkillToken {
    string public name = "SkillToken";
    string public symbol = "SKILL";
    uint8 public decimals = 18;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Mint(address indexed to, uint256 value);

    constructor() {
        totalSupply = 0;
    }

    // Anyone can mint tokens - no restrictions
    function mint(address to, uint256 value) public {
        require(to != address(0), "Cannot mint to zero address");
        require(value > 0, "Cannot mint 0 tokens");

        totalSupply += value;
        balanceOf[to] += value;

        emit Mint(to, value);
        emit Transfer(address(0), to, value);
    }

    function transfer(address to, uint256 value) public returns (bool) {
        require(balanceOf[msg.sender] >= value, "Not enough balance");
        require(to != address(0), "Cannot transfer to zero address");

        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;

        emit Transfer(msg.sender, to, value);
        return true;
    }

    function approve(address spender, uint256 value) public returns (bool) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) public returns (bool) {
        require(balanceOf[from] >= value, "Not enough balance");
        require(allowance[from][msg.sender] >= value, "Not enough allowance");
        require(to != address(0), "Cannot transfer to zero address");

        balanceOf[from] -= value;
        balanceOf[to] += value;
        allowance[from][msg.sender] -= value;

        emit Transfer(from, to, value);
        return true;
    }
}