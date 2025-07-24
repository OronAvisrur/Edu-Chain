// Current connected wallet address
let currentAccount = null;
// Currently selected course object
let currentCourse = null;
// Questions for current course
let courseQuestions = [];

// Switch between different panels function
function showPanel(panel) {
    // Hide all panels first
    ['home', 'admin', 'student', 'course'].forEach(p => {
        document.getElementById(p + 'Panel').classList.add('hidden');
    });

    // Show requested panel
    document.getElementById(panel + 'Panel').classList.remove('hidden');

    // Load data when switching to specific panels
    if (panel === 'admin' && currentAccount) {
        loadCoursesForAdmin();
        loadStatistics();
    } else if (panel === 'student' && currentAccount) {
        loadCourses();
        refreshWalletInfo();
    }
}

// Connect to MetaMask wallet
async function connectWallet() {
    // Check if MetaMask is installed
    if (typeof window.ethereum === 'undefined') {
        alert('Please install MetaMask to use EduChain!');
        return;
    }

    try {
        // Request wallet connection
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length === 0) throw new Error('No accounts found');

        // Set current account and update UI
        currentAccount = accounts[0];
        document.getElementById('walletInfo').innerText = `Connected: ${currentAccount.slice(0, 6)}...${currentAccount.slice(-4)}`;

        // Initialize blockchain integration
        const web3 = new Web3(window.ethereum);
        await window.eduChain.init(web3, currentAccount);

        showStatus('createStatus', 'Wallet connected successfully!', 'success');
    } catch (error) {
        showStatus('createStatus', `Connection failed: ${error.message}`, 'error');
    }
}

// Create new course with specified parameters
async function createCourse() {
    // Check wallet connection first
    if (!currentAccount) { alert('Connect wallet first!'); return; }

    // Collect form data
    const data = {
        name: getValue('courseName'),
        category: getValue('courseCategory'),
        difficulty: parseInt(getValue('courseDifficulty')),
        price: parseInt(getValue('coursePrice')) || 0,
        requiredCorrect: parseInt(getValue('requiredCorrect')),
        description: getValue('courseDescription')
    };

    // Validate required fields
    if (!data.name || !data.category || !data.difficulty || !data.requiredCorrect) {
        showStatus('createStatus', 'Please fill all required fields', 'error');
        return;
    }

    try {
        showStatus('createStatus', 'Creating course... Confirm in MetaMask', 'success');
        await window.eduChain.createCourse(data);
        showStatus('createStatus', 'Course created successfully!', 'success');
        // Clear form after successful creation
        clearForm(['courseName', 'courseCategory', 'courseDifficulty', 'coursePrice', 'requiredCorrect', 'courseDescription']);
    } catch (error) {
        showStatus('createStatus', `Failed: ${error.message}`, 'error');
    }
}

// Add new question to existing course
async function addQuestion() {
    // Check wallet connection
    if (!currentAccount) { alert('Connect wallet first!'); return; }

    // Collect option values and filter out empty ones
    const options = [getValue('option1'), getValue('option2'), getValue('option3'), getValue('option4')].filter(opt => opt);
    if (options.length < 2) {
        showStatus('questionStatus', 'Need at least 2 options', 'error');
        return;
    }

    // Prepare question data
    const data = {
        courseId: parseInt(getValue('questionCourseSelect')),
        questionText: getValue('questionText'),
        options: options,
        correctAnswer: parseInt(getValue('correctAnswer')),
        explanation: getValue('answerExplanation')
    };

    // Validate required fields
    if (!data.courseId || !data.questionText || isNaN(data.correctAnswer)) {
        showStatus('questionStatus', 'Please fill all required fields', 'error');
        return;
    }

    try {
        showStatus('questionStatus', '⏳ Adding question... Confirm in MetaMask', 'success');
        await window.eduChain.addQuestion(data);
        showStatus('questionStatus', 'Question added successfully!', 'success');
        // Clear form after successful addition
        clearForm(['questionText', 'option1', 'option2', 'option3', 'option4', 'correctAnswer', 'answerExplanation']);
    } catch (error) {
        showStatus('questionStatus', `Failed: ${error.message}`, 'error');
    }
}

// Load and display course statistics for dashboard
async function loadStatistics() {
    if (!currentAccount) return;

    try {
        // Load courses for statistics dropdown
        await window.eduChain.loadCourses();
        const courses = window.eduChain.state.courses;

        // Fill course selection dropdown
        const select = document.getElementById('courseStatsSelect');
        select.innerHTML = '<option value="">Select a course to view statistics</option>';

        courses.forEach(course => {
            const option = document.createElement('option');
            option.value = course.id;
            option.textContent = `${course.name} (${course.category})`;
            select.appendChild(option);
        });

    } catch (error) {
        console.error('Failed to load courses:', error);
    }
}

// Display detailed statistics for selected course
async function showCourseStats() {
    const courseId = document.getElementById('courseStatsSelect').value;
    const display = document.getElementById('courseStatsDisplay');

    // Clear display if no course selected
    if (!courseId) {
        display.innerHTML = '';
        return;
    }

    try {
        // Get course info from local state
        const course = window.eduChain.state.courses.find(c => c.id == courseId);

        // Get course statistics from blockchain
        const courseStats = await window.eduChain.contracts.eduChain.methods.getCourseStats(courseId).call();

        // Parse statistics
        const totalEnrolled = parseInt(courseStats.totalEnrolled);
        const totalCompleted = parseInt(courseStats.totalCompleted);
        const failed = totalEnrolled - totalCompleted;
        const passRate = totalEnrolled > 0 ? Math.round((totalCompleted / totalEnrolled) * 100) : 0;

        // Get enrolled students list
        const enrolledStudents = courseStats.enrolledStudents;

        // Build HTML for statistics display
        let html = `
            <div class="panel" style="margin-top: 1rem;">
                <h3>${course.name}</h3>
                
                <div class="grid grid-3" style="margin: 1rem 0;">
                    <div class="stat-card">
                        <div class="stat-number">${totalEnrolled}</div>
                        <div>Total Students</div>
                    </div>
                    <div class="stat-card" style="background: #d4edda;">
                        <div class="stat-number" style="color: #28a745;">${totalCompleted}</div>
                        <div>Passed</div>
                    </div>
                    <div class="stat-card" style="background: #f8d7da;">
                        <div class="stat-number" style="color: #dc3545;">${failed}</div>
                        <div>Failed</div>
                    </div>
                </div>
                
                <div style="text-align: center; margin: 1rem 0;">
                    <h3>Pass Rate: ${passRate}%</h3>
                </div>
                
                <div style="margin-top: 1rem;">
                    <h4>Enrolled Students:</h4>
                    <div style="background: #f8f9fa; padding: 1rem; border-radius: 5px;">
        `;

        // Add student addresses or empty message
        if (enrolledStudents.length > 0) {
            enrolledStudents.forEach(student => {
                html += `<div style="margin: 0.5rem 0; padding: 0.5rem; background: white; border-radius: 3px;">
                            ${student.slice(0, 8)}...${student.slice(-6)}
                         </div>`;
            });
        } else {
            html += '<p>No students enrolled yet.</p>';
        }

        html += `
                    </div>
                </div>
            </div>
        `;

        display.innerHTML = html;

    } catch (error) {
        console.error('Failed to load course stats:', error);
        display.innerHTML = '<div class="error">Failed to load course statistics.</div>';
    }
}

// Student function: Load all available courses from blockchain
async function loadCourses() {
    // Check wallet connection
    if (!currentAccount) { alert('Connect wallet first!'); return; }

    try {
        // Load courses from blockchain
        await window.eduChain.loadCourses();
        displayCourses();
    } catch (error) {
        document.getElementById('coursesContainer').innerHTML = `<div class="error">Failed to load courses: ${error.message}</div>`;
    }
}

// Display courses in UI with enrollment options
function displayCourses() {
    const courses = window.eduChain.state.courses;
    const container = document.getElementById('coursesContainer');

    // Show message if no courses available
    if (courses.length === 0) {
        container.innerHTML = '<p>No courses available yet. Check back later! 📚</p>';
        return;
    }

    let html = '';
    courses.forEach(course => {
        // Determine difficulty styling and text
        const difficultyClass = course.difficulty === 1 ? 'easy' : course.difficulty === 2 ? 'medium' : 'hard';
        const difficultyText = course.difficulty === 1 ? 'Easy' : course.difficulty === 2 ? 'Medium' : 'Hard';

        // Build course card HTML
        html += `
            <div class="course-card">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                    <h2>${course.name}</h2>
                    <span class="difficulty ${difficultyClass}">${difficultyText}</span>
                </div>
                <p><strong>Category:</strong> ${course.category}</p>
                <p><strong>Price:</strong> ${course.price} tokens ${course.price === 0 ? '(FREE)' : ''}</p>
                <p><strong>Pass Requirement:</strong> ${course.requiredCorrectAnswers} correct answers</p>
                <p><strong>Questions:</strong> ${course.questionCount}</p>
                <div style="margin-top: 1rem;">
                    <button onclick="enrollInCourse(${course.id})" class="btn-secondary">Enroll</button>
                    <button onclick="startCourse(${course.id})" class="btn-primary">Start Learning</button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// Enroll in selected course
async function enrollInCourse(courseId) {
    // Check wallet connection
    if (!currentAccount) { alert('Connect wallet first!'); return; }

    try {
        // Call blockchain enrollment function
        await window.eduChain.enrollInCourse(courseId);
        alert('Successfully enrolled!');
        refreshWalletInfo();
    } catch (error) {
        alert(`Enrollment failed: ${error.message}`);
    }
}

// Start taking a course
async function startCourse(courseId) {
    // Check wallet connection
    if (!currentAccount) { alert('Connect wallet first!'); return; }

    try {
        // Find course in loaded data
        currentCourse = window.eduChain.state.courses.find(c => c.id === courseId);
        if (!currentCourse) { alert('Course not found'); return; }

        // Load questions for this course
        courseQuestions = await window.eduChain.getCourseQuestions(courseId);
        if (courseQuestions.length === 0) { alert('This course has no questions yet.'); return; }

        // Switch to course panel and display content
        showPanel('course');
        displayCourseContent();
    } catch (error) {
        alert(`Failed to start course: ${error.message}`);
    }
}

// Display course content and materials
function displayCourseContent() {
    // Get difficulty text for display
    const difficultyText = currentCourse.difficulty === 1 ? 'Easy' : currentCourse.difficulty === 2 ? 'Medium' : 'Hard';

    // Format description with line breaks
    const formattedDescription = currentCourse.description
        .replace(/\n/g, '<br>');

    // Update course header
    document.getElementById('courseHeader').innerHTML = `
        <h2>${currentCourse.name}</h2>
        <p><strong>Category:</strong> ${currentCourse.category} | <strong>Difficulty:</strong> ${difficultyText} | <strong>Questions:</strong> ${courseQuestions.length}</p>
    `;

    // Display learning materials
    document.getElementById('courseContent').innerHTML = `
        <h3>📖 Learning Materials</h3>
        <div style="background: white; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #007bff;">
            ${formattedDescription}
        </div>
        <p><em>Study the materials above, then complete all questions below to earn your certificate!</em></p>
    `;

    displayQuiz();
}

// Display quiz questions with multiple choice options
function displayQuiz() {
    let quizHtml = '<div class="panel"><h3>Quiz Questions</h3>';

    // Loop through each question and create HTML
    courseQuestions.forEach((question, index) => {
        // Format question text
        const formattedQuestionText = question.questionText
            .replace(/\n/g, '<br>');

        quizHtml += `
            <div class="question-card">
                <div style="font-weight: bold; margin-bottom: 1rem; color: #333;">
                    Question ${index + 1}: ${formattedQuestionText}
                </div>
                ${question.options.map((option, optIndex) => `
                    <div class="option">
                        <label style="display: flex; align-items: center; cursor: pointer; display: block;">
                            <input type="radio" name="question_${question.id}" value="${optIndex}">
                            <span>${option}</span>
                        </label>
                    </div>
                `).join('')}
            </div>
        `;
    });

    quizHtml += '</div>';
    document.getElementById('quizContainer').innerHTML = quizHtml;
    document.getElementById('submitQuizBtn').classList.remove('hidden');
}

// Submit quiz answers to blockchain for grading
async function submitQuiz() {
    // Validate state
    if (!currentAccount || !currentCourse || courseQuestions.length === 0) {
        alert('Invalid state. Please refresh and try again.');
        return;
    }

    const questionIds = [];
    const selectedAnswers = [];
    let allAnswered = true;

    // Collect answers from form
    courseQuestions.forEach(question => {
        const selectedOption = document.querySelector(`input[name="question_${question.id}"]:checked`);
        if (!selectedOption) {
            allAnswered = false;
            return;
        }
        questionIds.push(question.id);
        selectedAnswers.push(parseInt(selectedOption.value));
    });

    // Check if all questions are answered
    if (!allAnswered) {
        alert('Please answer all questions before submitting.');
        return;
    }

    try {
        // Submit answers to blockchain
        await window.eduChain.submitAnswers(questionIds, selectedAnswers);

        // Hide quiz and show results
        document.getElementById('quizContainer').classList.add('hidden');
        document.getElementById('submitQuizBtn').classList.add('hidden');

        // Display success message with reward information
        document.getElementById('quizResults').innerHTML = `
            <div class="panel success">
                <h3>🎉 Quiz Completed Successfully!</h3>
                <p><strong>Rewards you'll receive:</strong></p>
                <ul>
                    <li>SkillTokens for each correct answer (${currentCourse.difficulty * 5} per question)</li>
                    <li>50 bonus tokens if you passed the course</li>
                    <li>NFT Certificate if you met the pass requirements</li>
                </ul>
                <p><em>Check your wallet to see your rewards!</em></p>
                <button onclick="refreshWalletInfo(); showPanel('student');" class="btn-primary">View My Dashboard</button>
            </div>
        `;
        document.getElementById('quizResults').classList.remove('hidden');

    } catch (error) {
        alert(`Failed to submit quiz: ${error.message}`);
    }
}

// Update wallet information display
async function refreshWalletInfo() {
    if (!currentAccount) return;

    try {
        // Get token and NFT balances in parallel
        const [tokenBalance, nftBalance] = await Promise.all([
            window.eduChain.getSkillTokenBalance(),
            window.eduChain.getNFTBalance()
        ]);

        // Update balance displays
        document.getElementById('skillTokens').textContent = tokenBalance;
        document.getElementById('nftCertificates').textContent = nftBalance;

        // Get completed courses count
        if (window.eduChain.contracts.eduChain) {
            try {
                const studentStats = await window.eduChain.contracts.eduChain.methods.getStudentStats(currentAccount).call();
                document.getElementById('coursesCompleted').textContent = studentStats.totalCoursesCompleted;
            } catch (e) {
                // If getStudentStats doesn't exist, default to 0
                document.getElementById('coursesCompleted').textContent = '0';
            }
        }
    } catch (error) {
        console.error('Failed to refresh wallet info:', error);
        document.getElementById('skillTokens').textContent = '0';
        document.getElementById('nftCertificates').textContent = '0';
        document.getElementById('coursesCompleted').textContent = '0';
    }
}

// Load courses for admin panel
async function loadCoursesForAdmin() {
    try {
        await window.eduChain.loadCourses();
    } catch (error) {
        console.error('Failed to load courses for admin:', error);
    }
}

// Get trimmed value from form element
function getValue(id) {
    return document.getElementById(id).value.trim();
}

// Display status message
function showStatus(elementId, message, type) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `<div class="status ${type}">${message}</div>`;
        // dissapear after 5 seconds
        setTimeout(() => element.innerHTML = '', 5000);
    }
}

// Clear multiple form fields
function clearForm(ids) {
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
}

// Event Listeners and Initialization
window.onload = () => {
    // Initialize app on page load
    showPanel('home');

    // Check MetaMask installation
    if (typeof window.ethereum === 'undefined') {
        document.getElementById('walletInfo').textContent = 'MetaMask not installed';
    }
};

// Listen for MetaMask account changes
if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
            // Update current account and display
            currentAccount = accounts[0];
            document.getElementById('walletInfo').textContent = `Connected: ${currentAccount.slice(0, 6)}...${currentAccount.slice(-4)}`;
        } else {
            // Handle disconnection
            currentAccount = null;
            document.getElementById('walletInfo').textContent = 'Not connected';
        }
    });
}