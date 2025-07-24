// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// NFT contract for issuing course completion certificates
contract CertificateNFT {
    // NFT information
    string public name = "EduChain Certificate";
    string public symbol = "EDU";
    // Total number of certificates issued
    uint256 public totalSupply; 

    struct Certificate {
        string courseName; 
        // Timestamp when course was completed     
        uint256 completionDate; 
        // Final score achieved (0-100)
        uint256 score;          
        string signature;
    }

    // Token ID to owner address
    mapping(uint256 => address) public ownerOf;  
    // Owner to token count  
    mapping(address => uint256) public balanceOf;  
    // Token ID to certificate data
    mapping(uint256 => Certificate) public certificates; 

    // Events for blockchain logging
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event CertificateIssued(uint256 indexed tokenId, address indexed student, string courseName);

    // Create new certificate NFT to student
    function issueCertificate(
        address student,        
        string memory courseName, 
        uint256 score,         
        string memory signature 
    ) public returns (uint256) {
        // Validate input parameters
        require(student != address(0), "Cannot issue to zero address");
        require(score >= 0 && score <= 100, "Score must be between 0 and 100");

        // Generate new token ID and increment supply
        uint256 tokenId = totalSupply + 1;
        totalSupply++;

        // Set ownership and update balance
        ownerOf[tokenId] = student;
        balanceOf[student]++;

        // Store certificate data
        certificates[tokenId] = Certificate({
            courseName: courseName,
            // Current block timestamp
            completionDate: block.timestamp, 
            score: score,
            signature: signature
        });

        // Standard NFT transfer event
        emit Transfer(address(0), student, tokenId); 
        // Custom certificate event
        emit CertificateIssued(tokenId, student, courseName); 

        // Return new certificate ID
        return tokenId; 
    }

    // Get certificate details by token ID
    function getCertificate(uint256 tokenId) public view returns (
        string memory courseName,  
        uint256 completionDate,     
        uint256 score,              
        string memory signature    
    ) {
        // Check if certificate exists
        require(ownerOf[tokenId] != address(0), "Certificate does not exist");
        
        // Get certificate data from storage
        Certificate memory cert = certificates[tokenId];
        
        // Return all certificate information
        return (cert.courseName, cert.completionDate, cert.score, cert.signature);
    }
}