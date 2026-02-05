<template>
    <div class="o-access">
        <h1 v-if="$slots['heading']" class="o-access__heading" :class="isCn ? 'to-md:hidden' : ''">
            <slot name="heading" />
        </h1>

        <m-progress-bar
            ref="progress-bar"
            :active-step="active"
            :complete-text="completeText"
            :disable-bullets="['final']"
            :nav-class="navClass">

            <template v-for="step in progressBarSteps" v-slot:[step.passthroughSlot]>
                <slot :name="step.name" />
            </template>

            <template v-slot:step-final-decorator>
                <a-icon size="inherit">
                    shopping_cart
                </a-icon>
            </template>

            <template v-slot:step-final>
                <slot name="progress-final">
                    {{ progressFinalText }}
                </slot>
            </template>
        </m-progress-bar>

        <div ref="container" class="o-access__container" :class="{'bg-white': isCn}">
            <transition-group
                ref="transition"
                class="o-access__transition"
                :class="!ready ? 'opacity-0' : ''"
                tag="div"
                name="-fade"
                v-on="transitionEvents">

                <div
                    v-for="step in steps"
                    v-show="step.id === active"
                    :ref="step.id === active ? 'step': null"
                    :key="step.id"
                    class="o-access__step">

                    <slot :name="step.name" />
                </div>
            </transition-group>

            <!-- Slot that is common to all steps -->
            <div v-if="$slots['common']" class="o-access__common">
                <slot name="common" />
            </div>

            <div class="o-access__loading" :class="loading ? '-isVisible' : ''">
                <a-loading-spinner :visible="loading" />
            </div>
        </div>
    </div>
</template>

<script>
    import { mapGetters, mapActions } from 'vuex';

    const SLOT_PREFIX = 'step-';
    const PROGRESS_SLOT_PREFIX = 'progress-step-';

    export default {
        name: 'OAccess',
        props: {
            activeStep: {
                type: [ String, Number ],
                default: 0
            },
            completeText: {
                type: String,
                default: 'Complete:'
            },
            loading: {
                type: Boolean,
                default: false
            },
            progressFinalText: {
                type: String,
                default: 'Start Shopping'
            },
            navClass: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                ready: false,

                /** @typedef {{ id: string, name: string }} StepItem */
                /** @type {Array<StepItem>} */
                steps: [],

                /** @typedef {{ id: string, name: string, passthroughSlot: string }} ProgressBarStepItem */
                /** @type {Array<ProgressBarStepItem>} */
                progressBarSteps: [],

                /** @type {Object<string, Function>} */
                transitionEvents: {
                    beforeEnter: this.beforeEnter,
                    enter: this.enter,
                    afterEnter: this.afterEnter
                }
            };
        },
        computed: {
            ...mapGetters('access', ['active']),
            isCn() {
                return this.$env?.IsCn || false;
            }
        },
        watch: {
            active() {
                if(this.ready) {
                    this._pendingFocus = true;
                }
            }
        },
        created() {
            this.$on('slot', this.setup);

            // non-reactive property to handle focus with transitions
            this._pendingFocus = false;
        },
        mounted() {
            this.setup();
        },
        methods: {
            ...mapActions('access', ['goToStep', 'setSteps']),

            handleFocus() {
                const step = this.$refs['step']?.[0] || this.$refs['step'];
                const heading = step.querySelector('h2');

                if(heading) {
                    heading.setAttribute('tabindex', '-1');
                    this.$nextTick(() => heading.focus());

                    const blur = () => {
                        heading.removeAttribute('tabindex');
                        heading.removeEventListener('blur', blur);
                    };

                    heading.addEventListener('blur', blur);
                }

                this._pendingFocus = false;
            },
            setup() {
                this.setupSteps();
                this.setupProgressBarSteps();
                this.setSteps(this.steps.map(step => step.id));
                this.goToStep(this.activeStep.toString());
                this.$nextTick(() => {
                    this.$refs['progress-bar'].$emit('slot');
                    this.ready = true;
                });
            },
            setupSteps() {
                this.steps = Object.keys(this.$slots)
                    .filter(name => name.startsWith(SLOT_PREFIX)) // filter array down to only slots prefixed with SLOT_PREFIX
                    .map(name => {
                        const id = name.replace(SLOT_PREFIX, '');
                        return {
                            id,
                            name
                        };
                    });
            },
            setupProgressBarSteps() {
                this.progressBarSteps = Object.keys(this.$slots)
                    .filter(name => name.startsWith(PROGRESS_SLOT_PREFIX)) // filter array down to only slots prefixed with PROGRESS_SLOT_PREFIX
                    .map(name => {
                        const id = name.replace(PROGRESS_SLOT_PREFIX, '');
                        return {
                            id,
                            name,
                            passthroughSlot: `step-${id}`
                        };
                    });
            },

            // transition events
            beforeEnter(el) {
                this.$refs['transition'].$el.style.height = `${this.$refs['transition'].$el.clientHeight}px`;
                this.$refs['transition'].$el.style.overflow = 'hidden';
            },
            enter(el) {
                this.$refs['transition'].$el.style.height = `${el.clientHeight}px`;
            },
            afterEnter(el) {
                this.$refs['transition'].$el.removeAttribute('style');

                if(this._pendingFocus) {
                    this.$nextTick(this.handleFocus);
                }
            }
        }
    };
</script>
