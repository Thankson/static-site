<template>
    <div class="m-growSubscriptionButton">
        <div class="m-growSubscriptionButton__wrapper">
            <button
                :disabled="isSubscribing"
                :class="`
                    ${buttonClasses}
                    m-growSubscriptionButton__button
                `"
                :style="{
                    color: getLocalizationProp('Data.ButtonTextColor', '#ffffff'),
                    backgroundColor: getLocalizationProp('Data.ButtonBackgroundColor', '#30862D')
                }"
                @click="onSubscribeButtonClick"
            >
                {{ getLocalizationProp('Data.ButtonText') }}
            </button>
            <p
                v-if="isGrowError || showSignIMEAError"
                class="m-growSubscriptionButton__error"
                v-html="isGrowError ? subscriptionErrorMessage : errorText">
            </p>
        </div>
        <o-grow-subscription-modal ref="growSubscriptionModalRef" :script-id="scriptId" />
    </div>

</template>

<script>
    import OGrowSubscriptionModal from '@productstore/source/js/vue/components/02-organisms/modals/grow-subscription-modal.vue';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import { mapState, mapActions } from 'vuex';
    import replaceToken from '@common/source/js/vue/utils/replace-token';
    import api from '@api/routes/account/marketingexecutive';

    export default {
        name: 'MGrowSubscriptionButton',
        components: {
            OGrowSubscriptionModal
        },
        mixins: [ localizationMixin ],
        data() {
            return {
                urlId: null,
                isSubscribing: false,
                showSignIMEAError: false
            };
        },
        computed: {
            ...mapState('businessPreferences', ['isGrowSubscribed', 'growErrorMessages']),
            buttonClasses() {
                return this.getLocalizationProp('Data.ButtonClasses', '');
            },
            hasSignedIMEA() {
                return this.getLocalizationProp('Data.HasSignedImea', false) ?? false;
            },
            errorText() {
                const defaultMessage = this.getLocalizationProp('Data.ErrorText', '');

                if(!this.urlId && this.hasSignedIMEA) {
                    return defaultMessage;
                }

                return replaceToken(defaultMessage, this.urlId);
            },
            isGrowError() {
                return this.growErrorMessages?.length > 0;
            },
            subscriptionErrorMessage() {
                return this.getLocalizationProp('Data.SubscriptionErrorMessage', '');
            }
        },
        methods: {
            replaceToken,
            ...mapActions('businessPreferences', ['growSubscription']),
            /**
             * Get URL ID for token replacement
             * @description Calls the API to get the mobile invitation code
             * @returns {Promise<string>} The URL ID
             */
            async getUrlId() {
                const response = await api.get();
                if(response.success && response.data.Success) {
                    const data = response.data?.Data;
                    this.urlId = data?.mobileInvitationCode;
                }
                return this.urlId;
            },
            /**
             * Call post GrowSubscription API to initiate the subscription process
             * If response is success then Success subscription modal opens
             */
            async handleGrowSubscription() {
                try {
                    this.isSubscribing = true;

                    await this.growSubscription({
                        RequestType: 'Post'
                    });

                    if(this.isGrowSubscribed && !this.isGrowError) {
                        this.$refs.growSubscriptionModalRef.$modal.show();
                    }
                } finally {
                    this.isSubscribing = false;
                }
            },
            /**
             * Handles the click event on the subscribe button
             * @description If user has signed IMEA, it calls handleGrowSubscription, otherwise shows an error
             */
            async onSubscribeButtonClick() {
                if(this.hasSignedIMEA) {
                    this.handleGrowSubscription();
                } else {
                    await this.getUrlId();
                    this.showSignIMEAError = true;
                }
            }
        }
    };
</script>
