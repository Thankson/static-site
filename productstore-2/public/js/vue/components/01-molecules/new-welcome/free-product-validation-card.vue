<template>
    <button
        type="button"
        class="m-freeProductValidationCard"
        @click="$emit('click')">

        <div class="m-freeProductValidationCard__imgWrapper">
            <img
                class="m-freeProductValidationCard__img"
                :alt="product.Image.Alt"
                :src="product.Image.Url"
            />
        </div>

        <div class="m-freeProductValidationCard__details">
            <ul>
                <li
                    v-for="(option, optionIndex) in product.SelectionOptions"
                    :key="uniqid(optionIndex)">

                    {{ option.Title ? `${option.Title}: ` : '' }}{{ option.Value }}
                </li>
                <li v-if="product.SelectionOptions.length === 0">

                    {{ product.Title ? `${product.Title}` : '' }}
                </li>
            </ul>

            <div
                class="m-freeProductValidationCard__selected"
                :class="!selected ? 'opacity-0' : ''"
                :aria-hidden="!selected ? 'true': null">

                {{ removedLabel }} <span class="text-green">{{ undoLabel }}</span>
            </div>
        </div>
    </button>
</template>

<script>
    import uniqid from 'uniqid';

    export default {
        name: 'MFreeProductValidationCard',
        props: {
            product: {
                type: Object,
                required: true
            },
            removedLabel: {
                type: String,
                default: ''
            },
            selected: {
                type: Boolean,
                default: false
            },
            undoLabel: {
                type: String,
                default: ''
            }
        },
        methods: {
            uniqid
        }
    };
</script>
