<template>
    <transition name="messageFade" @after-leave="handleAfterLeave">
        <div
            v-if="visible"
            class="a-message"
            aria-live="assertive"
            role="alert"
            :style="positionStyle"
            :class="`-${type}`"
        >
            <span class="a-message__icon material-icons mr-5" aria-hidden="true">
                {{ icon }}
            </span>
            <slot>
                <p v-if="!dangerouslyUseHTMLString" class="a-message__content">{{ message }}</p>
                <p v-else class="a-message__content" v-html="message"></p>
            </slot>
        </div>
    </transition>
</template>

<script>
    const typeMap = {
        success: 'done',
        info: 'info',
        error: 'close'
    };
    export default {
        name: 'AMessage',
        data() {
            return {
                visible: false,
                message: '',
                duration: 3000,
                type: 'info',
                closed: false,
                verticalOffset: 20,
                timer: null,
                onClose: null,
                dangerouslyUseHTMLString: false
            };
        },
        computed: {
            positionStyle() {
                return {
                    top: `${this.verticalOffset}px`
                };
            },
            icon() {
                return typeMap[this.type];
            }
        },
        watch: {
            closed(newVal) {
                if(newVal) {
                    this.visible = false;
                }
            }
        },
        mounted() {
            this.startTimer();
        },
        methods: {
            handleAfterLeave() {
                this.$destroy(true);
                this.$el.parentNode.removeChild(this.$el);
            },
            close() {
                this.closed = true;
                if(typeof this.onClose === 'function') {
                    this.onClose(this);
                }
            },
            startTimer() {
                if(this.duration > 0) {
                    this.timer = setTimeout(() => {
                        if(!this.closed) {
                            this.close();
                        }
                    }, this.duration);
                }
            }
        }
    };
</script>
