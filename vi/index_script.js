document.addEventListener('DOMContentLoaded', function () {
    var navbarToggler = document.querySelector('.navbar-toggler');
    var navbarCollapse = document.querySelector('.navbar-collapse');

    navbarToggler.addEventListener('click', function () {
        navbarCollapse.classList.toggle('show');
    });
});
// 비밀번호 일치 여부 확인 함수
let url = 'https://1432-123-212-234-141.ngrok-free.app/';

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
    window.location.href = 'study.html';
});