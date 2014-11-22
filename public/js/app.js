angular.module('FlexList', [
	'FlexList.directives',
	'FlexList.listItems',
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
	
	}).otherwise({
		redirectTo: "/"

	})
})