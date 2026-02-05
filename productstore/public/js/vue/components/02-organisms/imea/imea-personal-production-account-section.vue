<template>
    <o-imea-accordion
        :closed-heading="getLocalizationProp('Labels.ClosedHeading')"
        :open-heading="getLocalizationProp('Labels.OpenHeading')"
        :remove-label="getLocalizationProp('Labels.Remove')"
        @set-is-collapse-open="setIsCollapseOpen"
    >
        <div class="o-imeaPersonalProductionAccount pt-20">
            <p v-html="labels.Text"></p>
            <m-checkbox
                ref="selfPurchaseProductPoints"
                v-model="hasDesignatedSelfAsPpa"
                class="mt-20 md:w-1_2"
                label-mods="font-normal -items-start"
                :aria-required="Boolean(false)"
                :label="selfPurchaseProductPointsLabel"
            />
            <m-checkbox
                ref="householdPurchaseProductPoints"
                v-model="hasDesignatedOtherAccounts"
                class="mt-20 md:w-1_2"
                label-mods="font-normal -items-start"
                :aria-required="true"
                :label="householdPurchaseProductPointsLabel"
            />
            <div v-if="hasDesignatedOtherAccounts">
                <div
                    v-for="(household, index) in households"
                    :key="household.Id"
                    class="flex flex-col md:flex-row md:w-3_4 mt-40"
                >
                    <!-- First Name -->
                    <div>
                        <label
                            class="uppercase text-sm"
                            :for="`household${index}firstName`"
                            v-html="
                                `${labels.HouseholdFirstName.Text}${
                                    labels.HouseholdFirstName.Required
                                        ? requiredSpan
                                        : ''
                                }`
                            "
                        >
                        </label>
                        <input-basic
                            :id="`household${index}firstName`"
                            v-model="household.FirstName"
                            :tailwind-mods="
                                $v.households.$each[index].FirstName.$error
                                    ? '-isInvalid'
                                    : null
                            "
                            :name="`household${index}firstName`"
                            :placeholder="labels.HouseholdFirstName.Placeholder"
                            max-length="100"
                            aria-required="true"
                            :aria-invalid="
                                $v.households.$each[index].FirstName.$error
                            "
                            :aria-describedby="
                                $v.households.$each[index].FirstName.$error
                                    ? `household${index}firstNameErrorMsg`
                                    : false
                            "
                        />
                        <FormFieldErrorMessage
                            :id="`household${index}firstNameErrorMsg`"
                            :is-visible="
                                $v.households.$each[index].FirstName.$error
                            "
                            :msg="
                                labels.HouseholdFirstName.RequiredErrorMessage
                            "
                            modifier-classes="-no-icon"
                        />
                    </div>
                    <!-- Last Name -->
                    <div class="my-20 md:mx-30 md:my-0">
                        <label
                            class="uppercase text-sm"
                            :for="`household${index}lastName`"
                            v-html="
                                `${labels.HouseholdLastName.Text}${
                                    labels.HouseholdLastName.Required
                                        ? requiredSpan
                                        : ''
                                }`
                            "
                        >
                        </label>
                        <input-basic
                            :id="`household${index}lastName`"
                            v-model="household.LastName"
                            :tailwind-mods="
                                $v.households.$each[index].LastName.$error
                                    ? '-isInvalid'
                                    : null
                            "
                            :name="`household${index}lastName`"
                            :placeholder="labels.HouseholdLastName.Placeholder"
                            max-length="100"
                            aria-required="true"
                            :aria-invalid="
                                $v.households.$each[index].LastName.$error
                            "
                            :aria-describedby="
                                $v.households.$each[index].LastName.$error
                                    ? `household${index}lastNameErrorMsg`
                                    : false
                            "
                        />
                        <FormFieldErrorMessage
                            :id="`household${index}lastNameErrorMsg`"
                            :is-visible="
                                $v.households.$each[index].LastName.$error
                            "
                            :msg="labels.HouseholdLastName.RequiredErrorMessage"
                            modifier-classes="-no-icon"
                        />
                    </div>
                    <!-- Phone number -->
                    <div>
                        <label
                            class="uppercase text-sm"
                            :for="`household${index}phoneNumber`"
                            v-html="
                                `${labels.HouseholdPhoneNumber.Text}${
                                    labels.HouseholdPhoneNumber.Required
                                        ? requiredSpan
                                        : ''
                                }`
                            "
                        >
                        </label>
                        <input-basic
                            :id="`household${index}phoneNumber`"
                            v-model="household.PhoneNumber"
                            :tailwind-mods="
                                $v.households.$each[index].PhoneNumber.$error
                                    ? '-isInvalid'
                                    : null
                            "
                            :name="`household${index}phoneNumber`"
                            :placeholder="labels.HouseholdPhoneNumber.Placeholder"
                            aria-required="true"
                            :aria-invalid="
                                $v.households.$each[index].PhoneNumber.$error
                            "
                            :aria-describedby="
                                $v.households.$each[index].PhoneNumber.$error
                                    ? `household${index}phoneNumberErrorMsg`
                                    : false
                            "
                        />
                        <FormFieldErrorMessage
                            :id="`household${index}phoneNumberErrorMsg`"
                            :is-visible="
                                $v.households.$each[index].PhoneNumber.$error
                            "
                            :msg="
                                labels.HouseholdPhoneNumber.RequiredErrorMessage
                            "
                            modifier-classes="-no-icon"
                        />
                    </div>
                </div>
                <!-- Add Additional Button -->
                <button
                    v-if="households.length < 3"
                    class="text-green text-sm underline uppercase mt-40"
                    :aria-label="labels.AddAdditionalHousehold"
                    type="button"
                    @click="addAdditionalHousehold"
                >
                    <span>+</span>
                    {{ labels.AddAdditionalHousehold }}
                </button>
            </div>
        </div>
    </o-imea-accordion>
</template>
<script>
    import eventBus from '../../../mixins/event-bus';
    import FormFieldErrorMessage from '../../01-molecules/form-field-error-message/FormFieldErrorMessage.vue';
    import formHelper from '@common/source/js/vue/utils/form-helper';
    import getCountryCode from '@common/source/js/utils/get-country-code';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import { validationMixin } from 'vuelidate';
    import { required } from 'vuelidate/lib/validators';
    import uniqid from 'uniqid';

    export default {
        name: 'OImeaPersonalProductionAccountSection',
        components: {
            FormFieldErrorMessage
        },
        mixins: [localizationMixin, validationMixin],
        validations() {
            const validations = {
                households: {
                    $each: {
                        FirstName: { required },
                        LastName: { required },
                        PhoneNumber: {
                            required,
                            phone: phoneNumber => {
                                if(phoneNumber === null) return false;
                                return formHelper.isValidPhoneNumber(
                                    phoneNumber,
                                    this.countryCode
                                );
                            }
                        }
                    }
                }
            };
            return validations;
        },
        data() {
            return {
                hasDesignatedOtherAccounts: false,
                hasDesignatedSelfAsPpa: false,
                households: [],
                isCollapseOpen: false,
                isInputClear: false
            };
        },
        computed: {
            countryCode() {
                return getCountryCode(this.$env.Country)?.toLowerCase();
            },
            labels() {
                return this.localization?.Labels || {};
            },
            requiredSpan() {
                return `<span>*</span>`;
            },
            selfPurchaseProductPointsLabel() {
                return this.labels?.SelfPurchaseProductPointsCheckbox?.Text || '';
            },
            householdPurchaseProductPointsLabel() {
                return this.labels?.HouseholdPurchaseProductPointsCheckbox?.Text || '';
            }
        },
        watch: {
            // Clear the form fields when the accordion is collapsed
            isCollapseOpen(newVal) {
                this.isInputClear = !newVal;
            },
            isInputClear(newVal) {
                if(newVal) {
                    this.$v.$reset();
                    this.hasDesignatedOtherAccounts = false;
                    this.hasDesignatedSelfAsPpa = this.labels?.SelfPurchaseProductPointsCheckbox?.Checked;
                }
            },
            hasDesignatedOtherAccounts(newVal) {
                this.households = newVal
                    ? [
                        {
                            Id: uniqid(),
                            FirstName: '',
                            LastName: '',
                            PhoneNumber: ''
                        }
                    ]
                    : (this.$v.$reset(), []);
            }
        },
        mounted() {
            this.hasDesignatedSelfAsPpa = this.labels?.SelfPurchaseProductPointsCheckbox?.Checked;
            this.hasDesignatedOtherAccounts = this.labels?.HouseholdPurchaseProductPointsCheckbox?.Checked;
        },
        created() {
            this.setFormValidations();
        },
        beforeDestroy() {
            eventBus.$off('validate');
        },
        methods: {
            addAdditionalHousehold() {
                this.households = [
                    ...this.households,
                    {
                        Id: uniqid(),
                        FirstName: '',
                        LastName: '',
                        PhoneNumber: ''
                    }
                ];
            },
            setFormValidations() {
                eventBus.$on('validate', () => {
                    if(this.isCollapseOpen) {
                        this.$v.$touch();
                        if(!this.$v.$invalid) {
                            // create a new array omitting Ids as Ids are unnecessary for the API
                            const PersonalProductionAccountContacts = this.households.map(({ Id, ...rest }) => rest);
                            const formInputs = {
                                ...(this.households.length > 0 && {
                                    PersonalProductionAccountContacts
                                }),
                                HasDesignatedSelfAsPpa: this.hasDesignatedSelfAsPpa,
                                HasDesignatedOtherAccounts: this
                                    .hasDesignatedOtherAccounts
                            };
                            eventBus.$emit('getInput', formInputs, true);
                        } else eventBus.$emit('getInput', false, false);
                    } else eventBus.$emit('getInput', false, true);
                });
            },
            setIsCollapseOpen(val) {
                this.isCollapseOpen = val;
            }
        }
    };
</script>
