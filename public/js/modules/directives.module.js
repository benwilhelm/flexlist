angular.module('FlexList.directives', [])

/****************
 * Nav Bar
 ****************/
.directive('flNavbar', [
	'$location', 
function($location){
	return {
		restrict: 'AE',
		replace: true,
		scope: {},
		templateUrl: 'views/directives/navbar.html',
		link: function(scope, elem, atts){

			scope.$on('$locationChangeStart', function(event){
				var path = $location.path();
				path = path.split('/');

				var section = (path[1]) ? path[1] : 'listitems';
				scope.section = section;
			})
		}
	}

}])



/********************
 * Toggle Switch
 *********************/
.directive('flToggleSwitch', function(){

	return {
		restrict: 'AE',
		replace: true,
		scope: {
			toggleValue: '=toggleAttr',
			labels: '@toggleLabels'
		},
		templateUrl: 'views/directives/toggle-switch.html',

		link: function(scope, elem, atts) {
			var labels = scope.labels.split(":");
			scope.trueLabel = labels[0] || 'On';
			scope.falseLabel = labels[1] || 'Off';
			
			scope.setTrue = function() {
				scope.toggleValue = true;
			}

			scope.setFalse = function() {
				scope.toggleValue = false;
			}
		}
	}
})

/********************
 * Tree Select
 ********************/
 .directive('flTreeSelect', ['$timeout', function($timeout){

 		return {
 			restrict: 'AE',
 			replace: true,
 			scope: {
 				labelProp: '@labelProp',
 				valueProp: '@valueProp',
 				placeholderLabel: '@placeholderLabel',
 				tree: '=',
 				myModel: '='
 			},
 			templateUrl: 'views/directives/tree-select.html',
 			link: function(scope, elem, atts) {
				
				scope.$watch('tree', function(){
					scope.flattened = _.map(scope.tree, function(item){
						return {
							value: item._id,
							name: item.name
						}
					});
				})

 			}
 		}
 }])


/********************
 * Editable Text
 ********************/
.directive('flEditableText', [
	'$timeout',
function($timeout){

	return {
		restrict: 'AE',
		replace: true,
		scope: {
			val: '=editableValue',
			class: '@class',
			id: '@id'
		},
		templateUrl: 'views/directives/editable-text.html',
		transclude: true,

		compile: function(tElem, atts){
			var tagName = atts.elementTag || 'p';
			var $static = tElem.find('.static-text');
			$wrap = $("<" + tagName + ">");
			$static.wrapInner($wrap);

			return function(scope, elem, atts) {

				scope.editing = false;

				scope.edit = function() {
					scope.editing = true;
					$timeout(function(){
						elem.find('input').select();
					})

				}

				scope.done = function() {
					scope.editing = false;
				}
			}		
		} 

	}
}])