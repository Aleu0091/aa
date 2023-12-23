let url = 'http://localhost:8000/';
document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('floatingInput').value;
    const password = document.getElementById('floatingPassword').value;
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
        localStorage.setItem('id', data.id);
        alert(data.message);
        if (data.message === '로그인 성공') {
            document.getElementById('user-btn').style.display = 'flex';
            document.getElementById('login-btn').style.display = 'none';
            document.getElementById('userpage').innerText = username + '님';
            document.getElementById('signup-btn').style.display = 'none'; // 모달 닫기
            window.location.href = '/study.html'; // 로그아웃 후 리다이렉트
        }
    } catch (error) {
        console.error('Error:', error);
    }
});
// 비밀번호 일치 여부 확인 및 오류 메시지 처리
// 회원가입 폼 제출 시

// 로그인 폼 제출 시
// 로그인 폼 제출 시
document.getElementById('signup-btn').addEventListener('click', async () => {
    window.location.href = '/auth/signup.html';
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        const response = await fetch(url + 'logout', {
            method: 'POST',
            credentials: 'include' // 쿠키 전송을 위해 필요
        });
        localStorage.removeItem('username');

        if (response.ok) {
            // 변경 필요
            console.log('로그아웃 성공');

            window.location.href = '/'; // 로그아웃 후 리다이렉트
            // 여기에서 로그아웃 후에 할 작업을 추가할 수 있습니다.
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
        document.getElementById('userpage').innerText = username + '님';
        document.getElementById('signup-btn').style.display = 'none';
    } else {
        console.log('로그인되지 않음');
        window.location.href = '/'; // 로그아웃 후 리다이렉트
    }
}
document.getElementById('submit123').addEventListener('click', async function (e) {
    e.preventDefault();

    const username = document.getElementById('floatingInput').value;
    const password = document.getElementById('floatingPassword').value;
    try {
        const response = await fetch(url + 'profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        let un = data.username;
        localStorage.removeItem('username');
        localStorage.setItem('username', un);

        alert(data.message); // 서버에서 받은 메시지를 보여줍니다.
        window.location.reload(); // 페이지 새로고침
    } catch (error) {
        console.error('Error:', error);
    }
});

// 페이지 로드 시 사용자 상태 확인
window.onload = checkLoginStatus();
