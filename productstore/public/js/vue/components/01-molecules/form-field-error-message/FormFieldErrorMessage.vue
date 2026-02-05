<template>
    <p
        v-show="isVisible"
        aria-live="assertive"
        class="e-formError__item mt-4 pb-0 leading-base"
        :class="modifierClasses"
    >
        {{ msg }}
    </p>
</template>
<script>
    export default {
        name: 'MFormFieldErrorMessage',
        props: {
            modifierClasses: {
                type: String,
                default: ''
            },
            isVisible: {
                type: Boolean,
                default: null
            },
            msg: {
                type: String,
                default: null
            }
        }
    };
</script>
