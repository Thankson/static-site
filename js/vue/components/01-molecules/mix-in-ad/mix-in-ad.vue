<template>
    <component
        :is="variant"
        v-if="variant"
        :class="variantClass"
        v-bind="$props" />
</template>

<script>
    import { baseProps } from './mix-in-ad-base.vue';
    import mixInAd1 from './mix-in-ad-1.vue';
    import mixInAd2 from './mix-in-ad-2.vue';
    import mixInAd3 from './mix-in-ad-3.vue';
    import mixInAd4 from './mix-in-ad-4.vue';
    import mixInAd5 from './mix-in-ad-5.vue';
    import mixInAd6 from './mix-in-ad-6.vue';
    import mixInAd7 from './mix-in-ad-7.vue';

    const mixInAdMap = {
        1: mixInAd1,
        2: mixInAd2,
        3: mixInAd3,
        4: mixInAd4,
        5: mixInAd5,
        6: mixInAd6,
        7: mixInAd7
    };

    export default {
        name: 'MMixinAd',
        props: {
            ...baseProps
        },
        computed: {
            variant() {
                return mixInAdMap[this.context.Data.RenderingId] || null;
            },
            variantClass() {
                return this.context.Data.RenderingId ? `-variant${this.context.Data.RenderingId}` : '';
            }
        }
    };
</script>
