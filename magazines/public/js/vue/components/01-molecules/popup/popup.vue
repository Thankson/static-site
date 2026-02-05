<template>
    <div v-click-outside="hideSharePanel" class="m-popup" :class="position">
        <div v-show="sharePanelVisible" class="m-popup__body">
            <div class="m-popup__panel">
                <slot name="panel"></slot>
            </div>
            <div class="m-popup__triangle" aria-hidden="true"></div>
        </div>
        <div class="m-popup__trigger" @click="toggleSharePanel">
            <slot name="trigger"></slot>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'MPopup',
        props: {
            position: {
                type: String,
                default: '-left' // '-left' | '-top'
            },
            panelOffset: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                sharePanelVisible: false
            };
        },
        methods: {
            toggleSharePanel() {
                this.sharePanelVisible = !this.sharePanelVisible;
            },
            showSharePanel() {
                this.sharePanelVisible = true;
            },
            hideSharePanel() {
                this.sharePanelVisible = false;
            }
        }
    };
</script>
