(function(){
    var apiKey = '2c4c0137d9186c4b88bc23eb80e01aba';
    var userId = 'jmpzzzz';
    var tag = 'cats, synthesizers';
    var perPage = '25';
    var showOnPage = '6'

    var xmlhttp = new XMLHttpRequest();
    var flickrUrl = 'https://api.flickr.com/services/rest/?format=json&method=' 
    + 'flickr.photos.search&api_key='+ apiKey     
    + '&tags=' + tag 
    + '&per_page=' + perPage + '&jsoncallback=?'

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var myArr = JSON.parse(xmlhttp.responseText);
            myFunction(myArr);
        }
    };
    xmlhttp.open("GET", flickrUrl, true);
    xmlhttp.send();
    function myFunction(myArr){
        console.log('myARr',myArr);
    }
})();