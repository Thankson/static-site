<template>
    <div class="o-sendMemberMessage">
        <div v-if="!isSubmitted" class="o-sendMemberMessage__container">
            <h1 class="o-sendMemberMessage__heading">
                {{ getLocalizationProp('Labels.Heading') }}
            </h1>
            <div
                class="o-sendMemberMessage__subheading"
                v-html="getLocalizationProp('Labels.SubheadingRte')"
            />
            <MemberReferralForm
                :labels="formLabels"
                :consent="isConsentCheckboxCheckedByDefault"
                :hide-zipcode="true"
                :is-identification-validation="false"
                @submit="handleSubmit"
            />
            <div :class="[isLoading && 'o-referredByMember__loadingBackground']">
                <div class="o-referredByMember__spinnerContainer">
                    <a-loading-spinner :visible="isLoading" />
                </div>
            </div>
        </div>
        <div v-if="isSubmitted" class="o-sendMemberMessage__successContainer">
            <h1 class="o-sendMemberMessage__successHeading">
                {{ getLocalizationProp('Labels.SuccessHeading') }}
            </h1>
            <div
                class="o-sendMemberMessage__successSubheading"
                v-html="getLocalizationProp('Labels.SuccessSubheadingRte')"
            />
            <a
                class="a-button o-sendMemberMessage__successCta"
                :href="getLocalizationProp('Labels.SuccessCtaUrl')"
            >
                {{ getLocalizationProp('Labels.SuccessCta') }}
            </a>
        </div>
    </div>
</template>

<script>
    import api from '@api/routes/about/contact';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import MemberReferralForm from '@productstore/source/js/vue/components/01-molecules/member-referral-form/member-referral-form.vue';

    export default {
        name: 'OSendMemberMessage',
        components: {MemberReferralForm},
        mixins: [localizationMixin],
        data() {
            return {
                isLoading: false,
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

                const response = await api.post(formData);

                if(response && response.success) {
                    this.isLoading = false;
                    this.isSubmitted = true;
                }
            }
        }
    };
</script>
