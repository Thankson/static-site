<template>
    <div class="m-r3TermModals">
        <modal
            v-for="m in checkboxLabelExtend" :id="`${m.name}-id`"
            :key="m.name"
            width="535px"
        >
            <div :key="m.name" class="o-payForm -modal -noScroll">
                <h2
                    v-if="m.termTitle" id="global-modal-heading"
                    class="o-payForm__modalTitle"
                >
                    {{ m.termTitle }}
                </h2>
                <div class="o-payForm__scroll -isCn">
                    <!--Custom scrollbar-->
                    <perfect-scrollbar ref="scroll">
                        <div class="m-rte pr-16" v-html="m.termContent"></div>
                    </perfect-scrollbar>
                </div>
            </div>
        </modal>
    </div>
</template>

<script>
    export default {
        props: {
            checkboxLabelExtend: {
                type: Array,
                default: () => ([])
            }
        },
        methods: {
            showModal(id) {
                this.$modal.show({ id });
            }
        }
    };
</script>
