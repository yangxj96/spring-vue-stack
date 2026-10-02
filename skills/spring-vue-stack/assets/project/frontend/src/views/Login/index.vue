<script setup lang="ts">
// 登录页：账号密码表单；提交后写入 token 并跳转回来源页。当前为 Mock 登录，接入后端时见 auth store。
import { Lock, User } from "@element-plus/icons-vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";

import { useAuthStore } from "@/plugins/stores/auth";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const formRef = ref<FormInstance>();
const loading = ref(false);
const form = reactive({ username: "admin", password: "admin" });
const rules: FormRules = {
    username: [{ required: true, message: t("login.usernameRequired"), trigger: "blur" }],
    password: [{ required: true, message: t("login.passwordRequired"), trigger: "blur" }]
};

/** 校验并提交登录。 */
async function handleLogin(): Promise<void> {
    if (!formRef.value) {
        return;
    }
    const valid = await formRef.value.validate().catch(() => false);
    if (!valid) {
        return;
    }
    loading.value = true;
    try {
        await authStore.login({ username: form.username, password: form.password });
        ElMessage.success(t("login.success"));
        const redirect = typeof route.query.redirect === "string" ? route.query.redirect : "/";
        await router.replace(redirect);
    } catch (error) {
        ElMessage.error(error instanceof Error ? error.message : t("login.failed"));
    } finally {
        loading.value = false;
    }
}
</script>

<template>
    <div class="login-page">
        <el-card class="login-page__card" shadow="always">
            <div class="login-page__brand">
                <svg class="login-page__logo" viewBox="0 0 32 32" aria-hidden="true">
                    <rect width="32" height="32" rx="8" fill="var(--el-color-primary)" />
                    <path d="M9 21V11h3.4l3.6 6 3.6-6H23v10h-3v-5.1l-3 4.6h-.8l-3-4.6V21H9z" fill="#fff" />
                </svg>
                <span class="login-page__name">{{ t("app.name") }}</span>
            </div>
            <p class="login-page__subtitle">{{ t("login.subtitle") }}</p>

            <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent="handleLogin">
                <el-form-item :label="t('login.username')" prop="username">
                    <el-input
                        v-model="form.username"
                        :prefix-icon="User"
                        :placeholder="t('login.usernamePlaceholder')"
                        autocomplete="username" />
                </el-form-item>
                <el-form-item :label="t('login.password')" prop="password">
                    <el-input
                        v-model="form.password"
                        type="password"
                        show-password
                        :prefix-icon="Lock"
                        :placeholder="t('login.passwordPlaceholder')"
                        autocomplete="current-password" />
                </el-form-item>
                <el-button type="primary" class="login-page__submit" :loading="loading" native-type="submit">
                    {{ t("login.submit") }}
                </el-button>
            </el-form>
        </el-card>
    </div>
</template>

<style scoped lang="scss">
.login-page {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background:
        radial-gradient(circle at 20% 20%, var(--el-color-primary-light-7) 0%, transparent 45%),
        radial-gradient(circle at 80% 80%, var(--el-color-primary-light-8) 0%, transparent 45%),
        linear-gradient(135deg, #0f172a 0%, #1e293b 100%);

    &__card {
        width: 360px;
    }

    &__brand {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
    }

    &__logo {
        width: 36px;
        height: 36px;
    }

    &__name {
        font-size: 20px;
        font-weight: 600;
        color: var(--el-text-color-primary);
    }

    &__subtitle {
        margin: 8px 0 20px;
        font-size: 13px;
        text-align: center;
        color: var(--el-text-color-secondary);
    }

    &__submit {
        width: 100%;
    }
}
</style>
