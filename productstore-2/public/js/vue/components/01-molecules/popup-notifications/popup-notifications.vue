<template>
    <div ref="popupNotification" class="m-popupNotif flex" data-testid="container-notificationsButton">
        <button
            class="mr-24 border-none relative"
            :aria-label="buttonAriaLabel"
            :aria-pressed="visible ? 'true' : 'false'"
            v-on:click.stop.prevent="togglePopUp('notifications', { id: 113, eL: 'Notifications' })"
        >
            <img
                :class="iconClasses"
                :alt="iconAlt"
                :src="buttonIcon"
            >
            <span v-if="notifierVisible" class="absolute bg-red block border border-white h-10 right-0 rounded-full top-0 w-10"></span>
        </button>
        <popup
            ref="notifications"
            mods="-notification -sm -right-1 top-40"
            arrow-mods="-filled -shadow absolute -top-13 right-30"
            :body-mods="bodyModifier"
            :footer-link="footerLink"
            :gtm-id="187"
            :footer-title="footerTitle"
            :header-title="label"
            :header-visible="true"
            :footer-visible="true"
            v-on:visibility="checkVisibility"
        >
            <slot name="notification-content" />
        </popup>
    </div>
</template>

<script>
    import togglePopUpMixin from '../../../mixins/toggle-popup';
    import eventBus from '../../../mixins/event-bus';
    import closest from '../../../utils/closest';

    export default {
        name: 'PopupNotifications',

        mixins: [ togglePopUpMixin ],

        props: {
            buttonAriaLabel: {
                type: String,
                default: null
            },
            footerLink: {
                type: String,
                default: ''
            },
            footerTitle: {
                type: String,
                default: 'See all'
            },
            icon: {
                type: String,
                default: null
            },
            iconAlt: {
                type: String,
                default: 'Notifications'
            },
            iconClasses: {
                type: String,
                default: 'md:block hidden max-w-30'
            },
            label: {
                type: String,
                default: 'Notifications'
            }
        },

        data: function() {
            return {
                shoppingid: '',
                bodyModifier: '',
                visible: false,
                notifierVisible: false,
                buttonIcon: null
            };
        },

        watch: {
            visible: function(val) {
                if(val) {
                    eventBus.$emit('retrieve-notifications');
                } else {
                    eventBus.$emit('hide-notifications');
                }
            }
        },

        mounted() {
            this.checkNoNotification();

            this.setEventBus();

            this.getIcon();
        },

        methods: {
            shouldClose: function() {
                if(this.visible) {
                    this.$parent.$emit('shouldClose');
                }
            },
            checkVisibility: function(val) {
                this.visible = val;
            },
            checkNoNotification: function() {
                if(document.querySelector('.m-noNotif')) {
                    this.bodyModifier = '-full';
                } else {
                    this.bodyModifier = '';
                }
            },
            setEventBus: function() {
                eventBus.$on('update-popup-notification', (payload) => {
                    if(payload) {
                        this.bodyModifier = payload.bodyModifier;
                        this.notifierVisible = payload.notifierVisible;
                    }
                });
            },
            getIcon() {
                if(this.$refs['popupNotification']) {
                    const parent = closest.getClosestParent(this.$refs['popupNotification'], '.o-siteHeader__col');

                    if(parent) {
                        // Get the icon from parent's data attribute
                        this.buttonIcon = parent.getAttribute('data-notification-icon');

                        // If the data attribute is empty, then get the icon from prop
                        if(!this.buttonIcon) {
                            this.buttonIcon = this.icon;
                        }
                    }
                }
            }
        }
    };
</script>
