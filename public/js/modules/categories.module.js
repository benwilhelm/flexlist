angular.module('FlexList.categories', ['ngRoute'])

/********************************
 * Categories Index Controller
 *******************************/
.controller('CategoriesController', [
	'$scope',
	'categoryService', 

function($scope, service){
	$scope.categories = [];
	$scope.newCat = {name: '', parent: ''}
	service.getTree(null, function(err, cats){
		$scope.categories = cats;
	});

	$scope.addCategory = function(){
		var category = service.category($scope.newCat);
		async.parallel([
			function(cb){
				category.save(cb);
			},
			function(cb) {
				if ($scope.newCat.parent) {
					return category.assignParent($scope.newCat.parent, cb);
				}
				cb(null,null);
			}
		], function(err, rslt){
			$scope.newCat = {};
			service.getTree(null, function(err, cats){
				$scope.categories = cats;
			})
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
		var cat = db.resource('categories', ['_id', 'name', 'children'], vals);
		
		cat.assignParent = function(parentObject, callback) {
			var that = this;
			async.series([
				function(cb){
					service.getOne({children:cat._id}, function(err, oldParent){
						if (err) return cb(err);
						if (!oldParent._id) return cb(null,null);
						oldParent.children = oldParent.children || [];
						var idx = oldParent.children.indexOf(that._id);
						oldParent.children.splice(idx,1);
						oldParent.save(cb);
					})
				},
				function(cb){
					service.getOne({_id:that.parent._id}, function(err, newParent){
						if (err) return cb(err);
						newParent.children = newParent.children || [];
						newParent.children.push(cat._id);
						newParent.save(cb);
					})
				}
			], function(err, rslts){
				callback(err, rslts[1]);
			})
		}
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

	var getTree = function(root, callback) {
		getAll(function(err, rslts){
			if (err) callback(err);
			var tree = {};
			var rootElements = [];
			rslts.forEach(function(rslt){
				tree[rslt._id] = rslt;
			});

			var rootObject;
			_.each(tree, function(elmnt){
				populate(elmnt, tree);
				if (root && root === elmnt._id) {
					rootObject = elmnt;
				}
			})

			var ret = rootObject ? [rootObject] : tree;
			if (callback) callback(null, tree);
		})

		function populate(obj, elements) {
			if (!obj || !obj.children) return;
			obj.children.forEach(function(childId, idx){
				obj.children[idx] = elements[childId];
				delete elements[childId];
			})
		}
	}
	service.getTree = getTree;

	return service;
}])