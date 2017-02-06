// Ionic Starter App

var AWS = require('aws-sdk');
var awsIot = require('aws-iot-device-sdk');

angular.module('starter.services', [])

.service('PoolSvc', function($rootScope) {
    console.log('init PoolSvc');
    var self = this;
    
    self.state = {};
    self.init = _initState;
    
    function _initState(state) {
        if (state) {
            if (state.reported && state.reported.hasOwnProperty('lightPower')) {
                console.info('Set LightPower to: ', state.reported.lightPower);
                this.state.lightPower = state.reported.lightPower;
            }
            if (state.reported && state.reported.hasOwnProperty('lightColor')) {
                console.info('Set LightColor to: ', state.reported.lightColor);
                this.state.lightColor = state.reported.lightColor;
            }
            $rootScope.$broadcast('PoolSVC::init');
        } else {
            throw new Error('PoolSvc: no state was provided for the update.');
        }
    }    
});