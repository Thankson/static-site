<template>
    <div
        v-if="getLocalizationProp('Labels.TermsandConditionsText')"
        class="o-accordionModal pt-10 text-xs italic text-gray-150">
        <button
            class="p-checkout__showTermsIntlButton"
            @click="showModal"
            v-html="getLocalizationProp('Labels.TermsandConditionsText')">
        </button>
        <span
            v-html="getLocalizationProp('Labels.TermsandConditionsDetails')">
        </span>

        <!-- International Terms & Conditions Modal-->
        <modal width="900px" heading-class="m-termsModal__heading">
            <template v-slot:heading>
                {{ accordionTitle }}
            </template>

            <template v-slot:body>

                <div class="o-accordion border-t-1 border-slate-300*">
                    <accordion
                        v-for="(item, index) in accordionItems"
                        ref="accordion" :key="item.gtmId"
                        class="o-accordion_title bg-slate-300"
                        :content-id="convertIndex(index)"
                        :toggle-id="`${index}__toggler`"
                        :gtm-toggle-id="convertGtm(item.GtmId)"
                        :aria-label="hasError ? errorAriaLabel : null"
                        mod-title="bg-white border-b-1 border-slate-300"
                        wrapper-mods="-checkout"
                        @show="(id) => [ collapseUnselected(id), isVisible = true]"
                        @hide="isVisible = false">

                        <!-- eslint-disable-next-line vue/no-unused-vars -->
                        <template v-slot:icon="$accordion">
                            <span class="o-accordion__icon">
                                <a-icon size="inherit">
                                    keyboard_arrow_down
                                </a-icon>
                            </span>
                        </template>

                        <!-- eslint-disable-next-line vue/no-unused-vars -->
                        <template v-slot:title="$accordion">
                            {{ item.Title }}
                        </template>

                        <div class="o-accordion__content pl-20 -accordionModal" v-html="item.Description">
                        </div>
                    </accordion>
                </div>
            </template>

            <template v-slot:footer>
                <button
                    v-modal-hide
                    type="button"
                    class="m-termsModal__footer a-button -white">
                    {{ closeButtonText }}
                </button>
            </template>
        </modal>
    </div>
</template>
<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import { mapGetters, mapMutations } from 'vuex';
    export default {
        name: 'OAccordionModal',
        mixins: [localizationMixin],
        props: {
            scriptId: {
                type: String,
                default: 'accordionModal'
            },
            hasError: {
                type: Boolean,
                default: false
            }

        },
        data() {
            return {
                isVisible: false
            };
        },
        computed: {
            ...mapGetters('checkoutAccordions', ['onOpenAccordionModal']),
            isShown() {
                return Boolean(this.getLocalizationProp('Data.Accordions', []));
            },
            accordionTitle() {
                return this.getLocalizationProp('Data.AccordionTitle', 'Customer Membership Agreement Terms & Conditions');
            },
            accordionItems() {
                return this.getLocalizationProp('Data.Accordions', []);
            },
            closeButtonText() {
                return this.getLocalizationProp('Labels.CloseButtonText', 'Close');
            }
        },
        methods: {
            ...mapMutations('checkout', ['SET_TERMS_MODAL']),
            collapseUnselected(currentButtonId) {
                this.$refs['accordion'].forEach((acc) => {
                    if(acc.toggleId !== currentButtonId) {
                        acc.isOpened = false;
                        acc.isToggled = false;
                    }
                });
            },
            showModal() {
                this.$modal.show();
            },
            convertGtm(gtmId) {
                return parseInt(gtmId);
            },
            convertIndex(index) {
                return `${index}`;
            },
            updateIsVisible(isVisible) {
                this.isVisible = !this.isVisible;
            }
        }
    };
</script>
