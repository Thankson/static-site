<template>
    <modal :id="modalId" class="m-iboOverwriteIboNoticeModal">
        <template v-slot:content>
            <div>
                <p v-html="modalObj.content"></p>

                <div class="mt-20">
                    <v-button class="mr-10" @click="hide">
                        {{ modalObj.cancel }}
                    </v-button>
                    <v-button class="-plain" @click="hide">
                        {{ modalObj.ok }}
                    </v-button>
                </div>
            </div>
        </template>
    </modal>
</template>

<script>
    import eventBus from '@common/source/js/vue/mixins/event-bus';

    export default {
        name: 'MIboOverwriteIboNoticeModal',
        props: {
            modalObj: {
                type: Object,
                default: () => ({})
            }
        },
        data() {
            return {
                modalId: 'ibo-overwrite-ibo-notice'
            };
        },
        mounted () {
            this.setupListeners();
        },
        methods: {
            show() {
                this.$modal.show({id: this.modalId});
            },
            hide() {
                this.$modal.hide({id: this.modalId});
            },
            setupListeners() {
                this.$on('show', this.show);
                // eventBus.$emit('showIboOverwriteIboNoticeModal');
                eventBus.$on('showIboOverwriteIboNoticeModal', this.show);
            }
        }
    };
</script>
