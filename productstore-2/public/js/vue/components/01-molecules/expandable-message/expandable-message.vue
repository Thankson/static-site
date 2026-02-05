<template>
    <p class="m-expandableMessage" :class="mods">
        <!-- If printed, show full text without Less or More -->
        <span v-if="isPrinted" v-html="messageTextExpanded"></span>
        <span v-else>
            <span v-html="showMore ? messageTextExpanded : messageText"></span>
            <button
                class="text-green underline inline-block ml-1 align-baseline"
                @click.prevent="showMore = !showMore">
                {{ showMore ? lessText : moreText }}
            </button>
        </span>
    </p>
</template>

<script>
    export default {
        name: 'MExpandableMessage',
        props: {
            messageText: {
                type: String,
                default: ''
            },
            messageTextExpanded: {
                type: String,
                default: ''
            },
            mods: {
                type: String,
                default: ''
            },
            isPrinted: {
                type: Boolean,
                default: false
            },
            lessText: {
                type: String,
                default: ''
            },
            moreText: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                showMore: false
            };
        }
    };
</script>
