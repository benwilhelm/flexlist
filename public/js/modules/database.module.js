angular.module('FlexList.database', [])
.service('flexListDatabase', [
	'$timeout',
function($timeout){

	var db = {
		'listItems': new Nedb({autoload: true, filename: 'listItems'}),
		'categories': new Nedb({autoload: true, filename: 'categories'})
	}

	var service = {};

	var resource = function(collectionName, properties, vals) {
		
		var collection = db[collectionName];
		var crud = vals || {};
		properties = properties || [];

		var getProps = function(vals) {
			var ret = {};
			properties.forEach(function(prop){
				ret[prop] = (vals.hasOwnProperty(prop)) ? vals[prop] : '';
			})
			return ret;
		}

		crud.save = function(callback){
			callback = callback || function(){};
			var props = getProps(crud);
			if (props._id) {
				collection.update({_id:props._id}, props, function(err, ret){
					$timeout(function(){
						callback(err,ret);
					})
				});
			} else {
				collection.insert(props, function(err, ret){
					crud._id = ret._id;

					$timeout(function(){
						callback(err, ret);
					});
				});
			}
		}

		crud.delete = function(callback) {
			callback = callback || function() {};
			collection.remove({_id:crud._id}, callback);
		}

		return crud;
	}
	service.resource = resource;

	var get = function(collectionName, query, callback) {
		db[collectionName].find(query, function(err, items){
			if (err) {
				console.error(err);
				return callback(err);
			}
			callback(null, items);
		})
	}
	service.get = get;

	var getAll = function(collectionName, callback){
		get(collectionName, {}, callback);
	} 
	service.getAll = getAll;


	var getOne = function(collectionName, params, callback){
		get(collectionName, params, function(err, items){
			var ret = items ? items[0] : null;			
			callback(null, ret);
		})
	}
	service.getOne = getOne;

	return service;

}])

