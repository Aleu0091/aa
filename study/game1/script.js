// 내려오게 할 단어의 목록을 배열로 선언하였습니다.
var taja = ['회색', '흰색', '갈색', '민트', '주황', '분홍', '보라', '노랑', '파랑', '초록', '검정', '빨강'];

// 밑에 선언한 tajaContents 안에 글자로 된 Div를 넣어주게 됩니다.
var tajaContents = document.getElementById('tajaContents');

// tajaDiv를 다루기 위한 배열
var newObj = [];

// taja의 각 글자마다 top을 주기위한 배열 초기화 (글자를 내려오게 하기 위해 style 의 top을 이용할 것입니다)
var plusTop = new Array(taja.length);
for (let i = 0; i < plusTop.length; i++) {
    plusTop[i] = 0;
}

// 글자의 div 크기를 고정으로 주기 위한 변수입니다.
const TAJAWIDTH = 150;
const TAJAHEIGHT = 30;

// 그려지는 것 보다 내려오는게 간격이 더 짧게 함( setInterval의 시간 변수)
const DRAWTIME = 1000;
const DOWNTIME = 500;

// 생명 변수
var life = 5;
var lifeDiv = document.getElementById('life');
lifeDiv.innerHTML = 'LIFE : ' + life;

// 점수 변수
var score = 0;
var scoreDiv = document.getElementById('score');
scoreDiv.innerHTML = 'SCORE : ' + score;

// taja배열의 index 값에 대한 변수
var idx = 0;

// 화면에 글자를 뿌려주기 위한 메서드
function drawTaja() {
    var randomPick = 0;
    var temp = null;

    // 랜덤으로 taja배열을 섞어주기 위한 for문
    for (let i = 0; i < taja.length; i++) {
        randomPick = Math.round(Math.random() * (taja.length - 1));
        temp = taja[randomPick];
        taja[randomPick] = taja[i];
        taja[i] = temp;
    }

    // 일정한 간격으로 화면에 단어를 하나씩 뿌려주기 위한 setInteval 메서드 입니다.
    var drawInterval = setInterval(function () {
        var leftWidth = Math.round(Math.random() * 1200);
        var tajaDiv = document.createElement('div');
        tajaDiv.classList.add('tajaWord');
        tajaDiv.style.width = TAJAWIDTH + 'px';
        tajaDiv.style.height = TAJAHEIGHT + 'px';
        tajaDiv.style.position = 'absolute';
        tajaDiv.style.textAlign = 'center';
        tajaDiv.innerHTML = taja[idx++];
        tajaContents.appendChild(tajaDiv);
        // leftWidth 변수가 0 < leftWidth < 1200 으로 설정되어있기 때문에
        // 글자의 width값 까지 더하게 되면 tajaContents의 범위를 넘어갈 수 있습니다.
        // 그래서 그 범위를 넘어가게 되면 안넘어가게 하기 위한 재설정해주는 부분입니다.
        if (leftWidth + TAJAWIDTH >= tajaContents.offsetWidth) {
            tajaDiv.style.left = leftWidth - TAJAWIDTH + 'px';
        } else {
            tajaDiv.style.left = leftWidth + 'px';
        }

        // 각각의 tajaDiv를 다루기 위해 newObj 배열에 담는다.
        newObj.push(tajaDiv);

        // 화면에 글자가 다 뿌려지면 더 이상 글자를 뿌려주기 위한
        // setInterval() 을 중지시킨다. ( 그렇지 않으면 글자가 다 뿌려진 이후에도 계속 동작하게 됩니다.)
        if (newObj.length === taja.length) {
            clearInterval(drawInterval);
        }
    }, DRAWTIME);
}
// 글자를 내려주기 위한 메서드
function downTaja() {
    //글자가 뿌려진 이후에는 일정한 간격으로 글자를 내려줘야 합니다.
    setInterval(function () {
        for (let i = 0; i < taja.length; i++) {
            if (i < newObj.length) {
                newObj[i].style.top = plusTop[i] + 'px';
                // 글자의 범위가 경계(바닥) 바깥으로 나갔을 경우 제거
                if (plusTop[i] + TAJAHEIGHT >= tajaContents.offsetHeight) {
                    if (tajaContents.contains(newObj[i])) {
                        tajaContents.removeChild(newObj[i]);
                        life--;
                        lifeDiv.innerHTML = 'LIFE : ' + life;

                        // 목숨을 모두 잃었을 때 - 실패
                        if (life === 0) {
                            alert('5개의 생명을 모두 사용하셨습니다.');
                            alert('총 ' + score + '점을 획득하였습니다.');
                            location.reload();
                        }

                        // life가 남은상태로 게임이 끝났을 경우 - 성공
                        if (newObj.length === taja.length) {
                            // 화면에 단어가 다 뿌려진 이후
                            if (!tajaContents.hasChildNodes()) {
                                // 뿌려진 단어가 화면에 존재하지 않을 경우
                                alert('다음 단계로 이동합니다.(준비중)');
                                alert('총 ' + score + '점을 획득하였습니다.');
                                location.reload();
                            }
                        }
                    }
                }
                plusTop[i] += 30;
            }
        }
    }, DOWNTIME);
}

// 음성 인식 설정
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'ko-KR';
recognition.interimResults = true;
recognition.maxAlternatives = 1;

recognition.addEventListener('end', recognition.start);

// 음성 입력 감지 및 처리
recognition.addEventListener('result', (e) => {
    const transcript = Array.from(e.results)
        .map((result) => result[0].transcript)
        .join('');
    tajaText.value = transcript.trim(); // 음성으로 인식된 단어를 input에 넣음

    // 입력한 단어와 일치하는지 확인하여 처리
    for (let i = 0; i < newObj.length; i++) {
        if (tajaText.value === newObj[i].innerHTML) {
            tajaContents.removeChild(newObj[i]);
            score += 100;
            scoreDiv.innerHTML = 'SCORE : ' + score;

            if (newObj.length === taja.length) {
                if (!tajaContents.hasChildNodes()) {
                    alert('다음 단계로 이동합니다.(준비중)');
                    alert('총 ' + score + '점을 획득하였습니다.');
                    location.reload();
                }
            }
        }
    }
});

// 클릭 횟수에 대한 변수
var count = 0;

// 시작하기
var tajaBtn = document.getElementById('tajaBtn');
tajaBtn.addEventListener('click', function () {
    // 버튼을 눌렀을 때마다 메서드가 실행되므로 최초 1회만 실행되도록 count변수로 막아주었습니다.
    if (count === 0) {
        drawTaja();
        downTaja();
        recognition.start();
        tajaBtn.style.display = 'none';
    }
    count++;
});

// 음성 인식 시작
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
            document.getElementById('userpage').innerText = username + '님';
            document.getElementById('signup-btn').style.display = 'none'; // 모달 닫기
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

document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        const response = await fetch(url + 'logout', {
            method: 'POST',
            credentials: 'include' // 쿠키 전송을 위해 필요
        });

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
