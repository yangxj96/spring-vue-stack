<script setup lang="ts">
import { useI18n } from "vue-i18n";

import PagePlaceholder from "@/components/PagePlaceholder.vue";

const { t } = useI18n();
</script>

<template>
    <PagePlaceholder :title="t('nav.user')" />
</template>
