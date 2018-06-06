'use strict';

angular.module('myApp.client', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/client', {
    templateUrl: 'client/client.html',
    controller: 'ClientCtrl as vm'
  });
}])

.controller('ClientCtrl',['$scope','$log', function($scope, $log) {
  var vm = this;
  // mqtt配置

  vm.connecOpt = {
    keepalive: 60,
    clientId: null,
    clean: true,
    reconnectPeriod: 5000,
    connectTimeout: 60 * 1000,
    username: null,
    password: null
  };
  vm.endpointLog = '';
  vm.status = '离线';
  vm.isEndpointConnected = false;
  vm.connectBtnText = '连接';
  vm.disconnectBtnText = '断开';
  vm.input = {
    longwillqos: 0,
    subQos: "0",
    pubQos: "0"
  };
  vm.subscription = [];

  // 测试数据
  vm.input.host = 'broker.mqttdashboard.com';
  vm.input.port = '8000';
  vm.input.clientId = 'clientId-iHGrwZmvzK';
  vm.input.username = '';
  vm.input.password = '';
  vm.input.keepalive = 60;
  vm.input.isConnect = true;
  vm.mockSubTopic = '';

  // 连接mqtt
  vm.connect = function() {
    if (vm.input.host && vm.input.port) {
      vm.host = "tcp://" + vm.input.host + ":" + vm.input.port + "/mqtt";

      vm.connecOpt.clientId = vm.input.clientId;
      vm.connecOpt.username = vm.input.username;
      vm.connecOpt.password = vm.input.password;
      vm.connecOpt.keepalive = vm.input.keepalive;
      vm.connecOpt.clean = vm.isConnect;

      // connect
      vm.client = mqtt.connect(vm.host, vm.connecOpt);

      vm.client.on('connect', function() {
        vm.isEndpointConnected = true;
        vm.status = '在线';

        // 打日志
        $log.debug('mqtt connect');
        var date = new Date(Date.now());
        vm.endpointLog += date.toLocaleString() + '\n' +  '终端连接成功.\n';
        $scope.$apply();
      });

      vm.client.on('message', function(topic, message) {
        var date = new Date(Date.now());

        // 打日志
        $log.debug('mqtt receive message' + date.toLocaleString());
        vm.endpointLog += date.toLocaleString() + '\n' + '接收消息 topic: ' + topic + ', ' + 'message: ' + message + '\n';
        $scope.$apply();
      });
    }
  }

  vm.disconnect = function() {
    if (vm.client) {
      vm.client.end(function() {
        vm.isEndpointConnected = false;
        vm.status = '离线';
  
        // 打日志
        var date = new Date(Date.now());
        vm.endpointLog += date.toLocaleString() + '\n' + '终端断开连接.' + '\n';
        $log.debug('mqtt disconnect, ' + date.toLocaleString());

        vm.subscription = [];
        vm.input.pubTopic = '';
        vm.input.pubMessage = '';
        $scope.$apply();
      });
    }
  };

  $scope.$on('$destroy', function() {
    if (vm.client) {
      vm.client.end();
    }
  });

  vm.clearEndpointLog = function() {
    $log.debug('clear endpoint log.');
    vm.endpointLog = '';
  };

  vm.publish = function() {
    if (vm.input.pubTopic) {
      vm.pubMessage(vm.input.pubTopic, vm.input.pubMessage, {
        qos: parseInt(vm.input.pubQos),
        retain: Boolean(vm.input.pubRetain)
      });
    }
  };

  vm.pubMessage = function(topic, message, opts, callback) {
    if (vm.client) {
      vm.client.publish(topic, message, opts || {}, callback || function(err) {
        if (err) {
          // handle error
          $log.debug('publish error: ' + err);
        }else {
          // 打日志
          var date = new Date(Date.now());
          vm.endpointLog += date.toLocaleString() + '\n' + '发送消息 topic: ' + topic + '\n';
          $log.debug('mqtt publish, ' + date.toLocaleString());
        }
      });
    }
  }

  vm.subcribeMessage = function(topic, qos) {
    if (topic && qos) {
      vm.client.subscribe(topic, {qos: parseInt(qos)}, function(err, granted) {
        if (err) {
          // error handle
          $log.debug('subscribe error: ' + err);
        }else {
          vm.input.subTopic = '';
          vm.subscription = vm.subscription.concat(granted);
          // 打日志
          var date = new Date(Date.now());
          vm.endpointLog += date.toLocaleString() + '\n' + '订阅消息 topic: ' + topic + '\n';
          $log.debug('mqtt subscribe topic: ' + topic + ', ' + date.toLocaleString());
          $scope.$apply();
        }
      });
    }
  }

  vm.unSubscribe = function(topic, index) {
    if (topic) {
      vm.client.unsubscribe(topic, function(err) {
        if (err) {
          // error handle
          $log.debug('unsubscribe error: ' + err);
        }else {
          vm.subscription.splice(index, 1);
          $scope.$apply();
          $log.debug('unsubscribe success.');
        }
      });
    }
  }
}]);