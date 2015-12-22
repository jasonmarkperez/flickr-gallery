(function (){

    var flickrAPI = {

        flickrURL: 'https://api.flickr.com/services/rest/?nojsoncallback=1&format=json',
        getPhotosURL: '&method=flickr.photosets.getPhotos',
        getInfoURL: '&method=flickr.photos.getSizes',
        apiKey: '',

        buildGallery: function(params){
            this.apiKey = params.apiKey;
            this._getPhotos(params);
        },

        _addImagesToDOM: function(photos){
            var newImgTag = document.createElement('span');
            newImgTag.setAttribute('class', 'image-container');
            newImgTag.setAttribute('data-original', photos.displayImage);

            var img = document.createElement("img");
            img.setAttribute('src', photos.previewImage);

            newImgTag.appendChild(img);
            document.body.appendChild(newImgTag);
            this._attachClick(newImgTag);
        },

        _attachClick: function(element){
            element.addEventListener("click", function(){
                document.getElementById('lightbox-image').setAttribute('src', element.dataset.original);
            });
        },

        _getPhotoInfo: function(photos){
            var url = this.flickrURL  + this.getInfoURL
                + '&api_key=' + this.apiKey

            photos.photo.forEach(function(photo){
                var request = new XMLHttpRequest();
                url = url + '&photo_id=' + photo.id;
                request.onreadystatechange = function(images){
                    if (request.readyState == 4 && request.status == 200){
                        var parsedResponse = JSON.parse(request.response);
                        var photoSizes = parsedResponse.sizes.size.length;
                        this._addImagesToDOM({
                            previewImage: parsedResponse.sizes.size[0].source,
                            displayImage: parsedResponse.sizes.size[photoSizes-1].source
                        })

                    }
                }.bind(this);
                request.open('GET', url);
                request.send();
            }, this);
        },

        _getPhotos: function(params){
            var url = this.flickrURL + this.getPhotosURL 
                + '&api_key=' + params.apiKey
                + '&photoset_id=' + params.photosetId
                + '&user_id=' + params.userId;

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