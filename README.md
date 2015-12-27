# Flickr Gallery	
Exercise by Jason Perez (jaeysin@protonmail.com)

### Instructions

Flickr gallery comes preset with a photoset for demonstration purposes.

The photoset can be changed in two ways.

* **URL Parameters**

* **buildGallery()** function call
	
		buildGallery({
			apiKey: key,
			userId: userid,
			setId: setId
		})


You must provide a 

* flickr API key
* a userID
* a setID

If you call buildGallery with all three required params, these will be used. If they are omitted, or any are missing, the gallery will attempt to find them in the url params.

#### Future Improvements

1. Error Handling for URL parameters
2. Sanitation for URL parameters
2. Pagination
3. Ability to update images per page
4. More intelligent handling of precedence in handling url params versus function call params.