<template>
    <div class="m-readMore" :class="[{ '-isOpen': readMoreClicked }, compClassMods]">
        <transition name="fadeHeight" mode="out-in">
            <div v-show="readMoreClicked" class="inline">
                <slot name="description" />
            </div>
        </transition>
        <button
            :aria-label="readMoreClicked ? ariaLabelLess : ariaLabelMore"
            :aria-expanded="String(readMoreClicked)"
            :class="readMoreClicked ? lessClassMods : moreClassMods"
            @click="readMoreClicked = !readMoreClicked"
        >
            {{
                readMoreClicked ? lessLabel : moreLabel
            }}
        </button>
    </div>
</template>

<script>
    export default {
        name: 'MReadMore',
        props: {
            ariaLabelLess: {
                type: String,
                default: ''
            },
            ariaLabelMore: {
                type: String,
                default: ''
            },
            lessClassMods: {
                type: String,
                default: ''
            },
            lessLabel: {
                type: String,
                default: ''
            },
            moreClassMods: {
                type: String,
                default: ''
            },
            compClassMods: {
                type: String,
                default: ''
            },
            moreLabel: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                readMoreClicked: false
            };
        }
    };
</script>
