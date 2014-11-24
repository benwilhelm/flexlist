angular.module('FlexList.categories', ['ngRoute'])

/********************************
 * Categories Index Controller
 *******************************/
.controller('CategoriesController', [
	'$scope',
	'categoryService', 

function($scope, service){
	$scope.categories = {}
	service.getAll(function(err, cats){
		$scope.categories = cats;
	});

	$scope.newCatName = "";
	$scope.addToList = function(){
		var category = service.category({name: $scope.newCatName});
		$scope.categories.push(category);
		category.save(function(err, category){
			$scope.newCatName = "";
		});
	}

	$scope.deleteCategory = function() {
		var cat = this.category;
		var idx = this.$index;
		cat.delete();
		$scope.categories.splice(idx,1);
	}

}])


/*******************************
 * Single Category Controller
 *******************************/
.controller('CategoryController', [
	'$scope',
	'$routeParams',
	'$location',
	'categoryService',
function($scope, $routeParams, $location, service){
	var id = $routeParams.id;
	$scope.category = {};
	service.getOne({_id:id}, function(err, cat){
		$scope.category = cat
	})

	$scope.parents = [];
	service.get({'_id': {'$ne': id}}, function(err, cats){
		var idx = cats.indexOf($scope.category);
		$scope.parents = cats;
	})

	$scope.save = function() {
		$scope.category.save(function(){
			$location.path('/categories');
		})
	}
}])



/************************
 * Categories Service 
 *************************/
.service("categoryService", [
	'flexListDatabase',
	'$timeout',

function(db, $timeout){
	
	var service = {};

	var category = function(vals) {

		var cat = db.resource('categories', ['_id', 'name', 'parent'], vals);
		return cat;
	}
	service.category = category;


	var get = function(query, callback) {
		db.get('categories', query, function(err, cats){
			var ret = [];
			cats.forEach(function(cat){
				ret.push(category(cat));
			});

			$timeout(function(){
				callback(err, ret)
			})
		})
	}
	service.get = get;


	var getAll = function(callback) {
		get({}, callback);
	};
	service.getAll = getAll;


	var getOne = function(params, callback) {
		db.getOne('categories', params, function(err, cat){
			cat = category(cat);
			$timeout(function(){
				callback(err, cat);
			})
		});
	}
	service.getOne = getOne;

	return service;
}])