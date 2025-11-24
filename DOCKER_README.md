# Docker Setup для Energy Forecast

Цей документ містить інструкції по запуску проєкту через Docker з можливістю перемикання між локальним бекендом та Hugging Face.

## Швидкий старт

### 1. Запуск з Hugging Face бекендом (за замовчуванням)

```bash
# Production режим
docker-compose --env-file .env.docker.hg up --build

# Додаток буде доступний на http://localhost:3000
```

### 2. Запуск з локальним бекендом

```bash
# Production режим
docker-compose --env-file .env.docker.local up --build

# Додаток буде доступний на http://localhost:3000
```

### 3. Режим розробки (development) з hot reload

```bash
# З HG бекендом
docker-compose --env-file .env.docker.hg --profile dev up frontend-dev

# З локальним бекендом
docker-compose --env-file .env.docker.local --profile dev up frontend-dev

# Додаток буде доступний на http://localhost:5173
```

## Альтернативні методи запуску

### Використання Docker без docker-compose

#### Побудова образу з HG бекендом:
```bash
docker build \
  --build-arg VITE_API_ENDPOINT=https://mykola121-energy-forecast-api.hf.space \
  -t energy-forecast:hg .
```

#### Побудова образу з локальним бекендом:
```bash
docker build \
  --build-arg VITE_API_ENDPOINT=http://localhost:7860 \
  -t energy-forecast:local .
```

#### Запуск контейнера:
```bash
# З HG бекендом
docker run -p 3000:80 energy-forecast:hg

# З локальним бекендом
docker run -p 3000:80 energy-forecast:local
```

## Локальна розробка без Docker

### З HG бекендом:
```bash
cp .env.hg .env
pnpm install
pnpm dev
```

### З локальним бекендом:
```bash
cp .env.local .env
pnpm install
pnpm dev
```

## Структура файлів

```
energy-forecast/
├── Dockerfile              # Multi-stage Docker build
├── docker-compose.yml      # Docker Compose конфігурація
├── nginx.conf              # Nginx конфігурація для production
├── .dockerignore           # Файли, які треба ігнорувати при build
├── .env                    # Основний env файл (не комітиться)
├── .env.local              # Локальний бекенд (для розробки)
├── .env.hg                 # Hugging Face бекенд (для розробки)
├── .env.docker.local       # Локальний бекенд (для Docker)
└── .env.docker.hg          # Hugging Face бекенд (для Docker)
```

## Корисні команди

### Зупинити контейнери:
```bash
docker-compose down
```

### Зупинити та видалити volumes:
```bash
docker-compose down -v
```

### Переглянути логи:
```bash
docker-compose logs -f frontend
```

### Перебудувати без кешу:
```bash
docker-compose build --no-cache
```

### Health check:
```bash
curl http://localhost:3000/health
```

## Оптимізація

Dockerfile використовує multi-stage build для мінімізації розміру фінального образу:
- **Builder stage**: Node.js 20 Alpine + pnpm для збірки
- **Production stage**: Nginx Alpine для serving статичних файлів

### Переваги:
- Малий розмір фінального образу (~30MB)
- Швидкий час старту
- Gzip compression для статичних файлів
- Security headers
- Health check endpoint
- Кешування статичних ресурсів

## Конфігурація бекенду

Ви можете змінити URL бекенду редагуючи відповідний `.env` файл:

### Для локальної розробки:
```bash
# .env.local або .env.hg
VITE_API_ENDPOINT=http://localhost:7860
```

### Для Docker:
```bash
# .env.docker.local або .env.docker.hg
API_ENDPOINT=http://localhost:7860
```

## Troubleshooting

### Порт вже зайнятий:
```bash
# Змініть порт в docker-compose.yml
ports:
  - "8080:80"  # замість 3000:80
```

### Проблеми з підключенням до локального бекенду:
```bash
# На macOS/Windows використовуйте host.docker.internal
API_ENDPOINT=http://host.docker.internal:7860
```

### Очистити Docker кеш:
```bash
docker system prune -a
```

## Production Deployment

### Hugging Face Spaces:
Використовуйте `.env.docker.hg` конфігурацію

### Власний сервер:
```bash
docker-compose --env-file .env.docker.hg up -d
```

### Kubernetes:
Конвертуйте docker-compose.yml в Kubernetes manifests за допомогою kompose:
```bash
kompose convert
```