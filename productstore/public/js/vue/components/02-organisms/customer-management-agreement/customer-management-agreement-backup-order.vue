<template>
    <div class="o-customerManagementAgreementBackupOrder flex flex-col items-center py-20 px-8 rounded border border-gray-50 bg-white md:flex-row md:items-start md:p-40 text-gray-150">
        <div class="md:w-1_2 md:pr-15">
            <img
                :alt="imgData.Alt"
                :src="imgData.Url"
            />
            <p class="mt-10 text-sm text-gray italic leading-base">
                {{ labels.Exception }}
            </p>
        </div>
        <div class="mt-40 md:w-1_2 md:mt-0 md:pl-15">
            <h2 class="mb-2 text-xl font-bold leading-base md:text-2xl">
                {{ labels.Heading }}
            </h2>
            <p
                class="leading-tight"
                v-html="backupOrderDescription"
            />
            <h3 class="mt-40 mb-20 text-xl font-bold leading-base">
                {{ labels.Subheading }}
            </h3>
            <m-checkbox
                id="acknowledgmentCheckbox"
                :label="acknowledgementLabel"
                :label-mods="`-cma font-normal -items-start ${hasError && '-error'}`"
                mod-class="-facet"
                :value="isCheckboxChecked"
                @input="handleCheckboxInput"
            />
            <p
                v-if="hasError"
                role="alert"
                class="mt-6 text-red text-sm leading-base"
            >
                {{ labels.Required }}
            </p>
            <button
                class="a-button -green -medium mr-10 leading-initial"
                :class="[hasError ? 'mt-20' : 'mt-40']"
                @click="handleFinishClick()"
            >
                {{ labels.Finish }}
            </button>
            <span>
                <a-loading-spinner
                    class="inline-block -m-0"
                    size="sm"
                    :visible="isLoading"
                />
            </span>
        </div>
    </div>
</template>

<script>
    import { replaceTokenArray } from '@common/source/js/vue/utils/replace-token';

    export default {
        name: 'OCustomerManagementAgreementBackupOrder',
        props: {
            commitmentValue: {
                type: String,
                default: ''
            },
            isLoading: {
                type: Boolean,
                default: false
            },
            labels: {
                type: Object,
                default: () => {}
            },
            imgData: {
                type: Object,
                default: () => {}
            },
            skuPrice: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                hasError: false,
                isCheckboxChecked: false
            };
        },
        computed: {
            acknowledgementLabel() {
                return this.labels?.Acknowledgment || '';
            },
            backupOrderDescription() {
                return this.replaceTokenArray(this.labels?.BodyRte, [this.skuPrice, this.commitmentValue]);
            }
        },
        mounted() {
            window.dataLayer && window.dataLayer.push({
                event: 'virtualPageview',
                pP: '/back-up-order-enrollment',
                pT: 'Enrollment BUO'
            });
        },
        methods: {
            replaceTokenArray,
            handleCheckboxInput(currentVal) {
                this.isCheckboxChecked = currentVal;
                if(currentVal) {
                    window.dataLayer && window.dataLayer.push({
                        event: 'userEvent',
                        eC: 'Enrollment Funnel',
                        eA: 'CTA',
                        eL: this.acknowledgementLabel
                    });
                    this.hasError = false;
                }
            },
            handleFinishClick() {
                if(!this.isCheckboxChecked) {
                    this.hasError = true;
                    return;
                }
                window.dataLayer && window.dataLayer.push({
                    event: 'userEvent',
                    eC: 'Enrollment Funnel',
                    eA: 'CTA',
                    eL: this.labels?.Finish
                });
                this.$emit('createCustomerWithBackupOrder');
            }
        }
    };
</script>
