<template>
    <ul
        :class="[`m-personalLinkMessageList ${listMods}`]"
        data-testid="list-personalLinkMessageList"
    >
        <li
            v-if="shouldRenderSuccessMessage && (isPersonalLinkAvailable === true || isPersonalLinkAvailable === false)"
            id="inputAlert"
            role="alert"
            class="m-personalLinkMessageList__listItem flex text-sm leading-base"
            :class="[isPersonalLinkAvailable ? '-success text-green' : '-error text-red']"
            data-testid="listItem-personalLinkMessage"
            v-html="messageText"
        />
        <li
            v-else-if="!isPersonalLinkAvailable"
            id="inputAlert"
            role="alert"
            class="m-personalLinkMessageList__listItem -error flex text-red text-sm leading-base"
            data-testid="listItem-personalLinkMessage"
            v-html="messageText"
        />
    </ul>
</template>

<script>
    export default {
        name: 'MPersonalLinkMessageList',
        props: {
            isPersonalLinkAvailable: {
                type: Boolean,
                default: null
            },
            listMods: {
                type: String,
                default: ''
            },
            messageText: {
                type: String,
                default: ''
            },
            shouldRenderSuccessMessage: {
                type: Boolean,
                default: false
            }
        }
    };
</script>
