<template>
    <focus-trap v-model="visible">
        <div
            :ref="id"
            class="m-popUpMsg"
            :class="{ hidden: !visible }"
            @keyup.esc="toggleVisibility"
        >
            <div
                class="m-popUpMsg__popup"
                :class="[size, mods]"
            >
                <div class="m-popUpMsg__content" :class="modContent">
                    <div
                        v-if="headerVisible"
                        class="m-popUpMsg__header"
                        :class="headerMods"
                    >
                        <h2 class="m-popUpMsg__title" :class="headerTitleMods">
                            {{ headerTitle }}
                        </h2>
                    </div>

                    <div class="m-popUpMsg__body">
                        <slot></slot>
                    </div>

                    <div v-if="email" class="m-popUpMsg__email">
                        {{ email }}
                    </div>

                    <div
                        v-if="footerVisible"
                        class="m-popUpMsg__footer"
                        :class="footerMods"
                    >
                        <a
                            v-if="footerLink"
                            class="m-popUpMsg__cta"
                            :class="footerCTAMods"
                            :href="footerLink"
                            :target="footerTargetWindow"
                            v-on:click="toggleVisibility"
                        >
                            {{ footerTitle }}
                        </a>
                        <button
                            v-else
                            class="m-popUpMsg__cta"
                            :class="footerCTAMods"
                            v-on:click="toggleVisibility"
                        >
                            {{ footerTitle }}
                        </button>
                    </div>

                    <button
                        ref="closeModal"
                        class="m-popUpMsg__close"
                        tabindex="0"
                        :aria-label="closeAriaLabel"
                        autofocus
                        v-on:click="toggleVisibility"
                    >
                        <img
                            class="m-popUpMsg__closeImg"
                            :src="closeIcon"
                            :alt="closeAlt"
                            aria-hidden="true"
                        />
                    </button>
                </div>
            </div>
            <div
                class="m-popUpMsg__overlay"
                v-on:click="toggleVisibility"></div>
        </div>
    </focus-trap>
</template>

<script>
    export default {
        name: 'PopupMessage',
        props: {
            // Popup props
            id: {
                type: String,
                default: ''
            },
            isVisible: {
                type: Boolean,
                default: false
            },
            size: {
                type: String,
                default: ''
            },
            mods: {
                type: String,
                default: 'top-40'
            },
            modContent: {
                type: String,
                default: ''
            },
            // Header props
            headerVisible: {
                type: Boolean,
                default: true
            },
            headerTitle: {
                type: String,
                default: ''
            },
            headerMods: {
                type: String,
                default: ''
            },
            headerTitleMods: {
                type: String,
                default: ''
            },
            // Body
            email: {
                type: String,
                default: ''
            },
            // Footer Props
            footerVisible: {
                type: Boolean,
                default: true
            },
            footerTitle: {
                type: String,
                default: ''
            },
            footerLink: {
                type: String,
                default: ''
            },
            footerTargetWindow: {
                type: String,
                default: '_blank'
            },
            footerMods: {
                type: String,
                default: ''
            },
            footerCTAMods: {
                type: String,
                default: ''
            },
            // Close Button Props
            closeIcon: {
                type: String,
                default: '//cdnsc1.melaleuca.com/na/images/header/clear2x.png'
            },
            closeAlt: {
                type: String,
                default: 'Close Pop-up'
            },
            closeAriaLabel: {
                type: String,
                default: 'Close Pop-up'
            },
            isCn: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                visible: false
            };
        },
        watch: {
            isVisible: function(newVal) {
                if(newVal) {
                    this.toggleVisibility();
                }
            },
            visible: function(newVal) {
                const className = '-noScroll';
                if(newVal) {
                    document.body.classList.add(className);
                } else {
                    document.body.classList.remove(className);
                }
            }
        },
        mounted() {
            this.visible = this.isVisible;
            if(this.visible) {
                this.focusEl();
            }
        },
        methods: {
            toggleVisibility() {
                this.visible = !this.visible;
                if(this.visible) {
                    this.focusEl();
                }
            },
            focusEl() {
                this.$nextTick(() => {
                    this.$refs.closeModal.focus();
                });
            }
        }
    };
</script>
