/**
 * EduChain Blockchain Integration - Fixed Version
 */

class EduChainBlockchain {
    constructor() {
        this.contracts = {
            eduChain: '0xeD9c2eCc479006eAB5770bbdAf98385114b85d5E',
            skillToken: '0x871F37564445953712DaD79d78414A808c1b6463',
            certificateNFT: '0xE6A85805080c0a9392E361a99C94EccdA73EB391'
        };

        this.state = {
            account: null,
            isConnected: false,
            web3: null,
            courses: []
        };

        // You need to deploy contracts and update these addresses
        this.config = {
            addresses: {
                eduChain: '0xeD9c2eCc479006eAB5770bbdAf98385114b85d5E',
                skillToken: '0x871F37564445953712DaD79d78414A808c1b6463',
                certificateNFT: '0xE6A85805080c0a9392E361a99C94EccdA73EB391'
            },
            abi: {
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
                        "inputs": [],
                        "name": "getTotalCourses",
                        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
                        "stateMutability": "view",
                        "type": "function"
                    },
                    {
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
                        "inputs": [{ "internalType": "uint256", "name": "courseId", "type": "uint256" }],
                        "name": "getCourseQuestions",
                        "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }],
                        "stateMutability": "view",
                        "type": "function"
                    },
                    {
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
                        "inputs": [{ "internalType": "uint256", "name": "courseId", "type": "uint256" }],
                        "name": "enrollInCourse",
                        "outputs": [],
                        "stateMutability": "nonpayable",
                        "type": "function"
                    },
                    {
                        "inputs": [],
                        "name": "admin",
                        "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
                        "stateMutability": "view",
                        "type": "function"
                    }
                ],
                skillToken: [
                    {
                        "inputs": [{ "internalType": "address", "name": "_owner", "type": "address" }],
                        "name": "balanceOf",
                        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
                        "stateMutability": "view",
                        "type": "function"
                    },
                    {
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
                certificateNFT: [
                    {
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

    async init(web3, account) {
        if (!this.config.addresses.eduChain) {
            throw new Error('Contract addresses not configured. Please deploy contracts first.');
        }

        this.state.web3 = web3;
        this.state.account = account;
        this.state.isConnected = true;

        this.contracts.eduChain = new web3.eth.Contract(
            this.config.abi.eduChain,
            this.config.addresses.eduChain
        );

        console.log("✅ Blockchain integration initialized");
    }

    async loadCourses() {
        if (!this.contracts.eduChain) {
            console.warn("Contract not initialized");
            return;
        }

        try {
            const totalCourses = await this.contracts.eduChain.methods
                .getTotalCourses()
                .call();

            const courses = [];

            for (let i = 1; i <= totalCourses; i++) {
                const courseData = await this.contracts.eduChain.methods
                    .getCourse(i)
                    .call();

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

            this.state.courses = courses;
            this.updateQuestionCourseDropdown();
            console.log(`✅ Loaded ${courses.length} courses from blockchain`);

        } catch (error) {
            console.error("❌ Failed to load courses:", error.message);
            throw error;
        }
    }

    updateQuestionCourseDropdown() {
        const select = document.getElementById("questionCourseSelect");
        if (!select) return;

        select.innerHTML = '<option value="">Select Course</option>';
        this.state.courses.forEach(course => {
            const option = document.createElement("option");
            option.value = course.id;
            option.textContent = `${course.name} (${course.category})`;
            select.appendChild(option);
        });
    }

    async createCourse(data) {
        if (!this.contracts.eduChain) {
            throw new Error("Contract not initialized");
        }

        const { name, category, difficulty, price, description, requiredCorrect } = data;

        try {
            const tx = await this.contracts.eduChain.methods
                .createCourse(name, description, category, difficulty, price, requiredCorrect)
                .send({ from: this.state.account });

            console.log("✅ Course created:", tx.transactionHash);
            await this.loadCourses();
            return tx;

        } catch (error) {
            console.error("❌ Failed to create course:", error.message);
            throw error;
        }
    }

    async addQuestion(data) {
        if (!this.contracts.eduChain) {
            throw new Error("Contract not initialized");
        }

        const { courseId, questionText, options, correctAnswer, explanation } = data;

        try {
            const tx = await this.contracts.eduChain.methods
                .addQuestion(courseId, questionText, options, correctAnswer, explanation)
                .send({ from: this.state.account });

            console.log("✅ Question added:", tx.transactionHash);
            return tx;

        } catch (error) {
            console.error("❌ Failed to add question:", error.message);
            throw error;
        }
    }

    async enrollInCourse(courseId) {
        if (!this.contracts.eduChain) {
            throw new Error("Contract not initialized");
        }

        try {
            // Get FRESH course details from CONTRACT, not frontend state
            const courseData = await this.contracts.eduChain.methods.getCourse(courseId).call();
            const coursePrice = parseInt(courseData.price);

            console.log(`Fresh course data from contract: Price = ${coursePrice}`);

            // If course has a price, approve token spending first
            if (coursePrice > 0) {
                const priceInWei = (coursePrice * Math.pow(10, 18)).toString();
                console.log(`Course costs ${coursePrice} tokens (${priceInWei} wei), approving spending...`);

                await this.approveTokenSpending(priceInWei);
                console.log("✅ Token spending approved, now enrolling...");
            }

            // Now enroll in the course
            const tx = await this.contracts.eduChain.methods
                .enrollInCourse(courseId)
                .send({ from: this.state.account });

            console.log("✅ Enrolled in course:", tx.transactionHash);

            // Refresh wallet balance after enrollment
            setTimeout(async () => {
                if (typeof refreshWalletInfo === 'function') {
                    await refreshWalletInfo();
                }
            }, 3000);

            return tx;

        } catch (error) {
            console.error("❌ Enrollment failed:", error.message);
            throw error;
        }
    }

    async getCourseQuestions(courseId) {
        if (!this.contracts.eduChain) {
            throw new Error("Contract not initialized");
        }

        try {
            const questionIds = await this.contracts.eduChain.methods
                .getCourseQuestions(courseId)
                .call();

            const questions = [];
            for (let i = 0; i < questionIds.length; i++) {
                const questionData = await this.contracts.eduChain.methods
                    .getQuestion(questionIds[i])
                    .call();

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
            console.error("❌ Failed to load questions:", error.message);
            throw error;
        }
    }

    async submitAnswers(questionIds, selectedAnswers) {
        if (!this.contracts.eduChain) {
            throw new Error("Contract not initialized");
        }

        try {
            const tx = await this.contracts.eduChain.methods
                .submitAnswers(questionIds, selectedAnswers)
                .send({ from: this.state.account });

            console.log("✅ Answers submitted:", tx.transactionHash);
            return tx;

        } catch (error) {
            console.error("❌ Failed to submit answers:", error.message);
            throw error;
        }
    }

    async getSkillTokenBalance() {
        if (!this.state.web3 || !this.state.account) {
            return 0;
        }

        try {
            const contract = new this.state.web3.eth.Contract([
                {
                    "constant": true,
                    "inputs": [{ "name": "_owner", "type": "address" }],
                    "name": "balanceOf",
                    "outputs": [{ "name": "balance", "type": "uint256" }],
                    "type": "function"
                }
            ], this.config.addresses.skillToken);

            const balance = await contract.methods.balanceOf(this.state.account).call();

            // Convert from wei to whole tokens
            const tokenBalance = this.state.web3.utils.fromWei(balance, 'ether');
            return Math.floor(parseFloat(tokenBalance)); // Show whole numbers like 5, 15, 65
        } catch (error) {
            console.error("Failed to get token balance:", error);
            return 0;
        }
    }

    async getNFTBalance() {
        if (!this.state.web3 || !this.state.account) {
            return 0;
        }

        try {
            // Basic ERC721 balanceOf call
            const contract = new this.state.web3.eth.Contract([
                {
                    "constant": true,
                    "inputs": [{ "name": "_owner", "type": "address" }],
                    "name": "balanceOf",
                    "outputs": [{ "name": "", "type": "uint256" }],
                    "type": "function"
                }
            ], this.config.addresses.certificateNFT);

            const balance = await contract.methods.balanceOf(this.state.account).call();
            return balance.toString();
        } catch (error) {
            console.error("Failed to get NFT balance:", error);
            return 0;
        }
    }

    async approveTokenSpending(amount) {
        try {
            const tokenContract = new this.state.web3.eth.Contract([
                {
                    "inputs": [{ "name": "spender", "type": "address" }, { "name": "value", "type": "uint256" }],
                    "name": "approve",
                    "outputs": [{ "name": "", "type": "bool" }],
                    "stateMutability": "nonpayable",
                    "type": "function"
                }
            ], this.config.addresses.skillToken);

            const tx = await tokenContract.methods
                .approve(this.config.addresses.eduChain, amount)
                .send({ from: this.state.account });

            console.log("✅ Token approval:", tx.transactionHash);
            return tx;
        } catch (error) {
            console.error("❌ Token approval failed:", error);
            throw error;
        }
    }
}

// Expose instance globally
window.eduChain = new EduChainBlockchain();