<script>
import UiIconBulb from '@n1/ui-kit/UiIcons/UiIconBulb';

/** Компонент, отображающий подсказку для поиска */
export default {
    components: {
        UiIconBulb,
    },
};
</script>

<template lang="pug">
.choose-region-info
    ui-icon-bulb.icon
    .text
        | Если нет нужного населенного пункта, выберите весь регион, в&nbsp;котором он находится

</template>

<style lang="scss" scoped>
@import '~@n1/ui-kit/styles/color.scss';
@import '~@n1/ui-kit/styles/typography.scss';

.choose-region-info {
    @include ui-kit-typography-body-sm-tight();
    margin-top: 36px;
    margin-bottom: 36px;
    display: flex;
    flex-direction: column;
    color: $ui-kit-color-gray;
    align-items: center;
    padding-right: 24px;
}

.icon {
    color: $ui-kit-color-indigo;
    width: 48px;
    height: 48px;
}

.text {
    text-align: center;
    width: 204px;
    margin-top: 12px;
}
</style>
