<template>
    <div class="m-inputPseudoInline">
        <label class="m-inputPseudoInline__label">{{ label }}</label>
        <div class="m-inputPseudoInline__value">{{ value }}</div>
    </div>
</template>

<script>

    export default {
        name: 'MInputPseudoInline',
        props: {
            label: {
                type: String,
                default: ''
            },
            value: {
                type: [String, Number],
                default: ''
            }
        }
    };
</script>
