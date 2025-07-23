// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CertificateNFT {
    string public name = "EduChain Certificate";
    string public symbol = "EDU";
    uint256 public totalSupply;

    struct Certificate {
        string courseName;
        uint256 completionDate;
        uint256 score;
        string signature;
    }

    mapping(uint256 => address) public ownerOf;
    mapping(address => uint256) public balanceOf;
    mapping(uint256 => Certificate) public certificates;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event CertificateIssued(uint256 indexed tokenId, address indexed student, string courseName);

    function issueCertificate(
        address student,
        string memory courseName,
        uint256 score,
        string memory signature
    ) public returns (uint256) {
        require(student != address(0), "Cannot issue to zero address");
        require(score >= 0 && score <= 100, "Score must be between 0 and 100");

        uint256 tokenId = totalSupply + 1;
        totalSupply++;

        ownerOf[tokenId] = student;
        balanceOf[student]++;

        certificates[tokenId] = Certificate({
            courseName: courseName,
            completionDate: block.timestamp,
            score: score,
            signature: signature
        });

        emit Transfer(address(0), student, tokenId);
        emit CertificateIssued(tokenId, student, courseName);

        return tokenId;
    }

    function getCertificate(uint256 tokenId) public view returns (
        string memory courseName,
        uint256 completionDate,
        uint256 score,
        string memory signature
    ) {
        require(ownerOf[tokenId] != address(0), "Certificate does not exist");
        Certificate memory cert = certificates[tokenId];
        return (cert.courseName, cert.completionDate, cert.score, cert.signature);
    }
}