<template>
    <p
        id="inputLengthAlert"
        role="alert"
        :class="[
            `a-personaLinkCharacterMessage ml-auto text-sm leading-base ${mods}`,
            isTextRed ? 'text-red' : 'text-gray-120'
        ]"
        data-testid="paragraph-personalLinkCharacterMessage"
    >
        {{ message }}
    </p>
</template>

<script>
    export default {
        name: 'APersonalLinkCharacterMessage',
        props: {
            isTextRed: {
                type: Boolean,
                default: false
            },
            message: {
                type: String,
                default: ''
            },
            mods: {
                type: String,
                default: ''
            }
        }
    };
</script>
