<template>
    <div class="m-newWelcomeTracker">
        <div class="m-newWelcomeTracker__flexContainer">
            <div
                v-for="step in numberOfSteps"
                :id="uniqid(step)"
                :key="uniqid(step)"
                class="m-newWelcomeTracker__dotGroup"
            >
                <div
                    class="m-newWelcomeTracker__dotLg"
                    :class="[step - 1 <= currentStep && '-filled']"
                />
                <div v-if="step !== numberOfSteps" class="m-newWelcomeTracker__dotSmGroup">
                    <div class="m-newWelcomeTracker__dotSm" />
                    <div class="m-newWelcomeTracker__dotSm" />
                    <div class="m-newWelcomeTracker__dotSm" />
                    <div class="m-newWelcomeTracker__dotSm" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import uniqid from 'uniqid';

    export default {
        name: 'MNewWelcomeTracker',
        props: {
            currentStep: {
                type: Number,
                required: true
            },
            numberOfSteps: {
                type: Number,
                required: true
            }
        },
        methods: {
            uniqid(id) {
                return `${id}-${uniqid()}`;
            }
        }
    };
</script>
