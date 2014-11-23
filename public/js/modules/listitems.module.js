angular.module('FlexList.listItems', [
	'FlexList.database'
])


/*******************************
 * List Items Index Controller
 *******************************/
.controller('ListItemsController', [ 
	'$scope', 
	'$location',
	'listItemService', 
function($scope, $location, listItemService){

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
	'$routeParams',
	'$timeout',
	'$location',
	'listItemService',
function($scope, $routeParams, $timeout, $location, listItemService){
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
	$scope.categories = {
		'1': {id:'1', name:'Category 1'},
		'2': {id:'2', name:'Category 2'},
		'3': {id:'3', name:'Category 3'}
	}

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
		var item = angular.extend({
			created: new Date,
			closed: false
		}, vals)


		var props = [ '_id', 'closed', 'created', 'text' ]
		var getProps = function(vals) {
			var ret = {};
			props.forEach(function(prop){
				ret[prop] = (vals.hasOwnProperty(prop)) ? vals[prop] : '';
			})
			return ret;
		}




		item.save = function(callback){
			callback = callback || function(){};
			var itemProps = getProps(item);
			if (itemProps._id) {
				db.listItems.update({_id:itemProps._id}, itemProps, function(err, ret){
					$timeout(function(){
						callback(err,ret);
					})
				});
			} else {
				db.listItems.insert(itemProps, function(err, ret){
					item._id = ret._id;

					$timeout(function(){
						callback(err, ret);
					});
				});
			}
		}

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

		item.delete = function(callback) {
			callback = callback || function() {};
			db.listItems.remove({_id:item._id}, callback);
		}

		return item;

	}
	service.listItem = listItem;


	var getAll = function(callback){
		db.listItems.find({}, function(err, items){
			if (err) {
				console.error(err);
				return callback(err);
			}

			var ret = [];
			items.forEach(function(item){
				ret.push(listItem(item));
			})

			$timeout(function(){
				callback(null, ret);
			});
		});
	} 
	service.getAll = getAll;


	var getOne = function(params, callback){
		db.listItems.find(params, function(err, items){
			if (err) {
				console.log(err);
				return callback(err);
			}

			var ret = items.length ? listItem(items[0]) : null;
			
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