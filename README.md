## 개발 날짜
2014-12-01

## 담당자
FE 개발팀 박순영 <soonyoung.park@nhnent.com>

## 설명
- 무한 스크롤이 가능한 간단한 테이블 형태의 그리드.

## 기능 정의
- setList 메서드를 통해 스크롤 박스 내부에 출력할 데이터 테이블을 설정할 수 있다.
- append, prepend 메서드를 통해 현재 스크롤 박스 컨텐츠에 데이터 행을 추가할 수 있다.
- 생성자의 옵션 freeze 를 통해 append, prepend 시 현재 스크롤 위치 유지 여부를 설정할 수 있다.
- 생성자의 옵션 scrollX, scrollY 값으로 가로, 세로 스크롤의 노출 유무를 설정할 수 있다.
- color 옵션을 통해 테이블 헤더, 몸체, 테두리 영역의 색을 지정할 수 있다.
- border 옵션을 통해 테이블 테두리 두께를 지정할 수 있다.
- 데이터에 _colSpanBy 필드에 대표로 출력할 columnName 을 지정하여 colSpan 할 수 있다.
- 생성한 컴포넌트 인스턴스가 발행하는 커스텀 이벤트 "click" 에 바인딩 하여 click 이벤트를 처리할 수 있다.
- 생성자의 옵션 keyEventBubble 을 사용하여 스크롤 박스에서 처리해야하는 keyEvent 에 대한 버블링을 취소할 수 있다.
- 사용자 액션(셀렉션 영역 선택 중, 마우스 드래그를 사용하여 스크롤 중)이
진행중일 때 입력된 데이터 변경 명령(setList/prepend/append/clear)수행은 별도의 Queue에 저장하였다가
사용자 액션이 끝난 후 한번에 수행된다.


## 주의
- 한 행의 높이는 반드시 고정값이어야 한다.

## 샘플 페이지
http://fetech.nhnent.com/svnrun/fetech/components/SimpleGrid/sample/sample.concat.html

## 다운로드
http://fetech.nhnent.com/svnrun/fetech/components/SimpleGrid/release/Component-SimpleGrid.zip
  
## API 문서
http://fetech.nhnent.com/svnrun/fetech/components/SimpleGrid/doc/index.html

## 적용된 페이지

