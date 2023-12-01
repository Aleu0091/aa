function changeLanguage(lang) {
    document.getElementById('logoutBtn').style.display = 'none';
    if (lang === 'en') {
        showContent('termsEnglish');
        document.getElementById('exampleModalLabel').innerText = 'Terms of Service';
        document.getElementById('confirmBtn').innerText = 'I Understand';
        document.getElementById('st_btn').innerText = 'Start';
        document.getElementById('text1').innerText = 'Dyslexia Treatment Program';
        document.getElementById('text2').innerText =
            'This program was developed as a public interest program and is provided 100% free of charge.';
        document.getElementById('text3').innerText = 'You are deemed to have agreed to the ';
        document.getElementById('text4').innerText = 'Terms of Use.';
        document.getElementById('text5').innerText = '';
    } else if (lang === 'ko') {
        showContent('termsKorean');
        document.getElementById('exampleModalLabel').innerText = '이용약관';
        document.getElementById('confirmBtn').innerText = '이해했습니다.';
        document.getElementById('st_btn').innerText = '시작하기';
        document.getElementById('text1').innerText = '난독 치료 프로그램';
        document.getElementById('text2').innerText =
            '이 프로그램은 공익을 위한 프로그램으로 개발 되어 100% 무료로 제공됩니다.';
        document.getElementById('text3').innerText = '시작을 하면';
        document.getElementById('text4').innerText = '이용약관';
        document.getElementById('text5').innerText = '에 동의한 것으로 간주됩니다.';
    } else if (lang === 'zh') {
        showContent('termsChinese');
        document.getElementById('exampleModalLabel').innerText = '服务条款';
        document.getElementById('confirmBtn').innerText = '我明白了';
        document.getElementById('st_btn').innerText = '入门';
        document.getElementById('text1').innerText = '阅读障碍治疗计划';
        document.getElementById('text2').innerText = '该计划是作为一项公益计划而开发的，并且 100% 免费提供。';
        document.getElementById('text3').innerText = '开始即表示您同意我们的';
        document.getElementById('text4').innerText = '使用条款。';
        document.getElementById('text5').innerText = '';
    } else if (lang === 'vi') {
        showContent('termsVietnamese');
        document.getElementById('exampleModalLabel').innerText = 'Điều khoản sử dụng';
        document.getElementById('confirmBtn').innerText = 'Tôi đã hiểu';
        document.getElementById('st_btn').innerText = 'Bắt đầu';
        document.getElementById('text1').innerText = 'Chương trình điều trị chứng khó đọc';
        document.getElementById('text2').innerText =
            'Chương trình này được phát triển như một chương trình vì lợi ích công cộng và được cung cấp miễn phí 100%.';
        document.getElementById('text3').innerText = 'Bằng cách bắt đầu, bạn đồng ý với ';
        document.getElementById('text4').innerText = 'Điều khoản sử dụng ';
        document.getElementById('text5').innerText = 'của chúng tôi.';
    }
}
function showContent(id) {
    const languages = ['termsEnglish', 'termsKorean', 'termsChinese', 'termsVietnamese'];
    languages.forEach((language) => {
        const content = document.getElementById(language);
        if (language === id) {
            content.style.display = 'block';
        } else {
            content.style.display = 'none';
        }
    });
}
document.addEventListener('DOMContentLoaded', function () {
    var navbarToggler = document.querySelector('.navbar-toggler');
    var navbarCollapse = document.querySelector('.navbar-collapse');

    navbarToggler.addEventListener('click', function () {
        navbarCollapse.classList.toggle('show');
    });
});
// 비밀번호 일치 여부 확인 함수
let url = 'https://08ec-123-212-234-141.ngrok-free.app';
document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(url + '/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        alert(data.message);
        if (data.message === '로그인 성공') {
            document.getElementById('logoutBtn').style.display = 'flex';
            document.getElementById('login-btn').style.display = 'none';
            document.getElementById('signup-btn').style.display = 'none';
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
        const response = await fetch(url + '/signup', {
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

document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        const response = await fetch(url + '/logout', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json'
            } // 세션 정보를 전달하기 위해 credentials 설정
        });

        if (response.ok) {
            console.log('로그아웃 성공');
            // 로그아웃 후 원하는 동작 수행 (예: 홈페이지로 리다이렉트)
            window.location.href = '/';
        } else {
            console.error('로그아웃 실패');
        }
    } catch (error) {
        console.error('네트워크 오류:', error);
    }
});

// 페이지 로드 시 사용자 정보 확인
window.onload = getUserInfo;
