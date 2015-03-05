SimpleGrid
======================
심플그리드 컴포넌트<br>
[[그리드 컴포넌트]](https://github.nhnent.com/fe/application-grid/)의 경량화 버전으로<br>
그리드 형태의 데이터를 보여주기 위한 컴포넌트입니다. (그리드내 데이터 직접 편집은 지원하지 않음) <br>
대용량 데이터을 보여줄 수 있도록 그리드 영역에 무한 스크롤(세로방향)을 제공하며<br>
마우스 드래그로 열너비를 조정할 수 있습니다.

## Feature
* 대용량 데이터 랜더링 지원
* 단일 또는 복수의 행 추가/삭제 기능 지원
* 그리드 셀과 테두리의 색상 지정 기능 지원
* 열 너비 조정 기능 제공
* 열 병합 기능 제공 (행 병합은 지원하지 않음)
* 키보드의 Ctrl + C 입력을 통해 전체 또는 일부 내용을 엑셀에 붙여넣기 가능한 형태로 클립보드에 복사 기능 제공
* 가로/세로 스크롤 노출 여부 설정 가능
* 한 행의 높이 또는 전체 높이 설정 가능
* 그리드에서 발생하는 click 이벤트를 제어할 수 있는 인터페이스 제공

## Documentation
* **API** - https://github.nhnent.com/pages/fe/component-simple-grid/
* **Sample** - https://github.nhnent.com/pages/fe/component-simple-grid/tutorial-sample1.html
* **CI** - http://fe.nhnent.com:8080/jenkins/job/component-simple-grid/

## Dependency
* jquery-1.8.3 - https://github.com/jquery/jquery/tree/1.8.3
* code-snippet-1.0.0 - https://github.nhnent.com/fe/share-code-snippet/tree/1.0.0

## Download/Install
* Bower: `bower install git+http://3c672057a1ac16c4e6f1baaba73e24d5270ef453:x-oauth-basic@github.nhnent.com/fe/component-simple-grid.git#1.0.0b`
* Download: <https://github.nhnent.com/fe/component-simple-grid>

## History
| Version | Description | Date | Developer |
| ---- | ---- | ---- | ---- |
| v1.0.0b | 배포 포멧에 맞추어 파일명 변경 | 2015.03 | FE개발팀 박순영 <soonyoung.park@nhnent.com> |
| v1.0.0a | IE 스크롤바 조정 불가능한 오류 수정 | 2015.02 | FE개발팀 박순영 <soonyoung.park@nhnent.com> |
| v1.0.0 | 티켓링크 적용 | 2015.02 | FE개발팀 박순영 <soonyoung.park@nhnent.com> |
| v0.2.0 | 열조정 기능 추가 | 2015.01 | FE개발팀 박순영 <soonyoung.park@nhnent.com> |
| v0.1.0 | 최초개발 | 2014.12 | FE개발팀 박순영 <soonyoung.park@nhnent.com> |



