document.addEventListener('DOMContentLoaded', function() {
    // Toggle between login and register forms
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const toggleRegister = document.getElementById('toggleRegister');
    const toggleLogin = document.getElementById('toggleLogin');

    if (toggleRegister) {
        toggleRegister.addEventListener('click', function(e) {
            e.preventDefault();
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
            document.getElementById('formTitle').textContent = 'Register';
        });
    }

    if (toggleLogin) {
        toggleLogin.addEventListener('click', function(e) {
            e.preventDefault();
            registerForm.style.display = 'none';
            loginForm.style.display = 'block';
            document.getElementById('formTitle').textContent = 'Login';
        });
    }

    // Handle login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            try {
                const response = await fetch('http://localhost:8002/api/users/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Login failed');
                }

                const user = await response.json();
                sessionStorage.setItem('currentUser', JSON.stringify(user));
                
                if (user.role === 'admin') {
                    window.location.href = 'admin/dashboard.html';
                } else {
                    window.location.href = 'marketplace/browse.html';
                }
            } catch (error) {
                alert(error.message);
            }
        });
    }

    // Handle register form submission
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const fullName = document.getElementById('fullName').value;

            if (password !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }

            try {
                const response = await fetch('http://localhost:8002/api/users/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email,
                        password,
                        fullName
                    })
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Registration failed');
                }

                const user = await response.json();
                sessionStorage.setItem('currentUser', JSON.stringify(user));
                window.location.href = 'marketplace/browse.html';
            } catch (error) {
                alert(error.message);
            }
        });
    }
});

// Prevent accessing pages without authentication
function checkAuth() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) {
        // Cek apakah sudah di halaman index.html untuk mencegah loop redirect
        const currentPath = window.location.pathname;
        if (!currentPath.endsWith('index.html') && !currentPath.endsWith('/')) {
            window.location.href = '../index.html';
        }
        return null;
    }
    return currentUser;
}

// Check if user is already logged in
window.addEventListener('load', function() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (currentUser && window.location.pathname.endsWith('login.html')) {
        if (currentUser.role === 'admin') {
            window.location.href = 'admin/dashboard.html';
        } else {
            window.location.href = 'marketplace/browse.html';
        }
    }
});

// Logout function
function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = '../index.html';
}
