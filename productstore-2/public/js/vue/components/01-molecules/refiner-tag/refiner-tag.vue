<template>
    <div class="m-refinerTag" :class="{ '-isCn': isCn }">

        <ul v-if="activeRefiners.length" class="m-refinerTag__list">
            <li class="m-refinerTag__item">
                <button class="m-refinerTag__btn -clear" @click="removeAllRefiners">{{ clearAll }}</button>
            </li>
            <li
                v-for="(refiner, i) in activeRefiners"
                :key="i"
                class="m-refinerTag__item"
            >
                <button class="m-refinerTag__btn" :aria-label="replaceToken(removeFilterAriaLabel, refiner.name)" @click="removeRefiner(refiner)">
                    <span class="m-refinerTag__close" aria-hidden="true">cancel</span>
                    {{ refiner.name }}
                </button>
            </li>
        </ul>

    </div>
</template>

<script>
    import replaceToken from '@common/source/js/vue/utils/replace-token';

    export default {
        name: 'RefinerTag',

        props: {
            clearAll: {
                type: String,
                default: 'Clear All'
            },
            isCn: {
                type: Boolean,
                default: false
            },
            remove: {
                type: String,
                default: 'Remove'
            },
            removeFilterAriaLabel: {
                type: String,
                default: ''
            },
            /** @typedef {{ name: string, value: string, key: string }} Refiner */
            /** @type {Array<Refiner>} */
            activeRefiners: {
                type: Array,
                required: true
            }
        },

        methods: {
            replaceToken,

            removeRefiner(refiner) {
                this.$emit('remove', refiner);
            },

            removeAllRefiners() {
                this.$emit('clearAll');
            }
        }
    };
</script>
