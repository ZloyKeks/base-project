const API_BASE_URL = '/api';

let currentToken = null;
let currentUser = null;
let allUsers = []; // Храним список всех пользователей для сортировки
let currentSort = { column: 'username', direction: 'desc' }; // Текущая сортировка (по умолчанию по имени по убыванию)
let activeUsersUpdateInterval = null; // Интервал для обновления списка активных пользователей
let lastActivityTime = null; // Время последней активности пользователя
let inactivityCheckInterval = null; // Интервал для проверки неактивности
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 минут в миллисекундах

// Очистить сообщения об ошибках
function clearErrors() {
    document.getElementById('login-error').textContent = '';
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

// Обновить время последней активности
function updateLastActivity() {
    // Проверяем, что пользователь залогинен
    const token = localStorage.getItem('token');
    if (!token) {
        return; // Не обновляем, если пользователь не залогинен
    }
    
    lastActivityTime = Date.now();
    // Сохраняем в localStorage для восстановления после перезагрузки страницы
    localStorage.setItem('lastActivityTime', lastActivityTime.toString());
}

// Проверить неактивность и выполнить принудительный logout
function checkInactivity() {
    if (!lastActivityTime) {
        // Пытаемся восстановить из localStorage
        const savedTime = localStorage.getItem('lastActivityTime');
        if (savedTime) {
            lastActivityTime = parseInt(savedTime);
        } else {
            updateLastActivity();
            return;
        }
    }
    
    // Проверяем, что пользователь все еще залогинен
    const token = localStorage.getItem('token');
    if (!token) {
        // Пользователь уже разлогинен, останавливаем проверку
        stopActivityTracking();
        return;
    }
    
    const timeSinceLastActivity = Date.now() - lastActivityTime;
    const minutesInactive = Math.floor(timeSinceLastActivity / (60 * 1000));
    const secondsInactive = Math.floor((timeSinceLastActivity % (60 * 1000)) / 1000);
    
    // Логируем только каждые 5 минут для уменьшения шума в консоли
    if (minutesInactive > 0 && minutesInactive % 5 === 0 && secondsInactive < 30) {
        console.log(`Проверка неактивности: прошло ${minutesInactive} минут с последней активности`);
    }
    
    if (timeSinceLastActivity >= INACTIVITY_TIMEOUT) {
        // Пользователь неактивен более 30 минут - принудительный logout
        console.log('Пользователь неактивен более 30 минут, выполняется logout');
        alert('Сеанс истек из-за неактивности (30 минут). Вы будете перенаправлены на страницу входа.');
        logout();
    }
}

// Запустить отслеживание активности
function startActivityTracking() {
    // Обновляем время активности при различных действиях пользователя
    // Добавлены дополнительные события для лучшей совместимости с разными браузерами
    const events = [
        'mousedown', 'mouseup', 'mousemove', 
        'keydown', 'keyup', 'keypress', 
        'scroll', 'wheel',
        'touchstart', 'touchend', 'touchmove',
        'click', 'dblclick',
        'focus', 'blur',
        'input', 'change'
    ];
    
    events.forEach(eventType => {
        document.addEventListener(eventType, updateLastActivity, true);
        window.addEventListener(eventType, updateLastActivity, true);
    });
    
    // Также отслеживаем события на window для лучшей совместимости
    window.addEventListener('focus', updateLastActivity, true);
    window.addEventListener('blur', updateLastActivity, true);
    
    // Обновляем время активности при загрузке страницы
    updateLastActivity();
    
    // Проверяем неактивность каждые 30 секунд для более быстрой реакции
    inactivityCheckInterval = setInterval(checkInactivity, 30 * 1000); // Каждые 30 секунд
    
    console.log('Отслеживание активности запущено');
}

// Остановить отслеживание активности
function stopActivityTracking() {
    if (inactivityCheckInterval) {
        clearInterval(inactivityCheckInterval);
        inactivityCheckInterval = null;
    }
    lastActivityTime = null;
    localStorage.removeItem('lastActivityTime');
}

// Показать рабочее пространство
async function showWorkspace() {
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('workspace').style.display = 'flex';
    
    // Загрузить информацию о пользователе (там уже есть проверка на админа)
    await loadUserInfo();
    
    // Загрузить список пользователей для главной страницы
    await loadUsersList();
    
    // Запустить автоматическое обновление списка активных пользователей каждые 5 секунд
    startActiveUsersUpdate();
    
    // Запустить отслеживание активности
    startActivityTracking();
}

// Загрузить список пользователей для главной страницы
async function loadUsersList() {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    // НЕ обновляем время активности для автоматических запросов
    // Время активности обновляется только при реальных действиях пользователя
    
    try {
        // Проверяем, является ли текущий пользователь администратором
        if (!currentUser) {
            const usersCount = document.getElementById('users-count');
            const usersList = document.getElementById('users-list');
            if (usersCount) usersCount.textContent = '';
            if (usersList) usersList.innerHTML = '';
            return;
        }
        
        const isAdmin = currentUser.isAdmin === true || currentUser.admin === true;
        if (!isAdmin) {
            // Обычные пользователи не видят список
            const usersCount = document.getElementById('users-count');
            const usersList = document.getElementById('users-list');
            if (usersCount) usersCount.textContent = '';
            if (usersList) usersList.innerHTML = '';
            return;
        }
        
        // Загружаем только активных пользователей
        const response = await fetch(`${API_BASE_URL}/user/active`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const users = await response.json();
            const usersList = document.getElementById('users-list');
            const usersCount = document.getElementById('users-count');
            
            if (usersList && usersCount) {
                // Отображаем количество активных пользователей
                const count = users.length;
                usersCount.textContent = `Активных пользователей: ${count}`;
                
                // Очищаем список
                usersList.innerHTML = '';
                
                // Добавляем активных пользователей в список
                users.forEach(user => {
                    const li = document.createElement('li');
                    li.style.padding = '8px 0';
                    li.style.borderBottom = '1px solid #eee';
                    li.innerHTML = `
                        <strong>${user.username}</strong> 
                        <span style="color: #666; margin-left: 10px;">${user.email}</span>
                        <span style="color: #999; margin-left: 10px; font-size: 12px;">(${user.isAdmin ? 'Администратор' : 'Пользователь'})</span>
                    `;
                    usersList.appendChild(li);
                });
            }
        } else if (response.status === 403) {
            // Доступ запрещен
            const usersCount = document.getElementById('users-count');
            const usersList = document.getElementById('users-list');
            if (usersCount) usersCount.textContent = '';
            if (usersList) usersList.innerHTML = '';
        }
    } catch (error) {
        console.error('Error loading users list:', error);
        const usersCount = document.getElementById('users-count');
        if (usersCount) {
            usersCount.textContent = 'Ошибка загрузки списка пользователей';
        }
    }
}

// Загрузить информацию о пользоватеle
async function loadUserInfo() {
    const token = localStorage.getItem('token');
    if (!token) {
        showAuth();
        return;
    }
    
    // Обновляем время активности только при первой загрузке после входа
    // (это не автоматический запрос, а инициализация)
    if (!lastActivityTime) {
        updateLastActivity();
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
            console.log('User info loaded:', userInfo); // Отладка
            
            document.getElementById('welcome-username').textContent = userInfo.username;
            document.getElementById('user-name-display').textContent = userInfo.username;
            document.getElementById('user-email-display').textContent = userInfo.email;
            document.getElementById('user-role-display').textContent = userInfo.isAdmin ? 'Администратор' : 'Пользователь';
            
            // Показать/скрыть кнопку админ-панели
            const adminSettingsBtn = document.getElementById('admin-settings-btn');
            // Проверяем оба варианта (isAdmin и admin) на случай проблем с сериализацией
            const isAdmin = userInfo.isAdmin === true || userInfo.admin === true;
            console.log('Checking admin status:', { isAdmin, userInfoIsAdmin: userInfo.isAdmin, userInfoAdmin: userInfo.admin }); // Отладка
            if (isAdmin) {
                // Показываем кнопку шестеренки для администратора
                if (adminSettingsBtn) {
                    adminSettingsBtn.style.display = 'flex'; // Используем flex, так как это flex-контейнер
                    console.log('Admin settings button displayed');
                } else {
                    console.error('Admin settings button element not found');
                }
            } else {
                // Скрываем кнопку для обычных пользователей
                if (adminSettingsBtn) {
                    adminSettingsBtn.style.display = 'none';
                }
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
    
    // Проверяем, является ли пользователь администратором
    if (!currentUser) {
        return; // Информация о пользователе еще не загружена
    }
    
    const isAdmin = currentUser.isAdmin === true || currentUser.admin === true;
    if (!isAdmin) {
        return; // Пользователь не является администратором
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/user/all`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const users = await response.json();
            allUsers = users; // Сохраняем список пользователей
            
            // Применяем текущую сортировку (по умолчанию по имени)
            sortUsers(currentSort.column);
        } else if (response.status === 403) {
            // Доступ запрещен - пользователь не администратор
            // Просто игнорируем, не показываем ошибку
            return;
        }
    } catch (error) {
        // Игнорируем ошибки сети, если это не администратор
        if (error.name !== 'TypeError') {
            console.error('Error loading users:', error);
        }
    }
}

// Отрисовать таблицу пользователей
function renderUsersTable(users) {
    const tableBody = document.getElementById('users-table-body');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    users.forEach(user => {
        const row = document.createElement('tr');
        const editBtn = document.createElement('button');
        editBtn.className = 'btn-edit';
        editBtn.textContent = 'Изменить';
        editBtn.onclick = () => openEditUserModal(user.id, user.username, user.email, user.isAdmin);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-delete';
        deleteBtn.textContent = 'Удалить';
        deleteBtn.onclick = () => deleteUser(user.id, user.username);
        
        row.innerHTML = `
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${user.isAdmin ? 'Администратор' : 'Пользователь'}</td>
            <td></td>
        `;
        const actionsCell = row.querySelector('td:last-child');
        actionsCell.appendChild(editBtn);
        actionsCell.appendChild(deleteBtn);
        tableBody.appendChild(row);
    });
    
    // Обновляем визуальные индикаторы сортировки
    updateSortIndicators();
}

// Сортировка пользователей
function sortUsers(column) {
    // Если кликнули по той же колонке, меняем направление
    if (currentSort.column === column) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.column = column;
        currentSort.direction = 'asc';
    }
    
    // Сортируем массив пользователей
    const sortedUsers = [...allUsers].sort((a, b) => {
        let aValue, bValue;
        
        switch (column) {
            case 'username':
                aValue = a.username.toLowerCase();
                bValue = b.username.toLowerCase();
                break;
            case 'email':
                aValue = a.email.toLowerCase();
                bValue = b.email.toLowerCase();
                break;
            case 'role':
                aValue = a.isAdmin ? 'Администратор' : 'Пользователь';
                bValue = b.isAdmin ? 'Администратор' : 'Пользователь';
                break;
            default:
                return 0;
        }
        
        if (aValue < bValue) {
            return currentSort.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
            return currentSort.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });
    
            // Перерисовываем таблицу
    renderUsersTable(sortedUsers);
}

// Обновить визуальные индикаторы сортировки
function updateSortIndicators() {
    const headers = document.querySelectorAll('.users-table th.sortable');
    headers.forEach(header => {
        const arrow = header.querySelector('.sort-arrow');
        const column = header.getAttribute('data-sort');
        
        if (column === currentSort.column) {
            arrow.textContent = currentSort.direction === 'asc' ? ' ▲' : ' ▼';
            arrow.style.opacity = '1';
        } else {
            arrow.textContent = '';
            arrow.style.opacity = '0';
        }
    });
}

// Открыть модальное окно для добавления пользователя
function openAddUserModal() {
    document.getElementById('modal-title').textContent = 'Добавить пользователя';
    document.getElementById('modal-user-id').value = '';
    document.getElementById('modal-username').value = '';
    document.getElementById('modal-username').readOnly = false;
    document.getElementById('modal-email').value = '';
    document.getElementById('modal-password').value = '';
    document.getElementById('modal-password').required = true;
    document.getElementById('modal-role').value = 'false';
    document.getElementById('modal-message').textContent = '';
    
    // Показать поле роли при добавлении пользователя
    const roleGroup = document.getElementById('modal-role-group');
    if (roleGroup) {
        roleGroup.style.display = 'block';
    }
    
    document.getElementById('user-modal').style.display = 'block';
}

// Открыть модальное окно для редактирования пользователя
function openEditUserModal(userId, username, email, isAdmin, hideRole = false) {
    document.getElementById('modal-title').textContent = 'Изменить пользователя';
    document.getElementById('modal-user-id').value = userId;
    document.getElementById('modal-username').value = username;
    document.getElementById('modal-username').readOnly = true;
    document.getElementById('modal-email').value = email;
    document.getElementById('modal-password').value = '';
    document.getElementById('modal-password').required = false;
    document.getElementById('modal-role').value = isAdmin ? 'true' : 'false';
    document.getElementById('modal-message').textContent = '';
    
    // Скрыть/показать поле роли
    const roleGroup = document.getElementById('modal-role-group');
    if (roleGroup) {
        roleGroup.style.display = hideRole ? 'none' : 'block';
    }
    
    document.getElementById('user-modal').style.display = 'block';
}

// Открыть модальное окно для редактирования текущего пользователя
function openEditCurrentUserModal() {
    console.log('openEditCurrentUserModal called, currentUser:', currentUser); // Отладка
    
    if (!currentUser) {
        console.error('Текущий пользователь не загружен (currentUser is null)');
        alert('Информация о пользователе не загружена. Пожалуйста, обновите страницу.');
        return;
    }
    
    if (!currentUser.id) {
        console.error('ID пользователя отсутствует. currentUser:', currentUser);
        // Попробуем перезагрузить информацию о пользователе
        loadUserInfo().then(() => {
            if (currentUser && currentUser.id) {
                const isAdmin = currentUser.isAdmin === true || currentUser.admin === true;
                toggleUserMenu();
                openEditUserModal(
                    currentUser.id,
                    currentUser.username,
                    currentUser.email,
                    isAdmin,
                    true // hideRole = true для текущего пользователя
                );
            } else {
                alert('Не удалось загрузить информацию о пользователе. Пожалуйста, обновите страницу.');
            }
        });
        return;
    }
    
    // Закрыть меню пользователя
    toggleUserMenu();
    
    // Открыть модальное окно редактирования (скрываем поле роли для текущего пользователя)
    const isAdmin = currentUser.isAdmin === true || currentUser.admin === true;
    console.log('Opening edit modal with:', {
        id: currentUser.id,
        username: currentUser.username,
        email: currentUser.email,
        isAdmin: isAdmin
    });
    openEditUserModal(
        currentUser.id,
        currentUser.username,
        currentUser.email,
        isAdmin,
        true // hideRole = true для текущего пользователя
    );
}

// Закрыть модальное окно
function closeUserModal() {
    document.getElementById('user-modal').style.display = 'none';
}

// Сохранить пользователя (добавить или обновить)
async function saveUser() {
    const userId = document.getElementById('modal-user-id').value;
    const username = document.getElementById('modal-username').value;
    const email = document.getElementById('modal-email').value;
    const password = document.getElementById('modal-password').value;
    const roleValue = document.getElementById('modal-role').value;
    const isAdmin = roleValue === 'true' || roleValue === true;
    const messageDiv = document.getElementById('modal-message');
    
    console.log('Saving user with isAdmin:', isAdmin, 'roleValue:', roleValue);
    
    if (!username || !email) {
        messageDiv.textContent = 'Заполните все обязательные поля';
        messageDiv.style.color = '#e74c3c';
        return;
    }
    
    // При добавлении пароль обязателен
    if (!userId && !password) {
        messageDiv.textContent = 'Пароль обязателен при создании пользователя';
        messageDiv.style.color = '#e74c3c';
        return;
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
        messageDiv.textContent = 'Ошибка авторизации';
        messageDiv.style.color = '#e74c3c';
        return;
    }
    
    try {
        let response;
        if (userId) {
            // Проверяем, скрыто ли поле роли (для текущего пользователя)
            const roleGroup = document.getElementById('modal-role-group');
            const isCurrentUser = roleGroup && roleGroup.style.display === 'none';
            
            // Обновление пользователя
            const body = { 
                username: username, 
                email: email
            };
            
            // Отправляем роль только если это не текущий пользователь
            if (!isCurrentUser) {
                body.isAdmin = isAdmin;
            }
            
            if (password && password.trim() !== '') {
                body.password = password;
            }
            console.log('Update request body:', JSON.stringify(body));
            
            // Используем разные endpoints для текущего пользователя и других пользователей
            const endpoint = isCurrentUser 
                ? `${API_BASE_URL}/user/me`
                : `${API_BASE_URL}/user/${userId}`;
            
            response = await fetch(endpoint, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });
        } else {
            // Добавление пользователя
            const body = { 
                username: username, 
                email: email, 
                password: password, 
                isAdmin: isAdmin 
            };
            console.log('Create request body:', JSON.stringify(body));
            response = await fetch(`${API_BASE_URL}/user/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });
        }
        
        const data = await response.json();
        
        if (response.ok && data.status === 'success') {
            messageDiv.textContent = data.message || 'Пользователь успешно сохранен';
            messageDiv.style.color = '#27ae60';
            
            // Если редактировался текущий пользователь, обновить информацию о нем
            const editedUserId = userId ? parseInt(userId) : null;
            if (editedUserId && currentUser && currentUser.id === editedUserId) {
                await loadUserInfo();
            }
            
            // Обновить таблицу и закрыть модальное окно
            setTimeout(() => {
                loadAllUsers();
                closeUserModal();
            }, 500);
        } else {
            messageDiv.textContent = data.message || 'Ошибка сохранения';
            messageDiv.style.color = '#e74c3c';
        }
    } catch (error) {
        messageDiv.textContent = 'Ошибка соединения с сервером';
        messageDiv.style.color = '#e74c3c';
        console.error('Save user error:', error);
    }
}

// Удалить пользователя
async function deleteUser(userId, username) {
    if (!confirm(`Вы уверены, что хотите удалить пользователя "${username}"?`)) {
        return;
    }
    
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok && data.status === 'success') {
            alert('Пользователь успешно удален');
            loadAllUsers();
        } else {
            alert(data.message || 'Ошибка удаления пользователя');
        }
    } catch (error) {
        alert('Ошибка соединения с сервером');
        console.error('Delete user error:', error);
    }
}

// Переключить меню пользователя
function toggleUserMenu() {
    const dropdown = document.getElementById('user-menu-dropdown');
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
}

// Переключить панель администратора
function toggleAdminPanel() {
    const mainContent = document.getElementById('main-content');
    const adminPanel = document.getElementById('admin-panel');
    
    if (mainContent && adminPanel) {
        if (adminPanel.style.display === 'none' || adminPanel.style.display === '') {
            // Показать панель администратора
            mainContent.style.display = 'none';
            adminPanel.style.display = 'block';
            // Показать первую секцию (Пользователи)
            showAdminSection('users');
        } else {
            // Вернуться на главную страницу
            adminPanel.style.display = 'none';
            mainContent.style.display = 'block';
        }
    }
}

// Показать секцию в панели администратора
function showAdminSection(section) {
    // Скрыть все секции
    document.getElementById('admin-section-users').style.display = 'none';
    document.getElementById('admin-section-groups').style.display = 'none';
    
    // Убрать активный класс со всех кнопок
    document.querySelectorAll('.admin-nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Показать выбранную секцию
    if (section === 'users') {
        document.getElementById('admin-section-users').style.display = 'block';
        document.getElementById('admin-nav-users').classList.add('active');
        // Загрузить список пользователей при открытии секции
        loadAllUsers();
    } else if (section === 'groups') {
        document.getElementById('admin-section-groups').style.display = 'block';
        document.getElementById('admin-nav-groups').classList.add('active');
    }
}

// Закрыть меню при клике вне его
document.addEventListener('click', function(event) {
    const userMenu = document.querySelector('.user-menu');
    const dropdown = document.getElementById('user-menu-dropdown');
    
    if (userMenu && !userMenu.contains(event.target)) {
        dropdown.style.display = 'none';
    }
    
    // Закрыть модальное окно при клике вне его
    const modal = document.getElementById('user-modal');
    if (modal && modal.style.display !== 'none') {
        const modalContent = document.querySelector('.modal-content');
        if (modalContent && event.target === modal) {
            closeUserModal();
        }
    }
});

// Запустить автоматическое обновление списка активных пользователей
function startActiveUsersUpdate() {
    // Останавливаем предыдущий интервал, если он существует
    stopActiveUsersUpdate();
    
    // Запускаем обновление каждые 5 секунд (5000 мс)
    activeUsersUpdateInterval = setInterval(() => {
        loadUsersList();
    }, 5000);
}

// Остановить автоматическое обновление списка активных пользователей
function stopActiveUsersUpdate() {
    if (activeUsersUpdateInterval) {
        clearInterval(activeUsersUpdateInterval);
        activeUsersUpdateInterval = null;
    }
}

// Выход
async function logout() {
    // Останавливаем автоматическое обновление
    stopActiveUsersUpdate();
    
    // Останавливаем отслеживание активности
    stopActivityTracking();
    
    const token = localStorage.getItem('token');
    
    // Отправляем запрос на сервер для удаления из списка активных
    if (token) {
        try {
            await fetch(`${API_BASE_URL}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error('Error during logout:', error);
        }
    }
    
    // Очищаем локальное хранилище
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('isAdmin');
    currentToken = null;
    currentUser = null;
    showAuth();
}

// Показать форму аутентификации
function showAuth() {
    // Останавливаем автоматическое обновление списка активных пользователей
    stopActiveUsersUpdate();
    
    // Останавливаем отслеживание активности
    stopActivityTracking();
    
    document.getElementById('auth-container').style.display = 'block';
    document.getElementById('workspace').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';
    document.getElementById('admin-panel').style.display = 'none';
    document.getElementById('login-username').value = '';
    document.getElementById('login-password').value = '';
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
    
    // Обработчик Enter для входа
    const loginPasswordInput = document.getElementById('login-password');
    if (loginPasswordInput) {
        loginPasswordInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                login();
            }
        });
    }
    
    // Также можно нажать Enter в поле имени пользователя
    const loginUsernameInput = document.getElementById('login-username');
    if (loginUsernameInput) {
        loginUsernameInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                // Переключить фокус на поле пароля
                loginPasswordInput.focus();
            }
        });
    }
    
    // Обработчики Enter для модального окна пользователя
    const modalPassword = document.getElementById('modal-password');
    if (modalPassword) {
        modalPassword.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                saveUser();
            }
        });
    }
    
    const modalEmail = document.getElementById('modal-email');
    if (modalEmail) {
        modalEmail.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                modalPassword.focus();
            }
        });
    }
    
    const modalUsername = document.getElementById('modal-username');
    if (modalUsername) {
        modalUsername.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                modalEmail.focus();
            }
        });
    }
    
    // Обработчик Escape для закрытия модального окна
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            const modal = document.getElementById('user-modal');
            if (modal && modal.style.display !== 'none') {
                closeUserModal();
            }
        }
    });
    
    // Обработчик для кнопки "Изменить" в меню пользователя
    const editCurrentUserBtn = document.getElementById('edit-current-user-btn');
    if (editCurrentUserBtn) {
        editCurrentUserBtn.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            console.log('Edit button clicked'); // Отладка
            openEditCurrentUserModal();
        });
    }
    
    // Обработчики для сортировки таблицы пользователей
    setupSortableHeaders();
});

// Настроить обработчики для сортируемых заголовков (используем делегирование событий)
function setupSortableHeaders() {
    const table = document.querySelector('.users-table');
    if (!table) return;
    
    // Используем делегирование событий через thead
    const thead = table.querySelector('thead');
    if (thead) {
        thead.addEventListener('click', function(event) {
            const header = event.target.closest('th.sortable');
            if (header) {
                const column = header.getAttribute('data-sort');
                if (column) {
                    sortUsers(column);
                }
            }
        });
    }
    
    // Устанавливаем курсор для всех сортируемых заголовков
    const sortableHeaders = document.querySelectorAll('.users-table th.sortable');
    sortableHeaders.forEach(header => {
        header.style.cursor = 'pointer';
    });
}




