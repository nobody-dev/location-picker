<script>
import UiIconCross from '@n1/ui-kit/UiIcons/UiIconCross';
import UiIconSearch from '@n1/ui-kit/UiIcons/UiIconSearch';
import UiInput from '@n1/ui-kit/UiInput';

/** Строка поиска */
export default {
    components: {
        UiIconCross,
        UiInput,
        UiIconSearch,
    },

    props: {
        /** Значение в строке поиска */
        value: {
            type: String,
            default: '',
        },
    },

    methods: {
        /**
         * Эмитит в родителя значение, введенное в инпут
         * @param {string} value - значение, введенное в инпут
         */
        requestSearch(value) {
            this.$emit('search', value);
        },
    },
};
</script>

<template lang="pug">
.search-bar
    ui-input.input(
        placeholder="Регион, город, нас. пункт",
        :value="value",
        @input="requestSearch"
    )
    .icon(
        v-if="value",
        @click="requestSearch('')",
        @click.native="requestSearch('')",
    )
        ui-icon-cross.icon__inner
    .icon(v-else)
        ui-icon-search.icon__inner
</template>

<style lang="scss" scoped>
@import '~@n1/ui-kit/styles/typography.scss';

.search-bar {
    padding: 12px 0;
    position: relative;
    display: flex;
    align-items: center;
}

.input {
    width: 100%;
    @include ui-kit-typography-body-md-tight;
}

.icon {
    position: absolute;
    right: 8px;
    width: 20px;
    height: 20px;
    cursor: pointer;
    z-index: 1;

    &__inner {
        width: 20px;
        height: 20px;
        opacity: 0.5;

        &:hover {
            opacity: 1;
        }
    }
}
</style>

<style lang="scss">
.input .ui-input__field {
    padding-right: 40px;
}
</style>
