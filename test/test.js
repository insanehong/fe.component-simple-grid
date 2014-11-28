var infinite1 = new ne.Component.SimpleGrid({
    $el: $('#simpleGrid'),
    rowHeight: 25,    //line 당 pixel
    displayCount: 40,  //영역에 보여줄 line 갯수
    headerHeight: 30,
    scrollX: true,
    scrollY: true,
    freeze: true,    //Data Prepend 시 현재  scroll 된 위치를 유지할 것인지 여부
    keyEventBubble: false,  //key 입력시 이벤트 버블링 할지 여부
    defaultColumnWidth: 50,
    color: {
        border: '#EFEFEF',
        th: '#F8F8F8',
        td: '#FFFFFF',
        selection: 'orange'
    },
    opacity: '0.2',
    columnModelList: [
        {
            columnName: 'column1',
            title: '컬럼1',
            width: 300,
            align: 'center',
            formatter: function(value, rowData) {
                return '<input type="button" class="test_click" value="' + value + '"/>';
            }
        },
        {
            columnName: 'column2',
            title: '컬럼1',
            width: 400
        },
        {
            columnName: 'column3',
            title: '컬럼3',
            width: 500
        },
        {
            columnName: 'column4',
            title: '컬럼4',
            width: 600
        },
        {
            columnName: 'column5',
            title: '컬럼5',
            width: 700
        }
    ]
});

infinite1.on('click', function(customEvent) {
    console.log(customEvent);
    if (customEvent.$target.hasClass('test_click')) {
        alert(customEvent.$target.val());
        infinite1.remove(customEvent.rowKey);
    }
});












var infinite2 = new ne.Component.SimpleGrid({
    $el: $('#simpleGrid2'),
    rowHeight: 25,    //line 당 pixel
    displayCount: 40,  //영역에 보여줄 line 갯수
    headerHeight: 30,
    scrollX: true,
    scrollY: true,
    keyEventBubble: false,  //key 입력시 이벤트 버블링 할지 여부
    defaultColumnWidth: 50,
    color: {
        border: 'red',
        th: 'yellow',
        td: '#FFFFFF',
        selection: 'blue'
    },
    opacity: '0.1',
    columnModelList: [
        {
            columnName: 'column1',
            title: '컬럼1',
            width: 50,
            align: 'center',
            formatter: function(value, rowData) {
                return '<input type="button" class="test_click" value="' + value + '"/>';
            }
        },
        {
            columnName: 'column2',
            title: '컬럼1',
            width: 60
        },
        {
            columnName: 'column3',
            title: '컬럼3',
            width: 70
        },
        {
            columnName: 'column4',
            title: '컬럼4',
            width: 80
        },
        {
            columnName: 'column5',
            title: '컬럼5',
            width: 90
        }
    ]
});






$.ajax({
    url: 'http://10.77.34.122/webstorm/Application-Grid/test/php/temp_dummy.php',
    dataType: 'json'
}).done(function(data) {
    infinite1.setList(data);
    infinite2.setList(data);
});