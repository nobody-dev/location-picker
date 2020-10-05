<script>
import UiIconCheck from '@n1/ui-kit/UiIcons/UiIconCheck';

/** Элемент списка результатов поиска */
export default {
    components: {
        UiIconCheck,
    },

    props: {
        /** Массив с результатами поиска */
        item: {
            type: Object,
            requried: true,
            default: () => {},
        },
    },

    computed: {
        isRegion() {
            return this.item.type === 'region';
        },
    },

    methods: {
        /**
         * Эмитит в родителя, что гео-объект был выбран
         */
        selectItem() {
            this.$emit('city-selected', this.item);
        },
    },
};
</script>

<template lang="pug">
.search-item(
    @click="selectItem",
    @click.native="selectItem",
)
    .item
        .item__name {{item.title}}

        .item__subname(
            v-if="item.subtitle",
            :class="{'_red': isRegion}"
        ) {{item.subtitle}}

    ui-icon-check.item__check(
        v-if="item.checked"
    )

</template>

<style lang="scss" scoped>
@import '~@n1/ui-kit/styles/typography.scss';
@import '~@n1/ui-kit/styles/color.scss';

.search-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;

    &:hover {
        cursor: pointer;

        .item {
            color: $ui-kit-color-red;
        }
    }
}

.item {
    overflow: hidden;

    &__subname {
        @include ui-kit-typography-body-sm-tight();
        color: $ui-kit-color-gray;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;

        &._red {
            color: $ui-kit-color-red;
        }
    }

    &__check {
        color: $ui-kit-color-red;
    }
}
</style>
