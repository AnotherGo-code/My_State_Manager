# 数据库设置指南

## 问题诊断

如果添加任务、日程、日志的功能不工作，可能是因为：

1. **数据库表不存在** - 需要运行 SQL 创建表
2. **RLS 策略问题** - 数据被安全策略阻止
3. **用户未登录** - 所有操作都需要认证用户

## 解决方案

### 步骤 1: 设置 Supabase 数据库

1. 登录到您的 Supabase 控制台：<https://supabase.com/dashboard>
2. 选择您的项目
3. 进入 **SQL Editor**
4. 复制并运行项目中的 `supabase_setup.sql` 文件内容

### 步骤 2: 验证设置

1. 在应用中点击 **"测试数据库"** 按钮
2. 打开浏览器控制台 (F12) 查看日志
3. 确认所有表都可以访问

### 步骤 3: 测试功能

1. 登录到应用
2. 尝试添加任务、日程、日志
3. 如果仍有问题，查看控制台错误信息

## 常见错误

### "permission denied for table"

- 原因：RLS 策略阻止访问
- 解决：确保运行了完整的 `supabase_setup.sql`

### "relation does not exist"

- 原因：表不存在
- 解决：运行 `supabase_setup.sql` 创建表

### "user_id is required"

- 原因：代码中缺少用户ID
- 解决：确保已登录用户

## 调试工具

- **测试数据库按钮**：检查数据库连接
- **浏览器控制台**：查看详细错误信息
- **Supabase 日志**：在控制台查看数据库操作日志d:\Project\My_State_Manager\DATABASE_SETUP.md
