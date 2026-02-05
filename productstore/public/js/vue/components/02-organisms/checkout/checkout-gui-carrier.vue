<template>
    <div class="o-checkoutGuiCarrier">
        <component
            :is="useSequenceStyle ? 'o-checkout-sequence' : 'o-checkout-accordion'"
            v-if="guiCarrierTypes.length && selectedGui"
            :ref="useSequenceStyle ? 'sequence' : 'accordion'"
            :title="guiLabels.Title"
            container-type="fieldset"
            title-type="legend"
            :title-copy="titleCopy"
            :sequence-index="sequenceIndex"
            :script-id="scriptId"
            sequential-section-class-modifier="mb-0"
            sequential-title-class-modifier="mt-40"
        >
            <template v-slot:selected-title>
                <div class="font-bold text-lg">{{ getSelectedTitle }}</div>
            </template>
            <!-- Gui Carrier types -->
            <div
                v-for="(option) in guiCarrierTypes"
                :key="option.Type"
                class="o-checkoutAccordion__radio">
                <m-radio
                    v-model="selectedGui"
                    :input-value="option.Type"
                    :disabled="isCarrierTypeDisabled(option)"
                    name="CheckoutGuiCarrier"
                    mods="w-auto">
                    <div class="text-lg flex flex-col items-baseline sm:flex-row pr-5"><span class="pr-5">{{ guiLabels[option.Type] }}</span><span v-if="showCarrierValue(option)" class="text-md text-gray ">{{ option.Value }}</span></div>
                </m-radio>
            </div>
            <!-- Love donation code -->
            <div>
                <m-radio
                    v-model="selectedGui"
                    input-value="DonationCode"
                    :disabled="isDonationCodeDisabled"
                    name="CheckoutGuiCarrier"
                    mods="w-auto">
                    <div class="text-lg flex flex-col items-baseline md:flex-row pr-5"><span class="pr-5">{{ guiLabels.LoveCode }}</span><span v-if="showDonationValue" class="text-md text-gray">{{ donationCode.Value }}<span v-if="donationCode.CharityName" class="pl-5">{{ donationCode.CharityName }}</span></span></div>
                </m-radio>
                <p v-if="showDonationReminder" class="pl-36">{{ guiLabels.DonationReminder }}</p>
                <p v-if="hasWarning(donationCode)" class="pl-36 text-red">{{ guiLabels.LoveCodeWarning }}</p>
            </div>
            <div class="mt-30 ml-36">
                <a class="a-button -white rounded-md py-10 px-15 md:px-30 text-sm md:text-base font-medium tracking-wide" :aria-label="editGui.Text" :href="editGui.Url">{{ editGui.Text }}</a>
            </div>
        </component>
    </div>

</template>

<script>
    import { mapActions, mapGetters } from 'vuex';

    export default {
        name: 'OCheckoutGuiCarrier',

        props: {
            donationCode: {
                type: Object,
                default: function() {
                    return {};
                }
            },
            editGui: {
                type: Object,
                default: function() {
                    return {};
                }
            },
            guiCarrierTypes: {
                type: Array,
                default: function() {
                    return [];
                }
            },
            guiLabels: {
                type: Object,
                default: function() {
                    return {};
                }
            },
            isCorporate: {
                type: Boolean,
                default: false
            },
            scriptId: {
                type: String,
                default: ''
            },
            sequenceIndex: {
                type: Number,
                required: true
            },
            titleCopy: {
                type: String,
                default: ''
            },
            useSequenceStyle: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                selectedGui: null
            };
        },
        computed: {
            ...mapGetters('checkoutAccordions', ['onExpandGuiOption', 'onCollapseGuiOption']),

            isDonationCodeDisabled() {
                return this.isCorporate || !this.donationCode?.IsValid;
            },
            getSelectedTitle() {
                return this.selectedGui === 'DonationCode' ? this.guiLabels.LoveCode : this.guiLabels[this.selectedGui];
            },
            showDonationReminder() {
                return this.selectedGui === 'DonationCode' && !this.isCorporate;
            },
            showDonationValue() {
                return !this.isCorporate && this.donationCode?.Value && this.donationCode?.IsValid;
            }
        },
        watch: {
            selectedGui(newVal) {
                // Emit Gui carrier type as null if type is DonationCode
                const guiType = newVal === 'DonationCode' ? null : newVal;
                this.$emit('setGuiType', guiType);
                this.collapseGuiOption();
            }
        },
        created() {
            this.onExpandGuiOption(this.expand);
            this.onCollapseGuiOption(this.collapse);
            // Gui value needs to default to MelaleucaMembership on every checkout
            this.selectedGui = this.guiCarrierTypes[0]?.Type || '';
        },
        mounted() {
            if(this.useSequenceStyle) {
                this.completeSequence({
                    isActive: false,
                    index: this.sequenceIndex,
                    loading: false
                });
            }
        },
        methods: {
            ...mapActions('checkoutAccordions', ['collapseGuiOption']),
            ...mapActions('sequentialSections', ['completeSequence']),
            collapse() {
                if(this.$refs['accordion']) {
                    this.$refs['accordion'].$emit('hide');
                    this.$refs['accordion'].$emit('focus');
                }
            },
            expand() {
                if(this.$refs['accordion']) {
                    this.$refs['accordion'].$emit('show');
                    this.$refs['accordion'].$emit('focus');
                }
            },
            hasWarning(donationCode) {
                if(donationCode === null) {
                    return false;
                }

                return !donationCode?.IsValid && !this.isCorporate;
            },
            isCarrierTypeDisabled(option) {
                return (option.Type !== this.guiCarrierTypes[0].Type && this.isCorporate) || (option.Type !== this.guiCarrierTypes[0].Type && !option.Value);
            },
            showCarrierValue(option) {
                return !this.isCorporate && option.Value && option.Type !== this.guiCarrierTypes[0].Type;
            }
        }

    };
</script>
