// ===================================
// LOGIN PORTAL LOGIC (Multi-User)
// ===================================
const HabitProAuth = (function() {
    const SESSION_KEY = 'habitpro_logged_in';
    const SESSION_USER = 'habitpro_current_user';
    const USERS_KEY = 'habitpro_users';

    // Default users list — stored in localStorage so new users can be added
    function getUsers() {
        let users = JSON.parse(localStorage.getItem(USERS_KEY));
        if (!users || users.length === 0) {
            users = [
                { username: 'Ravi', password: 'ravi123' }
            ];
            localStorage.setItem(USERS_KEY, JSON.stringify(users));
        }
        return users;
    }

    function addUser(username, password) {
        const users = getUsers();
        // Check if user already exists (case-insensitive)
        if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
            return false;
        }
        users.push({ username, password });
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        return true;
    }

    function validateUser(username, password) {
        const users = getUsers();
        return users.find(u => u.username === username && u.password === password);
    }

    function getCurrentUser() {
        return localStorage.getItem(SESSION_USER) || '';
    }

    function isLoggedIn() {
        return localStorage.getItem(SESSION_KEY) === 'true' && getCurrentUser();
    }

    // User-specific localStorage keys
    function userKey(key) {
        const user = getCurrentUser();
        return user ? `habitpro_${user}_${key}` : key;
    }

    function logout() {
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(SESSION_USER);
        location.reload();
    }

    // Check if already logged in
    if (isLoggedIn()) {
        document.addEventListener('DOMContentLoaded', () => {
            const overlay = document.getElementById('login-overlay');
            const appContainer = document.getElementById('app-container');
            if (overlay) overlay.style.display = 'none';
            if (appContainer) {
                appContainer.style.display = '';
                appContainer.classList.add('entering');
            }
            // Show welcome name in sidebar
            const userNameEl = document.getElementById('sidebar-username');
            if (userNameEl) userNameEl.textContent = getCurrentUser();
        });
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            const overlay = document.getElementById('login-overlay');
            const loginForm = document.getElementById('login-form');
            const signupForm = document.getElementById('signup-form');
            const usernameInput = document.getElementById('login-username');
            const passwordInput = document.getElementById('login-password');
            const loginError = document.getElementById('login-error');
            const loginErrorText = document.getElementById('login-error-text');
            const loginBtn = document.getElementById('login-btn');
            const togglePasswordBtn = document.getElementById('toggle-password');
            const appContainer = document.getElementById('app-container');
            const particlesContainer = document.getElementById('login-particles');

            // Toggle between Login and Sign Up
            const showSignupLink = document.getElementById('show-signup');
            const showLoginLink = document.getElementById('show-login');
            if (showSignupLink) {
                showSignupLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    loginForm.style.display = 'none';
                    signupForm.style.display = 'block';
                    document.getElementById('login-error').classList.remove('show');
                    document.getElementById('signup-error').classList.remove('show');
                });
            }
            if (showLoginLink) {
                showLoginLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    signupForm.style.display = 'none';
                    loginForm.style.display = 'block';
                    document.getElementById('login-error').classList.remove('show');
                    document.getElementById('signup-error').classList.remove('show');
                });
            }

            // Create animated particles
            function createParticles() {
                for (let i = 0; i < 20; i++) {
                    const particle = document.createElement('div');
                    particle.className = 'particle';
                    const size = Math.random() * 6 + 3;
                    particle.style.width = size + 'px';
                    particle.style.height = size + 'px';
                    particle.style.left = Math.random() * 100 + '%';
                    particle.style.animationDuration = (Math.random() * 8 + 6) + 's';
                    particle.style.animationDelay = (Math.random() * 5) + 's';
                    particlesContainer.appendChild(particle);
                }
            }
            createParticles();

            // Toggle password visibility
            togglePasswordBtn.addEventListener('click', () => {
                const isPassword = passwordInput.type === 'password';
                passwordInput.type = isPassword ? 'text' : 'password';
                togglePasswordBtn.querySelector('i').className = isPassword
                    ? 'fa-solid fa-eye-slash'
                    : 'fa-solid fa-eye';
            });

            // Handle LOGIN form submit
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();

                const username = usernameInput.value.trim();
                const password = passwordInput.value;

                loginError.classList.remove('show');
                loginBtn.classList.add('loading');

                setTimeout(() => {
                    const user = validateUser(username, password);
                    if (user) {
                        localStorage.setItem(SESSION_KEY, 'true');
                        localStorage.setItem(SESSION_USER, user.username);

                        overlay.classList.add('hidden');
                        setTimeout(() => {
                            overlay.style.display = 'none';
                            appContainer.style.display = '';
                            appContainer.classList.add('entering');
                            // Show welcome name
                            const userNameEl = document.getElementById('sidebar-username');
                            if (userNameEl) userNameEl.textContent = user.username;
                            // Reload to initialize user-specific data
                            location.reload();
                        }, 600);
                    } else {
                        loginBtn.classList.remove('loading');
                        loginErrorText.textContent = 'Invalid username or password. Please try again.';
                        loginError.classList.add('show');

                        const card = document.getElementById('login-card');
                        card.style.animation = 'none';
                        card.offsetHeight;
                        card.style.animation = 'shakeError 0.5s ease';
                        setTimeout(() => { card.style.animation = ''; }, 500);
                    }
                }, 800);
            });

            // Handle SIGN UP form submit
            if (signupForm) {
                signupForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const newUser = document.getElementById('signup-username').value.trim();
                    const newPass = document.getElementById('signup-password').value;
                    const confirmPass = document.getElementById('signup-confirm').value;
                    const signupError = document.getElementById('signup-error');
                    const signupErrorText = document.getElementById('signup-error-text');

                    signupError.classList.remove('show');

                    if (newUser.length < 2) {
                        signupErrorText.textContent = 'Username must be at least 2 characters.';
                        signupError.classList.add('show');
                        return;
                    }
                    if (newPass.length < 4) {
                        signupErrorText.textContent = 'Password must be at least 4 characters.';
                        signupError.classList.add('show');
                        return;
                    }
                    if (newPass !== confirmPass) {
                        signupErrorText.textContent = 'Passwords do not match.';
                        signupError.classList.add('show');
                        return;
                    }

                    const added = addUser(newUser, newPass);
                    if (added) {
                        // Auto-login after sign up
                        localStorage.setItem(SESSION_KEY, 'true');
                        localStorage.setItem(SESSION_USER, newUser);
                        location.reload();
                    } else {
                        signupErrorText.textContent = 'This username is already taken.';
                        signupError.classList.add('show');
                    }
                });
            }

            setTimeout(() => usernameInput.focus(), 300);
        });
    }

    return { getCurrentUser, userKey, logout, isLoggedIn };
})();

document.addEventListener('DOMContentLoaded', () => {
    // --- State (user-specific using HabitProAuth.userKey) ---
    const uk = HabitProAuth.userKey;

    // Handle legacy migration from an array to our new structure
    let legacyHabits = JSON.parse(localStorage.getItem(uk('habits')));
    let defaultHabits = { college: [], home: [] };
    
    if (Array.isArray(legacyHabits)) {
        defaultHabits.college = legacyHabits; 
        defaultHabits.home = legacyHabits;
        localStorage.removeItem(uk('habits'));
    }
    
    let habitsMap = JSON.parse(localStorage.getItem(uk('habitsMap'))) || defaultHabits;
    
    // Day Types: 'YYYY-MM-DD' -> 'college' or 'home'. Defaults to 'college' if not set.
    let dayTypes = JSON.parse(localStorage.getItem(uk('dayTypes'))) || {};
    
    let completionData = JSON.parse(localStorage.getItem(uk('completionData'))) || {}; 
    
    let currentDate = new Date();

    // --- DOM Elements ---
    const navItems = document.querySelectorAll('.nav-links li');
    const views = document.querySelectorAll('.view');
    const displayDateEl = document.getElementById('display-date');
    const btnPrevDay = document.getElementById('prev-day');
    const btnNextDay = document.getElementById('next-day');
    const titleDateEl = document.getElementById('current-date-title');
    const habitListEl = document.getElementById('habit-list');
    
    // Day Type Selector
    const modeSegments = document.querySelectorAll('#dashboard-day-type .segment');

    // Settings
    const habitsForm = document.getElementById('habits-form');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const inputsCollege = document.getElementById('habit-inputs-college');
    const inputsHome = document.getElementById('habit-inputs-home');

    // --- Initialization ---
    initSettingsForm();
    updateDashboard();
    initNavigation();
    initModeSelector();

    // --- Navigation Logic ---
    function initNavigation() {
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                navItems.forEach(n => n.classList.remove('active'));
                item.classList.add('active');
                
                const viewId = item.dataset.view;
                views.forEach(v => {
                    v.classList.remove('active');
                    if(v.id === `${viewId}-view`) {
                        v.classList.add('active');
                    }
                });

                if(viewId === 'dashboard') {
                    updateDashboard();
                } else if(viewId === 'settings') {
                    initSettingsForm();
                }
            });
        });

        // Settings Tabs
        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                
                btn.classList.add('active');
                const t = btn.dataset.tab;
                document.getElementById(`habit-inputs-${t}`).classList.add('active');
            });
        });

        btnPrevDay.addEventListener('click', () => {
            currentDate.setDate(currentDate.getDate() - 1);
            updateDashboard();
        });
        
        btnNextDay.addEventListener('click', () => {
            currentDate.setDate(currentDate.getDate() + 1);
            updateDashboard();
        });
    }

    function initModeSelector() {
        modeSegments.forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.dataset.type;
                const dateStr = getDateString(currentDate);
                
                // Update state
                dayTypes[dateStr] = type;
                localStorage.setItem(uk('dayTypes'), JSON.stringify(dayTypes));
                
                // Force Update dashboard which will recalculate everything and re-render checklist
                updateDashboard();
            });
        });
    }

    // --- Formatting Utils ---
    function getDateString(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    function isToday(date) {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    }

    function getFormattedDateDisplay(date) {
        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        if (isToday(date)) return "Today";
        return date.toLocaleDateString('en-US', options);
    }

    function getDayTypeInfo(dateStr) {
        return dayTypes[dateStr] || 'college'; // default
    }

    // --- Rings Logic ---
    function setProgress(circleId, percent) {
        const circle = document.getElementById(circleId);
        const text = document.getElementById(circleId.replace('-ring', '-text'));
        if(!circle || !text) return;

        // Cap percent between 0 and 100
        percent = Math.min(100, Math.max(0, percent));

        const radius = circle.r.baseVal.value;
        const circumference = radius * 2 * Math.PI;
        
        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        const offset = circumference - (percent / 100) * circumference;
        circle.style.strokeDashoffset = offset;
        text.textContent = `${Math.round(percent)}%`;
    }

    // --- Settings Setup ---
    function populateInputs(container, category) {
        container.innerHTML = '';
        for(let i = 0; i < 15; i++) {
            const hList = habitsMap[category] || [];
            const val = hList[i] ? hList[i].name : '';
            const el = document.createElement('div');
            el.className = 'input-group';
            el.innerHTML = `
                <label>Habit ${i + 1}</label>
                <input type="text" id="habit-${category}-${i}" placeholder="${category === 'college' ? 'E.g., Attend class' : 'E.g., Walk dog'}" value="${val}" autocomplete="off">
            `;
            container.appendChild(el);
        }
    }

    function initSettingsForm() {
        populateInputs(inputsCollege, 'college');
        populateInputs(inputsHome, 'home');
    }

    habitsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        ['college', 'home'].forEach(category => {
            const newHabits = [];
            for(let i = 0; i < 15; i++) {
                const val = document.getElementById(`habit-${category}-${i}`).value.trim();
                if(val) {
                    newHabits.push({ id: `hab_${category}_${i}`, name: val });
                }
            }
            habitsMap[category] = newHabits;
        });

        localStorage.setItem(uk('habitsMap'), JSON.stringify(habitsMap));
        
        // Return to dash
        document.querySelector('li[data-view="dashboard"]').click();
        updateDashboard();
    });

    // --- Dashboard Logic ---
    function updateDashboard() {
        const dateStr = getDateString(currentDate);
        const currentDayType = getDayTypeInfo(dateStr);

        displayDateEl.textContent = getFormattedDateDisplay(currentDate);
        titleDateEl.textContent = isToday(currentDate) ? "Today's Habits" : `Habits (${getFormattedDateDisplay(currentDate)})`;

        // Update selector UI
        modeSegments.forEach(btn => {
            if(btn.dataset.type === currentDayType) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        renderChecklist(dateStr, currentDayType);
        setTimeout(updateStats, 50);
    }

    function renderChecklist(dateStr, dayType) {
        habitListEl.innerHTML = '';
        
        const habitsForDay = habitsMap[dayType] || [];

        if(habitsForDay.length === 0) {
            habitListEl.innerHTML = `
                <div class="empty-state">
                    <p style="margin-bottom: 1rem;"><i class="fa-solid fa-list-check fa-2x"></i></p>
                    <p>No habits configured for <b>${dayType === 'college' ? 'College' : 'Home'} Days</b>.</p>
                    <button class="btn-primary" style="margin-top: 1.5rem;" onclick="document.querySelector('li[data-view=\\'settings\\']').click()">Configure Habits</button>
                </div>
            `;
            return;
        }

        const completedHabits = completionData[dateStr] || [];

        habitsForDay.forEach(habit => {
            const isCompleted = completedHabits.includes(habit.id);
            const li = document.createElement('li');
            li.className = `habit-item ${isCompleted ? 'completed' : ''}`;
            li.innerHTML = `
                <div class="checkbox">
                    <i class="fa-solid fa-check"></i>
                </div>
                <span class="habit-name">${habit.name}</span>
            `;

            li.addEventListener('click', () => {
                toggleHabitCompletion(dateStr, habit.id);
            });

            habitListEl.appendChild(li);
        });
    }

    function toggleHabitCompletion(dateStr, habitId) {
        if (!completionData[dateStr]) {
            completionData[dateStr] = [];
        }

        const idx = completionData[dateStr].indexOf(habitId);
        if (idx > -1) {
            completionData[dateStr].splice(idx, 1);
        } else {
            completionData[dateStr].push(habitId);
        }

        localStorage.setItem(uk('completionData'), JSON.stringify(completionData));
        
        updateDashboard();
    }

    // --- Progress Calculation ---
    function updateStats() {
        const todayStr = getDateString(currentDate);
        const currentType = getDayTypeInfo(todayStr);
        const targetHabits = habitsMap[currentType] || [];
        const totalToday = targetHabits.length;

        // Daily
        if (totalToday === 0) {
            setProgress('daily-ring', 0);
        } else {
            const completedToday = (completionData[todayStr] || []).filter(h => h.includes(`_${currentType}_`)).length;
            setProgress('daily-ring', (completedToday / totalToday) * 100);
        }

        // Helper to calculate progress over a date range
        // For historical days, we evaluate against the capacity of that specific historical day's type.
        function calculateRangeProgress(startDate, daysCount) {
            let totalAvailableHabits = 0;
            let totalCompletedHabits = 0;

            for(let i=0; i<daysCount; i++) {
                const d = new Date(startDate);
                d.setDate(startDate.getDate() + i);
                const dStr = getDateString(d);
                
                // Disallow evaluating future dates heavily unbalancing the statistics
                if(d > new Date()) continue; 

                const dType = getDayTypeInfo(dStr);
                const dHabits = habitsMap[dType] || [];
                
                if (dHabits.length > 0) {
                    totalAvailableHabits += dHabits.length;
                    
                    // Count only completions that match that day's type 
                    const completedForDType = (completionData[dStr] || []).filter(h => h.includes(`_${dType}_`)).length;
                    totalCompletedHabits += completedForDType;
                }
            }

            if (totalAvailableHabits === 0) return 0;
            return (totalCompletedHabits / totalAvailableHabits) * 100;
        }

        // Weekly (Starting Monday)
        const currentDayOfWk = currentDate.getDay();
        const diffToMon = currentDayOfWk === 0 ? 6 : currentDayOfWk - 1; 
        const monDate = new Date(currentDate);
        monDate.setDate(currentDate.getDate() - diffToMon);
        
        setProgress('weekly-ring', calculateRangeProgress(monDate, 7));

        // Monthly
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1);
        
        setProgress('monthly-ring', calculateRangeProgress(firstDayOfMonth, daysInMonth));
    }
});
