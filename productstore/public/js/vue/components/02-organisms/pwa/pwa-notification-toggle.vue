<template>
    <div v-if="showToggle" class="o-pwaNotificationToggle">
        <input
            id="pwa-allow-toggle"
            ref="notificationToggle"
            v-model="toggle"
            :checked="toggle"
            type="checkbox"
            class="m-inputToggle__input"
            @click="toggleNotifications"
        />
        <label for="pwa-allow-toggle" class="m-inputToggle__label">
            <div class="m-inputToggle__description ">
                <slot></slot>
            </div>
            <div class="m-inputToggle__toggler"></div>
        </label>
    </div>
</template>
<script>
    import api from '@api/routes/communications/pushnotification';

    export default {
        name: 'PwaNotificationToggle',
        data() {
            return {
                isChecked: true,
                showToggle: true,
                permissionGranted: false,
                toggle: false
            };
        },
        mounted() {
            this.isPwa();
        },
        methods: {
            deleteRegistration: function(_subscription) {
                let setToggle = this.setToggle;
                if(!_subscription) {
                    alert('Unable to unregister push notification.');
                    return;
                }

                // Unsubscribe `push notification`
                _subscription.unsubscribe()
                    .then(function () {
                        const deleteSubscription = _subscription.toJSON();
                        const deletePublicKey = deleteSubscription.keys.p256dh;
                        return api.delete({ PublicKey: deletePublicKey })
                            .then(function(response) {
                                setToggle(false);
                            });
                    })
                    .catch(function (error) {
                        console.error(error);
                    });
            },
            isPwa: function() {
                const isInStandaloneMode = () => (window.matchMedia('(display-mode: standalone)').matches) || (window.navigator.standalone) || document.referrer.includes('android-app://');
                if(isInStandaloneMode()) {
                    this.showToggle = true;
                }
            },
            isUserSubscribed: async function() {
                let setToggle = this.setToggle;
                let subscribePush = this.subscribePush;
                let getNotifications = this.retrieveNotifications;

                if(Notification.permission === 'denied') {
                    console.log('User blocked notifications');
                    return;
                }

                if(!('PushManager' in window)) {
                    console.log('Push notifications aren\'t supported');
                    return;
                }
                navigator.serviceWorker.ready
                    .then(function (registration) {
                        registration.pushManager.getSubscription()
                            .then(async function (subscription) {
                                // null = no subscription
                                if(subscription === null) {
                                    subscribePush();
                                } else {
                                    // If already access granted, enable push button status
                                    setToggle(true);
                                    ga('send', 'event', 'pushnotificationsSubscribed', 'clicked');// eslint-disable-line
                                    getNotifications();
                                }
                            })
                            .catch(function (error) {
                                console.error('Error occurred while enabling push ', error);
                            });
                    });
            },
            askPermission() {
                let _askedPermission = false;
                const isUserSubscribed = this.isUserSubscribed;
                new Promise(function(resolve, reject) {
                    const permissionResult = Notification.requestPermission(function(result) {
                        resolve(result);
                    });
                    if(permissionResult) {
                        permissionResult.then(values => {
                            if(values === 'granted') {
                                isUserSubscribed();
                            }
                        });
                    }
                }).then(function(permissionResult) {
                    if(permissionResult !== 'granted') {
                        throw new Error('We weren\'t granted permission.');
                    }
                });
                return _askedPermission;
            },
            retrieveSubscriptions: async function() {
                return new Promise(function(resolve, reject) {
                    return api.get()
                        .then(function(response) {
                            console.log('Notifications: ', response);
                            resolve(response);
                        })
                        .catch(function(error) {
                            console.log('No Messages: ', error);
                        });
                });
            },
            registerSubscription: async function(_subscription) {
                let setToggle = this.setToggle;
                const retrieveSubscriptions = this.retrieveSubscriptions;
                const subscriptionObj = _subscription.toJSON();
                const subscription = {
                    'PublicKey': subscriptionObj.keys.p256dh,
                    'NotificationEndpoint': subscriptionObj.endpoint,
                    'Auth': subscriptionObj.keys.auth,
                    'ExprirationTime': subscriptionObj.expirationTime,
                    'BrowserAgent': navigator.userAgent
                };

                console.log('Subscription: ', subscription);
                return new Promise(function(resolve, reject) {
                    return api.post(subscription)
                        .then(function(response) {
                            setToggle(true);
                            ga('send', 'event', 'pushnotificationsDismissed', 'clicked'); // eslint-disable-line
                            retrieveSubscriptions();
                            resolve(response);
                        })
                        .catch(function(error) {
                            setToggle(false);
                            ga('send', 'event', 'pushnotificationsDismissed', 'dismissed'); // eslint-disable-line
                            reject(error);
                        });
                });
            },
            setToggle(state) {
                this.toggle = state;
            },
            subscribePush: function() {
                let url = this.urlBase64ToUint8Array('BHmm1gW1B16O9Eo6NWzQiPjatr3OF39Hq8oJAaC58CmQXRcxFHVlourlFKbY-EZBXYt99S0F-J508TEyowg4qJo');
                let registerUser = this.registerSubscription;

                navigator.serviceWorker.ready.then(function (registration) {
                    if(!registration.pushManager) {
                        alert('Your browser doesn\'t support push notification.');
                        return false;
                    }
                    // To subscribe `push notification` from push manager

                    registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: url
                    })
                        .then(function (subscription) {
                            registerUser(subscription);
                        })
                        .catch(function (error) {
                            console.error('Push notification subscription error: ', error);
                        });
                });
            },
            toggleNotifications: function(e) {
                e.preventDefault();
                if(e.target.checked) {
                    this.askPermission();
                } else {
                    this.unsubscribePush();
                }
            },
            urlBase64ToUint8Array: function (base64String) {
                var padding = '='.repeat((4 - base64String.length % 4) % 4);
                var base64 = (base64String + padding)
                    // eslint-disable-next-line no-useless-escape
                    .replace(/\-/g, '+')
                    .replace(/_/g, '/');
                var rawData = window.atob(base64);
                return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
            },
            unsubscribePush: function() {
                let deleteUser = this.deleteRegistration;

                navigator.serviceWorker.ready
                    .then(function (registration) {
                        // Get `push subscription`
                        registration.pushManager.getSubscription()
                            .then(function (subscription) {
                                // If no `push subscription`, then return
                                deleteUser(subscription);
                            })
                            // eslint-disable-next-line handle-callback-err
                            .catch(function (error) {
                                console.error('Failed to unsubscribe push notification.');
                            });
                    });
            }
        }
    };
</script>
