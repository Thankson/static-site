<template>
    <modal
        id="direct-to-preferred-modal"
        width="630px"
        :will-hide="willHideModal"
    >
        <template v-slot:before>
            <div
                class="o-personalLink__loadingBackground absolute w-full h-full top-0 left-0 z-3"
                :class="[isLoading ? 'block': 'hidden']"
            >
                <div class="flex justify-center items-center h-full">
                    <a-loading-spinner :visible="isLoading" />
                </div>
            </div>
            <img
                class="absolute bottom-0 right-0"
                :src="data.Image && data.Image.Url"
                :alt="data.Image && data.Image.Alt"
            />
        </template>
        <template v-slot:heading>
            <h2 class="font-bold">
                {{ labels.MainHeading }}
            </h2>
        </template>
        <template v-slot:body>
            <div
                v-if="!skipStepOne && !isFormVisible"
                v-html="labels.StepOneSubheading"
            />
            <div v-if="isFormVisible">
                <div
                    class="mb-30"
                    v-html="labels.StepTwoSubheading"
                />
                <div
                    v-for="(checkbox, i) in checkboxesArray"
                    :key="`${checkbox.Name}-${i}`"
                    class="mb-20"
                    :data-testid="`div-directToPreferredModalCheckbox${checkbox.Name}`"
                >
                    <m-checkbox
                        v-model="checkboxesState[checkbox.Name]"
                        :aria-required="checkbox.Required"
                        aria-describedby="errorMessage"
                        :label="checkbox.Text"
                        :label-mods="`font-normal -items-start${
                            hasCheckboxError(checkbox.Name) ? ' -error' : ''
                        }`"
                    />
                </div>
                <p class="mt-5 text-gray leading-tight">{{ labels.Disclaimer }}</p>
            </div>
        </template>
        <template v-slot:footer>
            <button
                v-if="!skipStepOne && !isFormVisible"
                type="button"
                class="a-button relative mb-75 px-24 py-15 text-base leading-base sm:mb-6"
                data-testid="button-directToPreferredModalBecomeAMember"
                @click="isFormVisible = true;"
            >
                {{ labels.BecomeAMember }}
            </button>
            <div v-if="isFormVisible" class="relative sm:flex">
                <button
                    class="a-button block mb-20 py-15 px-24 text-base leading-base sm:mb-0 sm:mr-30"
                    :class="[!isValid && '-disabled']"
                    data-testid="button-directToPreferredModalSubmit"
                    @click="handleSubmit"
                >
                    {{ labels.Submit }}
                </button>
                <button
                    type="button"
                    class="a-button -white block py-15 px-24 text-base leading-base"
                    data-testid="button-directToPreferredModalCancel"
                    @click="closeModalAndReset"
                >
                    {{ labels.Cancel }}
                </button>
            </div>
            <div
                v-if="!isValid && $v.$dirty"
                role="alert"
                class="e-formError__item relative max-w-170 mt-16 text-red text-sm leading-base sm:max-w-full"
            >
                {{ errorMessage }}
            </div>
            <div
                v-if="hasApiPostError"
                role="alert"
                class="e-formError__item relative max-w-170 mt-16 text-red text-sm leading-base sm:max-w-full"
            >
                {{ labels.SubmitErrorMessage }}
            </div>
        </template>
    </modal>
</template>

<script>
    import apiGet from '@api/routes/customer/directtopreferredmodal';
    import apiPost from '@api/routes/customer/upgradeaccount';
    import { validationMixin } from 'vuelidate';

    export default {
        name: 'ODirectToPreferredModal',
        mixins: [validationMixin],
        validations() {
            const validations = {
                checkboxesState: {}
            };
            if(this.checkboxesArray?.length) {
                this.checkboxesArray.forEach(obj => {
                    if(obj.Required) {
                        validations.checkboxesState[obj.Name] = {
                            checked: value => !!value
                        };
                    }
                });
            }
            return validations;
        },
        data() {
            return {
                checkboxesArray: [],
                checkboxesState: {},
                data: {},
                hasApiPostError: false,
                isFormVisible: false,
                isLoading: false,
                isValid: false,
                labels: {},
                skipStepOne: false
            };
        },
        computed: {
            errorMessage() {
                // Grab the first error message from the array of objects since we only need one
                // BE should pass the same message in each checkbox object
                return this.checkboxesArray[0]?.RequiredErrorMessage || '';
            }
        },
        watch: {
            checkboxesState: {
                deep: true,
                handler(newVal) {
                    if(!this.checkboxesArray || !this.checkboxesArray.length) {
                        this.isValid = false;
                        return;
                    }
                    const requiredCheckboxes = this.checkboxesArray.filter(cb => cb.Required);
                    this.isValid =
                        requiredCheckboxes.length > 0 &&
                        requiredCheckboxes.every(cb => newVal[cb.Name] === true);
                    // Clear API error on any checkbox change
                    if(this.hasApiPostError) this.hasApiPostError = false;
                }
            }
        },
        async mounted() {
            window.showDirectToPreferredModal = async (arg) => {
                const options = typeof arg === 'boolean' ? { skipStepOne: arg } : (arg || {});
                const response = await apiGet.get();
                if(!response?.success) return;
                if(response?.success && response?.data?.Data) {
                    this.labels = response.data.Data.Labels;
                    this.data = response.data.Data.Data;
                }
                this.skipStepOne = options.skipStepOne ?? false;
                this.checkboxesArray = this.labels?.Checkboxes;
                if(this.checkboxesArray?.length) this.setCheckboxesToInitState();
                this.isFormVisible = this.skipStepOne;
                this.$modal.show({ id: 'direct-to-preferred-modal' });
            };
        },
        methods: {
            buildCheckboxPayload() {
                // Returns an object: { [checkbox.Name]: checkedState, ... }
                const payload = {};
                this.checkboxesArray.forEach(cb => {
                    payload[cb.Name] = !!this.checkboxesState[cb.Name];
                });
                return payload;
            },
            closeModalAndReset() {
                this.$modal.hide({ id: 'direct-to-preferred-modal' });
                this.resetModalState();
            },
            async handleSubmit() {
                this.$v.$touch();
                if(!this.$v.$invalid) {
                    this.isLoading = true;
                    // Build payload with checkbox Name as key and checked state as boolean
                    const payload = this.buildCheckboxPayload();
                    const response = await apiPost.post(payload);
                    if(response.success && response?.data?.Success) window.location.reload();
                    else this.hasApiPostError = true;
                    this.isLoading = false;
                }
            },
            hasCheckboxError(checkboxName) {
                const v = this.$v.checkboxesState[checkboxName];
                return v && v.$dirty && !v.checked;
            },
            resetModalState() {
                // Reset modal, error state after a short delay
                // (200ms - same length of time as the modal close CSS transition)
                setTimeout(() => {
                    this.$v.$reset();
                    this.isValid = false;
                    this.hasApiPostError = false;
                    this.isFormVisible = this.skipStepOne;
                    this.setCheckboxesToInitState();
                }, 200);
            },
            setCheckboxesToInitState() {
                this.checkboxesArray.forEach(obj => {
                    this.$set(this.checkboxesState, obj.Name, obj.Checked);
                });
            },
            willHideModal() {
                this.resetModalState();
                // Returning true closes modal
                return true;
            }
        }
    };
</script>
