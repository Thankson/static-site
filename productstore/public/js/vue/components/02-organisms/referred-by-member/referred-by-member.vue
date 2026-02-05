<template>
    <div class="o-referredByMember">
        <div v-if="!isSubmitted" class="o-referredByMember__container">
            <h1 class="o-referredByMember__heading">
                {{ getLocalizationProp('Labels.Heading') }}
            </h1>
            <div class="o-referredByMember__radioRow">
                <m-radio
                    v-model="isReferredByMember"
                    :name="getLocalizationProp('Labels.YesRadioLabel')"
                    input-id="yesRadio"
                    :input-value="true"
                    :label="getLocalizationProp('Labels.YesRadioLabel')"
                    mods="w-auto"
                    label-mods="font-black"
                />
                <m-radio
                    v-model="isReferredByMember"
                    :name="getLocalizationProp('Labels.NoRadioLabel')"
                    input-id="noRadio"
                    :input-value="false"
                    :label="getLocalizationProp('Labels.NoRadioLabel')"
                    mods="w-auto"
                    label-mods="font-black"
                />
            </div>
            <div
                v-if="isReferredByMember"
                class="o-referredByMember__yesContainer"
            >
                <h2 class="o-referredByMember__yesHeading">
                    {{ getLocalizationProp('Labels.YesHeading') }}
                </h2>
                <div class="o-referredByMember__yesSubheading" v-html="getLocalizationProp('Labels.YesSubheadingRte')" />
            </div>
            <div
                v-if="isReferredByMember === false"
                class="o-referredByMember__noContainer"
            >
                <h2 class="o-referredByMember__noHeading">
                    {{ getLocalizationProp('Labels.NoHeading') }}
                </h2>
                <div class="o-referredByMember__noSubheading" v-html="getLocalizationProp('Labels.NoSubheadingRte')" />
                <MemberReferralForm
                    :labels="formLabels"
                    :consent="isConsentCheckboxCheckedByDefault"
                    :hide-zipcode="false"
                    :is-identification-validation="true"
                    @submit="handleSubmit"
                />
                <div v-if="errorMessage" class="o-referredByMember__errorContainer">
                    <p class="o-referredByMember__errorMessage">{{ errorMessage }}</p>
                </div>
                <div :class="[isLoading && 'o-referredByMember__loadingBackground']">
                    <div class="o-referredByMember__spinnerContainer">
                        <a-loading-spinner :visible="isLoading" />
                    </div>
                </div>
            </div>
        </div>

        <!-- Success Message -->
        <div v-if="isSubmitted" class="o-referredByMember__successContainer">
            <div class="o-referredByMember__successContent">
                <h2 class="o-referredByMember__successHeading">
                    {{ getLocalizationProp('Labels.SuccessHeading') }}
                </h2>
                <div class="o-referredByMember__successMessage" v-html="getLocalizationProp('Labels.SuccessMessage')" />
            </div>
        </div>
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import MemberReferralForm from '@productstore/source/js/vue/components/01-molecules/member-referral-form/member-referral-form.vue';
    import referralApi from '@api/routes/about/contact';

    export default {
        name: 'OReferredByMember',
        components: { MemberReferralForm },
        mixins: [localizationMixin],
        data() {
            return {
                errorMessage: '',
                isLoading: false,
                isReferredByMember: null,
                isSubmitted: false
            };
        },
        computed: {
            formLabels() {
                return this.localization?.Labels?.FormCopies || {};
            },
            isConsentCheckboxCheckedByDefault() {
                return this.localization?.Data?.ConsentCheckedByDefault || false;
            }
        },
        methods: {
            async handleSubmit(formData) {
                this.isLoading = true;
                this.errorMessage = ''; // Clear previous error message
                await this.saveCustomerContactReferral(formData);
                this.isLoading = false;
            },
            async saveCustomerContactReferral(formData) {
                const response = await referralApi.post({
                    ...formData
                });

                if(!response.success || !response.data.Success) {
                    this.errorMessage = response.data.ErrorMessages[0].Translation;
                    this.isSubmitted = false;
                } else {
                    this.isSubmitted = true;
                }
            }
        }
    };
</script>
