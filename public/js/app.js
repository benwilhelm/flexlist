angular.module('FlexList', [
	'FlexList.listItems',
	'ngRoute'
]).config(function($routeProvider){

	$routeProvider.when('/', {
		controller: 'ListItemsController',
		templateUrl: 'views/list.html'
	})
})