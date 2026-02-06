<template>
    <component :is="showGrowPremiumPopup ? 'button' : 'div'" ref="badgeContainer" class="a-badge" @click="handleBadgeClick">
        <slot></slot>

        <span
            v-if="title"
            class="a-badge__label"
            :class="[positionModifier, tailwindClasses]"
            :aria-label="ariaLabel"
            :style="{color: textColor, backgroundColor: backgroundColor}"
        >
            {{ title }}
        </span>
    </component>
</template>

<script>
    import eventBus from '../../../mixins/event-bus';

    export default {
        name: 'ABadge',
        props: {
            ariaLabel: {
                type: String,
                default: ''
            },
            backgroundColor: {
                type: String,
                default: ''
            },
            badgePosition: {
                type: String,
                default: ''
            },
            isGrowPremiumPopup: {
                type: String,
                default: ''
            },
            tailwindClasses: {
                type: String,
                default: ''
            },
            textColor: {
                type: String,
                default: ''
            },
            title: {
                type: String,
                default: ''
            }
        },
        computed: {
            positionModifier() {
                return '-' + this.badgePosition;
            },
            showGrowPremiumPopup() {
                return this.isGrowPremiumPopup === 'true';
            }
        },
        mounted() {
            this.$nextTick(() => {
                const slotContainer = this.$el?.firstElementChild;
                const badgeContainer = this.$refs.badgeContainer;
                const slotElExist = this.$slots.default && slotContainer && badgeContainer;
                if(slotElExist) {
                    // Synchronizes the CSS classes between the first child element of the slot container and the badge container.
                    if(slotContainer.classList.length) {
                        // Remove Rallyware classes as those are used for JS targeting instead of styling.
                        const safeClasses = Array.from(slotContainer.classList).filter(className => !className.startsWith('rw_'));
                        if(safeClasses.length) {
                            badgeContainer.classList.add(...safeClasses);
                        }
                        slotContainer.classList.add('-badgeSlot');
                    }
                    // If the slot container is an iframe, set the width of the badge container to match the iframe's width.
                    if(slotContainer.tagName?.toLowerCase() === 'iframe') {
                        const iframeWidth = slotContainer.offsetWidth || slotContainer.clientWidth;
                        if(iframeWidth) {
                            badgeContainer.style.width = `${iframeWidth}px`;
                        }
                    }
                }
                if(this.showGrowPremiumPopup && slotContainer) {
                    const allowedTags = ['a', 'button', 'article'];

                    allowedTags.forEach(tag => {
                        // Include the slotContainer itself if it matches the tag, as well as its descendants
                        const elements = [];
                        if(slotContainer.tagName.toLowerCase() === tag) {
                            elements.push(slotContainer);
                        }
                        elements.push(...slotContainer.querySelectorAll(tag));
                        elements.forEach(el => {
                            let replacementTag = tag === 'article' ? 'div' : 'span';
                            const replacement = document.createElement(replacementTag);

                            // Copy attributes
                            Array.from(el.attributes).forEach(attr => {
                                replacement.setAttribute(attr.name, attr.value);
                            });

                            // Copy inner HTML
                            replacement.innerHTML = el.innerHTML;
                            el.parentNode.replaceChild(replacement, el);
                        });
                    });
                }
                // Check if the first slot element is an <a> tag and the badge container is not already an <a> tag
                // Added a check for showGrowPremiumPopup to ensure this change doesn't affect the button scenario
                if(slotElExist && !this.showGrowPremiumPopup && slotContainer.tagName?.toLowerCase() === 'a' && badgeContainer.tagName?.toLowerCase() !== 'a') {
                    // Copy all attributes from slotContainer ( <a> tag ) to badgeContainer except className
                    Array.from(slotContainer.attributes).forEach(attr => {
                        if(attr.name !== 'class') {
                            badgeContainer.setAttribute(attr.name, attr.value);
                        }
                    });

                    const aTag = document.createElement('a');
                    Array.from(badgeContainer.attributes).forEach(attr => {
                        aTag.setAttribute(attr.name, attr.value);
                    });
                    // Move ALL child nodes to the new aTag
                    while (badgeContainer.firstChild) {
                        aTag.appendChild(badgeContainer.firstChild);
                    }
                    badgeContainer.parentNode?.replaceChild(aTag, badgeContainer);

                    // Replace slotContainer ( <a> tag ) with <span> tag
                    const span = document.createElement('span');
                    // Copy all attributes from slotContainer to the new <span> element
                    Array.from(slotContainer.attributes).forEach(attr => {
                        if(attr.name !== 'href' && attr.name !== 'tabindex') {
                            span.setAttribute(attr.name, attr.value);
                        }
                    });
                    // Move ALL child nodes to the new <span>
                    while (slotContainer.firstChild) {
                        span.appendChild(slotContainer.firstChild);
                    }
                    slotContainer.parentNode?.replaceChild(span, slotContainer);
                }
            });
        },
        methods: {
            handleBadgeClick() {
                if(this.showGrowPremiumPopup) {
                    eventBus.$emit('showGrowPremiumSubscriptionPopup');
                }
            }
        }
    };
</script>
