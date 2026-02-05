<template>
    <div class="m-prodQty">
        <div class="m-prodQty__media">
            <img
                v-if="imageUrl"
                class="m-prodQty__img"
                :class="disabled ? '-disabled': ''"
                :src="imageUrl"
                :alt="imageAlt || title" />

            <p
                v-if="offsaleMessage"
                class="m-prodQty__offsale"
                v-html="offsaleMessage"></p>
        </div>

        <p class="m-prodQty__title">
            <slot>
                {{ title }}
            </slot>
        </p>

        <div class="m-prodQty__quantity">
            <a-quantity
                v-model="quantity"
                :disabled="disabled"
                input-class="-prodQty"
                :min-value="0" />
        </div>
    </div>
</template>

<script>
    export default {
        name: 'MProductQuantity',
        props: {
            disabled: {
                type: Boolean,
                default: false
            },
            imageUrl: {
                type: String,
                default: null
            },
            imageAlt: {
                type: String,
                default: null
            },
            offsaleMessage: {
                type: String,
                default: null
            },
            title: {
                type: String,
                default: ''
            },
            value: {
                type: Number,
                default: null
            }
        },
        data() {
            return {
                quantity: 0
            };
        },
        watch: {
            quantity() {
                this.$emit('input', this.quantity);
            },
            value() {
                this.quantity = this.value;
            }
        },
        mounted() {
            if(typeof this.value === 'number') {
                this.quantity = this.value;
            }
        }
    };
</script>
