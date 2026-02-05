<template>
    <div class="o-payment-methods-cn">
        <div class="o-payment-methods-cn__heading">{{ getLocalizationProp('Labels.TitleLabel') }}</div>
        <div class="o-payment-methods-cn__content">
            <div class="mx-auto" style="max-width: 300px;">
                <div
                    v-for="(method, index) in payMethodsSorted"
                    :key="index"
                    class="o-checkoutAccordion__radio">
                    <m-radio
                        v-model="selectedIndex"
                        :class="method.ClassMod"
                        name="PaymentMethod"
                        :input-value="index"
                        mods="w-auto flex-1"
                    >
                        <a-pay-label
                            :display-name="method.Text"
                            :image="method.Image"
                            :type="method.CollectionProcessorType"
                            :is-cn="true"
                        />
                    </m-radio>
                </div>
                <div class="o-payment-methods-cn__btn hidden md:block">
                    <v-button
                        class="h-full w-full justify-center"
                        @click="continueSubmit">
                        {{ getLocalizationProp('Labels.ButtonLabel') }}
                    </v-button>
                </div>
            </div>
        </div>

        <div class="o-payment-methods-cn__btn block md:hidden">
            <v-button
                class="h-full w-full justify-center"
                @click="continueSubmit">
                {{ getLocalizationProp('Labels.ButtonLabel') }}
            </v-button>
        </div>
    </div>
</template>

<script>
    import { mapActions, mapState } from 'vuex';
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'OPaymentMethodsCn',
        mixins: [ localizationMixin ],
        data() {
            return {
                selectedIndex: null,
                channel: '',
                defaultId: '',
                redirectUrl: ''
            };
        },
        computed: {
            ...mapActions('paymentMethod', ['getExternalPayMethod']),
            ...mapState('paymentMethod', ['storedExternalPayMethods']),

            payMethodsSorted() {
                let payMethods = this.storedExternalPayMethods?.PayMethods || [];

                return payMethods;
            }
        },
        watch: {
            payMethodsSorted() {
                if(this.selectedIndex === null) {
                    this.setSelectedIndex();
                }
            }
        },
        async mounted() {
            this.$store.commit('paymentMethod/SET_CN', true);

            // Get all external payment methods of the customer used in CN
            await this.getExternalPayMethod;

            this.setSelectedIndex();
            this.redirectUrl = this.storedExternalPayMethods.RedirectUrl;
        },
        methods: {
            setSelectedIndex() {
                const selectedIndex = this.payMethodsSorted.findIndex(method => method.IsDefault === true);
                this.selectedIndex = selectedIndex > -1 ? selectedIndex : 0;
            },
            continueSubmit() {
                window.location.href = this.redirectUrl + '?orderNumber=' + this.getQueryVariable('orderNumber') + '&payMethodId=' + this.payMethodsSorted[this.selectedIndex].PayMethodId;
            },
            getQueryVariable(variable) {
                let query = window.location.search.substring(1);
                let vars = query.split('&');
                for (var i = 0; i < vars.length; i++) {
                    var pair = vars[i].split('=');
                    if(pair[0] === variable) { return pair[1]; }
                }
                return false;
            }
        }
    };
</script>
