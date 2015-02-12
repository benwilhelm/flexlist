angular.module('FlexList.categories', ['ngRoute'])

/********************************
 * Categories Index Controller
 *******************************/
.controller('CategoriesController', [
	'$scope',
	'$rootScope',
	'categoryService', 

function($scope, $rootScope, service){
	$rootScope.bodyLayout = 'categories index'
	$scope.categories = [];
	$scope.newCat = {name: '', parent: ''}
	service.getTree(null, function(err, cats){
		$scope.categories = cats;
	});

	$scope.addCategory = function(){
		var category = service.category({ name: $scope.newCat.name });
		async.waterfall([
			function(cb){
				category.save(cb);
			},
			function(category, cb) {
				if ($scope.newCat.parent) {
					console.log(category);
					return category.assignParent($scope.newCat.parent.value, cb);
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
		async.series({
			del:  function(cb){ cat.delete(cb) },
			tree: function(cb){ service.getTree(null, cb) }
		},function(err, rslt){
			if (err) console.error(err);
			$scope.categories = rslt.tree;
		})

	}

}])


/*******************************
 * Single Category Controller
 *******************************/
.controller('CategoryController', [
	'$scope',
	'$rootScope',
	'$routeParams',
	'$location',
	'categoryService',
function($scope, $rootScope, $routeParams, $location, service){
	var id = $routeParams.id;
	$rootScope.bodyLayout = 'categories single'
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
		cat.children = cat.children || [];
		
		cat.assignParent = function(parentObject, callback) {
			var that = this;
			var parentId = typeof parentObject === 'string' ? parentObject : parentObject._id;
			async.series([
				function(cb){
					that.removeParent(cb);
				},
				function(cb){
					service.getOne({_id:parentId}, function(err, newParent){
						if (err) return cb(err);
						console.log(that._id);
						newParent.children.push(that._id);
						newParent.save(cb);
					})
				}
			], function(err, rslts){
				if (err) console.error(err);
				callback(err, rslts[1]);
			})
		}

		cat.removeParent = function(callback) {
			var that = this;
			service.getOne({children:cat._id}, function(err, oldParent){
				if (!err && !oldParent._id) return callback(null,null);
				oldParent.children = oldParent.children || [];
				var idx = oldParent.children.indexOf(that._id);
				oldParent.children.splice(idx,1);
				oldParent.save(callback);
			})
		}

		var originalDelete = cat.delete;
		cat.delete = function(callback){
			var that = this;
			async.series([
				function(cb) {
					that.removeParent(cb)
				},
				function(cb){
					originalDelete.call(that, cb);
				}
			], callback);
		}

		return cat;
	}
	service.category = category;


	var get = function(query, callback) {
		db.get('categories', query).sort({'name':1}).exec(function(err, cats){
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
			rslts.forEach(function(rslt, idx){
				tree[rslt._id] = rslt;
			});

			var rootObject;
			_.each(tree, function(elmnt){
				populateTree(elmnt, tree);
				if (root && root === elmnt._id) {
					rootObject = elmnt;
				}
			})

			var ret = rootObject ? [rootObject] : tree;
			ret = sortRecursive(ret, 'name', 'children');
			if (callback) callback(null, ret);
		})

	}
	service.getTree = getTree;
	return service;


	/**
	 * Private Functions
	 ======================================*/
	
	function populateTree(obj, elements) {
		if (!obj 
		||  !obj.children 
		||  !obj.children.length) 
		return;
		
		obj.children.forEach(function(childId, idx){
			obj.children[idx] = elements[childId];
			delete elements[childId];
		})
	}

	function sortRecursive(tree, sortProp, childProp) {
		tree = _.toArray(tree);
		var sorted = tree.sort(sortFunc)
		_.each(sorted, function(item){
			item[childProp] = sortRecursive(item[childProp], sortProp, childProp);
		})
		return sorted;

		function sortFunc(a, b) {
			if (a[sortProp] < b[sortProp])
				return -1;
			if (a[sortProp] > b[sortProp])
				return 1;
			return 0;
		}
	}


}])