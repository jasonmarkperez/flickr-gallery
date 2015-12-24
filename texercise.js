(function (){

    var flickrAPI = {

        flickrURL: 'https://api.flickr.com/services/rest/?nojsoncallback=1&format=json',
        getPhotosURL: '&method=flickr.photosets.getPhotos',
        getInfoURL: '&method=flickr.photos.getSizes',

        buildGallery: function(params){
            this.params = params;
            this._getPhotos();
            this._setupElementRefs();
        },

        _setupElementRefs: function(){
            window.onload = (function(){
                this.previousButton = document.getElementById('previous');
                this.nextButton     = document.getElementById('next');
                this.closeButton    = document.getElementById('close');
                this.lightBoxImage  = document.getElementById('lightbox-image');
            }).bind(this);
        },

        _addImagesToDOM: function(photo){
            var imageContainer = this._createNewImageContainer(photo);
            this._createAndAppendImageToContainer(photo, imageContainer);

            if(typeof imageContainer.previousSibling.getAttribute === 'function'){
                var previousImage = imageContainer.previousSibling.getAttribute('data-original');
                imageContainer.previousSibling.setAttribute('data-next-image', photo.displayImage);
            }

            imageContainer.setAttribute('data-previous-image', previousImage);

            this._attachClick(imageContainer);
        },

        _createAndAppendImageToContainer: function(photo, imageContainer){
            var img = document.createElement("img");
            img.setAttribute('src', photo.previewImage);

            imageContainer.appendChild(img);
            document.body.appendChild(imageContainer);
        },

        _createNewImageContainer: function(photo){
            var newImageContainer = document.createElement('div');
            newImageContainer.setAttribute('class', 'image-container');
            newImageContainer.setAttribute('data-original', photo.displayImage);
            return newImageContainer;
        },

        _attachClick: function(element){
            element.addEventListener("click", (function(){
                this.currentElementInLightbox = element;
                document.body.setAttribute('class', 'lightbox-active');
                this.lightBoxImage.setAttribute('src', this.currentElementInLightbox.dataset.original);

                this.previousButton.addEventListener('click', this._goPrevious.bind(this));
                this.nextButton.addEventListener('click', this._goNext.bind(this));
            }).bind(this));
        },

        _attachCloseClick: function(){

        },

        _goNext: function(){
            this.lightBoxImage.setAttribute('src', this.currentElementInLightbox.dataset.nextImage);
            this.currentElementInLightbox = this.currentElementInLightbox.nextSibling;
        },

        _goPrevious: function() {
            this.lightBoxImage.setAttribute('src', this.currentElementInLightbox.dataset.previousImage);
            this.currentElementInLightbox = this.currentElementInLightbox.previousSibling;
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