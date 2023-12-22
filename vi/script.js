document.addEventListener('DOMContentLoaded', function () {
    var navbarToggler = document.querySelector('.navbar-toggler');
    var navbarCollapse = document.querySelector('.navbar-collapse');

    navbarToggler.addEventListener('click', function () {
        navbarCollapse.classList.toggle('show');
    });
});
// 비밀번호 일치 여부 확인 함수
let url = 'http://localhost:8000/';
document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email_login').value;
    const password = document.getElementById('password_login').value;

    try {
        const response = await fetch(url + 'login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password }),
            credentials: 'include'
        });

        const data = await response.json();
        const username = data.username;
        localStorage.setItem('username', username);
        alert(data.message);
        if (data.message === '로그인 성공') {
            document.getElementById('user-btn').style.display = 'flex';
            document.getElementById('login-btn').style.display = 'none';
            document.getElementById('userpage').innerText = username;
            document.getElementById('signup-btn').style.display = 'none'; //창 닫기
            window.location.href = '/'; // 로그아웃 후 리다이렉트
        }
    } catch (error) {
        console.error('Error:', error);
    }
});
// 비밀번호 일치 여부 확인 및 오류 메시지 처리
// 회원가입 폼 제출 시
document.getElementById('signupForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(url + 'signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });
        const data = await response.json();
        alert(data.message);
    } catch (error) {
        console.error('Error:', error);
    }
});
// 로그인 폼 제출 시
document.getElementById('signup-btn').addEventListener('click', async () => {
    window.location.href = '/auth/signup.html'; // 로그아웃 후 리다이렉트
});
// 로그인 폼 제출 시

document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        const response = await fetch(url + 'logout', {
            method: 'POST',
            credentials: 'include' // 쿠키 전송을 위해 필요
        });
        localStorage.removeItem('username');

        if (response.ok) {
            console.log('로그아웃 성공');

            window.location.href = '/'; // 로그아웃 후 리다이렉트
        } else {
            console.error('로그아웃 실패');
        }
    } catch (error) {
        console.error('네트워크 에러:', error);
    }
});
function checkLoginStatus() {
    var username = localStorage.getItem('username');

    if (username) {
        document.getElementById('user-btn').style.display = 'flex';
        document.getElementById('login-btn').style.display = 'none';
        document.getElementById('userpage').innerText = username;
        document.getElementById('signup-btn').style.display = 'none';
    } else {
        console.log('로그인되지 않음');
    }
}

// 페이지 로드 시 사용자 상태 확인
window.onload = checkLoginStatus();

document.getElementById('st_btn').addEventListener('click', async () => {
    window.location.href = '/study.html';
});
