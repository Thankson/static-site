<template>
    <div class="p-guiCodeEdit">
        <h1 class="p-guiCodeEdit__heading">
            {{ getLocalizationProp('Labels.Title') }}
        </h1>

        <div class="p-guiCodeEdit__content md:mb-12">
            <GuiConsolidation
                class="md:-mx-10"
                :cancel-label="getLocalizationProp('Labels.GUI.CancelLabel', 'Cancel')"
                :confirm-label="getLocalizationProp('Labels.GUI.ConfirmLabel', 'Confirm')"
                :desc-label="getLocalizationProp('Labels.GUI.ConsolidationText')"
                :error-label="getLocalizationProp('Labels.GUI.FailureMessage')"
                :modal-desc-label="getLocalizationProp('Labels.GUI.ModalDescription')"
                :modal-heading-label="getLocalizationProp('Labels.GUI.ModalTitle', 'Please Confirm')"
                :submission-url="getLocalizationProp('Data.GUIConsolidationURL', '')"
                :toggle-label="getLocalizationProp('Labels.GUI.ConsolidationButtonLabel', 'Gui Carrier Consolidation')"
            />
        </div>

        <div class="p-guiCodeEdit__content pb-50">
            <div class="md:inline-flex flex-col" aria-live="polite">
                <template v-if="!loading">
                    <GuiEditCarrierCode
                        :carrier-type="CARRIER_TYPES.MOBILE"
                        class="mt-7 md:mt-25"
                        :error-label="getLocalizationProp('Labels.MobileWarning')"
                        :input-label="getLocalizationProp('Labels.Mobile')"
                        :input-placeholder="getLocalizationProp('Labels.MobilePlaceholder')"
                        :input-value="mobileCode"
                        :is-readonly="isCorporate"
                        :submit-label="getLocalizationProp('Labels.Save')"
                        :success-label="getLocalizationProp('Labels.Success')"
                    />

                    <GuiEditCarrierCode
                        :carrier-type="CARRIER_TYPES.CDC"
                        :error-label="getLocalizationProp('Labels.CitizenDigitalCertificationWarning')"
                        :input-label="getLocalizationProp('Labels.CitizenDigitalCertification')"
                        :input-placeholder="getLocalizationProp('Labels.CitizenDigitalCertificationPlaceholder')"
                        :input-value="cdcCode"
                        :is-readonly="isCorporate"
                        :submit-label="getLocalizationProp('Labels.Save')"
                        :success-label="getLocalizationProp('Labels.Success')"
                    />

                    <GuiEditLoveCode
                        :carrier-type="CARRIER_TYPES.LOVE_CODE"
                        :error-label="getLocalizationProp('Labels.LoveCodeWarning')"
                        :input-label="getLocalizationProp('Labels.LoveCode')"
                        :input-placeholder="getLocalizationProp('Labels.LoveCodePlaceholder')"
                        :input-value="loveCode"
                        :is-readonly="isCorporate"
                        :no-results-label="getLocalizationProp('Labels.NoResults')"
                        :submit-label="getLocalizationProp('Labels.Save')"
                        :success-label="getLocalizationProp('Labels.Success')"
                    />
                </template>

                <div class="p-guiCodeEdit__loader">
                    <a-loading-spinner
                        :aria="false"
                        :visible="loading"
                    />
                </div>

                <div class="md:ml-auto">
                    <button
                        type="button"
                        class="p-guiCodeEdit__btn"
                        @click="onBack">

                        {{ getLocalizationProp('Labels.Back') }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import GuiConsolidation from '../../01-molecules/gui-consolidation/gui-consolidation.vue';
    import GuiEditCarrierCode from '../../01-molecules/gui-code-form/gui-edit-carrier-code.vue';
    import GuiEditLoveCode from '../../01-molecules/gui-code-form/gui-edit-love-code.vue';
    import guiApi from '@api/routes/account/customers/gui';

    const CARRIER_TYPES = {
        CDC: 'CitizenDigitalCertification',
        LOVE_CODE: 'LoveCode',
        MEMBERSHIP: 'MelaleucaMembership',
        MOBILE: 'Mobile'
    };

    export default {
        name: 'PGuiCarrierLoveCode',
        components: {
            GuiConsolidation,
            GuiEditCarrierCode,
            GuiEditLoveCode
        },
        mixins: [ localizationMixin ],
        data() {
            return {
                cdcCode: '',
                mobileCode: '',
                loveCode: '',
                loading: false
            };
        },
        computed: {
            isCorporate() {
                return this.getLocalizationProp('Data.IsCorporate', false);
            }
        },
        created() {
            // non-reactive const prop
            this.CARRIER_TYPES = CARRIER_TYPES;
        },
        mounted() {
            // Set values for non-corporate user
            if(!this.isCorporate) this.getGuiData();
        },
        methods: {
            async getGuiData() {
                this.loading = true;
                const response = await guiApi.get();
                if(response.success && response.data?.Success) {
                    const carriers = response.data.Data?.Carriers || [];
                    carriers.forEach((carrier) => {
                        if(carrier.Type === CARRIER_TYPES.CDC) {
                            this.cdcCode = carrier.Value;
                        } else if(carrier.Type === CARRIER_TYPES.MOBILE) {
                            this.mobileCode = carrier.Value;
                        }
                    });
                    const loveCodeValue = response.data.Data?.DonationCode;
                    this.loveCode = loveCodeValue ? `${loveCodeValue?.Value} ${loveCodeValue?.CharityName}` : '';
                }

                this.loading = false;
            },
            onBack() {
                window.history.back();
            }
        }
    };
</script>
