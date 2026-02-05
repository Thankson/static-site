<template>
    <div
        class="a-chip"
        :dataTestId="dataTestId"
        role="text"
        @click="emitClick"
    >
        <div class="a-chip__text">{{ label }}</div>
        <span v-if="showIcon" aria-hidden="true" class="a-chip__icon material-icons">info</span>
    </div>
</template>

<script>
    export default {
        name: 'AChip',
        props: {
            label: {
                type: String,
                default: '',
                required: true
            },
            showIcon: {
                type: Boolean,
                default: false
            },
            dataTestId: {
                type: String,
                default: ''
            }
        },
        methods: {
            emitClick() {
                this.$emit('click');
            }
        }
    };
</script>
