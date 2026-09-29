# 注释与文档注释标准

用于后端 Java、前端 Vue/TypeScript 和数据库建表的注释。目标仓库显式声明了其它注释约定时以仓库为准；默认按本文件执行。

## 总则

- **注释回答“为什么、约束、意图”，代码表达“做什么”。** 注释不重复翻译代码，而是补充代码本身无法表达的信息：业务原因、边界、不变量、权衡和坑。
- **注释语言用中文**，标识符、类型名、关键字、外部库名保持英文；中文使用规范标点，保持简洁完整。
- **注释与代码同步。** 改动逻辑时同步更新注释；注释与代码不一致即为缺陷；过期、失效的注释必须删除。
- 注释不是越多越好。**能靠清晰命名和结构表达的内容不写注释**；需要写的地方按下面的深度标准执行。

## 注释深度标准（L1–L5）

| 级别 | 对象 | 要求 | 写什么 |
|---|---|---|---|
| L1 | 类型 / 模块 | 必须 | 职责、边界、线程/事务/状态语义、模块用途 |
| L2 | 公开契约（接口方法、公开方法、导出函数） | 必须 | 行为、参数、返回值、异常、副作用、幂等性、权限要求 |
| L3 | 关键实现 | 按需 | 非直觉决策、业务规则原因、边界条件、workaround、性能/安全/并发/事务权衡 |
| L4 | 字段 / 常量 / 枚举 / 表列 | 按需 | 单位、范围、精度、封闭取值、状态含义、外部系统含义 |
| L5 | 显而易见的代码 | 禁止 | 逐行复述、getter/setter、简单 CRUD、命名已自解释的逻辑 |

判断口径：**L1/L2 是契约，必须写全；L3/L4 只在读者的理解成本会因为缺少注释而明显上升时才写；L5 一律不写。**

## 后端 Java

### 契约来源与实现

- 接口、抽象/基类的类级 Javadoc 描述**该能力的职责与契约**；公开方法 Javadoc 描述行为、`@param`、`@return`、`@throws` 以及副作用、幂等性、权限要求。
- **实现类（impl）与覆写方法默认不重复接口/父类的 Javadoc。** 接口注释是唯一契约来源，实现处不再复制一遍。
- 仅当实现有接口未描述的额外行为（例如特定事务边界、缓存策略、线程安全、异常映射）时，才在实现处补充，并用 `{@inheritDoc}` 引出再写增量，**不要复制原文**：
  - 只有增量说明时：`{@inheritDoc}` + 增量段落。
  - 实现特有说明也可放在实现类的类级 Javadoc，而非每个方法。
- 不要把 `@Deprecated`、`@Transactional` 等注解已经表达的信息再抄进注释；注释只补充注解无法表达的原因。
- Lombok 生成的 getter/setter、构造器等不加注释。

### 分级要点

- L1：Controller、Service 接口、`ServiceImpl`、Mapper 接口、配置类、枚举、基类。
- L2：Service 接口方法、Controller 的公开处理方法、Mapper 接口方法。
- L3：复杂条件、并发/事务处理、缓存与失效、第三方兼容处理、绕过框架的 workaround。
- L4：非自明的字段、常量、枚举项（含取值含义）；能用字段名和类型表达的不写。
- L5：`userMapper.selectById(id)` 之类一望即知的调用不注释。

### 示例

```java
/**
 * 用户账户服务：负责账户生命周期与登录凭证校验。
 * <p>实现需在事务边界内保证登录名唯一；查询结果不得返回密码字段。
 */
public interface UserService extends IService<UserEntity> {

    /**
     * 按登录名查询用户。
     *
     * @param userName 登录名，区分大小写，长度 3-32
     * @return 匹配的用户；不存在时返回 {@code null}
     */
    UserVO findByUserName(String userName);
}

/**
 * 用户账户服务实现。
 */
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, UserEntity> implements UserService {

    /**
     * {@inheritDoc}
     * <p>实现优先读本地缓存，未命中再查库，缓存 TTL 为 5 分钟。
     */
    @Override
    public UserVO findByUserName(String userName) {
        // ...
    }
}
```

### Mapper 与 XML

- Mapper 接口方法写清查询意图和返回结构（尤其在返回非实体模型时）。
- XML 中复杂的连接、多表更新、索引提示或非直观动态 SQL，用 `<!-- -->` 说明原因，不逐句解释 SQL。

## 前端 Vue / TypeScript

- L1：导出的 composable、Pinia store、API 模块、共享类型、工具模块写 TSDoc；复杂组件的 `<script setup>` 顶部注释说明职责与 props/emits/slots。
- L2：导出的函数/方法写参数、返回值、异常、副作用；`export` 的 API 函数注明用途与契约敏感点。
- L3：非直觉的响应式处理、竞态/取消、缓存与失效、兼容性 workaround 写原因。
- L4：非自明的类型字段、常量、映射表（如状态码到文案）写含义。
- L5：**不逐行注释 `ref`/`computed`/模板**；能从命名看出的逻辑不注释。
- 样式：BEM 类名已表达结构，不再加选择器注释；非直观的样式 hack 注明原因。`v-html` 等安全相关用法按需说明来源可信。
- `TODO`/`FIXME` 必须带原因与后续事项标识（issue/负责人），不写无上下文标记。

```ts
/**
 * 用户列表的分页加载与筛选状态。
 *
 * @param params 查询参数（分页、筛选、排序）
 * @returns 列表数据、总数与刷新方法
 */
export function useUserList(params: Ref<UserQuery>): UseUserListReturn {
    // ...
}
```

## 数据库

- **每张表和每一列都必须有注释**，在迁移脚本中使用 `COMMENT ON TABLE` / `COMMENT ON COLUMN`，紧随 `CREATE TABLE`。
- 表注释写业务用途；列注释写**业务含义、单位、封闭取值、可空/默认语义**，而非仅重复列名。
- 修改列含义时同步更新注释；迁移中非直观的数据回填或转换，用 SQL 注释 `--` 说明原因与范围。
- 注释文本与 Java 注释一致使用中文。

```sql
CREATE TABLE app_user (
    id         uuid        NOT NULL,
    user_name  varchar(32) NOT NULL,
    enabled    boolean     NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL
);

COMMENT ON TABLE  app_user            IS '应用用户账户主表';
COMMENT ON COLUMN app_user.id         IS '主键，UUID';
COMMENT ON COLUMN app_user.user_name  IS '登录名，全局唯一，区分大小写，长度 3-32';
COMMENT ON COLUMN app_user.enabled    IS '是否启用：true 可登录，false 已禁用';
COMMENT ON COLUMN app_user.created_at IS '创建时间（带时区）';
```

## 禁止项

- 注释掉的旧代码（应直接删除，历史由版本控制保留）。
- 作者、日期、修改记录类注释（除非项目既有模板明确要求）。
- 与代码不符或已失效的注释。
- 逐行翻译代码、无信息量的分隔线注释。
- 无原因、无后续标识的 `TODO`/`FIXME`。

## 更新与维护

- 修改公开契约时，先改接口/父类注释，实现处保持不重复。
- 修改字段、枚举、表列语义时同步更新对应注释。
- 评审时检查注释是否与代码一致、是否仍必要；删除噪音注释与过期注释。
