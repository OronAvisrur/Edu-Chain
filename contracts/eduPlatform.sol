// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ISkillToken {
    function rewardStudent(address student, uint256 amount) external;
    function spendTokens(address student, uint256 amount) external;
}

interface ICourseCertificate {
    function mintCertificate(
        address student,
        uint256 courseId,
        string memory courseName,
        uint8 score,
        string memory metadataURI
    ) external returns (uint256);
}

contract EduPlatform {
    address public owner;
    
    ISkillToken public skillToken;
    ICourseCertificate public courseCertificate;
    
    uint256 private _courseCounter;
    uint256 private _questionCounter;
    
    struct Course {
        uint256 courseId;
        string name;
        string description;
        string category;
        uint8 difficulty;
        uint256 enrollmentFee;
        address instructor;
        bool isActive;
        uint256 totalQuestions;
        uint256 passingScore;
        string certificateName;
        uint256 studentsEnrolled;
        uint256 createdAt;
    }
    
    struct Question {
        uint256 questionId;
        uint256 courseId;
        string questionText;
        string[4] options;
        uint8 correctAnswer;
        string explanation;
        uint256 rewardTokens;
    }
    
    struct StudentProgress {
        mapping(uint256 => bool) enrolledCourses;
        mapping(uint256 => uint256) courseScores;
        mapping(uint256 => bool) completedCourses;
        mapping(bytes32 => bool) answeredQuestions;
        uint256 totalTokensEarned;
    }
    
    mapping(uint256 => Course) public courses;
    mapping(uint256 => Question) public questions;
    mapping(address => StudentProgress) public studentProgress;
    mapping(uint256 => uint256[]) public courseQuestions; 
    
    event CourseCreated(uint256 indexed courseId, string name, address instructor);
    event QuestionAdded(uint256 indexed questionId, uint256 indexed courseId);
    event StudentEnrolled(address indexed student, uint256 indexed courseId);
    event QuestionAnswered(address indexed student, uint256 indexed questionId, bool correct);
    event CourseCompleted(address indexed student, uint256 indexed courseId, uint256 certificateId);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    constructor(address _skillToken, address _courseCertificate) {
        owner = msg.sender;
        skillToken = ISkillToken(_skillToken);
        courseCertificate = ICourseCertificate(_courseCertificate);
        _courseCounter = 0;
        _questionCounter = 0;
    }
    
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
    
    function createCourse(
        string memory name,
        string memory description,
        string memory category,
        uint8 difficulty,
        uint256 enrollmentFee,
        uint256 passingScore,
        string memory certificateName
    ) external onlyOwner {
        require(bytes(name).length > 0, "Course name cannot be empty");
        require(difficulty <= 10, "Difficulty must be between 0-10");
        require(passingScore > 0, "Passing score must be greater than 0");
        
        _courseCounter++;
        uint256 courseId = _courseCounter;
        
        courses[courseId] = Course({
            courseId: courseId,
            name: name,
            description: description,
            category: category,
            difficulty: difficulty,
            enrollmentFee: enrollmentFee,
            instructor: msg.sender,
            isActive: true,
            totalQuestions: 0,
            passingScore: passingScore,
            certificateName: certificateName,
            studentsEnrolled: 0,
            createdAt: block.timestamp
        });
        
        emit CourseCreated(courseId, name, msg.sender);
    }
    
    function addQuestion(
        uint256 courseId,
        string memory questionText,
        string[4] memory options,
        uint8 correctAnswer,
        string memory explanation,
        uint256 rewardTokens
    ) external onlyOwner {
        require(courses[courseId].courseId != 0, "Course does not exist");
        require(correctAnswer < 4, "Invalid correct answer index");
        require(bytes(questionText).length > 0, "Question text cannot be empty");
        require(rewardTokens > 0, "Reward tokens must be greater than 0");
        
        _questionCounter++;
        uint256 questionId = _questionCounter;
        
        questions[questionId] = Question({
            questionId: questionId,
            courseId: courseId,
            questionText: questionText,
            options: options,
            correctAnswer: correctAnswer,
            explanation: explanation,
            rewardTokens: rewardTokens
        });
        
        courseQuestions[courseId].push(questionId);
        courses[courseId].totalQuestions++;
        
        emit QuestionAdded(questionId, courseId);
    }
    
    function enrollInCourse(uint256 courseId) external {
        require(courses[courseId].isActive, "Course is not active");
        require(courses[courseId].courseId != 0, "Course does not exist");
        require(!studentProgress[msg.sender].enrolledCourses[courseId], "Already enrolled");
        
        if (courses[courseId].enrollmentFee > 0) {
            skillToken.spendTokens(msg.sender, courses[courseId].enrollmentFee);
        }
        
        studentProgress[msg.sender].enrolledCourses[courseId] = true;
        courses[courseId].studentsEnrolled++;
        
        skillToken.rewardStudent(msg.sender, 10);
        
        emit StudentEnrolled(msg.sender, courseId);
    }
    
    function answerQuestion(uint256 questionId, uint8 answer) external {
        Question memory question = questions[questionId];
        require(question.questionId != 0, "Question does not exist");
        require(answer < 4, "Invalid answer option");
        require(studentProgress[msg.sender].enrolledCourses[question.courseId], "Not enrolled in course");
        
        bytes32 questionHash = keccak256(abi.encodePacked(msg.sender, questionId));
        require(!studentProgress[msg.sender].answeredQuestions[questionHash], "Question already answered");
        
        studentProgress[msg.sender].answeredQuestions[questionHash] = true;
        
        bool isCorrect = (answer == question.correctAnswer);
        
        if (isCorrect) {
            studentProgress[msg.sender].courseScores[question.courseId]++;
            skillToken.rewardStudent(msg.sender, question.rewardTokens);
            studentProgress[msg.sender].totalTokensEarned += question.rewardTokens;
            
            _checkCourseCompletion(msg.sender, question.courseId);
        }
        
        emit QuestionAnswered(msg.sender, questionId, isCorrect);
    }
    
    function _checkCourseCompletion(address student, uint256 courseId) internal {
        Course memory course = courses[courseId];
        
        if (studentProgress[student].courseScores[courseId] >= course.passingScore &&
            !studentProgress[student].completedCourses[courseId]) {
            
            studentProgress[student].completedCourses[courseId] = true;
            
            uint8 scorePercentage = uint8((studentProgress[student].courseScores[courseId] * 100) / course.totalQuestions);
            
            uint256 certificateId = courseCertificate.mintCertificate(
                student,
                courseId,
                course.name,
                scorePercentage,
                "" 
            );
            
            skillToken.rewardStudent(student, 50);
            
            emit CourseCompleted(student, courseId, certificateId);
        }
    }
    
    function toggleCourseStatus(uint256 courseId) external onlyOwner {
        require(courses[courseId].courseId != 0, "Course does not exist");
        courses[courseId].isActive = !courses[courseId].isActive;
    }

    function getCourseQuestions(uint256 courseId) external view returns (uint256[] memory) {
        return courseQuestions[courseId];
    }
    
    function getStudentProgress(address student, uint256 courseId) 
        external view returns (bool enrolled, uint256 score, bool completed) {
        return (
            studentProgress[student].enrolledCourses[courseId],
            studentProgress[student].courseScores[courseId],
            studentProgress[student].completedCourses[courseId]
        );
    }
    
    function getAllCourses() external view returns (Course[] memory) {
        Course[] memory allCourses = new Course[](_courseCounter);
        
        for (uint256 i = 1; i <= _courseCounter; i++) {
            allCourses[i-1] = courses[i];
        }
        
        return allCourses;
    }
    
    function getTotalCourses() external view returns (uint256) {
        return _courseCounter;
    }
    
    function getTotalQuestions() external view returns (uint256) {
        return _questionCounter;
    }
    
    function getStudentTotalTokens(address student) external view returns (uint256) {
        return studentProgress[student].totalTokensEarned;
    }
    
    function getQuestionDetails(uint256 questionId) 
        external view onlyOwner returns (Question memory) {
        return questions[questionId];
    }
    
    function getQuestionForStudent(uint256 questionId) 
        external view returns (
            uint256 qId,
            uint256 cId,
            string memory questionText,
            string[4] memory options,
            string memory explanation,
            uint256 reward
        ) {
        Question memory question = questions[questionId];
        require(question.questionId != 0, "Question does not exist");
        require(studentProgress[msg.sender].enrolledCourses[question.courseId], "Not enrolled in course");
        
        return (
            question.questionId,
            question.courseId,
            question.questionText,
            question.options,
            question.explanation,
            question.rewardTokens
        );
    }
}