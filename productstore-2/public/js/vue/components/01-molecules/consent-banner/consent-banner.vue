<template>
    <div v-if="isVisible" class="m-consentBanner">
        <div class="m-consentBanner__flexContainer">
            <div
                class="m-consentBanner__rte"
                v-html="getLocalizationProp('Labels.BannerRte')"
            />
            <div class="m-consentBanner__ctaContainer">
                <button
                    class="a-button -green m-consentBanner__cta -accept"
                    @click="handleAcceptClick"
                >
                    {{ getLocalizationProp('Labels.AcceptCta') }}
                </button>
                <button
                    class="a-button -white m-consentBanner__cta -reject"
                    @click="handleRejectClick"
                >
                    {{ getLocalizationProp('Labels.RejectCta') }}
                </button>
            </div>
        </div>
    </div>
</template>

<script>
    import giveConsentApi from '@api/routes/TrackingConsent/GiveConsent';
    import rejectConsentApi from '@api/routes/TrackingConsent/RejectConsent';
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'MConsentBanner',
        mixins: [localizationMixin],
        data() {
            return {
                isVisible: false
            };
        },
        computed: {
            customerId() {
                return this.$custInfo?.customerID || null;
            }
        },
        mounted() {
            if(document.cookie.indexOf('GDPR-Consent=') === -1) this.isVisible = true;
        },
        methods: {
            dataLayerPush(e) {
                window.dataLayer && window.dataLayer.push(
                    {
                        'event': 'userEvent',
                        'eC': 'CookieConsent',
                        'eA': 'CTA',
                        'eL': e.target?.innerText || ''
                    });
            },
            async handleAcceptClick(e) {
                this.dataLayerPush(e);
                const response = await giveConsentApi.put({customerId: this.customerId});
                this.handleResponse(response);
            },
            async handleRejectClick(e) {
                this.dataLayerPush(e);
                const response = await rejectConsentApi.put({customerId: this.customerId});
                this.handleResponse(response);
            },
            handleResponse(response) {
                if(response?.success && response?.data?.Success) {
                    this.isVisible = false;
                } else {
                    console.log('Error ->', response?.data?.ErrorMessages);
                }
            }
        }
    };
</script>
