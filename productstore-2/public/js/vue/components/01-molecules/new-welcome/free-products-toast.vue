<template>
    <div class="m-freeProductsToast">
        <div class="m-freeProductsToast__content">
            <div v-if="loading">
                <a-loading-spinner :visible="loading" />
            </div>
            <div v-else>
                <h6 class="text-xl font-bold">{{ remainingAmount }} {{ getLocalizationProp('Labels.Remaining') }}</h6>
                <div v-if="productsAdded">
                    <div v-if="isPaying" class="text-sm text-blue italic">{{ getLocalizationProp('Labels.YouPay') }} {{ youPayAmount }}</div>
                    <a
                        class="a-button px-20 py-12 inline-block text-base font-medium mt-20"
                        :href="getLocalizationProp('Data.ViewCartLink.Url')">
                        {{ getLocalizationProp('Data.ViewCartLink.Text') }}
                    </a>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import { mapState, mapGetters } from 'vuex';

    export default {
        name: 'FreeProductsToast',
        mixins: [localizationMixin],
        computed: {
            ...mapState('cart', ['loading', 'summary']),
            ...mapGetters('cart', ['summary']),
            remainingAmount() {
                return this.summary?.WelcomeProgramLsdAvailable?.FormattedBalance;
            },
            isPaying() {
                return this.summary?.WelcomeProgramLsdAvailable?.YouPay > 0;
            },
            youPayAmount() {
                return this.summary?.WelcomeProgramLsdAvailable?.FormattedYouPay || '$0.00';
            },
            productsAdded() {
                return this.summary?.WelcomeProgramLsdAvailable?.Used > 0;
            }
        }
    };
</script>
