// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./SkillToken.sol";
import "./CertificateNFT.sol";

contract EduChain {
    address public admin;
    SkillToken public skillToken;
    CertificateNFT public certificateNFT;
    uint256 public courseCounter;
    uint256 public questionCounter;

    struct Course {
        string name;
        string description;
        string category;
        uint256 difficulty; // 1-3
        uint256 price;
        uint256 requiredCorrectAnswers;
        address creator;
        bool isActive;
        uint256[] questionIds;
        address[] enrolledStudents;
        uint256 totalCompletions;
    }

    struct Question {
        uint256 courseId;
        string questionText;
        string[] options;
        uint256 correctAnswer;
        string explanation;
    }

    struct StudentProgress {
        uint256 correctAnswers;
        uint256 totalAnswers;
        bool completed;
        uint256 finalScore;
        bool hasSubmitted;
    }

    mapping(uint256 => Course) public courses;
    mapping(uint256 => Question) public questions;
    mapping(address => uint256[]) public studentCourses;
    mapping(address => mapping(uint256 => StudentProgress)) public studentProgress;
    mapping(address => mapping(uint256 => bool)) public hasEnrolled;
    address[] public allStudents;
    mapping(address => bool) public isRegisteredStudent;
    mapping(address => uint256) public studentTotalCompletions;

    event CourseCreated(uint256 indexed courseId, string name, address creator);
    event QuestionAdded(uint256 indexed questionId, uint256 courseId);
    event StudentEnrolled(address indexed student, uint256 indexed courseId);
    event AnswersSubmitted(address indexed student, uint256 indexed courseId, uint256 correctCount, uint256 totalCount);
    event CourseCompleted(address indexed student, uint256 indexed courseId, uint256 score);

    constructor(address _skillToken, address _certificateNFT) {
        admin = msg.sender;
        skillToken = SkillToken(_skillToken);
        certificateNFT = CertificateNFT(_certificateNFT);
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    function createCourse(
        string memory name,
        string memory description,
        string memory category,
        uint256 difficulty,
        uint256 price,
        uint256 requiredCorrectAnswers
    ) public returns (uint256) {
        require(difficulty >= 1 && difficulty <= 3 && requiredCorrectAnswers > 0, "Invalid params");
        
        courses[++courseCounter] = Course({
            name: name,
            description: description,
            category: category,
            difficulty: difficulty,
            price: price,
            requiredCorrectAnswers: requiredCorrectAnswers,
            creator: msg.sender,
            isActive: true,
            questionIds: new uint256[](0),
            enrolledStudents: new address[](0),
            totalCompletions: 0
        });

        emit CourseCreated(courseCounter, name, msg.sender);
        return courseCounter;
    }

    function addQuestion(
        uint256 courseId,
        string memory questionText,
        string[] memory options,
        uint256 correctAnswer,
        string memory explanation
    ) public onlyAdmin {
        require(courses[courseId].isActive && correctAnswer < options.length && options.length >= 2, "Invalid question");

        questions[++questionCounter] = Question({
            courseId: courseId,
            questionText: questionText,
            options: options,
            correctAnswer: correctAnswer,
            explanation: explanation
        });

        courses[courseId].questionIds.push(questionCounter);
        emit QuestionAdded(questionCounter, courseId);
    }

    function enrollInCourse(uint256 courseId) public {
        require(courses[courseId].isActive && !hasEnrolled[msg.sender][courseId], "Cannot enroll");

        Course memory course = courses[courseId];
        if (course.price > 0) {
            uint256 priceInWei = course.price * 10**18;
            require(skillToken.balanceOf(msg.sender) >= priceInWei, "Not enough tokens");
            require(skillToken.transferFrom(msg.sender, admin, priceInWei), "Payment failed");
        }

        hasEnrolled[msg.sender][courseId] = true;
        studentCourses[msg.sender].push(courseId);
        studentProgress[msg.sender][courseId] = StudentProgress(0, 0, false, 0, false);

        if (!isRegisteredStudent[msg.sender]) {
            allStudents.push(msg.sender);
            isRegisteredStudent[msg.sender] = true;
        }

        courses[courseId].enrolledStudents.push(msg.sender);
        emit StudentEnrolled(msg.sender, courseId);
    }

    function submitAnswers(uint256[] memory questionIds, uint256[] memory selectedAnswers) public {
        require(questionIds.length == selectedAnswers.length && questionIds.length > 0, "Invalid arrays");
        
        uint256 courseId = questions[questionIds[0]].courseId;
        require(courses[courseId].isActive && hasEnrolled[msg.sender][courseId], "Invalid submission");
        
        StudentProgress storage progress = studentProgress[msg.sender][courseId];
        require(!progress.hasSubmitted && !progress.completed, "Already submitted");

        // Validate questions and calculate results
        uint256 correctCount = 0;
        uint256 totalTokenReward = 0;
        
        for (uint i = 0; i < questionIds.length; i++) {
            Question memory question = questions[questionIds[i]];
            require(question.courseId == courseId && selectedAnswers[i] < question.options.length, "Invalid question/answer");
            
            if (selectedAnswers[i] == question.correctAnswer) {
                correctCount++;
                totalTokenReward += (5 * courses[courseId].difficulty) * 10**18;
            }
        }

        // Update progress
        progress.correctAnswers = correctCount;
        progress.totalAnswers = questionIds.length;
        progress.hasSubmitted = true;

        // Check completion
        Course storage course = courses[courseId];
        if (correctCount >= course.requiredCorrectAnswers) {
            progress.completed = true;
            progress.finalScore = (correctCount * 100) / questionIds.length;
            totalTokenReward += 50 * 10**18; // completion bonus
            
            certificateNFT.issueCertificate(msg.sender, course.name, progress.finalScore, "EduChain Verified");
            course.totalCompletions++;
            studentTotalCompletions[msg.sender]++;
            
            emit CourseCompleted(msg.sender, courseId, progress.finalScore);
        }

        if (totalTokenReward > 0) skillToken.mint(msg.sender, totalTokenReward);
        emit AnswersSubmitted(msg.sender, courseId, correctCount, questionIds.length);
    }

    // View functions
    function getCourse(uint256 courseId) public view returns (
        string memory name, string memory description, string memory category,
        uint256 difficulty, uint256 price, uint256 requiredCorrectAnswers, uint256 questionCount
    ) {
        Course memory course = courses[courseId];
        return (course.name, course.description, course.category, course.difficulty, 
               course.price, course.requiredCorrectAnswers, course.questionIds.length);
    }

    function getQuestion(uint256 questionId) public view returns (
        string memory questionText, string[] memory options, string memory explanation, uint256 rewardTokens
    ) {
        Question memory question = questions[questionId];
        uint256 reward = (5 * courses[question.courseId].difficulty) * 10**18;
        return (question.questionText, question.options, question.explanation, reward);
    }

    function getQuestionWithAnswer(uint256 questionId) public view onlyAdmin returns (
        string memory questionText, string[] memory options, uint256 correctAnswer, string memory explanation
    ) {
        Question memory question = questions[questionId];
        return (question.questionText, question.options, question.correctAnswer, question.explanation);
    }

    function getStudentProgress(address student, uint256 courseId) public view returns (
        uint256 correctAnswers, uint256 totalAnswers, bool completed, uint256 finalScore, bool hasSubmitted, bool isEnrolled
    ) {
        StudentProgress memory progress = studentProgress[student][courseId];
        return (progress.correctAnswers, progress.totalAnswers, progress.completed, 
               progress.finalScore, progress.hasSubmitted, hasEnrolled[student][courseId]);
    }

    function getCourseQuestions(uint256 courseId) public view returns (uint256[] memory) {
        return courses[courseId].questionIds;
    }

    function getCourseStats(uint256 courseId) public view returns (
        uint256 totalEnrolled, uint256 totalCompleted, uint256 completionRate, address[] memory enrolledStudents
    ) {
        Course memory course = courses[courseId];
        uint256 rate = course.enrolledStudents.length > 0 ? 
                      (course.totalCompletions * 100) / course.enrolledStudents.length : 0;
        return (course.enrolledStudents.length, course.totalCompletions, rate, course.enrolledStudents);
    }

    function getStudentStats(address student) public view returns (
        uint256 totalCoursesEnrolled, uint256 totalCoursesCompleted, uint256[] memory enrolledCourses
    ) {
        return (studentCourses[student].length, studentTotalCompletions[student], studentCourses[student]);
    }

    function getPlatformStats() public view returns (
        uint256 totalCourses, uint256 totalStudents, uint256 totalEnrollments, uint256 totalCompletions
    ) {
        uint256 enrollmentCount = 0;
        uint256 completionCount = 0;
        
        for (uint256 i = 1; i <= courseCounter; i++) {
            enrollmentCount += courses[i].enrolledStudents.length;
            completionCount += courses[i].totalCompletions;
        }
        
        return (courseCounter, allStudents.length, enrollmentCount, completionCount);
    }

    function getAllStudents() public view returns (address[] memory) { return allStudents; }
    function getTotalCourses() public view returns (uint256) { return courseCounter; }
}