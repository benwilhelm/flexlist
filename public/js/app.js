angular.module('FlexList', [
	'FlexList.directives',
	'FlexList.listItems',
	'FlexList.categories',
	'ngRoute'
])


/******************
 * App config
 ******************/
.config(function($routeProvider){

	$routeProvider.when('/', {
		controller: 'ListItemsController',
		templateUrl: 'views/listitems/index.html'
	
	}).when("/listitems/:id", {
		controller: "ListItemController",
		templateUrl: "views/listitems/show.html"

	}).when("/categories", {
		controller: "CategoriesController",
		templateUrl: "views/categories/index.html"
	
	}).when("/categories/:id", {
		controller: "CategoryController",
		templateUrl: "views/categories/show.html"
	
	}).otherwise({
		redirectTo: "/"

	})
})