# ionic-light-switch
hybrid IOT client app built on cordova-based ionic framework

This is a mobile client to run on a phone as part of an AWS IoT solution.  The client subscribes to a devive shadow topic 
on the AWS IoT service.  The application is a hybrid mobile application built using the cordova-based Ionic Framework.  The client
can be run locally as a web app served on localhost using the ionic CLI.  Or, it can be built and run as an iOS or Android app 
in a simulator on the development machine or loaded to a real device.

The AWS IoT service provides a message service and framework for using a publish/subscribe model.  This eliminates the need for the user to open any firewall holes for direct communication from outside the home network.  Instead, this client listens for state changes on the device shadow topic that provides the device state.  When the user clicks to toggle the light, the mobile client publishes a message for "desired" state to the central AWS message queue.

The other application required to complete this solution is the node app running on the same device connected to the physical pool controller.  This client listens to the same device shadow on the AWS IoT service.  But rather than requesting changes, this client processes requested changes by actually changing the pool controller state using the REST api provided by nodejs-poolcontroller.  In this first incaranation, only the pool light can be toggled.  Upon successful execution of the REST call, the client publishes a message back to the device shadow to update the state to match the "desired" value.
