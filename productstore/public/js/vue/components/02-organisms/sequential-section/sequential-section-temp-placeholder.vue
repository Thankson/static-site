// this component is just to place in OSequentialSection when you just need something to complete a sequence temporarily before you have time to add the actual component
<template>
    <div>
        <slot>
            temporary placeholder element
        </slot>
        <button
            class="bg-green-120 text-white rounded-md block p-20 mt-20"
            @click="update"
        >continue</button>
    </div>

</template>

<script>
    import { mapActions } from 'vuex';

    export default {
        name: 'OSequentialSectionTempPlaceholder',
        props: {
            index: {
                type: Number,
                required: true
            },
            isActive: {
                type: Boolean,
                default: false
            }
        },
        mounted() {
            let randomDuration = Math.floor(Math.random() * 1000);
            console.log('sequential temp placeholder mounted');
            setTimeout(() => {
                let payload = {completed: false, isEmpty: true, index: this.index, loading: false};
                if(this.isActive) payload.isActive = true;
                this.$emit('completedStatus', payload);
            }, randomDuration);
        },
        methods: {
            ...mapActions('sequentialSections', ['completeSequence']),
            update() {
                this.completeSequence(
                    {
                        completed: true,
                        isEmpty: false,
                        index: this.index,
                        isActive: false,
                        loading: false,
                        selectedTitle: 'Placeholder copy for now this component should be removed'
                    });
            }
        }

    };
</script>
