<template>
    <span class="a-payLabel" :class="{'-isCn': isCn}">
        <img
            v-if="image && image.Url"
            class="a-payLabel__img"
            :alt="image.Alt || displayName"
            :src="image.Url">

        <span v-if="!typeIsPayPal" class="a-payLabel__content" role="text">
            <span class="a-payLabel__info">
                <!-- For KR, use credit card brand name, not display name -->
                <span class="a-payLabel__name">{{ cardBrandName || displayName || type }} </span>
                <span v-if="accountNumberPreview && !isCn" class="a-payLabel__account" v-html="maskedCardNumber"></span>
            </span>

            <span v-if="expirationDate && expiresSoon && !isExpired && !isCn" class="a-payLabel__expiration">
                {{ expiresLabel }} {{ expirationDate }}
            </span>
            <span v-else-if="isExpired && !isCn" class="a-payLabel__expiration">
                {{ expiredLabel }} <span v-if="showExpiredDate">{{ expirationDate }}</span>
            </span>
        </span>

        <span v-else class="a-payLabel__contentPayPal" role="text">
            <!-- For PayPal, use display name and name on account (email address) (stacked one on top of another) -->
            <span class="a-payLabel__namePayPal">{{ displayName || type }} </span>
            <span class="a-payLabel__infoPayPal">{{ nameOnAccount }}</span>
        </span>
    </span>
</template>

<script>
    export default {
        name: 'APayLabel',
        props: {
            accountNumberPreview: {
                type: String,
                default: null
            },
            cardBrandName: {
                type: String,
                default: null
            },
            cardMasking: {
                type: String,
                default: null
            },
            displayName: {
                type: String,
                default: null
            },
            expirationDate: {
                type: String,
                default: null
            },
            expiresLabel: {
                type: String,
                default: 'Expires'
            },
            expiresSoon: {
                type: Boolean,
                default: false
            },
            expiredLabel: {
                type: String,
                default: 'Expired'
            },
            isExpired: {
                type: Boolean,
                default: false
            },
            image: {
                type: Object,
                default: null
            },
            isCn: {
                type: Boolean,
                default: false
            },
            nameOnAccount: {
                type: String,
                default: ''
            },
            showExpiredDate: {
                type: Boolean,
                default: false
            },
            type: {
                type: String,
                default: ''
            }
        },
        computed: {
            maskedCardNumber() {
                return this.cardMasking + ' ' + this.accountNumberPreview;
            },
            typeIsPayPal() {
                return this.type.toLowerCase() === 'paypal';
            }
        }
    };
</script>
