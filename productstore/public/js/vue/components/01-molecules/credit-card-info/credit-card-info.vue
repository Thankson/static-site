<template>
    <div class="m-ccInfo" :class="{'-isCn': isCn}">
        <!-- card logo -->
        <img
            v-if="cardBrandImageSrc && cardBrandImageSrc.Url && !cardBrandName && !payTypeIsPayPal"
            :alt="cardBrandImageSrc.Alt ? cardBrandImageSrc.Alt: ''"
            :src="cardBrandImageSrc.Url ? cardBrandImageSrc.Url : ''"
            class="w-36 h-auto inline-block align-top mr-16 md:mr-10">
        <!-- card logo -->

        <p class="sr-only">{{ completeCardAriaLabel }}</p>

        <div v-if="!payTypeIsPayPal" class="m-ccInfo__info" :class="{'-isCn': isCn}" aria-hidden="true">
            <div class="m-ccInfo__card">
                <!-- cardBrand Name used for Korea instead of cardBrand Image -->
                <span v-if="cardBrandName" class="tracking-tight pr-12" :class="{'w-full': !isCn}">{{ cardBrandName }} </span>
                <span v-else-if="cardName" class="tracking-tight pr-12" :class="{'w-full': !isCn}">{{ cardName }}</span>
                <span v-if="cardEnding && cardName" v-html="cardMaskingCondensed"></span>&nbsp;
                <span v-if="!cardName" v-html="cardMasking"></span>
                <span class="tracking-tight md:mr-50">{{ cardEnding }}</span>
            </div>
            <div :class="{'-isCn': isCn}" class="m-ccInfo__expire">
                <span
                    v-if="cardExpiration"
                    class="tracking-tight text-base block w-full md:inline md:text-lg"
                    :class="{ 'text-red': cardExpirationNear || cardExpired, 'md:italic': !isCn }">
                    <span>{{ cardExpirationLabel }}&nbsp;</span>
                    {{ cardExpiration }}
                </span>
            </div>
        </div>
        <div v-else class="m-ccInfo__info" aria-hidden="true">
            <a-pay-label
                :image="cardBrandImageSrc"
                :name-on-account="nameOnAccount"
                :type="type"
                :display-name="displayName"
            />
        </div>
    </div>
</template>

<script>
    export default {
        name: 'CreditCardInfo',
        props: {
            cardBrandName: {
                type: String,
                default: null
            },
            cardEnding: {
                type: String,
                default: null
            },
            cardEndingAriaLabel: {
                type: String,
                default: 'Card ending in'
            },

            cardExpiration: {
                type: String,
                default: null
            },
            cardExpirationLabel: {
                type: String,
                default: 'Expires'
            },
            cardExpirationAriaLabel: {
                type: String,
                default: 'Card expiration'
            },
            cardExpirationNear: {
                type: Boolean,
                default: false
            },
            cardExpired: {
                type: Boolean,
                default: false
            },
            cardBrandImageSrc: {
                type: Object,
                default() {
                    return {};
                }
            },
            cardBrandAlt: {
                type: String,
                default: null
            },
            cardMasking: {
                type: String,
                default: null
            },
            cardMaskingCondensed: {
                type: String,
                default: null
            },
            displayName: {
                type: String,
                default: null
            },
            nameOnAccount: {
                type: String,
                default: null
            },
            nickName: {
                type: String,
                default: null
            },
            type: {
                type: String,
                default: null
            }
        },
        computed: {
            cardName: function() {
                return (this.nickName !== null || this.nickName !== '') ? this.nickName : '';
            },
            completeCardAriaLabel: function() {
                return (
                    this.cardName +
                    ' ' +
                    this.cardEndingAriaLabel +
                    ' ' +
                    this.cardEnding +
                    ' ' +
                    this.cardExpirationAriaLabel +
                    ' ' +
                    this.cardExpiration
                );
            },
            isCn() {
                return this.$env?.IsCn || false;
            },
            payTypeIsPayPal() {
                return this.type?.toLowerCase() === 'paypal';
            }
        }
    };
</script>
