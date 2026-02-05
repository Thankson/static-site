<template>
    <div class="o-checkoutFpxBanks" :class="{'-isOwingBalance': isOwingBalance}">
        <a-loading-spinner v-show="loading" class="ml-40" :visible="loading" />
        <div v-show="!loading" class="o-checkoutFpxBanks__row">
            <div class="o-checkoutFpxBanks__item">
                <label
                    class="o-checkoutFpxBanks__label"
                    :for="bankId">

                    {{ bankLabel }}
                </label>

                <v-select
                    :id="bankId"
                    ref="selectedBank"
                    :class="{ '-error': $v.$dirty && $v.selectedBank.$invalid }"
                    :options="bankText"
                    :values="bankValues"
                    :disables="bankDisables"
                    :initial="null"
                    :is-disabled="true"
                    :is-required="true"
                    select-mod="pl-14"
                    :aria-invalid="$v.$dirty && $v.selectedBank.$invalid"
                    arrow-other-mods="-filled w-0 h-0 absolute right-15 top-9 pointer-events-none md:top-8"
                    :aria-describedby="$v.$dirty && $v.selectedBank.$invalid ? bankErrorId : null"
                    @change="({ value }) => selectedBank = value"
                />
            </div>

            <span
                v-if="$v.$dirty && $v.selectedBank.$invalid"
                :id="bankErrorId"
                class="o-checkVirtual__error">

                {{ bankErrorLabel }}
            </span>
        </div>
    </div>
</template>

<script>
    import fpxBanksApi from '@api/routes/customeraccount/paymethods/banks';
    import { validationMixin } from 'vuelidate';
    import { required } from 'vuelidate/lib/validators';
    import safeId from '@common/source/js/vue/mixins/safe-id';
    import replaceToken from '@common/source/js/vue/utils/replace-token';

    export default {
        name: 'OCheckoutFpxBanks',
        mixins: [ safeId, validationMixin ],
        safeIds: [
            'bankId'
        ],
        validations() {
            return {
                selectedBank: { required }
            };
        },
        props: {
            bankErrorLabel: {
                type: String,
                default: 'Please select a bank.'
            },
            bankLabel: {
                type: String,
                default: 'Bank Choice'
            },
            bankPlaceholder: {
                type: String,
                default: 'Select Bank'
            },
            bankOfflineLabel: {
                type: String,
                default: '{0} (Offline)'
            },
            isOwingBalance: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                bankText: [],
                bankValues: [],
                bankDisables: [],
                bankOptions: [],
                loading: true,
                selectedBank: '',

                // dynamic ids
                bankId: '',
                bankErrorId: ''
            };
        },
        watch: {
            bankOptions() {
                this.prepareBankData();
            },
            selectedBank() {
                this.emitUpdate();
            }
        },
        created() {
            this.$on('show-error', this.showError);

            this.getBankNames();
        },
        methods: {
            emitUpdate() {
                this.$emit('update', {
                    bankId: this.selectedBank,
                    hasError: this.$v.$invalid
                });
            },
            async getBankNames() {
                const response = await fpxBanksApi.query({
                    country: this.$env?.Country,
                    IsVirtualAccountInstitution: true
                });

                if(response.success && response.data?.Success) {
                    this.bankOptions = response.data?.Data || [];
                }
            },
            prepareBankData() {
                this.bankText = [
                    this.bankPlaceholder,
                    ...this.bankOptions.map((option) => this.getBankName(option))
                ];

                this.bankValues = [
                    null,
                    ...this.bankOptions.map((option) => option.RoutingNumber)
                ];

                this.bankDisables = [
                    true,
                    ...this.bankOptions.map((option) => !option.IsAvailable)
                ];

                this.loading = false;
            },
            showError() {
                this.$v.$touch();

                if(this.$v['selectedBank'] && this.$v['selectedBank'].$invalid && this.$refs['selectedBank']) {
                    const el = this.$refs['selectedBank'];
                    if(el.nodeType === Node.ELEMENT_NODE || el._isVue) {
                        el.focus();
                    }
                }
            },
            getBankName(option) {
                if(option.IsAvailable) {
                    return option.Name;
                } else {
                    return replaceToken(this.bankOfflineLabel, option.Name);
                }
            }
        }
    };
</script>
