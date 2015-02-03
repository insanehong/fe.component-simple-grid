Component-SimpleGrid
======================
심플그리드 컴포넌트<br>
[[그리드 컴포넌트]](https://github.nhnent.com/FE/Application-Grid/)의 경량화 버전으로<br>
그리드 형태의 데이터를 보여주기 위한 컴포넌트입니다. (그리드내 데이터 직접 편집은 지원하지 않음) <br>
대용량 데이터을 보여줄 수 있도록 그리드 영역에 무한 스크롤(세로방향)을 제공하며<br>
마우스 드래그로 열너비를 조정할 수 있습니다.

## Feature
* setList 메서드를 통해 스크롤 박스 내부에 출력할 데이터 테이블을 설정할 수 있다.
* append, prepend 메서드를 통해 현재 스크롤 박스 컨텐츠에 데이터 행을 추가할 수 있다.
* remove 메서드를 통해 현재 설정된 데이터를 제거할 수 있다.
* clear 메서드를 통해 현재 설정된 데이터를 모두 제거할 수 있다.
* getList 메서드를 통해 현재 설정된 데이터셋을 조회할 수 있다.
* 생성자의 scrollX, scrollY 옵션을 통해 가로, 세로 스크롤의 노출 유무를 설정할 수 있다.
* 생성자의 height 옵션을 통해 테이블 높이값을 정할 수 있다.
* 생성자의 color 옵션을 통해 테이블 헤더, 몸체, 테두리 영역의 색을 지정할 수 있다.
* 생성자의 border 옵션을 통해 테이블 테두리 두께를 지정할 수 있다.
* 데이터에 _colSpanBy 필드에 대표로 출력할 columnName 을 지정하여 colSpan 할 수 있다.
* 생성한 컴포넌트 인스턴스가 발행하는 커스텀 이벤트 "click" 에 바인딩 하여 click 이벤트를 처리할 수 있다.
* 생성자의 keyEventBubble 옵션을 사용하여 스크롤 박스에서 처리해야하는 keyEvent 에 대한 버블링을 취소할 수 있다.
* 사용자 액션(셀렉션 영역 선택 중, 마우스 드래그를 사용하여 스크롤 중)이
진행중일 때 입력된 데이터 변경 명령(setList/prepend/remove/append/clear)수행은 별도의 Queue에 저장하였다가
사용자 액션이 끝난 후 한번에 수행된다.

## Documentation
* **API** - https://github.nhnent.com/pages/FE/Component-SimpleGrid/
* **Sample** - https://github.nhnent.com/pages/FE/Component-SimpleGrid/sample/sample.html
* **Tutorial** - 준비중
* **CI** - http://fe.nhnent.com:8080/jenkins/job/Component-SimpleGrid/

## Download/Install
* Bower: `bower install git+http://3c672057a1ac16c4e6f1baaba73e24d5270ef453:x-oauth-basic@github.nhnent.com/FE/Component-SimpleGrid.git#dist`
* Download: <https://github.nhnent.com/pages/FE/Component-SimpleGrid/dist/>


## History
| Version | Description | Date | Developer |
| ---- | ---- | ---- | ---- |
| v0.2 | 열조정 기능 추가 | 2015.01 | FE개발팀 박순영 <soonyoung.park@nhnent.com> |
| v0.1 | 최초개발 | 2014.12 | FE개발팀 박순영 <soonyoung.park@nhnent.com> |



