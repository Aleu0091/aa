let request = new XMLHttpRequest();

request.open('GET', 'url_사용자가_요청하는_데이터', true);

request.onload = function () {
    if (request.status >= 200 && request.status < 400) {
        // 요청이 성공하였을 때 데이터를 처리하는 로직
        let data = JSON.parse(request.responseText);
        console.log(data); // 받아온 데이터 출력 예시
    } else {
        // 서버가 요청을 받지 못하거나 데이터를 찾을 수 없을 때 처리하는 로직
        console.error('데이터를 가져올 수 없습니다.');
    }
};

request.onerror = function () {
    // 네트워크 오류 등으로 요청이 실패했을 때 처리하는 로직
    console.error('요청 실패');
};

request.send();
