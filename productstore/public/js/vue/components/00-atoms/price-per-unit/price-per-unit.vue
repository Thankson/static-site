<template>
    <p :class="['a-ppu', tailwindMods]">
        <span v-if="label">{{ `${label}: ` }}</span>
        <span>{{ `${price} / (${unit})` }}</span>
    </p>
</template>
<script>
    export default {
        name: 'PricePerUnit',
        props: {
            label: {
                type: String,
                default: null
            },
            price: {
                type: String,
                required: true
            },
            tailwindMods: {
                type: String,
                default: null
            },
            unit: {
                type: String,
                required: true
            }
        }
    };
</script>
