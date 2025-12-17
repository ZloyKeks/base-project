const API_BASE_URL = '/api';

let currentToken = null;
let currentUser = null;

// Показать форму входа
function showLogin() {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
    document.querySelectorAll('.tab-btn')[0].classList.add('active');
    document.querySelectorAll('.tab-btn')[1].classList.remove('active');
    clearErrors();
}

// Показать форму регистрации
function showRegister() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
    document.querySelectorAll('.tab-btn')[0].classList.remove('active');
    document.querySelectorAll('.tab-btn')[1].classList.add('active');
    clearErrors();
}

// Очистить сообщения об ошибках
function clearErrors() {
    document.getElementById('login-error').textContent = '';
    document.getElementById('register-error').textContent = '';
}

// Вход
async function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');
    
    if (!username || !password) {
        errorDiv.textContent = 'Заполните все поля';
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok && data.token) {
            currentToken = data.token;
            currentUser = {
                username: data.username,
                isAdmin: data.isAdmin
            };
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', data.username);
            localStorage.setItem('isAdmin', data.isAdmin);
            showWorkspace();
        } else {
            errorDiv.textContent = data.message || 'Ошибка входа';
        }
    } catch (error) {
        errorDiv.textContent = 'Ошибка соединения с сервером';
        console.error('Login error:', error);
    }
}

// Регистрация
async function register() {
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const errorDiv = document.getElementById('register-error');
    
    if (!username || !email || !password) {
        errorDiv.textContent = 'Заполните все поля';
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok && data.token) {
            currentToken = data.token;
            currentUser = {
                username: data.username,
                isAdmin: data.isAdmin
            };
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', data.username);
            localStorage.setItem('isAdmin', data.isAdmin);
            showWorkspace();
        } else {
            errorDiv.textContent = data.message || 'Ошибка регистрации';
        }
    } catch (error) {
        errorDiv.textContent = 'Ошибка соединения с сервером';
        console.error('Register error:', error);
    }
}

// Показать рабочее пространство
async function showWorkspace() {
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('workspace').style.display = 'flex';
    
    // Загрузить информацию о пользователе
    await loadUserInfo();
    
    // Показать секцию администратора, если пользователь - админ
    if (currentUser && currentUser.isAdmin) {
        document.getElementById('admin-section').style.display = 'block';
    }
}

// Загрузить информацию о пользоватеle
async function loadUserInfo() {
    const token = localStorage.getItem('token');
    if (!token) {
        showAuth();
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/user/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const userInfo = await response.json();
            currentUser = userInfo;
            
            document.getElementById('welcome-username').textContent = userInfo.username;
            document.getElementById('user-name-display').textContent = userInfo.username;
            document.getElementById('user-email-display').textContent = userInfo.email;
            document.getElementById('user-role-display').textContent = userInfo.isAdmin ? 'Администратор' : 'Пользователь';
            
            if (userInfo.isAdmin) {
                document.getElementById('admin-section').style.display = 'block';
            }
        } else {
            showAuth();
        }
    } catch (error) {
        console.error('Error loading user info:', error);
        showAuth();
    }
}

// Загрузить всех пользователей (для администратора)
async function loadAllUsers() {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/user/all`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const users = await response.json();
            const usersListDiv = document.getElementById('users-list');
            usersListDiv.innerHTML = '';
            
            users.forEach(user => {
                const userCard = document.createElement('div');
                userCard.className = 'user-card';
                userCard.innerHTML = `
                    <strong>${user.username}</strong>
                    <div class="user-email">${user.email}</div>
                    <div style="color: #667eea; font-size: 12px; margin-top: 5px;">
                        ${user.isAdmin ? 'Администратор' : 'Пользователь'}
                    </div>
                `;
                usersListDiv.appendChild(userCard);
            });
        }
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// Переключить меню пользователя
function toggleUserMenu() {
    const dropdown = document.getElementById('user-menu-dropdown');
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
}

// Закрыть меню при клике вне его
document.addEventListener('click', function(event) {
    const userMenu = document.querySelector('.user-menu');
    const dropdown = document.getElementById('user-menu-dropdown');
    
    if (userMenu && !userMenu.contains(event.target)) {
        dropdown.style.display = 'none';
    }
});

// Выход
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('isAdmin');
    currentToken = null;
    currentUser = null;
    showAuth();
}

// Показать форму аутентификации
function showAuth() {
    document.getElementById('auth-container').style.display = 'block';
    document.getElementById('workspace').style.display = 'none';
    document.getElementById('login-username').value = '';
    document.getElementById('login-password').value = '';
    document.getElementById('register-username').value = '';
    document.getElementById('register-email').value = '';
    document.getElementById('register-password').value = '';
    clearErrors();
}

// Проверить токен при загрузке страницы
window.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    if (token) {
        currentToken = token;
        currentUser = {
            username: localStorage.getItem('username'),
            isAdmin: localStorage.getItem('isAdmin') === 'true'
        };
        showWorkspace();
    } else {
        showAuth();
    }
});




