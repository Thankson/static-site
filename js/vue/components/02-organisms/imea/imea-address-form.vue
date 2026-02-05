<template>
    <o-imea-accordion
        :closed-heading="getLocalizationProp('Labels.ClosedHeading')"
        :is-collapse-always-open="isCollapseAlwaysOpen"
        :open-heading="getLocalizationProp('Labels.OpenHeading')"
        :remove-label="getLocalizationProp('Labels.Remove')"
        :subheading="getLocalizationProp('Labels.Subheading')"
        @set-is-collapse-open="setIsCollapseOpen"
        @set-is-chevron-focused="setIsChevronFocused"
    >
        <div class="o-imeaAddressForm pt-20">
            <ImeaAddressFormAu
                v-if="$env.Country === 'Australia'"
                :data="data"
                :labels="labels"
                :is-chevron-focused="isChevronFocused"
                :is-collapse-open="isCollapseAlwaysOpen || isCollapseOpen"
            />
            <ImeaAddressFormCa
                v-if="$env.Country === 'Canada'"
                :data="data"
                :labels="labels"
                :is-chevron-focused="isChevronFocused"
                :is-collapse-open="isCollapseAlwaysOpen || isCollapseOpen"
            />
            <ImeaAddressFormNz
                v-if="$env.Country === 'NewZealand'"
                :data="data"
                :labels="labels"
                :is-chevron-focused="isChevronFocused"
                :is-collapse-open="isCollapseAlwaysOpen || isCollapseOpen"
            />
            <!-- Improved MX address form vs Older version -->
            <template v-if="$env.Country === 'Mexico' && addressEntryEnhancementEnabled !== undefined">
                <ImeaAddressFormMxImprovedUx
                    v-if="addressEntryEnhancementEnabled"
                    :address-entry-enhancement-enabled="true"
                    :data="data"
                    :is-imea="true"
                    :labels="labels"
                    :is-chevron-focused="isChevronFocused"
                    :is-collapse-open="isCollapseAlwaysOpen || isCollapseOpen"
                />
                <ImeaAddressFormMx
                    v-else
                    :data="data"
                    :labels="labels"
                    :is-chevron-focused="isChevronFocused"
                    :is-collapse-open="isCollapseAlwaysOpen || isCollapseOpen"
                />
            </template>
            <ImeaAddressFormUs
                v-if="$env.Country === 'UnitedStates'"
                :data="data"
                :labels="labels"
                :is-chevron-focused="isChevronFocused"
                :is-collapse-open="isCollapseAlwaysOpen || isCollapseOpen"
            />
            <ImeaAddressFormJp
                v-if="$env.Country === 'Japan'"
                :data="data"
                :labels="labels"
                :is-chevron-focused="isChevronFocused"
                :is-collapse-open="isCollapseAlwaysOpen || isCollapseOpen"
            />
            <ImeaAddressFormIe
                v-if="$env.Country === 'Ireland'"
                :data="data"
                :labels="labels"
                :is-chevron-focused="isChevronFocused"
                :is-collapse-open="isCollapseAlwaysOpen || isCollapseOpen"
            />
            <ImeaAddressFormUkPl
                v-if="$env.Country === 'UnitedKingdom' || $env.Country === 'Poland'"
                :data="data"
                :labels="labels"
                :is-chevron-focused="isChevronFocused"
                :is-collapse-open="isCollapseAlwaysOpen || isCollapseOpen"
            />
            <ImeaAddressFormNlDeAtLt
                v-if="$env.Country === 'Netherlands' || $env.Country === 'Germany' || $env.Country === 'Austria' || $env.Country === 'Lithuania'"
                :data="data"
                :labels="labels"
                :is-chevron-focused="isChevronFocused"
                :is-collapse-open="isCollapseAlwaysOpen || isCollapseOpen"
            />
        </div>
    </o-imea-accordion>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import ImeaAddressFormAu from '../../01-molecules/imea/address-forms/imea-address-form-au.vue';
    import ImeaAddressFormCa from '../../01-molecules/imea/address-forms/imea-address-form-ca.vue';
    import ImeaAddressFormNz from '../../01-molecules/imea/address-forms/imea-address-form-nz.vue';
    import ImeaAddressFormMx from '../../01-molecules/imea/address-forms/imea-address-form-mx.vue';
    import ImeaAddressFormMxImprovedUx from '../../01-molecules/imea/address-forms/imea-address-form-mx-improved-ux.vue';
    import ImeaAddressFormUs from '../../01-molecules/imea/address-forms/imea-address-form-us.vue';
    import ImeaAddressFormJp from '../../01-molecules/imea/address-forms/imea-address-form-jp.vue';
    import ImeaAddressFormIe from '../../01-molecules/imea/address-forms/imea-address-form-ie.vue';
    import ImeaAddressFormNlDeAtLt from '../../01-molecules/imea/address-forms/imea-address-form-nl-de-at-lt.vue';
    import ImeaAddressFormUkPl from '../../01-molecules/imea/address-forms/imea-address-form-ukpl.vue';

    export default {
        name: 'OImeaAddressForm',
        components: {
            ImeaAddressFormAu,
            ImeaAddressFormCa,
            ImeaAddressFormIe,
            ImeaAddressFormJp,
            ImeaAddressFormMx,
            ImeaAddressFormMxImprovedUx,
            ImeaAddressFormNlDeAtLt,
            ImeaAddressFormNz,
            ImeaAddressFormUkPl,
            ImeaAddressFormUs
        },
        mixins: [localizationMixin],
        data() {
            return {
                isChevronFocused: null,
                isCollapseOpen: false
            };
        },
        computed: {
            data() {
                return this.localization?.Data || {};
            },
            // If ExpandBusinessAddressSection in localization data is true, pass to
            // parent ImeaAccordion component via is-collapse-always-open prop
            isCollapseAlwaysOpen() {
                return this.localization?.Data?.DisplaySettings?.ExpandBusinessAddressSection || false;
            },
            labels() {
                return this.localization?.Labels || {};
            },
            addressEntryEnhancementEnabled() {
                return this.data?.AddressEntryEnhancementEnabled;
            }
        },
        methods: {
            setIsChevronFocused(val) {
                this.isChevronFocused = val;
            },
            setIsCollapseOpen(val) {
                this.isCollapseOpen = val;
            }
        }
    };
</script>
