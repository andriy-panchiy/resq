# RESQ - React Element Selector Query

## Полная документация проекта

---

## 1. Обзор проекта

**RESQ** (React Element Selector Query) — это TypeScript библиотека, которая реализует механизм запросов к React компонентам через Virtual DOM, аналогично `querySelector` и `querySelectorAll` для обычного DOM.

### Основные характеристики

| Параметр | Значение |
|----------|----------|
| Версия | 1.12.0 |
| Язык | TypeScript |
| Автор | Baruch Velez |
| Лицензия | MIT |
| Репозиторий | https://github.com/baruchvlz/resq |
| NPM | https://www.npmjs.com/package/resq |

### Требования

- **React**: v16+ (включая v17, v18)
- **Node.js**: v14+
- **TypeScript**: v4.5+ (опционально, для типизации)

### Зависимости

- `fast-deep-equal` — глубокое сравнение объектов для фильтрации

### Новое в версии 1.12.0

- **Полная типизация TypeScript** — включая методы `byProps()` и `byState()`
- **Защита от Stack Overflow** — виявлення циклічних посилань у React Fiber
- **Ліміти безпеки** — обмеження глибини та ітерацій для захисту від нескінченних циклів

---

## 2. Решаемые задачи

RESQ решает следующие проблемы:

1. **Поиск React компонентов по имени** — без прямого доступа к DOM
2. **Доступ к props и state** — получение внутреннего состояния компонентов
3. **Фильтрация компонентов** — по props или state
4. **Автоматизированное тестирование** — интеграция с E2E тестами
5. **Отладка** — инспектирование React дерева компонентов

### Типичные сценарии использования

- **E2E тестирование**: Selenium, Puppeteer, Cypress
- **Отладка приложений**: поиск компонентов с определенным состоянием
- **Инструменты разработчика**: создание утилит для анализа React приложений

---

## 3. Архитектура проекта

### Структура файлов

```
resq/
├── src/
│   ├── index.ts            # Главная точка входа (экспорты)
│   ├── types.ts            # TypeScript определения типов
│   ├── resq.ts             # Классы запросов
│   ├── utils.ts            # Утилиты для работы с деревом
│   └── waitToLoadReact.ts  # Ожидание загрузки React
├── tests/
│   ├── __mocks__/
│   │   └── vdom.ts         # Mock данные Virtual DOM
│   ├── resq.test.ts        # Тесты основных классов
│   ├── utils.test.ts       # Тесты утилит
│   ├── waitToLoadReact.test.ts
│   └── cycle-detection.test.ts  # Тесты защиты от Stack Overflow
├── dist/
│   ├── index.js            # Скомпилированный UMD bundle
│   └── src/
│       ├── *.js            # Скомпилированные модули
│       └── *.d.ts          # Сгенерированные типы
├── package.json
├── tsconfig.json           # Конфигурация TypeScript
├── webpack.config.js
├── jest.config.js
└── babel.config.js
```

### Диаграмма зависимостей модулей

```
src/index.ts (точка входа)
    ├── src/resq.ts
    │   ├── src/utils.ts
    │   └── src/types.ts
    ├── src/utils.ts
    │   └── src/types.ts
    └── src/waitToLoadReact.ts
        ├── src/utils.ts
        └── src/types.ts
```

---

## 4. API Reference

### Типы данных

#### RESQNode

Основной тип возвращаемых данных:

```typescript
interface RESQNode {
    name: string | StyledComponentName | undefined;  // Имя компонента
    node: HTMLElement | Text | (HTMLElement | Text)[] | null; // DOM элемент(ы)
    isFragment?: boolean;   // Является ли React Fragment
    state: unknown;         // Состояние компонента
    props: Record<string, unknown> | string;  // Props компонента
    children: RESQNode[];   // Дочерние компоненты
}
```

#### FiberNode

Внутренний тип React Fiber:

```typescript
interface FiberNode {
    type: string | FunctionComponent | null;
    child: FiberNode | null;
    sibling: FiberNode | null;
    return: FiberNode | null;  // Циклическая ссылка на родителя!
    memoizedProps: Record<string, unknown> | string | null;
    memoizedState: MemoizedState | null;
    stateNode: HTMLElement | Text | null;
}
```

#### FilterOptions

Опции для методов фильтрации:

```typescript
interface FilterOptions {
    exact?: boolean;  // Точное совпадение (по умолчанию false)
}
```

#### TraversalOptions (новое в 1.12.0)

Опции для безопасного обхода дерева:

```typescript
interface TraversalOptions {
    maxDepth?: number;       // Максимальная глубина (по умолчанию 1000)
    visited?: WeakSet<object>; // Набор посещенных узлов
}
```

### Основные функции

#### `resq$(selector, element?)`

Находит **первый** совпадающий компонент.

```javascript
import { resq$ } from 'resq'

const component = resq$('MyComponent', document.getElementById('root'))
// Возвращает: RESQNode
```

**Параметры:**
- `selector` (string) — имя компонента или цепочка селекторов
- `element` (HTMLElement, опционально) — корневой элемент для поиска

#### `resq$$(selector, element?)`

Находит **все** совпадающие компоненты.

```javascript
import { resq$$ } from 'resq'

const components = resq$$('Button', document.getElementById('root'))
// Возвращает: Array<RESQNode>
```

#### `waitToLoadReact(timeout?, rootSelector?)`

Асинхронно ожидает загрузку React приложения.

```javascript
import { waitToLoadReact } from 'resq'

await waitToLoadReact(5000)  // ожидание до 5 секунд
await waitToLoadReact(2000, '#app')  // с указанием селектора корня
```

**Параметры:**
- `timeout` (number, по умолчанию 5000) — таймаут в миллисекундах
- `rootSelector` (string, опционально) — CSS селектор корневого элемента

**Поведение:**
- Устанавливает `global.isReactLoaded = true`
- Сохраняет корневой Fiber node в `global.rootReactElement`

---

## 5. Методы фильтрации

### `.byProps(props, options?)`

Фильтрует результаты по props.

```javascript
const buttons = resq$$('Button', root)
const activeButtons = buttons.byProps({ isActive: true })
```

### `.byState(state, options?)`

Фильтрует результаты по state.

```javascript
const forms = resq$$('Form', root)
const validForms = forms.byState({ isValid: true })
```

### Опции фильтрации

```javascript
// Частичное совпадение (по умолчанию)
.byProps({ name: 'John' })  // Совпадет с { name: 'John', age: 25 }

// Точное совпадение
.byProps({ name: 'John' }, { exact: true })  // Только { name: 'John' }
```

### Цепочка фильтров

```javascript
const result = resq$$('UserCard', root)
    .byProps({ role: 'admin' })
    .byState({ isOnline: true })
```

---

## 6. Синтаксис селекторов

### Простой селектор

```javascript
resq$('MyComponent')
```

### Вложенный селектор (через пробел)

```javascript
resq$('ParentComponent ChildComponent')
// Находит ChildComponent внутри ParentComponent
```

### Wildcard селекторы

```javascript
resq$$('My*')           // MyComponent, MyButton, MyForm...
resq$$('*Component')    // MyComponent, UserComponent...
resq$$('*Button*')      // SubmitButton, ButtonGroup, MyButtonWrapper...
```

### HTML элементы

```javascript
resq$('div')
resq$('MyComponent span')
```

---

## 7. Внутреннее устройство

### Класс ReactSelectorQuery

**Файл:** `src/resq.ts`

Главный класс для выполнения запросов.

```typescript
class ReactSelectorQuery {
    selectors: string[]
    rootComponent: FiberNode
    tree: RESQNode
    nodes?: ReactSelectorQueryNodes

    constructor(selector: string, root: FiberNode) {
        this.selectors = selector.split(' ').filter(el => !!el).map(el => el.trim())
        this.rootComponent = root
        this.tree = buildNodeTree(this.rootComponent)
    }

    find(): ReactSelectorQueryNode { /* ... */ }
    findAll(): ReactSelectorQueryNodes { /* ... */ }
}
```

### Класс ReactSelectorQueryNode

**Файл:** `src/resq.ts`

Обертка для единичного результата с методами `byProps()` и `byState()`.

### Класс ReactSelectorQueryNodes

**Файл:** `src/resq.ts`

Расширение Array для множественных результатов с методами `byProps()` и `byState()`.

---

## 8. Ключевые утилиты

### `buildNodeTree(element, options?)`

**Файл:** `src/utils.ts`

Конвертирует React Fiber node в дерево RESQNode с защитой от циклов.

```typescript
// Сигнатура (новое в 1.12.0)
function buildNodeTree(
    element: FiberNode | null,
    options?: TraversalOptions  // { maxDepth?: number, visited?: WeakSet }
): RESQNode

// Выходные данные:
{
    name: 'MyComponent',
    props: { hello: 'world' },
    state: { count: 0 },
    children: [...],
    node: HTMLElement,
    isFragment: false
}
```

**Защита от Stack Overflow (новое в 1.12.0):**
- Использует WeakSet для отслеживания посещенных узлов
- Ограничивает глубину рекурсии (по умолчанию 1000)
- Обнаруживает циклические ссылки через `element.return`

### `findReactInstance(element)`

**Файл:** `src/utils.ts`

Извлекает React Fiber из DOM элемента. Поддерживает разные версии React:

- `_reactRootContainer` — React 18
- `__reactFiber` — React 17
- `__reactInternalInstance` — React 16
- `__reactContainer` — альтернативные точки

### `findSelectorInTree(selectors, tree, selectFirst)`

**Файл:** `src/utils.ts`

Основной итератор. Использует reducer для последовательного поиска по цепочке селекторов.

### `findInTree(stack, searchFn)`

**Файл:** `src/utils.ts`

Поиск узлов в дереве с защитой от циклов (новое в 1.12.0):
- Использует WeakSet для предотвращения повторного посещения
- Ограничивает количество итераций (MAX_SEARCH_ITERATIONS = 100000)

### `matchSelector(selector, nodeName)`

**Файл:** `src/utils.ts`

Сопоставление имени компонента с селектором (с поддержкой wildcard).

### `stripHoCFromName(componentName)`

**Файл:** `src/utils.ts`

Удаляет обертки Higher-Order Components из имени.

```typescript
stripHoCFromName('withRouter(MyComponent)')  // => 'MyComponent'
stripHoCFromName('connect(withAuth(Page))')  // => 'Page'
```

---

## 9. Поток данных

```
Вызов: resq$('Parent Child', element)
           ↓
src/index.ts: doQuery() → валидация элемента
           ↓
findReactInstance(element) → получение Fiber root
           ↓
new ReactSelectorQuery('Parent Child', fiberRoot)
           ↓
Конструктор:
  - Парсинг селектора: ['Parent', 'Child']
  - buildNodeTree(fiberRoot, { visited: new WeakSet() })
    → построение дерева RESQNode с защитой от циклов
           ↓
find() → findSelectorInTree()
           ↓
Reducer с защитой от Stack Overflow:
  1. Найти все 'Parent' в дереве (с WeakSet tracking)
  2. В детях найденных 'Parent' искать 'Child'
           ↓
Результат: ReactSelectorQueryNode с первым совпадением
```

---

## 10. Примеры использования

### Базовое использование

```javascript
import { resq$, resq$$, waitToLoadReact } from 'resq'

// С явным указанием корня
const root = document.getElementById('root')
const header = resq$('Header', root)

// С автоматическим определением
await waitToLoadReact(2000)
const buttons = resq$$('Button')
```

### Доступ к props и state

```javascript
const form = resq$('LoginForm', root)

console.log(form.props)   // { onSubmit: [Function], disabled: false }
console.log(form.state)   // { email: '', password: '', isValid: false }
console.log(form.node)    // <form>...</form>
```

### Работа с вложенными компонентами

```javascript
// Найти все кнопки внутри формы
const formButtons = resq$$('Form Button', root)

// Найти первый input внутри UserCard > FormField
const input = resq$('UserCard FormField input', root)
```

### Фильтрация

```javascript
// Найти все активные табы
const activeTabs = resq$$('Tab', root)
    .byProps({ isActive: true })

// Найти форму с валидным состоянием
const validForm = resq$('Form', root)
    .byState({ isValid: true })

// Комбинированная фильтрация
const result = resq$$('UserCard', root)
    .byProps({ role: 'admin' })
    .byState({ isVerified: true })
```

### React Fragments

```javascript
const fragment = resq$('MyFragmentComponent', root)

if (fragment.isFragment) {
    // fragment.node — это массив HTML элементов
    console.log(fragment.node)  // [<div>, <span>, <p>]
}
```

### Styled Components

```javascript
// Styled components доступны по displayName
const styledButton = resq$('StyledButton', root)

// Или с wildcard
const allStyled = resq$$('Styled*', root)
```

---

## 11. Интеграция с тестами

### Puppeteer

```javascript
await page.evaluate(async () => {
    const { resq$, waitToLoadReact } = window.resq

    await waitToLoadReact(5000)

    const button = resq$('SubmitButton')
    button.node.click()
})
```

### Selenium

```javascript
driver.executeScript(`
    const { resq$, waitToLoadReact } = window.resq;
    return waitToLoadReact(5000).then(() => {
        const form = resq$('LoginForm');
        return form.props;
    });
`);
```

### Cypress

```javascript
cy.window().then(async (win) => {
    await win.resq.waitToLoadReact(5000)

    const component = win.resq.resq$('MyComponent')
    expect(component.props.isVisible).to.be.true
})
```

---

## 12. Сборка и разработка

### Команды

```bash
# Запуск тестов
npm test

# Тесты в watch режиме
npm run test:dev

# Линтинг
npm run lint

# Сборка (TypeScript + Webpack)
npm run build
```

### Конфигурация сборки

**TypeScript** компилирует в ES2018:
- Конфигурация: `tsconfig.json`
- Strict mode: включен
- Declaration maps: включены

**Webpack** собирает UMD bundle:
- Точка входа: `dist/src/index.js` (после tsc)
- Выход: `dist/index.js`
- Library name: `resq` (доступна как `window.resq`)

**Babel** транспилирует для Jest:
- Presets: `@babel/preset-env`, `@babel/preset-typescript`
- Plugin: `@babel/plugin-transform-runtime`

### Тесты

```
Test Suites: 4 passed (resq, utils, waitToLoadReact, cycle-detection)
Tests:       46+ passed
```

---

## 13. Ограничения

1. **Только React 16+** — не работает с React 15 и ниже
2. **Production builds** — минифицированные имена компонентов усложняют поиск
3. **Server-Side Rendering** — ограниченная поддержка
4. **Concurrent Mode** — требует дополнительного тестирования

### Рекомендации

- Используйте `displayName` для компонентов в production
- Добавляйте data-testid атрибуты как fallback
- Используйте React DevTools для проверки имен компонентов

---

## 14. История изменений

| Версия | Изменения |
|--------|-----------|
| 1.12.0 | **TypeScript миграция**, защита от Stack Overflow, полная типизация |
| 1.11.0 | Добавлена поддержка constructor name для поиска |
| 1.10.2 | Исправления багов |
| 1.10.0 | Поддержка React 18 |
| 1.9.0 | Поддержка React 17, displayName |
| 1.8.0 | Улучшенная обработка HoC |

### Детали версии 1.12.0

**Добавлено:**
- Полная миграция на TypeScript
- Типы `RESQNode`, `FiberNode`, `FilterOptions` экспортируются
- Защита от Stack Overflow с использованием WeakSet
- Константы безопасности:
  - `DEFAULT_MAX_DEPTH = 1000` — максимальная глубина дерева
  - `MAX_SIBLINGS = 10000` — максимум siblings
  - `MAX_SEARCH_ITERATIONS = 100000` — максимум итераций поиска

**Исправлено:**
- Критическая ошибка "Maximum call stack size exceeded" при глубоких деревьях
- Циклические ссылки `element.return` больше не вызывают бесконечную рекурсию

---

## 15. Лицензия

MIT License

Copyright (c) Baruch Velez

---

## Приложение A: Глоссарий

| Термин | Описание |
|--------|----------|
| **Fiber** | Внутренняя структура данных React для представления компонентов |
| **Virtual DOM** | Виртуальное представление DOM в React |
| **HoC** | Higher-Order Component — паттерн композиции компонентов |
| **Fragment** | React компонент для группировки без добавления DOM узлов |
| **displayName** | Статическое свойство компонента для отладки |

## Приложение B: Структура Fiber Node

```javascript
{
    type: Function | String,      // Функция компонента или тег HTML
    memoizedProps: Object,        // Props компонента
    memoizedState: Object | null, // State (для class) или hooks (для functional)
    stateNode: HTMLElement | null,// DOM узел
    child: FiberNode | null,      // Первый дочерний элемент
    sibling: FiberNode | null,    // Следующий sibling
    // ... другие внутренние поля React
}
```
