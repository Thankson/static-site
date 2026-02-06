<template>
    <div class="a-select" :class="{'relative a-select__forVideo': sortType == 'video'}">
        <span v-if="sortType == 'video'" ref="filterShowing" class="absolute flex items-center h-40 pl-10 text-gray-100 pointer-events-none z-1" :class="isCn ? 'text-sm' :'text-md top-1'">
            {{ title }}
        </span>
        <select v-model="selected" :aria-label="ariaLabel" class="a-select__field -sort" @change="$emit('change', $event)">
            <option v-for="(option, i) in options" :key="i" :value="option.value">
                <!-- if `showTitle` is set to 'selected', then display the title only for the first item: -->
                {{ sortType !=='video' && ( (showTitle === true) || (showTitle === 'selected' && option.value === selected)) ? `${title}: ` : null }}{{ option.name }}
            </option>
        </select>
        <div class="a-select__icon">
            <span aria-hidden="true" class="a-arrow -sm -down -filled">
                <span class="border-black a-arrow__icon"></span>
            </span>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'MFilterSort',
        props: {
            ariaLabel: {
                type: String,
                default: ''
            },
            title: {
                type: String,
                default: ''
            },
            // if/how to show the title in the options list:
            // if `true` show title for all items; if "first" show title only for the first item:
            showTitle: {
                type: [String, Boolean],
                default: true,
                validator: value => [true, false, 'selected'].indexOf(value) !== -1
            },
            value: {
                type: String,
                default: ''
            },
            /** @typedef {{ name: string, value: string }} SortOption */
            /** @type {Array<SortOption>} */
            options: {
                type: Array,
                required: true
            },
            sortType: {
                type: String,
                default: ''
            },
            sortLabel: {
                type: String,
                default: ''
            }
        },
        computed: {
            selected: {
                get() {
                    return this.value;
                },
                set(val) {
                    this.$emit('input', val);
                }
            },
            isCn() {
                return this.$env.IsCn || false;
            }
        }
    };
</script>
