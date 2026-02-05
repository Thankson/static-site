<template>
    <p
        v-if="showPreAuthStatus"
        class=" flex text-sm leading-tight"
        :class="[info.PreAuthStatus ? 'text-green' : 'text-red']"
    >
        <span
            class="font-material text-xs mr-3 mt-2 leading-base"
            aria-hidden="true"
        >
            {{ info.PreAuthStatus ? 'check_circle_outline' : 'error_outline' }}
        </span>
        <span role="text">
            <span v-if="info.PreAuthStatus" class="text-gray">
                {{ getLocalizationProp('Labels.BankCardAuthorized') }}
            </span>
            <span v-else>
                {{ getLocalizationProp('Labels.BankCardNotAuthorized') }}
                <a :href="`${getLocalizationProp('Data.PreAuthPageUrl.Url')}?paymethodid=${info.PayMethodId}`" class="underline">
                    {{ getLocalizationProp('Data.PreAuthPageUrl.Text') }}
                </a>
            </span>
        </span>
    </p>
</template>

<script>
    import { mapState } from 'vuex';
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'PreAuthorizationStatus',
        mixins: [ localizationMixin ],
        props: {
            card: {
                type: Object,
                default: null
            }
        },
        computed: {
            ...mapState('paymentMethod', ['storedPayMethod']),

            info() {
                return this.card || this.storedPayMethod || {};
            },

            showPreAuthStatus() {
                return this.getLocalizationProp('Data.EnablePreAuth') && typeof this.info.PreAuthStatus === 'boolean';
            }
        }
    };
</script>
