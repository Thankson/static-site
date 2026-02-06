<template>
    <div class="o-enrollmentBuo">
        <!-- Title -->
        <h2 class="o-enrollmentBuo__title" v-html="getLabels(localization, 'Data.BackupOrderSection.Title')"></h2>

        <!-- Subtitle -->
        <div class="o-enrollmentBuo__subtitle" v-html="subtitle"></div>

        <div class="o-enrollmentBuo__columns">
            <!-- Image Column -->
            <div v-if="image && image.Url">
                <img
                    class="o-enrollmentBuo__img"
                    :src="image.Url"
                    :alt="image.Alt" />
            </div>

            <!-- RTE Column -->
            <div>
                <!-- Member's Choice - Title -->
                <h3
                    class="o-enrollmentBuo__memberChoiceTitle"
                    v-html="getLabels(localization, 'Data.BackupOrderSection.MembersChoiceOrderText')">
                </h3>

                <!-- Member's Choice - RTE -->
                <div class="o-enrollmentBuo__memberChoiceText" v-html="membersChoiceText"></div>

                <!-- Note Disclaimer -->
                <div
                    class="o-enrollmentBuo__disclaimer -note"
                    v-html="getLabels(localization, 'Data.BackupOrderSection.DisclaimerText')">
                </div>

                <!-- Checkbox -->
                <m-checkbox
                    v-model="membersChoiceValue"
                    name="members-choice"
                    :label="getLabels(localization, 'Data.BackupOrderSection.CheckBoxText', 'Checkbox')"
                    :label-mods="`text-dark font-normal leading-tight text-sm md:text-base -m-4 tracking-tight${showError && submitted ? ' -error' : ''}`"
                    :aria-required="true">
                </m-checkbox>

                <!-- CTA -->
                <div class="flex justify-end">
                    <button
                        class="o-enrollmentBuo__button a-button green"
                        type="button"
                        @click="submit">
                        {{ getLabels(localization, 'Labels.CTA.Continue') }}
                    </button>
                </div>

                <!-- Price Disclaimer -->
                <p
                    class="o-enrollmentBuo__disclaimer -price"
                    v-html="getLabels(localization, 'Data.BackupOrderSection.PriceDisclaimerText')">
                </p>

                <!-- Validation Error Message -->
                <div v-if="showError && submitted" id="members-choice-error" class="e-formError flex md:justify-end">
                    <p
                        class="e-formError__item pb-0"
                        role="alert"
                        v-html="getLabels(localization, 'Data.BackupOrderSection.ErrorMessage')">
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import labels from '@common/source/js/vue/mixins/api-localization';
    import { replaceTokenArray } from '@common/source/js/vue/utils/replace-token';

    export default {
        name: 'OEnrollmentBuoSection',
        mixins: [ labels ],
        props: {
            isCn: {
                type: Boolean,
                default: false
            },
            localization: {
                type: Object,
                default: () => {}
            }
        },
        data() {
            return {
                membersChoiceValue: null,
                showError: false,
                submitted: false
            };
        },
        computed: {
            commitmentPoints() {
                // TODO: PriceRange.RawMinPoints??
                return this.getLabels(this.localization, 'Data.BackupOrderSection.PriceRange.RawMinPoints');
            },
            commitmentPrice() {
                // TODO: PriceRange.PrimaryPreferredMemberSavings??
                return this.getLabels(this.localization, 'Data.BackupOrderSection.PriceRange.MinPreferredPrice');
            },
            image() {
                return this.getLabels(this.localization, 'Data.BackupOrderSection.Image', {});
            },
            membersChoiceText() {
                return replaceTokenArray(
                    this.getLabels(this.localization, 'Data.BackupOrderSection.MembersChoiceDetails'),
                    [this.commitmentPrice, this.commitmentPoints]
                );
            },
            subtitle() {
                return replaceTokenArray(
                    this.getLabels(this.localization, 'Data.BackupOrderSection.Subtitle'),
                    [this.commitmentPoints, this.commitmentPrice]
                );
            }
        },
        watch: {
            membersChoiceValue() {
                this.updateInfo({
                    model: 'membersChoiceValue',
                    value: this.membersChoiceValue
                });

                this.applyValidation();
            }
        },
        mounted() {
            // Set checkbox as NOT checked
            this.membersChoiceValue = false;
        },
        methods: {
            applyValidation() {
                this.showError = !this.membersChoiceValue;
            },
            submit(event) {
                event.preventDefault();

                this.submitted = true;

                this.applyValidation();

                if(!this.showError && this.membersChoiceValue) {
                    // Set BUO section as valid
                    this.$emit('validate-section', {
                        section: 'buo',
                        valid: true
                    });

                    // Go to next step
                    this.$emit('go-to-next');
                } else {
                    // Set BUO section as NOT valid
                    this.$emit('validate-section', {
                        section: 'buo',
                        valid: false
                    });
                }
            },
            updateInfo(payload) {
                this.$emit('update-info', {
                    ...payload
                });
            },
            replaceTokenArray
        }
    };
</script>
