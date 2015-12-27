"use strict";

(function (){
    var flickrURL         =  'https://api.flickr.com/services/rest/?nojsoncallback=1&format=json';
    var getPhotosURL      =  '&method=flickr.photosets.getPhotos';
    var getInfoURL        =  '&method=flickr.photos.getSizes';
    var peopleGetInfoURL  =  '&method=flickr.people.getInfo';
    var imagesPerPage   = 21;
    var lightboxImage;
    var lightboxGrid;
    var imageTitle;
    var currentElementInLightbox;
    var browserHeight;
    var browserWidth;
    var userNameElement;
    var realNameElement;
    var userDescriptionElement;
    var profileUrlElement;

    function buildGallery(params) {
        window.onload = function(){
            setupElementRefs();
            getBrowserHeight();

            if(!params){
                params = {};
            }

            if(params.apiKey && params.userId && params.setId){
                getPhotos(params.apiKey, params.userId, params.setId, addImageToDOM, failure);
            } else {
                params = getURLParametersOrUseParams(params);
                getPhotos(params.apiKey, params.userId, params.setId, addImageToDOM, failure);
            }
            //if all parameters are supplied to the buildGallery call, we just use these.
        }
        //we should always have a window
    }

    function setupElementRefs() {
        var doc = document;

        doc.getElementById('previous').addEventListener('click', goPrevious);
        doc.getElementById('next').addEventListener('click', goNext);
        doc.getElementById('close').addEventListener('click', close);

        lightboxGrid = doc.getElementById('image-grid');
        imageTitle  = doc.getElementById('image-title');
        lightboxImage = doc.getElementById('lightbox-image');

        userNameElement = doc.getElementById('user-name');
        realNameElement = doc.getElementById('real-name');
        userDescriptionElement = doc.getElementById('user-description');
        profileUrlElement = doc.getElementById('profile-url');

        lightboxImage.addEventListener('click', function(event){
            event.stopPropagation();
        });
    }

    function get(url, success, failure, args) {
        var request = new XMLHttpRequest();
        request.open('GET', url);
        request.send();

        request.onreadystatechange = function(){
            if (request.readyState == 4 && request.status == 200){
                var response = JSON.parse(request.response);
                success(response, args);
            }  else if (request.status != 200 && request.status != 304) {
                //this could have more options and take into account more response codes
                console.log('err', request);
                failure(request.status);
            }
        };
    }
    
    function getUserInfo (apiKey, userId){
        var url = flickrURL + peopleGetInfoURL + '&api_key=' + apiKey + '&user_id=' + userId;

        function appendUserInfoToDom(response){
            var person = response.person;
            var userName = person.username._content;
            var realName = person.realname._content;
            var description = person.description._content;
            var profileUrl = person.profileurl._content;

            if(person){

                if(userName && userNameElement){
                    userNameElement.innerHTML = userName;
                }

                if(realName && realNameElement){
                    realNameElement.innerHTML = realName;
                }

                if(description && userDescriptionElement){
                    userDescriptionElement.innerHTML = description;
                }

                if(profileUrl && profileUrlElement){
                    profileUrlElement.innerHTML = profileUrl;
                }
            }

        }
        get(url, appendUserInfoToDom, failure);
    }

    function getPhotos(apiKey, userId, setId, success, failure) {
        var url = flickrURL + getPhotosURL + '&api_key=' + apiKey + '&photoset_id=' + setId + '&user_id=' + userId + '&per_page=' + imagesPerPage;

        function parseResponse(response){
            var parsedResponse = response.photoset;
            getUserInfo(apiKey, userId);  
            getPhotosInfo(apiKey, parsedResponse, success, failure);
        }

        get(url, parseResponse, failure);
    }

    function getPhotosInfo(apiKey, photos, success, failure) {
        var url = flickrURL  + getInfoURL + '&api_key=' + apiKey;

        function parseResponse(response, photoTitle){
            var parsedResponse  = response;
            var photoSizes      = parsedResponse.sizes.size;
            //there could be better control over what images to use
            //we are using the smallest and nearly the largest

            success({
              previewImage: photoSizes[1].source,
              displayImage: photoSizes[9].source,
              photoTitle:   photoTitle
            });
        }

        photos.photo.forEach(function(photo){
            url = url + '&photo_id=' + photo.id;
            get(url, parseResponse, failure, photo.title);
        });
    }

    function goNext() {
        event.stopPropagation();
        if(currentElementInLightbox.dataset.nextImage){
            lightboxImage.setAttribute('src', currentElementInLightbox.dataset.nextImage);
            currentElementInLightbox = currentElementInLightbox.nextSibling;
            imageTitle.innerHTML = currentElementInLightbox.dataset.title;
        }
    }

    function goPrevious() {
        event.stopPropagation();
        if(currentElementInLightbox.dataset.previousImage){
            lightboxImage.setAttribute('src', currentElementInLightbox.dataset.previousImage);
            currentElementInLightbox = currentElementInLightbox.previousSibling;
            imageTitle.innerHTML = currentElementInLightbox.dataset.title;
        }
    }

    function close() {
        document.body.removeEventListener('click', close);
        document.body.classList.remove('lightbox-active');
    }

    function addImageToDOM(photo) {
        var imageContainer = createImageContainer(photo);
        createAndAppendImageToContainer(photo, imageContainer);
        if(imageContainer.previousSibling && typeof imageContainer.previousSibling.getAttribute === 'function'){
            var previousImage = imageContainer.previousSibling.getAttribute('data-original');
            imageContainer.previousSibling.setAttribute('data-next-image', photo.displayImage);
        }
        if(previousImage){
            imageContainer.setAttribute('data-previous-image', previousImage);
        }
        imageContainer.setAttribute('data-title', photo.photoTitle);
    }

    function createAndAppendImageToContainer (photo, imageContainer){
        var img = document.createElement("img");
        img.setAttribute('src', photo.previewImage);
        imageContainer.appendChild(img);
        lightboxGrid.appendChild(imageContainer);
    }

    function createImageContainer (photo){
        var imageContainer = document.createElement('div');
        imageContainer.setAttribute('id', 'preview-container');
        imageContainer.setAttribute('data-original', photo.displayImage);
        imageContainer.addEventListener("click", openLightbox);
        return imageContainer;
    }

    function openLightbox(){
        var scaledBrowserHeight = browserHeight - 40;
        currentElementInLightbox = event.target.parentElement;
        document.body.setAttribute('class', 'lightbox-active');
        event.stopPropagation();
        document.body.addEventListener('click', close);
        imageTitle.innerHTML = currentElementInLightbox.dataset.title;
        lightboxImage.setAttribute('style', 'max-height: ' + scaledBrowserHeight + 'px');
        lightboxImage.setAttribute('src', currentElementInLightbox.dataset.original);
    }

    function getBrowserHeight(){
        if( typeof( window.innerWidth ) == 'number' ) {
          //Non-IE
          browserWidth = window.innerWidth;
          browserHeight = window.innerHeight;
        } else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
          //IE 6+ in 'standards compliant mode'
          browserWidth = document.documentElement.clientWidth;
          browserHeight = document.documentElement.clientHeight;
        } else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
          //IE 4 compatible
          browserWidth = document.body.clientWidth;
          browserHeight = document.body.clientHeight;
        }
    }

    function getURLParametersOrUseParams(params){
        var userId = getURLParameter('userid');
        var apiKey = getURLParameter('apikey');
        var setId = getURLParameter('setid');
        if(userId){
            params.userId = userId;
        }

        if(apiKey){
            params.apiKey = apiKey
        }

        if(setId){
            params.setId = setId; 
        }
        return params;
    }

    function getURLParameter(name) {
      return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null
    }

    function failure(message){
        alert('Something bad happened', message);
    }

    buildGallery(
        {
            apiKey: '2c4c0137d9186c4b88bc23eb80e01aba',
            userId: '67617854@N04',
            setId: '72157648256881341'
        }
    );

})();