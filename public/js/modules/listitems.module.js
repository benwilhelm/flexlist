angular.module('FlexList.listItems', [
	'FlexList.database'
])
.controller('ListItemsController', [ 
	'$scope', 
	'listItemService', 
function($scope, listItemService){
	
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
		item.save();
		$scope.newListItem = "";
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
}])
.service('listItemService', [ 'flexListDatabase', function(db){

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
				db.listItems.update({_id:itemProps._id}, itemProps, callback);
			} else {
				db.listItems.insert(itemProps, function(err, ret){
					item._id = ret._id;
					callback(err, ret);
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

			callback(null, ret);
		});
	} 
	service.getAll = getAll





	/*******************
    / Private functions
    / *****************/

	//...



	return service;
}])