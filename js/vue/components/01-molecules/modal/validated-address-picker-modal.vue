<template>
    <modal id="m-validatedAddressPickerModal" width="460px">
        <template v-slot:heading>
            <div class="text-dark font-bold text-4xl-2">{{ labels.ValidationTitle }}</div>
            <p v-if="hasMoreAvailableSuggestions" class="text-sm font-bold text-gray-120 mt-10">{{ labels.ValidationDescription }}</p>
            <p v-else class="text-sm font-bold text-gray-120 mt-10">{{ labels.ValidationAddressNotOnSystem }}</p>
        </template>

        <template v-slot:body>
            <div v-if="hasMoreAvailableSuggestions">
                <!-- Address entered -->
                <p class="text-base text-gray-120 font-bold pl-40">{{ labels.ValidationAddressEntered }}</p>
                <m-radio
                    v-model="radioSelectedIndex"
                    name="verifyAddress"
                    data-testid="radio-validateUserEnteredAddress"
                    :input-value="0"
                    :label="formattedUserEnteredAddressForModal"
                    mods="w-auto flex-1"
                    label-mods="-top"
                />

                <!-- Address suggested -->
                <p class="text-base text-gray-120 font-bold mt-25 pl-40">{{ labels.ValidationSuggested }}</p>
                <m-radio
                    v-for="(item, index) in formattedSuggestedAddressListForModal"
                    :key="item"
                    v-model="radioSelectedIndex"
                    name="verifyAddress"
                    data-testid="radio-validateSuggestedAddress"
                    :input-value="index + 1"
                    :label="item"
                    mods="w-auto flex-1"
                    label-mods="-top"
                />
                <div v-if="deliveryInstructionsData" class="mt-30 text-gray-120">
                    <p class="text-sm">{{ labels.ValidationDeliveryInstructions }}</p>
                    <p class="text-xs italic">{{ deliveryInstructionsData }}</p>
                </div>
            </div>

            <!-- No-suggestions variant: text only -->
            <div v-else>
                <p class="text-base text-gray-120 font-bold mt-15">{{ labels.ValidationAddressEntered }}</p>
                <span class="text-sm text-dark" v-html="formattedUserEnteredAddressForModal" />
                <div v-if="deliveryInstructionsData" class="mt-15 text-gray-120">
                    <p class="text-sm">{{ labels.ValidationDeliveryInstructions }}</p>
                    <p class="text-xs italic">{{ deliveryInstructionsData }}</p>
                </div>
            </div>
        </template>

        <template v-slot:footer>
            <!-- Suggestions: Use / Cancel -->
            <div v-if="hasMoreAvailableSuggestions" class="flex flex-col md:flex-row">
                <v-button
                    class="a-button justify-center text-base font-medium py-12 mb-20 md:mb-0 mr-0 md:mr-20 w-full"
                    data-testid="button-chooseValidateAddressModal"
                    @click="handleChooseAddress"
                >
                    {{ labels.ValidationUseThisAddress }}
                </v-button>
                <v-button
                    class="a-button justify-center text-base font-medium py-12 w-full -white"
                    data-testid="button-cancelValidateAddressModal"
                    @click="handleCancel"
                >
                    {{ labels.ValidationCancel }}
                </v-button>
            </div>

            <!-- No suggestions: Back / Use -->
            <div v-else class="flex flex-col md:flex-row">
                <v-button
                    class="a-button justify-center text-base font-medium py-12 mb-20 md:mb-0 mr-0 md:mr-20 w-full -white -experianModal"
                    data-testid="button-cancelValidateAddressModal"
                    @click="handleCancel"
                >
                    {{ labels.ValidationBack }}
                </v-button>
                <v-button
                    class="a-button justify-center text-base font-medium py-12 w-full"
                    data-testid="button-chooseValidateAddressModal"
                    @click="handleChooseAddress"
                >
                    {{ labels.ValidationUseThisAddress }}
                </v-button>
            </div>
        </template>
    </modal>
</template>

<script>
    export default {
        name: 'MValidatedAddressPickerModal',
        props: {
            deliveryInstructionsData: {
                type: String,
                default: ''
            },
            formattedSuggestedAddressListForModal: {
                type: Array,
                default: () => []
            },
            formattedUserEnteredAddressForModal: {
                type: String,
                default: ''
            },
            hasMoreAvailableSuggestions: {
                type: Boolean,
                default: false
            },
            labels: {
                type: Object,
                default: () => ({})
            },
            showModal: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                radioSelectedIndex: 1 // Default to validate API suggested address
            };
        },
        watch: {
            showModal(newVal) {
                if(newVal) {
                    this.$modal.show({ id: 'm-validatedAddressPickerModal' });
                    this.pushDataLayerEvent({
                        'event': 'userEvent',
                        'eC': 'Modals',
                        'eA': 'View',
                        'eL': this.labels?.ValidationTitle
                    });
                    // Reset radio selected
                    this.radioSelectedIndex = 1;
                }
            }
        },
        mounted() {
            this.$modal.$on.hide(() => {
                this.$emit('close');
            });
        },
        methods: {
            closeModal() {
                this.$modal.hide();
            },
            getAddressChosen() {
                if(this.hasMoreAvailableSuggestions) {
                    // 0 = user-entered; 1..N = suggestions
                    if(this.radioSelectedIndex > 0) {
                        this.pushDataLayerEvent({
                            'event': 'userEvent',
                            'eC': 'Suggested Address',
                            'eA': 'CTA',
                            'eL': this.radioSelectedIndex + 1
                        });
                        const addressChoseIndex = this.radioSelectedIndex - 1;
                        this.$emit('choseValidatedAddress', addressChoseIndex);
                    } else {
                        this.pushDataLayerEvent({
                            'event': 'userEvent',
                            'eC': 'Entered Address',
                            'eA': 'CTA',
                            'eL': 1
                        });
                        this.$emit('choseUserEnteredAddress');
                    }
                } else {
                    // No-suggestions → always use the user-entered address
                    this.pushDataLayerEvent({
                        'event': 'userEvent',
                        'eC': 'Entered Address',
                        'eA': 'CTA',
                        'eL': 1
                    });
                    this.$emit('choseUserEnteredAddress');
                }
                this.closeModal();
            },
            handleCancel(event) {
                this.closeModal();
            },
            handleChooseAddress(event) {
                this.getAddressChosen();
            },
            pushDataLayerEvent(eventData) {
                if(window.dataLayer) {
                    window.dataLayer.push(eventData);
                }
            }
        }
    };
</script>
