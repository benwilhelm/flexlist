angular.module('FlexList.listItems', [
	'FlexList.database',
	'FlexList.categories'
])


/*******************************
 * List Items Index Controller
 *******************************/
.controller('ListItemsController', [ 
	'$scope',
	'$rootScope',
	'$location',
	'listItemService',
function($scope, $rootScope, $location, listItemService){
  $rootScope.bodyLayout = 'listitems index';
	$scope.openItems = [];
	$scope.closedItems = [];
	var service = listItemService;
	service.getAll(function(err, items){
		if (err) console.error(err);

		$scope.$apply(function(){
			items.forEach(function(item){
				if (item.closed) {
					$scope.closedItems.push(item);
				} else {
					$scope.openItems.push(item);
				}
			})
		})
	})

	

	$scope.addToList = function(){
		var item = service.listItem({text: $scope.newListItem});
		$scope.openItems.push(item);
		item.save(function(err, item){
			$scope.newListItem = "";
			$location.path("/listitems/" + item._id);
		});
	
	}

	$scope.closeItem = function() {
		var item = this.item;
		var idx = this.$index;
		$scope.openItems.splice(idx, 1);
		$scope.closedItems.unshift(item);
		item.close();
	}

	$scope.openItem = function() {
		var item = this.item;
		var idx = this.$index;
		$scope.closedItems.splice(idx, 1);
		$scope.openItems.push(item);
		item.open();
	}

	$scope.deleteItem = function() {
		var item = this.item;
		var idx = this.$index;
		$scope.closedItems.splice(idx, 1);
		item.delete();
	}
}])


/*******************************
 * Single List Item Controller
 *******************************/
.controller('ListItemController',[
	'$scope',
	'$rootScope',
	'$routeParams',
	'$timeout',
	'$location',
	'listItemService',
	'categoryService',
function($scope, $rootScope, $routeParams, $timeout, $location, listItemService, categoryService){
	$rootScope.bodyLayout = 'listitems single'
	var id = $routeParams.id;
	$scope.item = {};
	listItemService.getOne({'_id':id}, function(err, item){
		$scope.item = item;
	});
	
	$scope.editingTitle = false;
	$scope.toggleEditingTitle = function() {
		$scope.editingTitle = !$scope.editingTitle;
		$timeout(function(){
			if ($scope.editingTitle) {
				angular.element('.title-editor').select();
			}
		});
	}

	$scope.save = function() {
		$scope.item.save(function(err, item){
			$location.path('/');
		})
	}

	$scope.removeCategory = function() {
		var id = this.category.id;
		delete $scope.item.categories[id];
	}

	$scope.selectedCategory = null;
	$scope.categories = {}
	categoryService.getAll(function(err, cats){
		$scope.categories = cats;
	})

	$scope.$watch('selectedCategory', function(newVal, oldVal){
		$scope.item.categories = $scope.item.categories || {};
		if (newVal && newVal != oldVal) {
			$scope.item.categories[newVal] = $scope.categories[newVal];
			$scope.selectedCategory = null;
		}
	})

}])



/********************
 * ListItem Service
 *********************/
.service('listItemService', [ 
	'flexListDatabase',
	'$timeout',
function(db, $timeout){

	var service = {};

	var listItem = function(vals) {
		vals = angular.extend({
			created: new Date,
			closed: false
		}, vals);

		var item = db.resource(
			'listItems', 
			[ '_id', 'closed', 'created', 'text' ],
			vals
		);

		item.close = function(callback) {
			callback = callback || function(){};
			item.closed = true;
			item.save(callback);
		}

		item.open = function(callback) {
			callback = callback || function(){};
			item.closed = false;
			item.save(callback);
		}

		return item;

	}
	service.listItem = listItem;


	var get = function(params, callback){
		db.get('listItems', params, function(err, items){
			var ret = [];
			items.forEach(function(item){
				var li = listItem(item);
				ret.push(li);
			})

			$timeout(function(){
				callback(null, ret);
			});
		})
	}
	service.get = get;


	var getAll = function(callback) {
		get({}, callback);
	};
	service.getAll = getAll;


	var getOne = function(params, callback){
		db.getOne('listItems', params, function(err, item){
			var ret = listItem(item);
			
			$timeout(function(){
				callback(null, ret);
			});
		})
	}
	service.getOne = getOne;


	/*******************
    / Private functions
    / *****************/

	//...



	return service;
}])