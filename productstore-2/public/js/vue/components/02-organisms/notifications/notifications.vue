<template>
    <div class="o-notifications" :class="modifierOrganism">
        <div class="o-notifications__wrapper">
            <ul v-if="notifications && notifications.length" class="o-notifications__list">
                <li v-for="notification in filteredNotifications" :key="notification.MessageId" class="o-notifications__item">
                    <notification-item
                        :action-btn-text="actionBtnText"
                        :index-video="getIndex(notification)"
                        :is-popup="isPopup"
                        :modifier-molecule="modifierMolecule"
                        :notification="notification"
                        :remove-btn-text="removeBtnText"
                        :remove-btn-icon="removeBtnIcon"
                        :enable-new-webalert="enableNewWebalert"
                        :delay-set-dismiss-notification-ids="delaySetDismissNotificationIds"
                        @dismiss="dismissNotification">
                    </notification-item>
                </li>
            </ul>
            <div v-else class="m-noNotif" :class="{'-popup' : isPopup}">
                <div class="m-noNotif__image" :style="noNotificationInlineStyle"></div>
                <h2 v-if="noNotificationTitle" class="m-noNotif__title">{{ noNotificationTitle }}</h2>
                <p v-if="noNotificationText" class="m-noNotif__text">{{ noNotificationText }}</p>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapState, mapMutations, mapActions } from 'vuex';
    import eventBus from '../../../mixins/event-bus';

    export default {
        name: 'Notifications', //eslint-disable-line

        props: {
            actionBtnText: {
                type: String,
                default: 'Close modal'
            },
            isPopup: {
                type: Boolean,
                default: true
            },
            modifierOrganism: {
                type: String,
                default: null
            },
            modifierMolecule: {
                type: String,
                default: null
            },
            noNotificationImage: {
                type: String,
                default: '//cdnsc1.melaleuca.com/na/images/common/no-notif-desktop.png'
            },
            noNotificationText: {
                type: String,
                default: 'Check back later for new notifications.'
            },
            noNotificationTitle: {
                type: String,
                default: 'You\'re All Caught Up'
            },
            removeBtnText: {
                type: String,
                default: 'Remove notification'
            },
            removeBtnIcon: {
                type: String,
                default: '//cdnsc1.melaleuca.com/na/images/common/trash.png'
            },
            enableNewWebalert: {
                type: Boolean,
                default: false
            }
        },

        data: function() {
            return {
                allNotifications: [],
                limit: 5,
                notifications: [],
                pointer: null,
                videosOnly: [],
                visible: false,
                delaySetDismissNotificationIds: [],
                isDismissPartialNotificationsFlag: false
            };
        },

        computed: {
            ...mapState('notifications', ['storedNotifications', 'storedDismissedNotifications']),

            filteredNotifications() {
                let unreadNotifications = [];
                if(this.allNotifications && Array.isArray(this.allNotifications)) {
                    if(this.isPopup) {
                        unreadNotifications = this.allNotifications.filter((item) => {
                            return !this.isDismissed(item);
                        });

                        return unreadNotifications.slice(0, this.limit);
                    } else {
                        return this.allNotifications;
                    }
                } else {
                    return [];
                }
            },

            filteredVideos() {
                if(this.allNotifications && Array.isArray(this.allNotifications)) {
                    // Get all videos notifications
                    this.allNotifications.filter(item => {
                        if(item.CallToActionData && item.CallToActionData.Video) {
                            this.videosOnly.push(item);
                        }
                    });
                    return this.videosOnly;
                } else {
                    return [];
                }
            },

            noNotificationInlineStyle() {
                if(this.noNotificationImage) {
                    return `background-image: url('${this.noNotificationImage}');`;
                }

                return null;
            }
        },

        watch: {
            filteredNotifications(newVal) {
                this.notifications = newVal;

                if(this.pointer === null) {
                    this.pointer = this.notifications.length - 1;
                }

                this.updatePopup();
            },

            storedNotifications: {
                deep: true,
                handler() {
                    this.parseAllNotifications();
                }
            },
            delaySetDismissNotificationIds() {
                if(this.enableNewWebalert && !this.visible) {
                    this.doDelaySetDismissNotifications();
                }
            }
        },

        mounted() {
            this.getNotifications({push: false});

            this.setEventBus();
        },

        methods: {
            ...mapMutations('notifications', ['SET_DISMISSED_NOTIFICATION']),
            ...mapActions('notifications', ['getNotifications', 'dismissPartialNotifications']),

            dismissNotification(notification) {
                this.notifications.filter((item, index) => {
                    if(item.MessageId === notification.MessageId) {
                        this.notifications.splice(index, 1);
                        this.getNextNotification();
                    }
                });
            },

            getIndex(el) {
                const videosArr = this.filteredVideos;
                const videoId = el.id;
                let myId = null;
                // Get index of the video
                for (let i = 0; i < videosArr.length; i++) {
                    if(videosArr[i].id === videoId) {
                        myId = i;
                        break;
                    }
                }
                return myId;
            },

            getNextNotification() {
                if(this.allNotifications && this.allNotifications[this.pointer + 1]) {
                    this.pointer++;

                    this.notifications.push(this.allNotifications[this.pointer]);
                }

                this.updatePopup();
            },

            isDismissed(notification) {
                return notification.ViewedTime || this.storedDismissedNotifications.includes(notification.MessageId);
            },

            parseAllNotifications() {
                if(this.storedNotifications) {
                    let alreadyExists = false;
                    const newNotifications = this.storedNotifications.filter((item) => {
                        alreadyExists = this.allNotifications.filter((i) => {
                            return i.MessageId === item.MessageId;
                        });

                        return !this.isDismissed(item) && !alreadyExists.length;
                    });

                    this.allNotifications = newNotifications.concat(this.allNotifications);
                } else {
                    this.allNotifications = [];
                }
            },

            setEventBus() {
                eventBus.$on('retrieve-notifications', async () => {
                    if(this.enableNewWebalert) {
                        this.visible = true;
                    }

                    await this.getNotifications({push: true});

                    if(this.enableNewWebalert && this.filteredNotifications?.length) {
                        /**
                         * Prevent users from frequently opening and closing popups, which may cause notification to be repeatedly marked as read and cl-data-tracked.
                         */
                        if(this.isDismissPartialNotificationsFlag) return;
                        this.isDismissPartialNotificationsFlag = true;

                        const filteredNotificationIds = this.filteredNotifications.map(i => i.MessageId);

                        await this.dismissPartialNotifications({
                            notificationIDs: filteredNotificationIds,
                            enableNewWebalert: this.enableNewWebalert
                        });

                        // convertlab data track
                        this.filteredNotifications.forEach(item => {
                            // If the message has been read, do not do cl data track
                            if(this.isDismissed(item)) return;
                            this.clTrackAction('c_open_webalert', {
                                c_webalert_templateid: item.WebAlertTemplateId,
                                c_webalert_alerttype: 'WebAlert',
                                c_webalert_templatetype: item.CallToActionType,
                                c_webalert_channel: '全渠道',
                                c_webalert_filtertype: item.FilterType,
                                c_webalert_senddate: item.NotificationGroup?.DeliveredTime,
                                c_webalert_browsechannel: '官网',
                                c_webalert_vediolink: item.CallToActionVideo?.Data?.Id,
                                c_webalert_urllink: item.CallToActionLink,
                                c_webalert_productsku: item.CallToActionData?.Sku,
                                externalId: item.MessageId
                            });
                        });

                        // GA
                        this.filteredNotifications.forEach(item => {
                            if(this.isDismissed(item)) return;
                            window.dataLayer && window.dataLayer.push({
                                'event': 'userEvent',
                                'eC': 'Web Alerts-CN',
                                'eA': 'View',
                                'eL': item.Message
                            });
                        });

                        /**
                         * `filteredNotificationIds` has been set as read through the api
                         * but in order to ensure that these notifications can be displayed in the popup at this time, the front-end delays the reading setting
                         *  */
                        this.delaySetDismissNotificationIds = filteredNotificationIds;

                        this.isDismissPartialNotificationsFlag = false;
                    }
                });

                if(this.enableNewWebalert) {
                    eventBus.$on('hide-notifications', () => {
                        this.visible = false;
                        this.doDelaySetDismissNotifications();
                    });
                }
            },
            doDelaySetDismissNotifications() {
                if(this.delaySetDismissNotificationIds?.length) {
                    this.SET_DISMISSED_NOTIFICATION({listNotificationID: this.delaySetDismissNotificationIds});
                    this.delaySetDismissNotificationIds = [];
                }
            },
            setNotifierVisible(visible = false) {
                if(visible) {
                    eventBus.$emit('update-popup-notification', {
                        bodyModifier: '',
                        notifierVisible: true
                    });
                } else {
                    eventBus.$emit('update-popup-notification', {
                        bodyModifier: '-full',
                        notifierVisible: false
                    });
                }
            },

            updatePopup() {
                if(this.isPopup) {
                    if(this.notifications.length) {
                        this.setNotifierVisible(true);
                    } else {
                        this.setNotifierVisible(false);
                    }
                }
            }
        }
    };
</script>
