# Base Application

Java приложение с фронтендом и бэкендом, использующее PostgreSQL для хранения данных.

## Технологии

- **Backend**: Spring Boot 3.5.0, Java 25
- **Frontend**: HTML, CSS, JavaScript
- **База данных**: PostgreSQL
- **Безопасность**: Spring Security, JWT (jjwt 0.12.6)
- **ORM**: Spring Data JPA
- **PostgreSQL Driver**: 42.7.4

## Требования

- Java 25 (LTS)
- Maven 3.9+ (рекомендуется Maven 4.0)
- PostgreSQL 12+ (рекомендуется PostgreSQL 15+)

## Установка и настройка

### 1. Настройка PostgreSQL

Создайте базу данных:

```sql
CREATE DATABASE base_db;
```

### 2. Настройка приложения

Отредактируйте файл `src/main/resources/application.properties` и укажите ваши данные для подключения к PostgreSQL:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/base_db
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### 3. Запуск приложения

```bash
mvn spring-boot:run
```

Приложение будет доступно по адресу: http://localhost:8080

## Функциональность

### Аутентификация
- Регистрация новых пользователей
- Вход в систему
- JWT токены для авторизации

### Роли пользователей
- **USER** - обычный пользователь
- **ADMIN** - администратор

### Рабочее пространство
- Верхняя панель с управлением пользователем
- Меню пользователя с информацией и выходом
- Панель администратора (только для администраторов)

## API Endpoints

### Аутентификация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход

### Пользователи
- `GET /api/user/me` - Информация о текущем пользователе
- `GET /api/user/all` - Список всех пользователей (только для администраторов)

## Структура проекта

```
src/
├── main/
│   ├── java/com/example/base/
│   │   ├── config/          # Конфигурация безопасности
│   │   ├── controller/      # REST контроллеры
│   │   ├── dto/             # Data Transfer Objects
│   │   ├── model/           # Модели данных
│   │   ├── repository/      # Репозитории
│   │   └── service/         # Бизнес-логика
│   └── resources/
│       ├── static/
│       │   ├── css/         # Стили
│       │   └── js/          # JavaScript
│       └── templates/       # HTML шаблоны
└── pom.xml
```

## Первый запуск

При первом запуске приложение автоматически создаст необходимые таблицы в базе данных. Первый пользователь будет создан через форму регистрации.

Для создания администратора можно использовать SQL:

```sql
-- Найти пользователя
SELECT id, username FROM users WHERE username = 'your_username';

-- Добавить роль администратора
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.username = 'your_username' AND r.name = 'ADMIN';
```

