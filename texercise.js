(function (){

    var flickrAPI = {

        flickrURL: 'https://api.flickr.com/services/rest/?nojsoncallback=1&format=json',
        getPhotosURL: '&method=flickr.photosets.getPhotos',
        getInfoURL: '&method=flickr.photos.getSizes',

        buildGallery: function(params){
            this.params = params;
            this._getPhotos();
            this._setupLightboxControls();
        },

        _setupLightboxControls: function(){
            window.onload = (function(){
                this.previousButton = document.getElementById('previous');
                this.nextButton = document.getElementById('next');
                this.closeButton = document.getElementById('close');
            }).bind(this);
            //since the lightbox always exists, let's only get the elements once
        },

        _addImagesToDOM: function(photos){
            var newImgTag = document.createElement('div');
            newImgTag.setAttribute('class', 'image-container');
            newImgTag.setAttribute('data-original', photos.displayImage);

            var img = document.createElement("img");
            img.setAttribute('src', photos.previewImage);

            newImgTag.appendChild(img);
            document.body.appendChild(newImgTag);

            if(typeof newImgTag.previousSibling.getAttribute === 'function'){
                var previousImage = newImgTag.previousSibling.getAttribute('data-original');
                newImgTag.previousSibling.setAttribute('data-next-image', photos.displayImage);
            }

            newImgTag.setAttribute('data-previous-image', previousImage);

            this._attachClick(newImgTag);
        },

        _attachClick: function(element){
            var lightBoxImage = document.getElementById('lightbox-image');

            element.addEventListener("click", (function(){
                this.currentElementInLightbox = element;
                document.body.setAttribute('class', 'lightbox-active');
                lightBoxImage.setAttribute('src', this.currentElementInLightbox.dataset.original);

                this.previousButton.addEventListener('click', (function(){
                    lightBoxImage.setAttribute('src', this.currentElementInLightbox.dataset.previousImage);
                    this.currentElementInLightbox = this.currentElementInLightbox.previousSibling;
                }).bind(this));
                this.nextButton.addEventListener('click', (function(){
                    lightBoxImage.setAttribute('src', this.currentElementInLightbox.dataset.nextImage);
                    this.currentElementInLightbox = this.currentElementInLightbox.nextSibling;
                }).bind(this));
            }).bind(this));
        },

        _getPhotoInfo: function(photos){
            var url = this.flickrURL  + this.getInfoURL
                + '&api_key=' + this.params.apiKey

            photos.photo.forEach(function(photo){

                var request = new XMLHttpRequest();
                url = url + '&photo_id=' + photo.id;

                request.onreadystatechange = function(images){
                    if (request.readyState == 4 && request.status == 200){
                        var parsedResponse  = JSON.parse(request.response);
                        var photoSizes      = parsedResponse.sizes.size;
                        var photoSizeLength = photoSizes.length

                        this._addImagesToDOM({
                            previewImage: photoSizes[1].source,
                            displayImage: photoSizes[photoSizeLength-1].source
                        })

                    }
                }.bind(this);

                request.open('GET', url);
                request.send();
            }, this);
        },

        _getPhotos: function(){
            var url = this.flickrURL + this.getPhotosURL 
                + '&api_key=' + this.params.apiKey
                + '&photoset_id=' + this.params.photosetId
                + '&user_id=' + this.params.userId;

            var request = new XMLHttpRequest();
            var self = this;

            request.onreadystatechange = function(){
                if (request.readyState == 4 && request.status == 200){
                    var parsedResponse = JSON.parse(request.response);
                    self._getPhotoInfo(parsedResponse.photoset);
                }
            };

            request.open('GET', url);
            request.send();
        },
    }

    flickrAPI.buildGallery({
        apiKey: '2c4c0137d9186c4b88bc23eb80e01aba',
        userId: '32992083@N00',
        photosetId: '72157642810856243'
    });

})();