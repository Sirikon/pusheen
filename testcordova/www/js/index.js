/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

console.log('Yeah!');

function log(text){
    console.log('LOG: ' + text);
    var cosa = document.createElement('li');
    cosa.textContent = text;
    document.getElementById('log').appendChild(cosa);
}

log('Start!');

var successHandler = function(result){
    log('Success!: ' + result);
}

var errorHandler = function(error){
    log('Error: ' + error);
}

var tokenHandler = function(token){
    log('Token!: ' + token);
}

var pushNotification = null;
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');

        pushNotification = window.plugins.pushNotification;

        if ( device.platform.toLowerCase() == 'android' ){
            log('Android!');
            pushNotification.register(successHandler,errorHandler,{
                "senderID":"547949270294",
                "ecb":"onNotification"
            });
        } else {
            log('iOS!');
            pushNotification.register(tokenHandler,errorHandler,{
                "badge":"true",
                "sound":"true",
                "alert":"true",
                "ecb":"onNotificationAPN"
            });
        }
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

function onNotificationAPN(event){

    log('onNotificationAPN');

    if ( event.alert )
    {
        log(event.alert)
    }

    if ( event.badge )
    {
        log('Setting badge to: ' + event.badge);
        pushNotification.setApplicationIconBadgeNumber(successHandler, errorHandler, event.badge);
    }
}

function onNotification(e) {

    switch( e.event ) {

        case 'registered':
            if ( e.regid.length > 0 )
            {
                log(e.regid);
                log('Sending data to server');
                $.post('http://192.168.1.129:3000/devices', {token:'falsetoken1234',platform:'android',uuid:device.uuid,model:device.model,version:device.version},function(res){
                    log('Register:' + res);
                    console.log(res);
                });
            }
        break;

        case 'message':
            if ( e.foreground )
            {
                // log('NEW FOREGROUND NOTIFICATION');
            }
            else
            {
                if ( e.coldstart )
                {
                    log('NEW COLDSTART NOTIFICATION');
                }
                else
                {
                    log('NEW BACKGROUND NOTIFICATION');
                }
            }

            log(e.payload.title+': '+ e.payload.message);
        break;

        case 'error':
            log('Error: ' + e.msg);
        break;

        default:
            log('Error, something went wrong');
        break;
  }
}

app.initialize();