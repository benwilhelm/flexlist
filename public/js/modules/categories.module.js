angular.module('FlexList.categories', [])

.controller('CategoriesController', function($scope){
	$scope.categories = {
		'1': {id:'1', name:'Category 1'},
		'2': {id:'2', name:'Category 2'},
		'3': {id:'3', name:'Category 3'}
	}
})