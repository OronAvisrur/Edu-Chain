// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CourseCertificate is ERC721, Ownable {
    uint256 private _nextTokenId = 1;
    address public eduPlatform;
    
    struct Certificate {
        uint256 courseId;
        address student;
        string courseName;
        uint256 completionDate;
        uint8 score;
        string metadataURI;
    }
    
    mapping(uint256 => Certificate) public certificates;
    mapping(address => uint256[]) public studentCertificates;
    mapping(uint256 => string) private _tokenURIs;
    
    constructor(address initialOwner) ERC721("CourseCertificate", "CERT") Ownable(initialOwner) {}
    
    modifier onlyEduPlatform() {
        require(msg.sender == eduPlatform, "Only EduPlatform can call this");
        _;
    }
    
    function setEduPlatform(address _eduPlatform) external onlyOwner {
        eduPlatform = _eduPlatform;
    }
    
    function mintCertificate(
        address student,
        uint256 courseId,
        string memory courseName,
        uint8 score,
        string memory metadataURI
    ) external onlyEduPlatform returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        
        _mint(student, tokenId);
        _setTokenURI(tokenId, metadataURI);
        
        certificates[tokenId] = Certificate({
            courseId: courseId,
            student: student,
            courseName: courseName,
            completionDate: block.timestamp,
            score: score,
            metadataURI: metadataURI
        });
        
        studentCertificates[student].push(tokenId);
        
        return tokenId;
    }
    
    function getStudentCertificates(address student) 
        external view returns (uint256[] memory) {
        return studentCertificates[student];
    }
    
    function totalSupply() external view returns (uint256) {
        return _nextTokenId - 1;
    }
    
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        
        string memory _tokenURI = _tokenURIs[tokenId];
        string memory base = _baseURI();
        
        if (bytes(base).length == 0) {
            return _tokenURI;
        }
        
        if (bytes(_tokenURI).length > 0) {
            return string.concat(base, _tokenURI);
        }
        
        return super.tokenURI(tokenId);
    }
    
    function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal {
        _tokenURIs[tokenId] = _tokenURI;
    }
}