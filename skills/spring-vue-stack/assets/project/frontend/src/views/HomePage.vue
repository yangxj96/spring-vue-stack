<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>

<template>
    <div class="home-page">
        <h1 class="home-page__title">{{ t("app.title") }}</h1>
    </div>
</template>

<style scoped lang="scss">
.home-page {
    padding: 24px;

    &__title {
        font-size: 20px;
    }
}
</style>
