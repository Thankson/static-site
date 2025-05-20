<template>
    <div class="m-iconTip leading-normal" :class="wrapClass">
        <div class="flex" :class="textClass">
            <span class="font-material leading-base" :class="iconClass" aria-hidden="true">{{ type }}</span>
            {{ text }}
            <slot name="extendText"></slot>
        </div>
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'MIconTip',
        mixins: [ localizationMixin],
        props: {
            text: {
                type: String,
                default: ''
            },
            type: {
                type: String,
                default: 'info'
            },
            iconClass: {
                type: String,
                default: 'text-sm'
            },
            textClass: {
                type: String,
                default: 'text-tiny text-gray-100'
            },
            wrapClass: {
                type: String,
                default: ''
            }
        }
    };
</script>
