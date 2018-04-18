storageEngine = function(){
	var initialised = false;
	var initialisedObjStores = {};
	function getStorageObject(type){
		var item = localStorage.getItem(type);
		var parseItem = JSON.parse(item);
		return parseItem;
	}
		
		return{
			init : function(successCallback, errorCallback){
				if(window.localStorage){
					initialised = true;
					successCallback(null);
				} else {
					errorCallback('storage_api_not_supported','The web storage api is not supported');
				}
			},
			initObjectStore : function(type, successCallback, errorCallback){
				if(!initialised){
					errorCallback('storage_api_not_supported','The web storage api is not supported');
				} else if(!localStorage.getItem(type)){
					localStorage.setItem(type, JSON.stringify({}));
					initialisedObjStores[type] = true;
					successCallback(null);
				} else if(localStorage.getItem(type)){
					initialisedObjStores[type] = true;
					successCallback(null);
				}
			},
			save : function(type, obj, successCallback, errorCallback){
				if(!initialised){
					errorCallback('storage_api_not_supported','The web storage api is not supported');
				} else if(!initialisedObjStores[type]){
					errorCallback('storage_api_not_supported','1 The storage type ' + type + ' api is not supported');
				} else {
					if(!obj.id)
						obj.id = $.now();
					var storageItem = getStorageObject(type);
					storageItem[obj.id] = obj;
					localStorage.setItem(type, JSON.stringify(storageItem));
					successCallback(obj);
				}
			},
			findAll : function(type, successCallback, errorCallback){
				if(!initialised){
					errorCallback('storage_api_not_supported','The web storage api is not supported');
				} else if(!initialisedObjStores[type]){
					errorCallback('storage_api_not_supported','2. The object store ' + type + ' api is not supported');
				} else {
					var result = [];
					var storageItem = getStorageObject(type);
					$.each(storageItem, function(i,v){
						result.push(v);
					});
					successCallback(result);
				}
			},
			delete : function(type, id, successCallback, errorCallback){
					if(!initialised){
					errorCallback('storage_api_not_supported','The web storage api is not supported');
					} else if(!initialisedObjStores[type]){
						errorCallback('storage_api_not_supported','2. The object store ' + type + ' api is not supported');
					} else {
						var storageItem = getStorageObject(type);
						if(storageItem[id]){
							delete storageItem[id];
							localStorage.setItem(type, JSON.stringify(storageItem));
							successCallback(id);
						} else {
							errorCallback('object_not_found', 'the object to the deleted could nto be found');
						}
					}
			},
			findByProperty : function(type, propertyName, propertyValue, successCallback, errorCallback){
				if(!initialised){
                    errorCallback('storage_api_not_supported','The web storage api is not supported');
				} else if(!initialisedObjStores[type]){
                    errorCallback('storage_api_not_supported','2. The object store ' + type + ' api is not supported');
                } else {
                    var result = [];
                    var storageItem = getStorageObject(type);
                    $.each(storageItem, function(i,v){
                    	if(v[propertyName] === propertyValue)
                    		result.push(v);
					});
                    successCallback(result);
                }
			},
			findById : function(type, id, successCallback, errorCallback){
				if(!initialised){
					errorCallback('storage_api_not_supported','The web storage api is not supported');
					} else if(!initialisedObjStores[type]){
						errorCallback('storage_api_not_supported','2. The object store ' + type + ' api is not supported');
					} else {
                    	var storageItem = getStorageObject(type);
                    	var result = storageItem[id];
                    	if(!result)
                    		result = null;
						successCallback(result);
					}
			},
			saveAll: function(type, objArray, successCallback, errorCallback){
				if(!initialised)
					errorCallback('storage_api_not_initialised', 'The storage engine has not been initialised');
				else if(!initialisedObjStores[type])
					errorCallback('storage_not_initialised', 'The object store' + type + ' has not been initialised');
				else {
					var storageItem = getStorageObject(type);
					$.each(objArray, function(i, obj){
						if(!obj.id)
							obj.id = $.now();
						storageItem[obj.id] = obj;
					});
					localStorage.setItem(type, JSON.stringify(storageItem));
					successCallback(objArray);
				}
			}
		};
		
	
}();