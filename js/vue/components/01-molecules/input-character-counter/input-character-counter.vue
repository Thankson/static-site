<template>
    <p
        aria-live="assertive"
        class="m-inputCharacterCounter text-sm  whitespace-no-wrap"
        :class="[modifierClasses, isOverTheCharacterLimit ? 'text-red': 'text-gray']"
    >
        {{ counter }}
    </p>
</template>
<script>
    export default {
        name: 'MInputCharacterCounter',
        props: {
            isOverTheCharacterLimit: {
                type: Boolean,
                default: false
            },
            maxLength: {
                type: Number,
                default: 100
            },
            modifierClasses: {
                type: String,
                default: ''
            },
            value: {
                type: String,
                default: null
            }
        },
        computed: {
            // Displays the character counter as "currentLength / maxLength"
            counter() {
                return `${this.currentLength} / ${this.maxLength}`;
            },
            currentLength() {
                return this.value?.length || 0;
            }
        }
    };
</script>
