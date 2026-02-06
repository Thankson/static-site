<template>
    <div class="m-formField -radio" :class="mods">
        <input
            :id="inputId"
            class="a-input -radio"
            :class="size ? `-${size}` : ''"
            :checked="value === inputValue"
            type="radio"
            :name="name"
            :value="inputValue"
            :readonly="disabled"
            :aria-disabled="disabled"
            @change="$emit('change', $event)"
            v-on="!disabled ? { change: update } : {
                click: evt => evt.preventDefault(),
                keydown: evt => {
                    const key = evt.which || evt.keyCode || 0;
                    if(key !== 9) {
                        evt.preventDefault();
                    }
                }
            }">

        <label
            :for="inputId"
            class="m-formField__label -radio"
            :class="labelClasses">

            <span
                v-if="label"
                v-html="label" />

            <slot v-else />
        </label>
    </div>
</template>

<script>
    import safeId from '@common/source/js/vue/mixins/safe-id';

    export default {
        name: 'MRadio',
        mixins: [ safeId ],
        safeIds: [
            'inputId'
        ],
        props: {
            name: {
                type: String,
                default: ''
            },
            disabled: {
                type: Boolean,
                default: false
            },
            label: {
                type: String,
                default: ''
            },
            labelMods: {
                type: String,
                default: ''
            },
            mods: {
                type: String,
                default: ''
            },
            size: {
                type: String,
                default: ''
            },
            value: {
                type: [ String, Number, Boolean ],
                default: ''
            },
            inputValue: {
                type: [ String, Number, Boolean ],
                required: true
            }
        },
        data() {
            return {
                // dynamically generated Ids
                inputId: ''
            };
        },
        computed: {
            labelClasses() {
                return [
                    this.size ? `-${this.size}` : '',
                    this.disabled ? '-disabled' : '',
                    this.labelMods
                ];
            }
        },
        methods: {
            update() {
                this.$emit('input', this.inputValue);
            }
        }
    };
</script>
