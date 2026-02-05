<template>
    <div>
        <o-access nav-class="hidden" :loading="loading" class="-showHead">
            <template v-slot:heading>
                {{ title }}
            </template>

            <template v-slot:step-1>
                <pre-auth-form v-model="form" :paymethodid="paymethodid" :script-id="scriptId" />
            </template>

            <template v-slot:step-2>
                <pre-auth-verify :form="form" :paymethodid="paymethodid" :data="data" :script-id="scriptId">
                    <template v-slot:description>
                        <p v-html="step2Desc"></p>
                    </template>

                    <template v-slot:field-label>
                        <span v-html="labels.EnterCodeInputName"></span>
                    </template>

                    <template v-slot:field-resend>
                        <span v-html="labels.ResendCode" />
                    </template>

                    <template v-slot:button-label>
                        {{ labels.SubmitCode }}
                    </template>

                    <template v-slot:note>
                        <span v-html="labels.NotReceiveCodeTips"></span>
                    </template>
                </pre-auth-verify>
            </template>
        </o-access>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import apiPaymentmethod from '@api/routes/preauth/paymentmethod';
    import PreAuthForm from './pre-auth-form.vue';
    import PreAuthVerify from './pre-auth-verify.vue';

    const stepDataMap = {
        1: { titleField: 'FirstStepTitle' },
        2: { titleField: 'SecondStepTitle' }
    };

    export default {
        name: 'PreAuthorization',
        components: {
            PreAuthForm,
            PreAuthVerify
        },
        mixins: [localizationMixin],
        props: {},
        data() {
            return {
                labels: {},
                data: {},
                loading: false,

                paymethodid: '',
                form: {
                    cardHolderValue: '',
                    cardNumberValue: '',
                    mobileNumberValue: '',
                    code: ''
                }
            };
        },
        computed: {
            ...mapGetters('access', ['active']),
            title() {
                return this.localization?.Data?.Form[
                    stepDataMap[this.active].titleField
                ];
            },
            step2Desc() {
                return this.labels?.EnterCodeTips?.replace(
                    '{0}',
                    this.form.mobileNumberValue
                );
            }
        },
        created() {},
        async mounted() {
            this.loading = true;
            this.labels = this.localization?.Labels || {};
            this.data = this.localization?.Data || {};

            const query = new URLSearchParams(window.location.search);
            this.paymethodid = query.get('paymethodid') || '';
            await this.getPaymentMethod(this.paymethodid);
            this.loading = false;
        },
        methods: {
            async getPaymentMethod(paymethodid) {
                const response = await apiPaymentmethod.query({paymethodid});
                const paymentMethod = response.data?.Data || {};
                const {
                    NameOnAccount: cardHolderValue = '',
                    LastFourDigitsOfAccount = '',
                    PayMethodType: accounttype
                } = paymentMethod;
                const cardNumberValue = LastFourDigitsOfAccount
                    ? `${'⋅⋅⋅⋅ '.repeat(3)}${LastFourDigitsOfAccount}`
                    : '';
                this.form = {
                    ...this.form,
                    cardHolderValue,
                    cardNumberValue,
                    accounttype,
                    mobileNumberValue: this.data?.PhoneNumber || ''
                };
            }
        }
    };
</script>
