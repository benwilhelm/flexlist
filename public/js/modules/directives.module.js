angular.module('FlexList.directives', [])

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
 * Editable Text
 ********************/
.directive('flEditableText', [
	'$timeout',
function($timeout){

	return {
		restrict: 'AE',
		replace: true,
		scope: {
			val: '=editableValue'
		},
		templateUrl: 'views/directives/editable-text.html',

		compile: function(tElem, atts){
			var tagName = atts.elementTag || 'p';
			var $static = tElem.find('.static-text');
			$wrap = $("<" + tagName + ">");
			$static.wrapInner($wrap);

			return function(scope, elem, atts) {

				scope.editing = false;

				scope.edit = function() {
					$timeout(function(){
						scope.editing = true;
						elem.find('input').select();
					})

				}

				scope.done = function() {
					$timeout(function(){
						scope.editing = false;
					})
				}
			}		
		} 

	}
}])