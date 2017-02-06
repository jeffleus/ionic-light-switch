// Ionic Starter App

var AWS = require('aws-sdk');
var awsIot = require('aws-iot-device-sdk');

angular.module('starter.controllers', [])

.controller('MainCtrl', function($scope, PoolSvc) {
    console.log('init MainCtrl');
    $scope.poolSvc = PoolSvc;
    $scope.$on('PoolSVC::init', function() {
        $scope.$apply();
    });
    
    var awsConfiguration = {
       poolId: 'us-west-2:0b1deaee-9d68-4ad9-a0c2-bb9a85bdf3f0', // 'YourCognitoIdentityPoolId'
       region: 'us-west-2' // 'YourAwsRegion', e.g. 'us-east-1'
    };
    var clientId = 'ionic-app-client-1';
    
    //
    // Initialize our configuration.
    //
    AWS.config.region = awsConfiguration.region;

    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
       IdentityPoolId: awsConfiguration.poolId
    });

    //
    // Create the AWS IoT device object.  Note that the credentials must be 
    // initialized with empty strings; when we successfully authenticate to
    // the Cognito Identity Pool, the credentials will be dynamically updated.
    //
    const mqttClient = awsIot.device({
       //
       // Set the AWS region we will operate in.
       //
       region: AWS.config.region,
       //
       // Use the clientId created earlier.
       //
       clientId: clientId,
       //
       // Connect via secure WebSocket
       //
       protocol: 'wss',
       //
       // Set the maximum reconnect time to 8 seconds; this is a browser application
       // so we don't want to leave the user waiting too long for reconnection after
       // re-connecting to the network/re-opening their laptop/etc...
       //
       maximumReconnectTimeMs: 8000,
       //
       // Enable console debugging information (optional)
       //
       debug: true,
       //
       // IMPORTANT: the AWS access key ID, secret key, and sesion token must be 
       // initialized with empty strings.
       //
       accessKeyId: '',
       secretKey: '',
       sessionToken: ''
    });

    //
    // Attempt to authenticate to the Cognito Identity Pool.  Note that this
    // example only supports use of a pool which allows unauthenticated 
    // identities.
    //
    var cognitoIdentity = new AWS.CognitoIdentity();
    AWS.config.credentials.get(function(err, data) {
       if (!err) {
          console.log('retrieved identity: ' + AWS.config.credentials.identityId);
          var params = {
             IdentityId: AWS.config.credentials.identityId
          };
          cognitoIdentity.getCredentialsForIdentity(params, function(err, data) {
             if (!err) {
                //
                // Update our latest AWS credentials; the MQTT client will use these
                // during its next reconnect attempt.
                //
                mqttClient.updateWebSocketCredentials(data.Credentials.AccessKeyId,
                   data.Credentials.SecretKey,
                   data.Credentials.SessionToken);
             } else {
                console.log('error retrieving credentials: ' + err);
                alert('error retrieving credentials: ' + err);
             }
          });
       } else {
          console.log('error retrieving identity:' + err);
          alert('error retrieving identity: ' + err);
       }
    });

    var topicUpdate = '$aws/things/LightSwitch/shadow/update';
    var topicUpdateAccept = '$aws/things/LightSwitch/shadow/update/accept';
    var topicUpdateReject = '$aws/things/LightSwitch/shadow/update/reject';
    var topicDelta = '$aws/things/LightSwitch/shadow/update/delta';
    var topicDocs = '$aws/things/LightSwitch/shadow/update/documents';
    var topicGetAccept = '$aws/things/LightSwitch/shadow/get/accepted';
    //
    // Install connect/reconnect event handlers.
    //
    mqttClient.on('connect', function() {
        console.log('connect');
        //
        // Subscribe to our current topic.
        //
        mqttClient.subscribe(topicUpdateAccept);
        mqttClient.subscribe(topicUpdateReject);
        mqttClient.subscribe(topicDelta);
        mqttClient.subscribe(topicDocs);
        mqttClient.subscribe(topicGetAccept);
        mqttClient.publish('$aws/things/LightSwitch/shadow/get', '');        
        //comment to test browserify
    });

    //mqttClient.on('reconnect', window.mqttClientReconnectHandler);
    mqttClient.on('message', function(topic, payload) {
        if (topic == topicDelta) {
            var data = JSON.parse(payload.toString());
            console.log('Circuit: ', 'lightPower', ' set to state: ', data.state.lightPower);
        };
        if (topic == topicGetAccept) {
            console.log('INIT POOL SVC: received the accepted GET response with state');
            PoolSvc.init(JSON.parse(payload.toString()).state);
        }
        console.log('message', topic, payload.toString());
    });
    
    $scope.setPoolLight = function(poolLight) {
        var requestedState = { "state": { "desired": { "lightPower": 0 } } };
        requestedState.state.desired.lightPower = poolLight;
        mqttClient.publish(topicUpdate, JSON.stringify(requestedState));
    }
    
});