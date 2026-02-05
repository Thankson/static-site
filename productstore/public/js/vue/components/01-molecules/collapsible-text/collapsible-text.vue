<template>
    <div class="m-collapsibleText">
        <p class="m-collapsibleText__content" :class="{ '-showLessContent': !showFullContent }" :style="{ '--content-height': contentHeight }">
            <slot></slot>
        </p>
        <button :aria-expanded="showFullContent" class="m-collapsibleText__toggle" @click="toggleLabel">
            {{ showFullContent ? lessLabel : moreLabel }}
            <arrow
                :direction="showFullContent ? '-up' : '-down'"
                size="-sm"
                tailwind-color="green"
                other-mods="ml-5"
            ></arrow>
        </button>
    </div>
</template>

<script>
    export default {
        name: 'MCollapsibleText',
        props: {
            contentHeight: {
                type: String,
                default: '80px'
            },
            lessLabel: {
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
                showFullContent: false
            };
        },
        methods: {
            toggleLabel() {
                this.showFullContent = !this.showFullContent;
            }
        }
    };
</script>
