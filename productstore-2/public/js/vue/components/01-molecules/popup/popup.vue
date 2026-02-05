<template>
    <!-- Focus trap basically needs a bool var to control if it should trap the focus or not -->
    <!-- For more info: https://www.npmjs.com/package/focus-trap-vue -->
    <focus-trap
        v-model="isTrapped"
        :escape-deactivates="false"
        :initial-focus="() => calcInitialFocus()">

        <div
            v-clickoutside="shouldClose"
            :class="[ size, mods, { hidden: !isVisible } ]"
            class="m-popUp"
            @keyup.esc="shouldClose"
            @click="onClick">

            <div
                class="m-popUp__content"
                :class="[modContent, { '-isCn': isCn }]">

                <button
                    ref="close"
                    class="m-popUp__close"
                    tabindex="0"
                    :aria-label="closeAriaLabel"
                    data-testid="button-popUpClose"
                    @click="toggleVisibility">

                    <img
                        class="m-popUp__closeImg"
                        :src="closeIcon"
                        :alt="closeAlt"
                        aria-hidden="true" />
                </button>
                <!-- arrow -->
                <span
                    class="a-arrow"
                    :class="[arrowSize, arrowDirection, arrowMods]"
                    aria-hidden="true">

                    <span
                        class="a-arrow__icon"
                        :class="arrowColorClass" />
                </span>

                <div
                    v-if="headerVisible"
                    class="m-popUp__header"
                    :class="headerMods">

                    <h2
                        class="m-popUp__headerTitle"
                        :class="headerTitleMods" v-html="headerTitle"></h2>

                    <p
                        v-if="subtitle"
                        class="m-popUp__subtitle"
                        :class="[subtitleMods, (lvipTitle && isCn || (vipTitle && showVipTitle)) ? 'pt-10 pb-0' : '']">

                        {{ subtitle }}
                    </p>

                    <p
                        v-if="vipTitle && showVipTitle"
                        class="m-popUp__subtitle"
                        :class="subtitleMods">

                        {{ vipTitle }}
                    </p>

                    <p
                        v-if="lvipTitle && isCn"
                        class="m-popUp__subtitle -isCn inline-block"
                        :class="subtitleMods">
                        {{ lvipTitle }}
                        <img v-if="lvipIcon" class="inline-block align-text-bottom" :src="lvipIcon">
                    </p>

                    <div v-if="lsd && isCn" class="m-popUp__lsdCn">
                        <p class="m-popUp__lsdTitle"> {{ lsdTitle }} </p>
                        <p class="m-popUp__lsdCount"> <span>{{ lsdLabels }}</span> <span class="m-popUp__lsdCount -conut">{{ lsd }}</span> </p>
                    </div>

                    <div class="pl-24">
                        <slot name="header" />
                    </div>
                </div>

                <div
                    ref="popup-body"
                    class="m-popUp__body"
                    :class="bodyMods">
                    <!-- This is a default slot for the popup inner content -->
                    <slot />
                    <!-- End Slot -->
                </div>

                <div
                    v-if="footerVisible"
                    class="m-popUp__footer"
                    :class="footerMods">

                    <a
                        class="m-popUp__footerCTA"
                        :class="footerCTAMods"
                        :href="footerLink"
                        :aria-label="footerCtaAriaLabel"
                        data-testid="link-footerCTA"
                        @click="gtmId ? gtmTrackAction({id: gtmId}, $event): ''">

                        {{ footerTitle }}
                    </a>
                </div>
            </div>
        </div>
    </focus-trap>
</template>

<script>
    import togglePopUpMixin from '../../../mixins/toggle-popup';

    export default {
        name: 'Popup', //eslint-disable-line
        directives: {
            clickoutside: {
                bind(el, binding, vnode) {
                    el.clickOutsideEvent = function(event) {
                        // Click outside the el and his childrens
                        if(!(el === event.target || el.contains(event.target))) {
                            // Call method provided in attribute value
                            vnode.context[binding.expression](event);
                        }
                    };

                    document.body.addEventListener('click', el.clickOutsideEvent);
                    document.body.addEventListener('touchstart', el.clickOutsideEvent);
                },
                unbind(el) {
                    document.body.removeEventListener('click', el.clickOutsideEvent);
                    document.body.removeEventListener('touchstart', el.clickOutsideEvent);
                },
                stopProp(event) {
                    event.stopPropagation();
                }
            }
        },
        mixins: [ togglePopUpMixin ],
        props: {
            // Popup props
            visible: {
                type: Boolean,
                default: true
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
            initialFocusEl: {
                type: Node,
                default: null
            },
            // Arrow props
            arrowSize: {
                type: String,
                default: '-lg'
            },
            arrowDirection: {
                type: String,
                default: '-up'
            },
            arrowMods: {
                type: String,
                default: '-filled -shadow absolute -top-13 to-md:left-8 md:right-8'
            },
            arrowColor: {
                type: String,
                default: 'white'
            },
            footerCtaAriaLabel: {
                type: String,
                default: null
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
            subtitle: {
                type: String,
                default: ''
            },
            subtitleMods: {
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
            // Body Props
            bodyMods: {
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
            footerMods: {
                type: String,
                default: ''
            },
            footerCTAMods: {
                type: String,
                default: ''
            },
            gtmId: {
                type: Number,
                default: null
            },
            cancelTrapped: {
                type: Boolean,
                default: false
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
            // trap/visibility props
            disableTrap: {
                type: Boolean,
                default: false
            },
            lsd: {
                type: String,
                default: ''
            },
            lsdTitle: {
                type: String,
                default: ''
            },
            lsdMobileLabels: {
                type: String,
                default: ''
            },
            lsdLabels: {
                type: String,
                default: ''
            },
            lvipTitle: {
                type: String,
                default: ''
            },
            lvipIcon: {
                type: String,
                default: ''
            },
            showVipTitle: {
                type: Boolean,
                default: false
            },
            vipTitle: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                enableTrap: true,
                isTrapped: false,
                isVisible: false,
                prevFocused: null
            };
        },
        computed: {
            arrowColorClass: function() {
                return `border-${this.arrowColor}`;
            },
            isCn() {
                return this.$env?.IsCn || false;
            }
        },
        watch: {
            isVisible(val, oldVal) {
                this.$emit('visibility', val);

                if(val && this.enableTrap) {
                    this.isTrapped = true;
                } else if(!this.cancelTrapped) {
                    this.isTrapped = false;
                }

                if(val && !oldVal) {
                    this.prevFocused = document.activeElement;
                }
            },
            disableTrap(val) {
                this.enableTrap = !val;
            },
            enableTrap(val) {
                if(val && this.isVisible) {
                    this.isTrapped = true;
                } else {
                    this.isTrapped = false;
                }
            },
            isTrapped(val) {
                if(!val && this.isVisible && this.enableTrap) {
                    this.isTrapped = true;
                }
            }
        },
        mounted() {
            // Reinitialize modal if already initialized.
            // If modal was not initialized yet, it will initialize
            // correctly on $(document).ready with the popup videos.
            if(window.refreshVideoModal) {
                window.refreshVideoModal();
            }
        },
        methods: {
            calcInitialFocus() {
                return this.initialFocusEl && this.initialFocusEl.nodeType === Node.ELEMENT_NODE ? this.initialFocusEl : this.$refs.close;
            },
            shouldClose() {
                if(this.isVisible && this.enableTrap) {
                    this.isVisible = false;
                }
            },
            watchModal() {
                // Watch Video Modal DOM element (JQuery component)
                const videoModals = $('[data-js="videoModal"]');
                const openModal = videoModals.filter((...[, element]) => element.style.display === 'block')[0];

                if(videoModals && openModal) {
                    const MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
                    const observer = new MutationObserver((mutations, observer) => {
                        mutations.forEach((mutation) => {
                            if(mutation.attributeName === 'style') {
                                if(openModal.style.display !== 'block') {
                                    // Video Modal closed
                                    this.prevFocused.focus();
                                    observer.disconnect();

                                    this.$nextTick(() => (this.enableTrap = true));
                                }
                            }
                        });
                    });

                    observer.observe(openModal, {
                        attributes: true,
                        attributeFilter: ['style']
                    });
                }
            },
            toggleVisibility(e) {
                this.$nextTick(() => {
                    if(typeof e === 'undefined') {
                        document.body.click();
                    }
                    this.isVisible = !this.isVisible;
                });
            },
            onClick(evt) {
                const target = evt.target;
                const videoModal = $(target).closest('[data-js="videoModal-open"]');
                if(videoModal && videoModal.length) {
                    // When opening a Video Modal
                    this.enableTrap = false;
                    setTimeout(this.watchModal, 300);
                }
            }
        }
    };
</script>
