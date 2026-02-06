<template>
    <a href="#" @click.prevent="click">
        <slot />
    </a>
</template>

<script>
    import { mapActions } from 'vuex';

    export default {
        name: 'AEnrollControls',
        props: {
            prev: {
                type: Boolean,
                default: false
            },
            next: {
                type: Boolean,
                default: false
            },
            toStep: {
                type: String,
                default: ''
            }
        },
        methods: {
            ...mapActions('enroll', ['nextStep', 'prevStep', 'goToStep']),

            click() {
                switch (true) {
                    case !!this.toStep:
                        this.goToStep(this.toStep);
                        break;
                    case this.prev:
                        this.prevStep();
                        break;
                    case this.next:
                        this.nextStep();
                        break;
                }
            }
        }
    };
</script>
