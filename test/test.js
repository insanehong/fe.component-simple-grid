var infinite = new ne.Component.SimpleGrid({
    $el : $('#simpleGrid'),
    lineHeight : 20,
    displayCount : 15,
//    scrollX : false,
    scrollFix : true,
    columnModelList: [
        {
            columnName: 'column1',
            title: '컬럼1',
            width: 100
        },
        {
            columnName: 'column2',
            title: '컬럼1',
            width: 100
        },
        {
            columnName: 'column3',
            title: '컬럼3',
            width: 100
        },
        {
            columnName: 'column4',
            title: '컬럼4',
            width: 100
        },
        {
            columnName: 'column5',
            title: '컬럼5',
            width: 100
        }
    ]
});

$.ajax({
    url: 'http://10.77.34.122/webstorm/Application-Grid/test/php/temp_dummy.php',
    dataType: 'json'
}).done(function(data) {
    infinite.setList(data);
});

$('#append').on('click', function(){
    infinite.append(dummy.append);
});
$('#prepend').on('click', function(){
    infinite.prepend(dummy.real);
});
$('#clear').on('click', function(){
    infinite.clear();
});

$('#length').on('click', function(){
    print(infinite.getList().length);
});
$('#data').on('click', function(){
    print(infinite.getList());
});
$('#run').on('click', function(){
    var script = $('#script_text').val();
    var scriptEval = new Function(script);
    scriptEval();
});
//
//setInterval(function(){
//    infinite.prepend(dummy.real);
//},4000);
//setInterval(function(){
//    infinite.prepend(dummy.prepend);
//},100);
var count = 0;
//setInterval(function(){
//    var strings = [],
//        string = 'Test string';
//    strings.push((++count) + string);
//    strings.push((++count) + string);
//    strings = strings.reverse();
//    infinite.prepend(strings);
//}, 500);
//setTimeout(function(){
//    infinite.prepend(dummy.prepend.slice(100, 200));
//}, 2000);

        function print(obj){
            $('#result').html(JSON.stringify(obj));
        }

