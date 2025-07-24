/**
 * EduChain Blockchain Integration - Fixed Version
 */

class EduChainBlockchain {
    constructor() {
        // Contract addresses for deployed smart contracts
        this.contracts = {
            eduChain: '0xeD9c2eCc479006eAB5770bbdAf98385114b85d5E',
            skillToken: '0x871F37564445953712DaD79d78414A808c1b6463',
            certificateNFT: '0xE6A85805080c0a9392E361a99C94EccdA73EB391'
        };

        // Application state variables
        this.state = {
            // Current user wallet address
            account: null,       
            isConnected: false,  
            // Web3 instance
            web3: null,       
            // Loaded courses from blockchain  
            courses: []         
        };

        // Configuration object with contract addresses and ABIs
        this.config = {
            addresses: {
                eduChain: '0xeD9c2eCc479006eAB5770bbdAf98385114b85d5E',
                skillToken: '0x871F37564445953712DaD79d78414A808c1b6463',
                certificateNFT: '0xE6A85805080c0a9392E361a99C94EccdA73EB391'
            },
            abi: {
                // Main EduChain contract ABI - defines all function signatures
                eduChain: [
                    {
                        "inputs": [
                            { "internalType": "address", "name": "_skillToken", "type": "address" },
                            { "internalType": "address", "name": "_certificateNFT", "type": "address" }
                        ],
                        "stateMutability": "nonpayable",
                        "type": "constructor"
                    },
                    {
                        // Function to create new course
                        "inputs": [
                            { "internalType": "string", "name": "name", "type": "string" },
                            { "internalType": "string", "name": "description", "type": "string" },
                            { "internalType": "string", "name": "category", "type": "string" },
                            { "internalType": "uint256", "name": "difficulty", "type": "uint256" },
                            { "internalType": "uint256", "name": "price", "type": "uint256" },
                            { "internalType": "uint256", "name": "requiredCorrectAnswers", "type": "uint256" }
                        ],
                        "name": "createCourse",
                        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
                        "stateMutability": "nonpayable",
                        "type": "function"
                    },
                    {
                        // Function to add questions to courses
                        "inputs": [
                            { "internalType": "uint256", "name": "courseId", "type": "uint256" },
                            { "internalType": "string", "name": "questionText", "type": "string" },
                            { "internalType": "string[]", "name": "options", "type": "string[]" },
                            { "internalType": "uint256", "name": "correctAnswer", "type": "uint256" },
                            { "internalType": "string", "name": "explanation", "type": "string" }
                        ],
                        "name": "addQuestion",
                        "outputs": [],
                        "stateMutability": "nonpayable",
                        "type": "function"
                    },
                    {
                        // Get total number of courses
                        "inputs": [],
                        "name": "getTotalCourses",
                        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
                        "stateMutability": "view",
                        "type": "function"
                    },
                    {
                        // Get course details by ID
                        "inputs": [{ "internalType": "uint256", "name": "courseId", "type": "uint256" }],
                        "name": "getCourse",
                        "outputs": [
                            { "internalType": "string", "name": "name", "type": "string" },
                            { "internalType": "string", "name": "description", "type": "string" },
                            { "internalType": "string", "name": "category", "type": "string" },
                            { "internalType": "uint256", "name": "difficulty", "type": "uint256" },
                            { "internalType": "uint256", "name": "price", "type": "uint256" },
                            { "internalType": "uint256", "name": "requiredCorrectAnswers", "type": "uint256" },
                            { "internalType": "uint256", "name": "questionCount", "type": "uint256" }
                        ],
                        "stateMutability": "view",
                        "type": "function"
                    },
                    {
                        // Get all question IDs for a course
                        "inputs": [{ "internalType": "uint256", "name": "courseId", "type": "uint256" }],
                        "name": "getCourseQuestions",
                        "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }],
                        "stateMutability": "view",
                        "type": "function"
                    },
                    {
                        // Get question details by ID
                        "inputs": [{ "internalType": "uint256", "name": "questionId", "type": "uint256" }],
                        "name": "getQuestion",
                        "outputs": [
                            { "internalType": "string", "name": "questionText", "type": "string" },
                            { "internalType": "string[]", "name": "options", "type": "string[]" },
                            { "internalType": "string", "name": "explanation", "type": "string" },
                            { "internalType": "uint256", "name": "rewardTokens", "type": "uint256" }
                        ],
                        "stateMutability": "view",
                        "type": "function"
                    },
                    {
                        // Submit quiz answers for grading
                        "inputs": [
                            { "internalType": "uint256[]", "name": "questionIds", "type": "uint256[]" },
                            { "internalType": "uint256[]", "name": "selectedAnswers", "type": "uint256[]" }
                        ],
                        "name": "submitAnswers",
                        "outputs": [],
                        "stateMutability": "nonpayable",
                        "type": "function"
                    },
                    {
                        // Get course statistics (enrolled, completed, etc.)
                        "inputs": [{ "internalType": "uint256", "name": "courseId", "type": "uint256" }],
                        "name": "getCourseStats",
                        "outputs": [
                            { "internalType": "uint256", "name": "totalEnrolled", "type": "uint256" },
                            { "internalType": "uint256", "name": "totalCompleted", "type": "uint256" },
                            { "internalType": "uint256", "name": "completionRate", "type": "uint256" },
                            { "internalType": "address[]", "name": "enrolledStudents", "type": "address[]" }
                        ],
                        "stateMutability": "view",
                        "type": "function"
                    },
                    {
                        // Enroll student in course
                        "inputs": [{ "internalType": "uint256", "name": "courseId", "type": "uint256" }],
                        "name": "enrollInCourse",
                        "outputs": [],
                        "stateMutability": "nonpayable",
                        "type": "function"
                    },
                    {
                        // Get contract admin address
                        "inputs": [],
                        "name": "admin",
                        "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
                        "stateMutability": "view",
                        "type": "function"
                    }
                ],
                // SkillToken contract ABI - ERC20 token functions
                skillToken: [
                    {
                        // Get token balance for address
                        "inputs": [{ "internalType": "address", "name": "_owner", "type": "address" }],
                        "name": "balanceOf",
                        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
                        "stateMutability": "view",
                        "type": "function"
                    },
                    {
                        // Approve token spending
                        "inputs": [
                            { "internalType": "address", "name": "spender", "type": "address" },
                            { "internalType": "uint256", "name": "value", "type": "uint256" }
                        ],
                        "name": "approve",
                        "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
                        "stateMutability": "nonpayable",
                        "type": "function"
                    },
                    {
                        // Transfer tokens
                        "inputs": [
                            { "internalType": "address", "name": "to", "type": "address" },
                            { "internalType": "uint256", "name": "value", "type": "uint256" }
                        ],
                        "name": "transfer",
                        "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
                        "stateMutability": "nonpayable",
                        "type": "function"
                    },
                    {
                        // Check token allowance
                        "inputs": [
                            { "internalType": "address", "name": "owner", "type": "address" },
                            { "internalType": "address", "name": "spender", "type": "address" }
                        ],
                        "name": "allowance",
                        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
                        "stateMutability": "view",
                        "type": "function"
                    }
                ],
                // Certificate NFT contract ABI - ERC721 functions
                certificateNFT: [
                    {
                        // Get NFT balance for address
                        "inputs": [{ "internalType": "address", "name": "_owner", "type": "address" }],
                        "name": "balanceOf",
                        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
                        "stateMutability": "view",
                        "type": "function"
                    }
                ]
            }
        };
    }

    // Initialize blockchain connection with Web3 and user account
    async init(web3, account) {
        // Check if contract addresses are configured
        if (!this.config.addresses.eduChain) {
            throw new Error('Contract addresses not configured. Please deploy contracts first.');
        }

        // Set connection state
        this.state.web3 = web3;
        this.state.account = account;
        this.state.isConnected = true;

        // Create contract instance for main EduChain contract
        this.contracts.eduChain = new web3.eth.Contract(
            this.config.abi.eduChain,
            this.config.addresses.eduChain
        );

        console.log("Blockchain integration initialized");
    }

    // Load all courses from blockchain and update UI
    async loadCourses() {
        // Check if contract is initialized
        if (!this.contracts.eduChain) {
            console.warn("Contract not initialized");
            return;
        }

        try {
            // Get total number of courses from contract
            const totalCourses = await this.contracts.eduChain.methods
                .getTotalCourses()
                .call();

            const courses = [];

            // Loop through each course and get details
            for (let i = 1; i <= totalCourses; i++) {
                const courseData = await this.contracts.eduChain.methods
                    .getCourse(i)
                    .call();

                // Format course data for frontend
                courses.push({
                    id: i,
                    name: courseData.name,
                    description: courseData.description,
                    category: courseData.category,
                    difficulty: parseInt(courseData.difficulty),
                    price: parseInt(courseData.price),
                    requiredCorrectAnswers: parseInt(courseData.requiredCorrectAnswers),
                    questionCount: parseInt(courseData.questionCount)
                });
            }

            // Update state and UI
            this.state.courses = courses;
            this.updateQuestionCourseDropdown();
            console.log(`Loaded ${courses.length} courses from blockchain`);

        } catch (error) {
            console.error("Failed to load courses:", error.message);
            throw error;
        }
    }

    // Update course dropdown in question creation form
    updateQuestionCourseDropdown() {
        const select = document.getElementById("questionCourseSelect");
        if (!select) return;

        // Clear existing options
        select.innerHTML = '<option value="">Select Course</option>';
        
        // Add course options
        this.state.courses.forEach(course => {
            const option = document.createElement("option");
            option.value = course.id;
            option.textContent = `${course.name} (${course.category})`;
            select.appendChild(option);
        });
    }

    // Create new course on blockchain
    async createCourse(data) {
        if (!this.contracts.eduChain) {
            throw new Error("Contract not initialized");
        }

        const { name, category, difficulty, price, description, requiredCorrect } = data;

        try {
            // Send transaction to create course
            const tx = await this.contracts.eduChain.methods
                .createCourse(name, description, category, difficulty, price, requiredCorrect)
                .send({ from: this.state.account });

            console.log("Course created:", tx.transactionHash);
            
            // Reload courses to update UI
            await this.loadCourses();
            return tx;

        } catch (error) {
            console.error("Failed to create course:", error.message);
            throw error;
        }
    }

    // Add question to existing course
    async addQuestion(data) {
        if (!this.contracts.eduChain) {
            throw new Error("Contract not initialized");
        }

        const { courseId, questionText, options, correctAnswer, explanation } = data;

        try {
            // Send transaction to add question
            const tx = await this.contracts.eduChain.methods
                .addQuestion(courseId, questionText, options, correctAnswer, explanation)
                .send({ from: this.state.account });

            console.log("Question added:", tx.transactionHash);
            return tx;

        } catch (error) {
            console.error("Failed to add question:", error.message);
            throw error;
        }
    }

    // Enroll student in course (handles payment if required)
    async enrollInCourse(courseId) {
        if (!this.contracts.eduChain) {
            throw new Error("Contract not initialized");
        }

        try {
            // Get fresh course details from contract (not frontend state)
            const courseData = await this.contracts.eduChain.methods.getCourse(courseId).call();
            const coursePrice = parseInt(courseData.price);

            console.log(`Fresh course data from contract: Price = ${coursePrice}`);

            // If course has a price, approve token spending first
            if (coursePrice > 0) {
                const priceInWei = (coursePrice * Math.pow(10, 18)).toString();
                console.log(`Course costs ${coursePrice} tokens (${priceInWei} wei), approving spending...`);

                // Approve tokens for contract to spend
                await this.approveTokenSpending(priceInWei);
                console.log("Token spending approved, now enrolling...");
            }

            // Send enrollment transaction
            const tx = await this.contracts.eduChain.methods
                .enrollInCourse(courseId)
                .send({ from: this.state.account });

            console.log("Enrolled in course:", tx.transactionHash);

            // Refresh wallet info after enrollment
            setTimeout(async () => {
                if (typeof refreshWalletInfo === 'function') {
                    await refreshWalletInfo();
                }
            }, 3000);

            return tx;

        } catch (error) {
            console.error("Enrollment failed:", error.message);
            throw error;
        }
    }

    // Get all questions for a specific course
    async getCourseQuestions(courseId) {
        if (!this.contracts.eduChain) {
            throw new Error("Contract not initialized");
        }

        try {
            // Get question IDs for course
            const questionIds = await this.contracts.eduChain.methods
                .getCourseQuestions(courseId)
                .call();

            const questions = [];
            
            // Get details for each question
            for (let i = 0; i < questionIds.length; i++) {
                const questionData = await this.contracts.eduChain.methods
                    .getQuestion(questionIds[i])
                    .call();

                // Format question data
                questions.push({
                    id: questionIds[i],
                    questionText: questionData.questionText,
                    options: questionData.options,
                    explanation: questionData.explanation,
                    rewardTokens: parseInt(questionData.rewardTokens)
                });
            }

            return questions;

        } catch (error) {
            console.error("Failed to load questions:", error.message);
            throw error;
        }
    }

    // Submit quiz answers for grading
    async submitAnswers(questionIds, selectedAnswers) {
        if (!this.contracts.eduChain) {
            throw new Error("Contract not initialized");
        }

        try {
            // Send transaction with answers
            const tx = await this.contracts.eduChain.methods
                .submitAnswers(questionIds, selectedAnswers)
                .send({ from: this.state.account });

            console.log("Answers submitted:", tx.transactionHash);
            return tx;

        } catch (error) {
            console.error("Failed to submit answers:", error.message);
            throw error;
        }
    }

    // Get user's SkillToken balance
    async getSkillTokenBalance() {
        if (!this.state.web3 || !this.state.account) {
            return 0;
        }

        try {
            // Create token contract instance
            const contract = new this.state.web3.eth.Contract([
                {
                    "constant": true,
                    "inputs": [{ "name": "_owner", "type": "address" }],
                    "name": "balanceOf",
                    "outputs": [{ "name": "balance", "type": "uint256" }],
                    "type": "function"
                }
            ], this.config.addresses.skillToken);

            // Get balance in wei
            const balance = await contract.methods.balanceOf(this.state.account).call();

            // Convert from wei to whole tokens
            const tokenBalance = this.state.web3.utils.fromWei(balance, 'ether');
            return Math.floor(parseFloat(tokenBalance)); 
        } catch (error) {
            console.error("Failed to get token balance:", error);
            return 0;
        }
    }

    // Get user's NFT certificate count
    async getNFTBalance() {
        if (!this.state.web3 || !this.state.account) {
            return 0;
        }

        try {
            // Create NFT contract instance for ERC721 balanceOf call
            const contract = new this.state.web3.eth.Contract([
                {
                    "constant": true,
                    "inputs": [{ "name": "_owner", "type": "address" }],
                    "name": "balanceOf",
                    "outputs": [{ "name": "", "type": "uint256" }],
                    "type": "function"
                }
            ], this.config.addresses.certificateNFT);

            // Get NFT count
            const balance = await contract.methods.balanceOf(this.state.account).call();
            return balance.toString();
        } catch (error) {
            console.error("Failed to get NFT balance:", error);
            return 0;
        }
    }

    // Approve contract to spend user's tokens
    async approveTokenSpending(amount) {
        try {
            // Create token contract instance
            const tokenContract = new this.state.web3.eth.Contract([
                {
                    "inputs": [{ "name": "spender", "type": "address" }, { "name": "value", "type": "uint256" }],
                    "name": "approve",
                    "outputs": [{ "name": "", "type": "bool" }],
                    "stateMutability": "nonpayable",
                    "type": "function"
                }
            ], this.config.addresses.skillToken);

            // Send approval transaction
            const tx = await tokenContract.methods
                .approve(this.config.addresses.eduChain, amount)
                .send({ from: this.state.account });

            console.log("Token approval:", tx.transactionHash);
            return tx;
        } catch (error) {
            console.error("Token approval failed:", error);
            throw error;
        }
    }
}

window.eduChain = new EduChainBlockchain();