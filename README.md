Component-SimpleGrid
======================
경량화 버전의 그리드 컴포넌트<br>
* 무한 스크롤과 열 너비 조정 가능한 테이블 형태의 그리드 컴포넌트

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
* **API** - <http://github.nhnent.com/pages/FE/Component-SimpleGrid/>
* **Sample** - <http://github.nhnent.com/pages/FE/Component-SimpleGrid/sample/sample.html>
* **Tutorial** - 준비중
* **CI** - <http://fe.nhnent.com:8080/jenkins/job/Component-SimpleGrid/>

## Download/Install
* Bower: `bower~~~~`
* Download: <http://github.nhnent.com/pages/FE/Component-SimpleGrid/dist/>


## History
| Version | Description | Date | Developer |
| ---- | ---- | ---- | ---- |
| v0.2 | 열조정 기능 추가 | 2014.01 | FE개발팀 박순영 <kihyun.lee@nhnent.com> |
| v0.1 | 최초개발 | 2014.12 | FE개발팀 박순영 <kihyun.lee@nhnent.com> |



