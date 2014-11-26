## 개발 날짜
2014-10-16

## 담당자
FE 개발팀 박순영 <soonyoung.park@nhnent.com>

## 설명
- 안드로이드의 logcat 과 같이 무한히 지속적으로 쌓이는 한줄 단위 데이터를 웹페이지에 속도 저하없이 노출하기 위한 스크롤 컴포넌트

## 기능 정의
- setList 메서드를 통해 스크롤 박스 내부에 출력할 데이터를 설정할 수 있다.
- append, prepend 메서드를 통해 현재 스크롤 박스 컨텐츠에 데이터를 추가할 수 있다.
- 생성자의 옵션 freeze 를 통해 append, prepend 시 현재 스크롤 위치 유지 여부를 설정할 수 있다.
- 생성자의 옵션 scrollX, scrollY 값으로 가로, 세로 스크롤의 노출 유무를 설정할 수 있다.
- 생성자의 옵션 keyEventBubble 을 사용하여 스크롤 박스에서 처리해야하는 keyEvent 에 대한 버블링을 취소할 수 있다.
- 선택 영역 기능을 지원하여 클립 보드로 컨텐츠 내용을 복사 할 수 있다. (Ctrl + A, Shift + Click, 마우스 드래그를 이용한 선택 기능 지원 됨)
- 사용자 액션(셀렉션 영역 선택 중, 마우스 드래그를 사용하여 스크롤 중)이
진행중일 때 입력된 데이터 변경 명령(setList/prepend/append/clear)수행은 별도의 Queue에 저장하였다가
사용자 액션이 끝난 후 한번에 수행된다.


## 주의
- 한 행의 높이는 고정값이어야 한다.

## 인스턴스 생성
```
var infinite = new InfiniteScroll({
	$el: $('#infiniteScroll'),	//무한 스크롤을 생성할 div jQuery 엘리먼트
	lineHeight: 20,	//한 행의 높이에 (default : 20)
	displayCount: 15,	//화면에 보여질 line 갯수 (default : 15)
	scrollX: true,		//가로 스크롤 여부	(default : true)
	scrollY: true,		//세로 스크롤 여부	(default : true)
	freeze: true,	//prepend 로 데이터 추가 시 현재 scroll 위치 유지 여부 (default : true)
	keyEventBubble: false	//컴포넌트에서 처리해야 하는 key event 발생 시, event 버블링을 할지 여부 (default : false)
});
```

## setList
스크롤 박스 안의 모든 내용을 인자로 받아온 내용으로 변경한다.
```
var strings = [
	'line1...',
	'line2...',
	'line3...'
];
infinite.setList(strings);
```
## append
스크롤 박스 컨텐츠 뒷부분에 텍스트를 추가한다.
```
var strings = [
	'line1...',
	'line2...',
	'line3...'
];
infinite.setList(strings);
```
## prepend
스크롤 박스 컨텐츠 앞부분에 텍스트를 추가한다.
```
var strings = [
	'line1...',
	'line2...',
	'line3...'
];
infinite.setList(strings);
```
## clear
스크롤 박스 컨텐츠의 내용을 빈값으로 초기화한다.
```
infinite.clear();
```
## getList
스크롤 박스 컨텐츠의 내용을 배열로 반환한다.
```
var strings = infinite.getList();
console.log(strings);
/*
[
	'line1...',
	'line2...',
	'line3...'
];
*/
```
