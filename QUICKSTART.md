# Быстрый старт

## Предварительные требования

1. **Java 25** (LTS)
2. **Maven 3.9+** (рекомендуется Maven 4.0)
3. **PostgreSQL 12+** (рекомендуется PostgreSQL 15+)

## Шаги для запуска

### 1. Создайте базу данных PostgreSQL

```sql
CREATE DATABASE base_db;
```

**Опционально**: Если вы хотите вручную создать таблицы вместо автоматического создания через Hibernate, выполните скрипт `database/init.sql`:

```bash
psql -U ваш_пользователь -d base_db -f database/init.sql
```

Этот скрипт создаст необходимые таблицы (`roles`, `users`, `user_roles`) и добавит базовые роли (USER, ADMIN).

### 2. Настройте подключение к БД

Отредактируйте `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/base_db
spring.datasource.username=ваш_пользователь
spring.datasource.password=ваш_пароль
```

### 3. Запустите приложение

```bash
mvn spring-boot:run
```

Или скомпилируйте и запустите:

```bash
mvn clean package
java -jar target/base-1.0.0.jar
```

### 4. Откройте в браузере

Перейдите по адресу: http://localhost:8080

## Использование

1. **Регистрация**: Создайте нового пользователя через форму регистрации
2. **Вход**: Войдите используя имя пользователя и пароль
3. **Рабочее пространство**: После входа вы увидите рабочее окно с панелью управления

## Создание администратора

После регистрации первого пользователя, выполните SQL для назначения роли администратора:

```sql
-- Найти ID пользователя
SELECT id, username FROM users WHERE username = 'имя_пользователя';

-- Добавить роль администратора
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.username = 'имя_пользователя' AND r.name = 'ADMIN';
```

**Примечание**: В файле `database/init.sql` есть закомментированный пример создания администратора с предустановленным паролем. Вы можете раскомментировать и использовать его для первоначальной настройки.

## Структура проекта

- **Backend**: Spring Boot приложение в `src/main/java`
- **Frontend**: HTML/CSS/JS в `src/main/resources/static`
- **Database**: PostgreSQL (настройка в `application.properties`)

## API Endpoints

- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `GET /api/user/me` - Информация о текущем пользователе
- `GET /api/user/all` - Список всех пользователей (только для администраторов)

