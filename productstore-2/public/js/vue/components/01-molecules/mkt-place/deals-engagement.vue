<template>
    <div v-if="showComponent" class="m-mktDealsEngagement">
        <div class="m-mktDealsEngagement__row">
            <div class="m-mktDealsEngagement__col">
                <div class="m-mktDealsEngagement__wrapper">
                    <div class="m-rte" v-html="dealsDescription"></div>
                    <m-checkbox
                        v-model="$v.deals.$model"
                        name="deals"
                        :label="getLocalizationProp('Labels.DealsCheckbox', 'By checking Melaleuca Deals membership box, you agree')"
                        :label-mods="`-blue font-normal -m-4 md:text-base ${$v.deals.$error ? '-error': ''}`"
                        :aria-required="true"
                        @blur="showErrors">
                    </m-checkbox>
                    <div v-if="$v.deals.$error" id="deals-error" class="e-formError__item" role="alert">
                        {{ getLocalizationProp('Labels.Required', 'Required') }}
                    </div>
                </div>
                <div class="m-mktDealsEngagement__wrapper">
                    <div class="m-rte" v-html="getLocalizationProp('Data.CancelationDescription')"></div>
                    <m-checkbox
                        v-model="$v.cancelation.$model"
                        name="cancelation"
                        :label="getLocalizationProp('Labels.CancelationCheckbox', 'By checking cancel membership box, you agree')"
                        :label-mods="`-blue font-normal -m-4 md:text-base ${$v.cancelation.$error ? '-error': ''}`"
                        input-value="cancelation"
                        :aria-required="true"
                        @blur="showErrors">
                    </m-checkbox>
                    <div v-if="$v.cancelation.$error" id="cancelation-error" class="e-formError__item" role="alert">
                        {{ getLocalizationProp('Labels.Required', 'Required') }}
                    </div>
                </div>
                <div class="m-mktDealsEngagement__cta">
                    <v-button v-if="$v.deals.$invalid || $v.cancelation.$invalid" :class="addToCartStyles" @click="showErrors">
                        {{ getLocalizationProp('Labels.AddToCart', 'Add to cart') }}
                    </v-button>
                    <o-shelf-configurator
                        v-else
                        :class="addToCartStyles"
                        :aria-label="addToCartAriaLabel"
                        :sku="getLocalizationProp('Data.ProductData.Sku')"
                        :show-carousel-on-confirm="false">
                        {{ getLocalizationProp('Labels.AddToCart', 'Add to cart') }}
                    </o-shelf-configurator>
                </div>
            </div>
            <div class="m-mktDealsEngagement__col">
                <img :src="getLocalizationProp('Data.MobileImage.Url')" :alt="getLocalizationProp('Data.MobileImage.Alt')" class="md:hidden m-mktDealsEngagement__img">
                <img :src="getLocalizationProp('Data.DesktopImage.Url')" :alt="getLocalizationProp('Data.DesktopImage.Alt')" class="hidden md:block m-mktDealsEngagement__img">
            </div>
        </div>
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import { replaceTokenArray } from '@common/source/js/vue/utils/replace-token';
    import { validationMixin } from 'vuelidate';
    import { required } from 'vuelidate/lib/validators';
    import mktHelper from '@marketplace/source/js/vue/mixins/mkt-helper';

    export default {
        name: 'MMktDealsEngagement',
        mixins: [ localizationMixin, validationMixin, mktHelper],
        validations() {
            return {
                deals: {
                    required,
                    checked: value => {
                        if(value) {
                            return true;
                        }
                        return false;
                    }
                },
                cancelation: {
                    required,
                    checked: value => {
                        if(value) {
                            return true;
                        }
                        return false;
                    }
                }
            };
        },
        data() {
            return {
                cancelation: false,
                deals: false
            };
        },
        computed: {
            addToCartAriaLabel() {
                return this.getLocalizationProp('Labels.AddToCart', 'Add to cart') + this.getLocalizationProp('Data.ProductData.Name');
            },
            addToCartStyles() {
                return 'a-button -mkt font-base px-60 py-12 md:mt-20 hover:bg-blue-200 focus:bg-blue-200';
            },
            dealsDescription() {
                const rte = this.getLocalizationProp('Data.DealsDescription');
                const preferredPrice = this.getLocalizationProp('Data.ProductData.PriceRange.MaxPreferredPrice');
                const regularPrice = this.getLocalizationProp('Data.ProductData.PriceRange.MaxRegularPrice');
                return this.replaceTokenArray(rte, [preferredPrice, regularPrice]);
            }
        },
        methods: {
            replaceTokenArray,
            showErrors() {
                this.$v.$touch();
            }
        }
    };
</script>
