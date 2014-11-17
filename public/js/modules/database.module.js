angular.module('FlexList.database', [])
.service('flexListDatabase', function(){

	var db = {};
	db.listItems = new Nedb({autoload: true, filename: 'listItems'});
	db.categories = new Nedb({autoload: true, filename: 'categories'});
	return db;
})