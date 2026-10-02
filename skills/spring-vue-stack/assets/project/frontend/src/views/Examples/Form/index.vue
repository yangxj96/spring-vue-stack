<script setup lang="ts">
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { reactive, ref } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const formRef = ref<FormInstance>();
const form = reactive({ name: "", type: "A" });
const rules: FormRules = {
    name: [{ required: true, message: t("demo.nameRequired"), trigger: "blur" }]
};

/** 校验并提交演示表单。 */
async function handleSubmit(): Promise<void> {
    if (!formRef.value) {
        return;
    }
    const valid = await formRef.value.validate().catch(() => false);
    if (!valid) {
        return;
    }
    ElMessage.success(t("demo.submitSuccess"));
}
</script>

<template>
    <div class="demo-form">
        <el-form ref="formRef" :model="form" :rules="rules" label-width="80px" class="demo-form__form">
            <el-form-item :label="t('demo.name')" prop="name">
                <el-input v-model="form.name" :placeholder="t('demo.namePlaceholder')" />
            </el-form-item>
            <el-form-item :label="t('demo.type')">
                <el-select v-model="form.type">
                    <el-option label="A" value="A" />
                    <el-option label="B" value="B" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="handleSubmit">{{ t("demo.submit") }}</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<style scoped lang="scss">
.demo-form {
    &__form {
        max-width: 480px;
    }
}
</style>
