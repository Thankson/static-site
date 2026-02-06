<template>
    <button
        type="button"
        class="a-chevronButton leading-base"
        @click="$emit('click')"
        @focus="$emit('focus')"
        @blur="$emit('blur')"
    >
        <span :class="['material-icons', arrowMods]">
            {{
                isInverted ? 'expand_less' : 'expand_more'
            }}
        </span>
    </button>
</template>

<script>
    export default {
        name: 'AChevronButton',
        props: {
            arrowMods: {
                type: String,
                default: ''
            },
            isInverted: {
                type: Boolean,
                required: true
            }
        }
    };
</script>
