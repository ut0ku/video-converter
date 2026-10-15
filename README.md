# Video Converter

В проекте есть React/Vite-фронтенд и Java/Spring Boot API для конвертации через FFmpeg.

## Запуск

1. Установите FFmpeg и убедитесь, что команда `ffmpeg` доступна в `PATH`.
   Если бинарник находится в другом месте, задайте `FFMPEG_PATH`.
2. Запустите API:

   ```powershell
   mvn -f backend\pom.xml spring-boot:run
   ```

3. В другом окне запустите фронтенд:

   ```powershell
   npm install
   npm run dev
   ```

Vite проксирует `/api` на `http://localhost:8080`. Для отдельного адреса API
можно задать `VITE_API_URL` при сборке фронтенда.

### Аутентификация и лимиты

- `POST /api/auth/register` и `POST /api/auth/login` принимают JSON
  `{"email":"user@example.com","password":" минимум 8 символов "}` и возвращают
  JWT. Подтверждение email не требуется.
- `POST /api/conversions` можно выполнять без токена (гостевой лимит — 10
  конвертаций в сутки на IP) или с `Authorization: Bearer <token>` (лимит
  зарегистрированного пользователя — 100 в сутки). Ответ и статус содержат
  `identity` и текущий `usage`.
- `GET /api/admin/statistics` возвращает использование форматов конвертации и
  доступен администратору.

Администратор создаётся при запуске из `ADMIN_EMAIL` и `ADMIN_PASSWORD`.
Значения по умолчанию: `admin@example.com` / `admin123` (для production
обязательно задайте переменные окружения). Секрет JWT задаётся `JWT_SECRET`
(не менее 32 символов; по умолчанию используется development-секрет).

## API

- `POST /api/conversions` — multipart-загрузка с полем `file` и параметрами
  `format`, `resolutionMode`, `resolution`, `width`, `height`, `fpsMode`, `fps`,
  `quality`, `durationMs`.
- `GET /api/conversions/{id}` — состояние, процент, этап и URL готового файла.
- `DELETE /api/conversions/{id}` — остановка FFmpeg и удаление временных файлов.
- `GET /api/conversions/{id}/download` — скачивание результата.

Поддерживаются форматы MP4, WebM, MKV, MOV, AVI и GIF. По умолчанию сервер
одновременно обрабатывает две задачи; число задач можно изменить через
`CONVERTER_MAX_CONCURRENT_JOBS`.

### Админ-панель

Администратор входит через кнопку аккаунта в шапке сайта, используя `ADMIN_EMAIL` и
`ADMIN_PASSWORD` (по умолчанию `admin@example.com` / `admin123`). Администратор
получает дневной лимит 100000 конвертаций и видит панель со статистикой по дням и
форматам, состояниями задач, нагрузкой CPU/RAM и списком пользователей.

В панели можно выдать зарегистрированному пользователю дополнительные конвертации
на текущий день. Данные аккаунтов, лимитов и статистики сохраняются в PostgreSQL
в базе `video_converter`.

Для проверки API доступны Swagger UI и OpenAPI JSON:

- `http://localhost:8080/swagger-ui/index.html`
- `http://localhost:8080/v3/api-docs`

Параметры подключения задаются в `backend/.env`: `DB_URL`, `DB_USERNAME`,
`DB_PASSWORD`, `ADMIN_EMAIL` и `ADMIN_PASSWORD`.
