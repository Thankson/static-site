<template>
    <div class="m-notification" :class="modifierMolecule">
        <div class="m-notification__badge">
            <icon-badge
                :img-src="notification && notification.Icon && notification.Icon.Url"
                :img-alt="notification && notification.Icon && notification.Icon.Alt"
                :inline-style="iconBadgeInlineStyle">
            </icon-badge>
        </div>
        <div class="m-notification__message" :class="msgModifier">
            <p ref="notificationMessage" @click.once="dataLayerPush('CTA')" @click="clTrackPage" v-html="notification.Message"></p>
            <p v-if="notification.NotificationGroup" class="m-notification__time">
                {{ notification.NotificationGroup.DeliveredTimeString }}
            </p>
        </div>
        <div v-if="notification.CallToActionData || notification.CallToActionVideo" class="m-notification__action">
            <div v-if="notification.CallToActionData">
                <action-icon
                    :button-text="notification.CallToActionData.Description"
                    :sku="notification.CallToActionData.Sku || null"
                    :product-name="notification.CallToActionData.Title"
                    :family-id="notification.CallToActionData.ProductFamilyId"
                    :img-src="notification.CallToActionData.Icon && notification.CallToActionData.Icon.Url"
                    :img-alt="notification.CallToActionData.Icon && notification.CallToActionData.Icon.Alt"
                    :img-aria-hidden="false"
                    @data-layer-push="dataLayerPush"
                    @cl-track="clTrack">
                </action-icon>
            </div>
            <!--Video Modal Button - using L2E framework-->
            <div v-if="notification.CallToActionVideo">
                <o-video-modal-button
                    v-if="notification.CallToActionVideo.Data"
                    :id="notification.CallToActionVideo.Data.Id"
                    :allow-seek="notification.CallToActionVideo.Data.Video.VirtualVideo.AllowSeek || false"
                    :localization="notification.CallToActionVideo.Data.Localization"
                    :video-data="notification.CallToActionVideo.Data.Video.VirtualVideo"
                    :lte="hasLte"
                    :quiz="hasQuiz"
                    @data-layer-push="dataLayerPush"
                    @cl-track="clTrack"
                >
                    <span class="a-actionIcon -notificationVideo material-icons">play_arrow</span>
                </o-video-modal-button>
            </div>
            <!--Video Modal Button - using L2E framework-->
        </div>
        <button
            v-if="isPopup"
            v-show="!showLoading"
            class="m-notification__remove"
            :aria-label="removeBtnText"
            :title="removeBtnText"
            @click.prevent.once="dismiss('Remove')">
            <img :src="removeBtnIcon" :alt="removeBtnText" class="m-notification__img -remove" aria-hidden="true">
        </button>
        <a-loading-spinner
            v-if="isPopup && showLoading"
            :visible="showLoading"
            size="sm"
            class="m-notification__loading"
            aria-hidden="true">
        </a-loading-spinner>
    </div>
</template>

<script>
    import { mapState, mapActions } from 'vuex';

    export default {
        name: 'NotificationItem',

        props: {
            actionBtnText: {
                type: String,
                default: 'Close modal'
            },
            indexVideo: {
                type: Number,
                default: 0
            },
            isPopup: {
                type: Boolean,
                default: true
            },
            modifierMolecule: {
                type: String,
                default: null
            },
            notification: {
                type: Object,
                default () {
                    return {};
                }
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
            },
            delaySetDismissNotificationIds: {
                type: Array,
                default: () => []
            }
        },

        data: function() {
            return {
                msgModifier: '',
                showLoading: false
            };
        },

        computed: {
            ...mapState('notifications', ['storedDismissedNotifications']),

            iconBadgeInlineStyle() {
                if(this.notification.IconColor) {
                    return `background-color: ${this.notification.IconColor};`;
                }

                return null;
            },
            hasLte() {
                return this.notification?.CallToActionVideo?.Data?.Video?.LearnToEarn ?? {};
            },

            hasQuiz() {
                return this.notification?.CallToActionVideo?.Data?.Video?.LearnToEarn?.Quiz;
            },

            videoInformation() {
                let video = {};
                const CTAData = this.notification.CallToActionData;

                if(CTAData.Video) {
                    const notification = CTAData.Video;

                    video = {
                        culture: notification.Culture,
                        description: notification.Description,
                        fallbacks: notification.Fallbacks,
                        mediaId: notification.MediaId,
                        mediaItemName: notification.MediaItemName,
                        runTimeSeconds: notification.RuntimeSeconds,
                        subtitlePath: notification.SubtitlePath,
                        title: notification.Title,
                        thumbnailImageUrl: notification.ThumbnailImageUrl,
                        videoFolderPath: notification.VideoFolderPath
                    };
                }

                return video;
            }
        },

        methods: {
            ...mapActions('notifications', ['dismissNotification']),

            async dismiss(eventAction) {
                this.dataLayerPush(eventAction);

                if(this.notification.MessageId) {
                    this.msgModifier = '-loading';
                    this.showLoading = true;

                    await this.dismissNotification({
                        notificationID: this.notification.MessageId
                    });

                    if(this.enableNewWebalert) {
                        // If the message has been read, do not do cl data track
                        // delaySetDismissNotificationIds has already tracked.
                        const delayDismissNotification = this.delaySetDismissNotificationIds.find(item => item === this.notification.MessageId);
                        if(!delayDismissNotification) {
                            // convertlab data track
                            this.clTrackAction('c_open_webalert', {
                                c_webalert_templateid: this.notification.WebAlertTemplateId,
                                c_webalert_alerttype: 'WebAlert',
                                c_webalert_templatetype: this.notification.CallToActionType,
                                c_webalert_channel: '全渠道',
                                c_webalert_filtertype: this.notification.FilterType,
                                c_webalert_senddate: this.notification.NotificationGroup?.DeliveredTime,
                                c_webalert_browsechannel: '官网',
                                c_webalert_vediolink: this.notification.CallToActionVideo?.Data?.Id,
                                c_webalert_urllink: this.notification.CallToActionLink,
                                c_webalert_productsku: this.notification.CallToActionData?.Sku,
                                externalId: this.notification.MessageId
                            });

                            // GA
                            window.dataLayer && window.dataLayer.push({
                                'event': 'userEvent',
                                'eC': 'Web Alerts-CN',
                                'eA': 'View',
                                'eL': this.notification.Message
                            });
                        }
                    }

                    if(this.storedDismissedNotifications && this.storedDismissedNotifications.includes(this.notification.MessageId)) {
                        this.$emit('dismiss', this.notification);
                    } else {
                        this.msgModifier = '';
                        this.showLoading = false;
                    }
                }
            },
            dataLayerPush(eventLabel) {
                const impression = {
                    'event': 'Alerts Interactions',
                    'eC': 'Web Alerts Notifications',
                    'eA': eventLabel,
                    'eL': this.$refs.notificationMessage.innerText
                };

                window.dataLayer && window.dataLayer.push({...impression});
            },
            clTrack() {
                this.clTrackAction('c_click_webalert', {
                    c_webalert_templateid: this.notification.WebAlertTemplateId,
                    c_webalert_alerttype: 'WebAlert',
                    c_webalert_templatetype: this.notification.CallToActionType,
                    c_webalert_channel: '全渠道',
                    c_webalert_filtertype: this.notification.FilterType,
                    c_webalert_senddate: this.notification.NotificationGroup?.DeliveredTime,
                    c_webalert_browsechannel: '官网',
                    c_webalert_vediolink: this.notification.CallToActionVideo?.Data?.Id,
                    c_webalert_urllink: this.notification.CallToActionLink,
                    c_webalert_productsku: this.notification.CallToActionData?.Sku
                });

                // GA
                window.dataLayer && window.dataLayer.push({
                    'event': 'userEvent',
                    'eC': 'Web Alerts-CN',
                    'eA': 'Click',
                    'eL': this.notification.Message
                });
            },
            clTrackPage(e) {
                if(e.target.nodeName === 'A') {
                    this.clTrack();
                }
            }
        }
    };
</script>
