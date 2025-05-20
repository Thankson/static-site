<template>
    <div class="m-exampleTip">
        <span ref="container" class="text-xs text-gray inline-block mb-10" v-html="displayText">
        </span>

        <modal>
            <template v-slot:content>
                <p v-html="exampleRtx"></p>
            </template>
        </modal>
    </div>
</template>

<script>
    export default {
        name: 'MExampleTip',
        props: {
            tipName: {
                type: String,
                default: ''
            },
            text: {
                type: String,
                default: ''
            },
            ctaText: {
                type: String,
                default: ''
            },
            exampleRtx: {
                type: String,
                default: ''
            }
        },
        computed: {
            displayText() {
                return this.text.replace('{0}', `<a class="text-blue underline cursor-pointer ${this.tipName}">${this.ctaText}</a>`);
            }
        },
        mounted () {
            this.bindTipClickEvent();
        },
        methods: {
            openTipModal() {
                this.$modal.show();
            },
            bindTipClickEvent() {
                const observer = new MutationObserver((mutations) => {
                    mutations.forEach(() => {
                        const tipLink = this.$el.querySelector(`.${this.tipName}`);
                        tipLink && tipLink.addEventListener('click', (e) => {
                            e.preventDefault();
                            this.openTipModal();
                            return false;
                        });
                    });
                });

                observer.observe(this.$el, {
                    childList: true,
                    subtree: true
                });

                this.$once('hook:beforeDestroy', () => {
                    observer && observer.disconnect();
                });
            }
        }
    };
</script>
