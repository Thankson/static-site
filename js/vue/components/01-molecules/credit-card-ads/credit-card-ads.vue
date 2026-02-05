<template>
    <component :is="isModal ? 'modal' : 'div'" :will-hide="() => update(false)">
        <div v-if="isVisible" ref="cCardBanner" :class="['m-creditCardAds', isModal ? 'm-creditCardAds modal' : '']" :style="isModal ? `background-color: ${backgroundColor}` : null">
            <div class="m-creditCardAds__wrapper" :style="!isModal ? `background-color: ${backgroundColor}` : null">
                <div class="m-creditCardAds__col">
                    <img class="m-creditCardAds__image" :src="adData.Image.Url" :alt="adData.Image.Alt" />
                </div>
                <div class="m-creditCardAds__col">
                    <div class="m-creditCardAds__header">
                        <h2 class="m-creditCardAds__title" v-html="title"></h2>
                        <p class="m-creditCardAds__subtitle" v-html="subTitle"></p>
                    </div>
                    <!-- CTA -->
                    <v-button
                        :cta="cta.Title"
                        :class="[ isLink ? 'm-creditCardAds__link' : 'm-creditCardAds__btn']"
                        :is-anchor="false"
                        :aria-label="cta.Title"
                        @click="update(true)" />
                    <button
                        v-if="isModal"
                        v-modal-hide
                        class="m-creditCardAds__link -close"
                        :aria-label="adData.NoThanks"
                        @click="updateInteraction('Rejected')">
                        {{ adData.NoThanks }}
                    </button>
                </div>
            </div>
        </div>
    </component>
</template>

<script>
    import { mapActions } from 'vuex';
    import popupApi from '@api/routes/productstore/creditcard/popup';
    import bannerApi from '@api/routes/productstore/creditcard/banner';
    import interactionApi from '@api/routes/productstore/creditcard/interaction';

    const APPLY_NOW = 'ApplyNow';
    const CHECKOUT = 'CheckoutMethodOfPayment';
    const DEFAULT = 'DefaultMethodOfPayment';

    export default {
        name: 'MCreditCardAds',
        props: {
            isModal: {
                type: Boolean,
                default: false
            },
            backgroundColor: {
                type: String,
                default: 'white'
            }
        },
        data() {
            return {
                adData: {
                    'Title': 'Youre missing out on <span>REWARDS!</span>',
                    'Subtitle': 'Earn 1% back in Loyalty Shopping Dollars on eligable purchases with the Melaleuca Mastercard credit card.',
                    'NoThanks': 'No thanks',
                    'Image': {
                        'Url': 'https://placehold.co/120x90.jpg',
                        'Alt': 'Visa card'
                    },
                    'Action': {
                        'Type': 'CheckoutMethodOfPayment',
                        'AdditionalData': {
                            'PaymethodId': 1234567,
                            'HasCard': false,
                            'ReceiptOrderType': '',
                            'Url': '',
                            'Title': 'Use my melaleuca visa'
                        }
                    }
                },
                fnboPayload: {},
                isVisible: false,
                localOrderId: this.orderId,
                interactionObj: {
                    Accepted: false,
                    Rejected: false,
                    Ignored: false
                },
                interactionPosted: false
            };
        },
        computed: {
            ccUrl() {
                return this.adData.Action.AdditionalData.Url;
            },
            cta() {
                return this.adData.Action.AdditionalData;
            },
            isLink() {
                const actionType = this.adData.Action.Type;
                let isLink = false;
                switch (actionType) {
                    case APPLY_NOW:
                        isLink = false;
                        break;
                    case CHECKOUT:
                        isLink = true;
                        break;
                    case DEFAULT:
                        isLink = true;
                        break;
                    default:
                        isLink = false;
                        break;
                }
                return isLink;
            },
            subTitle() {
                return this.adData.Subtitle;
            },
            target() {
                return this.adData.Action.AdditionalData.Target;
            },
            title() {
                return this.adData.Title;
            }
        },
        async mounted() {
            const isOrderFeedback = new URLSearchParams(window.location.search).get('showorderfeedback');

            this.$nextTick(async () => {
                const hasOrderFeedback = isOrderFeedback === 'true';

                // need to wait till update injected data isn't available
                const orderId = this.appData !== undefined ? this.appData?.orderId : null;
                let api = null;

                if(this.isModal) {
                    api = orderId || hasOrderFeedback ? popupApi.query({ orderId: orderId, showorderfeedback: true }) : popupApi.get();
                } else {
                    api = orderId || hasOrderFeedback ? bannerApi.query({ orderId: orderId, showorderfeedback: true }) : bannerApi.get();
                }

                await api.then((response) => {
                    this.isVisible = response.data.Success || response.Success;
                    this.adData = response.data.Data;

                    this.$nextTick(() => {
                        if(this.isVisible) {
                            this.openModal();
                        } else {
                            this.$destroy();
                        }
                    });
                });
            });
        },
        methods: {
            ...mapActions('checkoutAccordions', ['expandPaymentMethod']),
            ...mapActions('payAddress', ['setDefaultCard']),

            openModal: function() {
                this.$modal.show();
            },
            getBackTo () {
                return window.location.pathname;
            },
            goToPage() {
                const backTo = this.getBackTo();
                const redirectUrl = this.ccUrl + '?backTo=' + backTo;
                window.open(redirectUrl, this.target);
            },
            updateInteraction(val) {
                if(val === 'Rejected') {
                    // If user clicks on No Thanks
                    this.interactionObj.Rejected = true;
                } else if(val === 'Ignored' && !this.interactionObj.Rejected) {
                    // If user clicks on Close X
                    this.interactionObj.Ignored = true;
                } else if(val === 'Accepted') {
                    // If user clicks on Apply Now
                    this.interactionObj.Accepted = true;
                }
                // Avoid duplicate interaction posts
                if(!this.interactionPosted) {
                    interactionApi.post(this.interactionObj);
                    this.interactionPosted = true;
                }
            },
            async update(val) {
                const updateType = this.adData.Action.Type;
                const hasCard = this.adData.Action.AdditionalData.HasCard;
                const selection = val;

                // Pass BackTo parameter to cc landing page
                if(updateType === APPLY_NOW) {
                    if(selection) {
                        this.updateInteraction('Accepted');
                        this.goToPage();
                    } else {
                        this.updateInteraction('Ignored');
                    }
                }

                // CheckoutMethodOfPayment
                if(updateType === CHECKOUT) {
                    // open paywith accordion
                    if(hasCard) {
                        this.expandPaymentMethod();
                    } else {
                        this.goToPage();
                    }
                }

                // DefaultMethodOfPayment
                if(updateType === DEFAULT) {
                    // Set the paymethodId in additionalData as the default for additionalData.OrderType orders
                    if(hasCard) {
                        this.setDefaultCard({
                            paymentId: this.adData.Action.AdditionalData.PaymethodId,
                            hasProdServ: true,
                            otherDefaults: this.adData.Action.AdditionalData.ReceiptOrderType,
                            source: 'credit-ad'
                        });
                    } else {
                        this.goToPage();
                    }
                }
            }
        }
    };
</script>
