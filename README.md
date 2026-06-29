HEAD
# Неваляшка - Веб-интерфейс

Современный веб-интерфейс для управления системой "Неваляшка", построенный на **Nuxt 3**, **Vue 3**, **TypeScript** и **Element Plus**.

## Возможности

### Управление нодами
- Подключение к нодам по URL
- Сохранение списка нод для быстрого доступа
- Отображение статуса подключения
- Дашборд с основными метриками

### Управление модулями
- Просмотр списка модулей на ноде
- Просмотр модулей из подключенных реестров
- Добавление модулей из реестров на ноду
- Копирование модулей с новым ID
- Удаление модулей
- Просмотр исходного кода модулей (Elixir)

### Управление сервисами
- Создание и редактирование сервисов
- Настройка входных и выходных каналов
- Запуск и остановка отдельных сервисов
- Запуск и остановка всех сервисов
- Просмотр запущенных сервисов
- Привязка конфигураций к сервисам

### Управление конфигурациями
- Создание конфигураций с JSON параметрами
- Редактирование конфигураций с валидацией JSON
- Удаление конфигураций
- Просмотр параметров конфигураций

### Управление реестрами
- Подключение внешних реестров
- Просмотр модулей в реестрах
- Добавление модулей из реестров на ноду
- Удаление реестров

## Технологический стек

- **Nuxt 3** - Vue.js фреймворк
- **Vue 3** - Composition API
- **TypeScript** - строгая типизация
- **Element Plus** - UI библиотека
- **Pinia** - управление состоянием
- **Axios** - HTTP клиент
- **Tailwind CSS** - утилитарный CSS
- **VueUse** - композиционные утилиты

## Установка и запуск

### Установка pnpm

```bash
npm i -g pnpm
```

### Установка зависимостей

```bash
pnpm install
```

### Запуск в режиме разработки

```bash
pnpm dev
```

Приложение будет доступно по адресу: http://localhost:3000

### Сборка для production

```bash
pnpm build
pnpm preview
```

## Конфигурация

Создайте файл `.env`:

```env
NUXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

## Использование

1. **Подключение к ноде**: введите URL ноды и нажмите "Подключиться"
2. **Управление модулями**: просмотр, добавление, копирование и удаление модулей
3. **Управление сервисами**: создание, настройка и запуск сервисов
4. **Управление конфигурациями**: создание и редактирование JSON конфигураций
5. **Управление реестрами**: подключение реестров и добавление модулей

## Структура проекта

```
nevalyashka-ui/
├── api/                    # OpenAPI спецификация
├── assets/styles/          # Стили
├── components/             # Vue компоненты
├── composables/            # Композиционные функции
├── layouts/                # Layouts
├── pages/                  # Страницы
├── plugins/                # Nuxt плагины
├── stores/                 # Pinia stores
├── types/                  # TypeScript типы
├── utils/                  # Утилиты
└── nuxt.config.ts          # Конфигурация
```

## API

Типы автоматически генерируются из OpenAPI спецификации:

```bash
npx openapi-typescript api/openapi.yaml -o types/api-schema.ts
```

## Лицензия

MIT
# Weeblix (Project Nevalyashka)

**Weeblix** is a platform automation project designed for real-time streaming data processing. It enables the rapid organization and reorganization of competence centers and decision-making hubs, forming a situational center network with arbitrary complex connectivity for seamless data exchange and high resilience against system node failures.

## Overview

Weeblix implements a concept of deploying data processing nodes and registries that centrally provide processing modules and their configurations to the nodes. Data processing is orchestrated both within individual nodes and between them. This approach significantly enhances system flexibility, simplifies deployment, and streamlines management on container orchestration platforms like Kubernetes (K8s).

The agent component of Weeblix has a minimal footprint, allowing it to be deployed on IoT devices. This capability enables the creation of highly efficient data collection and processing networks with pre-processing and aggregation nodes positioned directly near edge devices, thereby reducing bandwidth requirements for external connections.

## Architecture

A Weeblix node consists of a set of services. Each service is composed of a processing module (retrieved from pre-connected registries) and its configuration (also from the registry). Services exchange information via named channels.

The entire system is optimized for in-memory data processing. Extraneous information that is not directed to any specific channel is not stored, unless a dedicated logging or archiving module is explicitly connected.

All node and registry configurations can be easily distributed, including via files, which allows for the mass deployment of nodes in fully automated modes. This makes Weeblix highly suitable for production environments.

Technically, all Weeblix nodes and registries are managed via a REST HTTP API. An OpenAPI specification is provided, ensuring seamless integration of any operations with Weeblix into existing data processing workflows.

## Recommended Use Cases

### Smart Home & Industrial IoT
Weeblix is highly optimized for data transmission and processing in Smart Home networks and Industrial IoT. In these scenarios, network segments containing various sensors (temperature, pressure, leak detection, etc.) can be isolated. Information is collected by an aggregating Weeblix node, which then transmits strictly targeted data (filtering out statistical noise and data from faulty sensors) rather than raw streams to an upstream controller or user interface.

### Testing and Research Environments
IT teams can leverage Weeblix when setting up testing and research environments that require switching between mock systems and their real counterparts during integration testing or when analyzing complex interactions between systems.

Weeblix nodes provide a standard interface and logging system, alongside an open mechanism for connecting modules. This allows for processing any type of data using any method, while maintaining standardized resource and log management, which significantly reduces maintenance overhead for DevOps teams.

### Situational Centers and Headquarters
Situational centers represent another key application scenario for Weeblix. The standardized interaction interface allows for the connection of external information sources, including those managed by external teams. Simplified interface alignment automatically reduces connection overhead and, most importantly, minimizes the time required for such integrations. Easy channel management allows for connecting new information supply channels and disconnecting outdated or unreliable ones without disrupting the overall system operations.

### Distributed ETL Systems
DevOps teams should consider Weeblix for building large, distributed ETL (Extract, Transform, Load) data processing systems utilizing multiple distinct nodes, all of which are standardly managed and monitored in Kubernetes. Traditional ETL systems often restrict monitoring and debugging to their internal methods and interfaces. A system based on Weeblix nodes enables independent monitoring for each node, utilizing the standard monitoring tools of the container management platform hosting the nodes.

## Getting Started

### Local Development Setup

To build and run the project locally in development mode:

```bash
iex -S mix
```

### Production Build

To compile the project for production:

```bash
MIX_ENV=prod mix release
```

### Docker Build

To build Docker images for the registry and nodes:

```bash
cd docker
./build.sh register
./build.sh node
```

### Running Docker Images

To run the built Docker images:

```bash
docker run -ti --rm -p 4000:4000 knodlang/weeblix:register
docker run -ti --rm -p 4001:4000 knodlang/weeblix:register
```

By default:
* The **registry** is available at `http://localhost:4000`
* The **node** is available at `http://localhost:4001`

## License

This project is licensed under the terms specified in the [LICENSE](LICENSE) file.
00446561adb6a2f47fc1fe917c2e32ec1e6243dc
