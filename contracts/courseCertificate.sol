// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CourseCertificate is ERC721, ERC721URIStorage, Ownable {
    uint256 private _tokenIds;
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
    
    constructor() ERC721("CourseCertificate", "CERT") Ownable(msg.sender) {}
    
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
        _tokenIds++;
        uint256 newTokenId = _tokenIds;
        
        _mint(student, newTokenId);
        _setTokenURI(newTokenId, metadataURI);
        
        certificates[newTokenId] = Certificate({
            courseId: courseId,
            student: student,
            courseName: courseName,
            completionDate: block.timestamp,
            score: score,
            metadataURI: metadataURI
        });
        
        studentCertificates[student].push(newTokenId);
        
        return newTokenId;
    }
    
    function getStudentCertificates(address student) 
        external view returns (uint256[] memory) {
        return studentCertificates[student];
    }
    
    function tokenURI(uint256 tokenId)
        public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}