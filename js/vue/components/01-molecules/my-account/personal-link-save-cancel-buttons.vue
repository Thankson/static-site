<template>
    <div :class="[`m-personalLinkSaveCancelButtons flex flex-wrap ${containerMods}`]">
        <button
            class="a-button py-15 px-48 mr-15 text-base font-medium leading-base"
            :class="{'-disabled': isSaveButtonDisabled}"
            :disabled="isSaveButtonDisabled"
            data-testid="button-personalLinkSave"
            @click="$emit('save')"
        >
            {{ saveButtonText }}
        </button>
        <button
            class="a-button -white py-15 px-48 text-base font-medium leading-base"
            data-testid="button-personalLinkCancel"
            @click="$emit('cancel')"
        >
            {{ cancelButtonText }}
        </button>
    </div>
</template>

<script>
    export default {
        name: 'MPersonalLinkSaveCancelButtons',
        props: {
            cancelButtonText: {
                type: String,
                default: ''
            },
            containerMods: {
                type: String,
                default: ''
            },
            isSaveButtonDisabled: {
                type: Boolean,
                default: false
            },
            saveButtonText: {
                type: String,
                default: ''
            }
        }
    };
</script>
