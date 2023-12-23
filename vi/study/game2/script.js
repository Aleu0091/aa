let url = 'http://localhost:8000/';

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
    }
}

// 페이지 로드 시 사용자 상태 확인
window.onload = checkLoginStatus();
// 이미지 URL 배열 (랜덤 이미지)
const imageUrls = [
    'https://via.placeholder.com/150',
    'https://via.placeholder.com/150',
    'https://via.placeholder.com/150'
    // 다른 이미지 URL들...
];

// 이미지를 무작위로 배치하는 함수
function placeRandomImages(numImages) {
    const container = document.querySelector('.image-container');
    const placedPositions = [];

    // 랜덤 이미지 추가
    for (let i = 0; i < numImages; i++) {
        const randomImageUrl = imageUrls[Math.floor(Math.random() * imageUrls.length)];

        const img = document.createElement('img');
        img.src = randomImageUrl;
        img.classList.add('random-image');
        img.dataset.name = `Image ${i + 1}`; // 이미지에 이름 속성 추가
        img.addEventListener('click', () => displayImageName(img.dataset.name)); // 클릭 이벤트 추가

        let x, y;
        do {
            x = Math.random() * (container.offsetWidth - img.width);
            y = Math.random() * (container.offsetHeight - img.height);
        } while (checkOverlap(x, y, placedPositions));

        placedPositions.push({ x, y });

        img.style.left = `${x}px`;
        img.style.top = `${y}px`;

        container.appendChild(img);
    }

    // 항상 나오는 이미지 추가
    const staticImageUrl = 'https://via.placeholder.com/200'; // 항상 나오는 이미지 URL
    const staticImg = document.createElement('img');
    staticImg.src = 'https://github.githubassets.com/assets/illu-codespaces-1d2d17e8b2b7.png';
    staticImg.classList.add('random-image');
    staticImg.dataset.name = 'Always Visible Image';
    staticImg.addEventListener('click', () => displayImageName(staticImg.dataset.name)); // 클릭 이벤트 추가
    staticImg.style.left = `${Math.random() * (container.offsetWidth - staticImg.width)}px`;
    staticImg.style.top = `${Math.random() * (container.offsetHeight - staticImg.height)}px`;
    container.appendChild(staticImg);
}

// 이미지가 겹치는지 확인하는 함수
function checkOverlap(x, y, placedPositions) {
    const threshold = 50; // 이미지 간격
    for (const position of placedPositions) {
        if (Math.abs(position.x - x) < threshold && Math.abs(position.y - y) < threshold) {
            return true; // 겹치는 경우
        }
    }
    return false; // 겹치지 않는 경우
}

// 이미지 이름을 표시하는 함수
function displayImageName(name) {
    alert(`이미지 이름: ${name}`);
}

// 페이지 로드 시 이미지 배치
window.addEventListener('load', () => {
    placeRandomImages(5); // 이미지 수 조절 가능
});
