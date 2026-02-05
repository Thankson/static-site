<template>
    <div class="m-progressBar" :class="isCn ? 'px-10' : ''">
        <ol class="m-progressBar__nav" :class="navClass">
            <li
                v-for="(step, i) in steps"
                :key="i"
                class="m-progressBar__item"
                :class="[ isComplete(i) ? '-isComplete' : '', isActive(i) ? '-isActive' : '', isCn ? '-mbShowText' : '']"
                :aria-current="isActive(i)">

                <component
                    :is="(isButton && !isActive(i) && i < activeStep) ? 'button' : (isComplete(i) && step.href) ? 'a' : 'div'"
                    class="m-progressBar__inner"
                    :href="isComplete(i) && step.href ? step.href : false"
                    :target="isComplete(i) && step.href ? step.target : false"
                    @click="(isButton && !isActive(i) && i < activeStep) ? $emit('goToStep', step.id) : null">

                    <span class="m-progressBar__progress">
                        <span class="m-progressBar__line" :class="isCn ? '-mbShowText' : ''">
                            <span class="m-progressBar__icon">
                                <a-bullet
                                    v-if="!disableBulletsArr.includes(step.id)"
                                    :active="isActive(i)"
                                    :complete="isComplete(i)"
                                    :class="isActive(i) && !isCn ? bulletActiveClass : ''" />

                                <slot v-else :name="`${step.name}${_decoratorPostfix}`" />
                            </span>
                        </span>
                    </span>

                    <span v-if="isComplete(i)" class="sr-only">{{ completeText }}</span>

                    <span class="m-progressBar__title" :class="isCn ? '-mbShowText' : ''">
                        <slot :name="step.name" />
                    </span>
                </component>
            </li>
        </ol>
    </div>
</template>

<script>
    const SLOT_PREFIX = 'step-';
    const SLOT_DECORATOR_POSTFIX = '-decorator';

    export default {
        name: 'MProgressBar',
        props: {
            activeStep: {
                type: [ String, Number ],
                default: 0
            },
            isButton: {
                type: Boolean,
                default: false
            },
            bulletActiveClass: {
                type: String,
                default: '-isGreen'
            },
            completeText: {
                type: String,
                default: 'Complete:'
            },
            /** @type {Array<string|number>} */
            disableBullets: {
                type: Array,
                default: () => []
            },
            /** @typedef {{ href: string, target: ?string }} StepLink */
            /** @type {Object<string, StepLink>} */
            stepLinks: {
                type: Object,
                default: () => {}
            },
            navClass: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                /** @typedef {{ id: string, name: string, href: ?string, target: string }} StepItem */
                /** @return {Array<StepItem>} */
                steps: []
            };
        },
        computed: {
            activeStepIndex() {
                let index = 0;
                for (let i = 0; i < this.steps.length; i++) {
                    if(this.steps[i].id <= this.activeStep.toString() && this.steps[i + 1] && this.steps[i + 1].id > this.activeStep.toString()) {
                        index = i;
                        break;
                    } else if(!this.steps[i + 1]) {
                        index = this.steps.length - 1;
                        break;
                    }
                }
                return index;
            },
            disableBulletsArr() {
                // convert array items to strings to avoid type mismatch
                return this.disableBullets.map(item => item.toString());
            },
            isCn() {
                return this.$env?.IsCn || false;
            }
        },
        created() {
            // non-reactive properties
            this._decoratorPostfix = SLOT_DECORATOR_POSTFIX;

            this.$on('slot', this.setupSteps);
        },
        mounted() {
            this.setupSteps();
        },
        methods: {
            isActive(index) {
                return index >= this.activeStepIndex && index < this.activeStepIndex + 1;
            },
            isComplete(index) {
                return index < this.activeStepIndex;
            },
            setupSteps() {
                this.steps = Object.keys(this.$slots)
                    .filter(name => name.startsWith(SLOT_PREFIX) && !name.endsWith(this._decoratorPostfix)) // filter array down to only slots prefixed with SLOT_PREFIX
                    .map(name => {
                        const id = name.replace(SLOT_PREFIX, '');
                        return {
                            id,
                            name,
                            href: this.stepLinks?.[id].href || null,
                            target: this.stepLinks?.[id].target || '_self'
                        };
                    });
            }
        }
    };
</script>
