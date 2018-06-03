'use strict';

angular.module('myApp.client', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/client', {
    templateUrl: 'client/client.html',
    controller: 'ClientCtrl as vm'
  });
}])

.controller('ClientCtrl', [function() {
  var vm = this;

  vm.status = 'online';
  vm.connectBtnText = '连接';
  vm.input = {
    longwillqos: 0
  };
}]);