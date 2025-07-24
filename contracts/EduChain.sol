// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./SkillToken.sol";
import "./CertificateNFT.sol";

// Main contract for EduChain learning platform
contract EduChain {
    address public admin;               
    SkillToken public skillToken;      
    CertificateNFT public certificateNFT; 
    uint256 public courseCounter;       
    uint256 public questionCounter;    

    // Structure to store course information
    struct Course {
        string name;                   
        string description;             
        string category;                
        uint256 difficulty;             
        uint256 price;                 
        uint256 requiredCorrectAnswers; 
        address creator;                
        bool isActive;                  
        uint256[] questionIds;          
        address[] enrolledStudents;     
        uint256 totalCompletions;       
    }

    // Structure to store question data
    struct Question {
        uint256 courseId;              
        string questionText;            
        string[] options;              
        uint256 correctAnswer;         
        string explanation;             
    }

    // Structure to track student progress in courses
    struct StudentProgress {
        uint256 correctAnswers;        
        uint256 totalAnswers;          
        bool completed;                 
        uint256 finalScore;             
        bool hasSubmitted;            
    }

    // Course ID to course data
    mapping(uint256 => Course) public courses;     
    // Question ID to question data
    mapping(uint256 => Question) public questions; 
    // Student to enrolled course IDs
    mapping(address => uint256[]) public studentCourses; 
    // Student progress per course
    mapping(address => mapping(uint256 => StudentProgress)) public studentProgress; 
    // Enrollment status tracking
    mapping(address => mapping(uint256 => bool)) public hasEnrolled; 
    // List of all registered students
    address[] public allStudents;         
    // Student registration status        
    mapping(address => bool) public isRegisteredStudent;
    // Total courses completed per student
    mapping(address => uint256) public studentTotalCompletions; 

    // Events for blockchain logging
    event CourseCreated(uint256 indexed courseId, string name, address creator);
    event QuestionAdded(uint256 indexed questionId, uint256 courseId);
    event StudentEnrolled(address indexed student, uint256 indexed courseId);
    event AnswersSubmitted(address indexed student, uint256 indexed courseId, uint256 correctCount, uint256 totalCount);
    event CourseCompleted(address indexed student, uint256 indexed courseId, uint256 score);

    // Initialize contract with token and NFT addresses
    constructor(address _skillToken, address _certificateNFT) {
        // Set deployer as admin
        admin = msg.sender;         
        // Connect to token contract                 
        skillToken = SkillToken(_skillToken);    
        // Connect to NFT contract    
        certificateNFT = CertificateNFT(_certificateNFT); 
    }

    // Modifier to restrict admin-only functions
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    // Create new course 
    function createCourse(
        string memory name,                
        string memory description,         
        string memory category,             
        uint256 difficulty,                
        uint256 price,                      
        uint256 requiredCorrectAnswers      
    ) public returns (uint256) {
        // Validate input parameters
        require(difficulty >= 1 && difficulty <= 3 && requiredCorrectAnswers > 0, "Invalid params");
        
        // Create new course with incremented ID
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

        // Event for course creation
        emit CourseCreated(courseCounter, name, msg.sender);
        
        // Return new course ID
        return courseCounter; 
    }

    // Add question to existing course - only course admin can add questions
    function addQuestion(
        uint256 courseId,                  
        string memory questionText,       
        string[] memory options,            
        uint256 correctAnswer,            
        string memory explanation          
    ) public onlyAdmin {
        // Validate question parameters
        require(courses[courseId].isActive && correctAnswer < options.length && options.length >= 2, "Invalid question");

        // Create new question with incremented ID
        questions[++questionCounter] = Question({
            courseId: courseId,
            questionText: questionText,
            options: options,
            correctAnswer: correctAnswer,
            explanation: explanation
        });

        // Add question ID to course's question list
        courses[courseId].questionIds.push(questionCounter);
        emit QuestionAdded(questionCounter, courseId);
    }

    // Enroll student in course 
    function enrollInCourse(uint256 courseId) public {
        // Check if enrollment is valid
        require(courses[courseId].isActive && !hasEnrolled[msg.sender][courseId], "Cannot enroll");

        // Get course details for payment processing
        Course memory course = courses[courseId];
        
        // Handle payment if course has a price
        if (course.price > 0) {
            // Convert to wei (18 decimals)
            uint256 priceInWei = course.price * 10**18; 
            require(skillToken.balanceOf(msg.sender) >= priceInWei, "Not enough tokens");
            require(skillToken.transferFrom(msg.sender, admin, priceInWei), "Payment failed");
        }

        // Set enrollment status and initialize progress
        hasEnrolled[msg.sender][courseId] = true;
        studentCourses[msg.sender].push(courseId);
        studentProgress[msg.sender][courseId] = StudentProgress(0, 0, false, 0, false);

        // Register student if first time
        if (!isRegisteredStudent[msg.sender]) {
            allStudents.push(msg.sender);
            isRegisteredStudent[msg.sender] = true;
        }

        // Add student to course enrollment list
        courses[courseId].enrolledStudents.push(msg.sender);
        emit StudentEnrolled(msg.sender, courseId);
    }

    // Submit quiz answers for grading
    function submitAnswers(uint256[] memory questionIds, uint256[] memory selectedAnswers) public {
        // Validate input arrays
        require(questionIds.length == selectedAnswers.length && questionIds.length > 0, "Invalid arrays");
        
        // Get course ID from first question 
        uint256 courseId = questions[questionIds[0]].courseId;
        require(courses[courseId].isActive && hasEnrolled[msg.sender][courseId], "Invalid submission");
        
        // Get student progress and validate submission status
        StudentProgress storage progress = studentProgress[msg.sender][courseId];
        require(!progress.hasSubmitted && !progress.completed, "Already submitted");

        // Process answers and calculate rewards
        uint256 correctCount = 0;
        uint256 totalTokenReward = 0;
        
        // Loop through each question to check answers
        for (uint i = 0; i < questionIds.length; i++) {
            Question memory question = questions[questionIds[i]];
            require(question.courseId == courseId && selectedAnswers[i] < question.options.length, "Invalid question/answer");
            
            // Award tokens for correct answers
            if (selectedAnswers[i] == question.correctAnswer) {
                correctCount++;
                totalTokenReward += (5 * courses[courseId].difficulty) * 10**18; 
            }
        }

        // Update student progress
        progress.correctAnswers = correctCount;
        progress.totalAnswers = questionIds.length;
        progress.hasSubmitted = true;

        // Check if student passed the course
        Course storage course = courses[courseId];
        if (correctCount >= course.requiredCorrectAnswers) {
            progress.completed = true;
            progress.finalScore = (correctCount * 100) / questionIds.length; 
            totalTokenReward += 50 * 10**18;
            
            // Issue NFT certificate for completion
            certificateNFT.issueCertificate(msg.sender, course.name, progress.finalScore, "EduChain Verified");
            course.totalCompletions++;
            studentTotalCompletions[msg.sender]++;
            
            emit CourseCompleted(msg.sender, courseId, progress.finalScore);
        }

        // Mint reward tokens to student
        if (totalTokenReward > 0) skillToken.mint(msg.sender, totalTokenReward);
        emit AnswersSubmitted(msg.sender, courseId, correctCount, questionIds.length);
    }

    // Get course details by ID
    function getCourse(uint256 courseId) public view returns (
        string memory name, string memory description, string memory category,
        uint256 difficulty, uint256 price, uint256 requiredCorrectAnswers, uint256 questionCount
    ) {
        Course memory course = courses[courseId];
        return (course.name, course.description, course.category, course.difficulty, 
               course.price, course.requiredCorrectAnswers, course.questionIds.length);
    }

    // Get question details 
    function getQuestion(uint256 questionId) public view returns (
        string memory questionText, string[] memory options, string memory explanation, uint256 rewardTokens
    ) {
        Question memory question = questions[questionId];
        uint256 reward = (5 * courses[question.courseId].difficulty) * 10**18; 
        return (question.questionText, question.options, question.explanation, reward);
    }

    // Get question with correct answer 
    function getQuestionWithAnswer(uint256 questionId) public view onlyAdmin returns (
        string memory questionText, string[] memory options, uint256 correctAnswer, string memory explanation
    ) {
        Question memory question = questions[questionId];
        return (question.questionText, question.options, question.correctAnswer, question.explanation);
    }

    // Get student's progress in specific course
    function getStudentProgress(address student, uint256 courseId) public view returns (
        uint256 correctAnswers, uint256 totalAnswers, bool completed, uint256 finalScore, bool hasSubmitted, bool isEnrolled
    ) {
        StudentProgress memory progress = studentProgress[student][courseId];
        return (progress.correctAnswers, progress.totalAnswers, progress.completed, 
               progress.finalScore, progress.hasSubmitted, hasEnrolled[student][courseId]);
    }

    // Get all question IDs for a course
    function getCourseQuestions(uint256 courseId) public view returns (uint256[] memory) {
        return courses[courseId].questionIds;
    }

    // Get course statistics 
    function getCourseStats(uint256 courseId) public view returns (
        uint256 totalEnrolled, uint256 totalCompleted, uint256 completionRate, address[] memory enrolledStudents
    ) {
        Course memory course = courses[courseId];
        // Calculate completion rate as percentage
        uint256 rate = course.enrolledStudents.length > 0 ? 
                      (course.totalCompletions * 100) / course.enrolledStudents.length : 0;
        return (course.enrolledStudents.length, course.totalCompletions, rate, course.enrolledStudents);
    }

    // Get individual student overall statistics
    function getStudentStats(address student) public view returns (
        uint256 totalCoursesEnrolled, uint256 totalCoursesCompleted, uint256[] memory enrolledCourses
    ) {
        return (studentCourses[student].length, studentTotalCompletions[student], studentCourses[student]);
    }

    // Get all statistics
    function getPlatformStats() public view returns (
        uint256 totalCourses, uint256 totalStudents, uint256 totalEnrollments, uint256 totalCompletions
    ) {
        uint256 enrollmentCount = 0;
        uint256 completionCount = 0;
        
        // Loop through all courses to count enrollments and completions
        for (uint256 i = 1; i <= courseCounter; i++) {
            enrollmentCount += courses[i].enrolledStudents.length;
            completionCount += courses[i].totalCompletions;
        }
        
        return (courseCounter, allStudents.length, enrollmentCount, completionCount);
    }

    function getAllStudents() public view returns (address[] memory) { 
        return allStudents; 
    }
    
    function getTotalCourses() public view returns (uint256) { 
        return courseCounter; 
    }
}