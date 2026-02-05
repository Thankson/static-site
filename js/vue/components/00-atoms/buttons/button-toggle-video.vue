<template>
    <button
        type="button"
        class="m-videoToggle"
        :data-js="buttonDataJs"
        :data-video="buttonDataVideo"
        @click="$emit('click', $event)">

        <span class="sr-only">
            Watch Video {{ videoTitle }}
        </span>

        <div
            class="m-videoToggle__button"
            :class="alignmentClass"
            aria-hidden="true">

            <span v-if="icon" class="a-playCircle material-icons" :class="iconClass">{{ iconCode }}</span>
        </div>
    </button>
</template>

<script>
    export default {
        name: 'VButtonVideo',
        props: {
            buttonDataJs: {
                type: String,
                default: null
            },
            buttonDataVideo: {
                type: String,
                default: null
            },
            videoTitle: {
                type: String,
                default: 'XXX'
            },
            icon: {
                type: Boolean,
                default: true
            },
            alignmentClass: {
                type: String,
                default: 'items-start justify-center'
            },
            iconClass: {
                type: String,
                default: '-gray -xl'
            },
            iconCode: {
                type: String,
                default: 'play_circle_outline'
            }
        }
    };
</script>
