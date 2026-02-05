<template>
    <div class="o-configuratorAcc -mixMatch">
        <accordion
            v-if="type !== 'Static' && servicesSucceeded"
            ref="accordion"
            arrow-size="-md"
            title-el="div"
            class="-config"
            :content-id="contentId"
            :toggle-id="toggleId"
            :visible="visible"
            @show="show"
            @hide="hide">

            <template v-slot:title>
                <span role="text">
                    {{ chooseLabel }}
                    <span class="text-gray-150 font-bold ml-10">{{ title }}</span>
                </span>
            </template>

            <template v-slot:icon="$accordion">
                <span class="text-2xl text-gray-150 leading-none">
                    <a-icon size="inherit" :class="[ $accordion.isOpened ? '-flip': '', $accordion.isReady ? '-transition' : '' ]">
                        keyboard_arrow_down
                    </a-icon>
                </span>
            </template>

            <div
                class="o-configuratorAcc__content"
                :aria-labelledby="toggleId">

                <ul class="o-configuratorAcc__list">
                    <li
                        v-for="(option, i) in options"
                        :key="option.FacetRefinerId"
                        class="o-configuratorAcc__item">

                        <m-product-quantity
                            :disabled="!!offsaleMessages[i]"
                            :image-url="!isPdp ? option.ShelfImage : option.PdpImage"
                            :image-alt="option.Title"
                            :offsale-message="offsaleMessages[i]"
                            :value="quantities[option.FacetRefinerId] || 0"
                            @input="quantity => onInput({ id: option.FacetRefinerId, quantity })">

                            <span v-html="option.Title"></span>
                        </m-product-quantity>
                    </li>
                </ul>

                <p class="o-configuratorAcc__total">
                    {{ totalLabel }} <span class="font-bold ml-10">{{ totalSelected }}</span>
                </p>
            </div>
        </accordion>
        <m-error-card v-if="!servicesSucceeded" :reload-text="servicesFailureReloadText" :text="servicesFailureText"></m-error-card>
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import safeId from '@common/source/js/vue/mixins/safe-id';

    export default {
        name: 'OConfiguratorAccMixMatch',
        mixins: [
            localizationMixin,
            safeId
        ],
        safeIds: [
            'toggleId',
            'contentId'
        ],
        props: {
            buttonStyle: {
                type: String,
                default: ''
            },
            chooseLabel: {
                type: String,
                default: ''
            },
            includesLabel: {
                type: String,
                default: ''
            },
            /**
             * fallback message to show for offsale
             * - shows if there is one or more SKUs associated with a refiner with different offsale messages
             */
            offsaleLabel: {
                type: String,
                default: 'Unavailable'
            },
            totalLabel: {
                type: String,
                default: ''
            },
            title: {
                type: String,
                required: true
            },
            isPdp: {
                type: Boolean,
                default: false
            },
            products: {
                type: Array,
                default: () => []
            },
            scriptId: {
                type: String,
                default: 'service-failure-configurator-pdp'
            },
            servicesSuccess: {
                type: Boolean,
                default: false
            },
            servicesErrorReloadText: {
                type: String,
                default: ''
            },
            servicesErrorText: {
                type: String,
                default: ''
            },
            type: {
                type: String,
                default: ''
            },
            /** @typedef {{ Title: string, FacetRefinerId: string, ShelfImage: string, PdpImage: string, Filters: Array }} Options */
            /** @type {Array<Options>} */
            options: {
                type: Array,
                required: true
            },
            /** @type {Object<string, Object<string, number>>} */
            selectedQuantities: {
                type: Object,
                default: () => {}
            },
            keepConfigurationOpen: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                visible: true,
                /**
                 * quantity to facet refiner id mapping
                 * @type {Object<string, Object<string, number>>}
                 */
                quantities: {},
                servicesSucceeded: false,
                servicesFailureReloadText: '',
                servicesFailureText: '',

                // dynamically generated Ids
                toggleId: '',
                contentId: ''
            };
        },
        computed: {
            offsaleMessages() {
                return this.options.map(option => {
                    const product = this.products.find(product => product.FacetRefiners.includes(option.FacetRefinerId));
                    return !!product.Offsale || product.IsSoldOut ? product.Offsale || this.offsaleLabel : '';
                });
            },
            totalSelected() {
                const values = Object.values(this.quantities);
                return values.length > 0 ? values.reduce((a, b) => a + b) : 0;
            }
        },
        watch: {
            selectedQuantities() {
                this.quantities = this.selectedQuantities;
            }
        },
        created() {
            this.$on('show', this.show);
            this.$on('hide', this.hide);
        },
        mounted() {
            this.quantities = this.selectedQuantities;

            // if we don't get a "Success" response, assume error:
            // n.b. the default value of `false` is the complete opposite to what we do in `product-details.vue` -- this is
            // intentional, due to the way the localization scripts for `product-details` are generated:
            this.servicesSucceeded = this.servicesSuccess || this.getLocalizationProp('Success', false);
            this.servicesFailureReloadText = this.servicesErrorReloadText || this.getLocalizationProp('ErrorButtonText', 'Reload Page');
            this.servicesFailureText = this.servicesErrorText || this.getLocalizationProp('GenericFailureMessage', 'This part of the page had trouble loading.');
        },
        methods: {
            show() {
                this.visible = true;
            },
            hide() {
                if(!this.keepConfigurationOpen) {
                    this.visible = false;
                }
            },
            onInput({ id, quantity }) {
                const quantities = { ...this.quantities };
                if(quantity > 0) {
                    quantities[id] = quantity;
                } else {
                    delete quantities[id];
                }
                this.quantities = quantities;

                this.$emit('input', {
                    quantities: this.quantities,
                    totalSelected: this.totalSelected
                });
            }
        }
    };
</script>
