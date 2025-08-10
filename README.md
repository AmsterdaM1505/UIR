# BlazorWebAppAutoRendering

## Описание
**BlazorWebAppAutoRendering** — веб-приложение для создания и редактирования схем с визуализацией и интерактивным взаимодействием объектов различной природы на HTML5 Canvas.  
Проект ориентирован на задачи **визуального моделирования** и **построения схем**, и может применяться в **образовательных** и **инженерных** программных системах.

## Возможности
- Добавление, редактирование и удаление графических объектов:
  - прямоугольники, круги, линии, звёзды, облака, таблицы
- Форматирование текстовых описаний объектов
- Построение связей между объектами (ориентированные и неориентированные)
- Анализ схем:
  - поиск циклов
  - поиск кратчайших путей
- Импорт и экспорт:
  - собственный текстовый формат
  - OWL
- Поддержка пользовательских CSS-файлов
- Интерактивный интерфейс с панелями управления
- Хранение и обработка данных в **PostgreSQL** через **Entity Framework Core**
- Undo/Redo история
- Автосохранение в LocalStorage

## Стек технологий
- **Frontend:** Blazor WebAssembly, TypeScript, HTML5 Canvas, CSS, MudBlazor
- **Backend:** ASP.NET Core, C#, Entity Framework Core, PostgreSQL
- **Прочее:** XML2JS (импорт/экспорт OWL), LocalStorage API

## Используемые NuGet-пакеты
- `Microsoft.AspNetCore.Components.WebAssembly`
- `Microsoft.NET.ILLink.Tasks`
- `Microsoft.NET.Sdk.WebAssembly.Pack`
- `Microsoft.TypeScript.MSBuild`
- `MudBlazor`

## Установка и запуск
1. Клонировать репозиторий:
```bash
git clone https://github.com/AmsterdaM1505/UIR.git
```
2. Открыть проект в Visual Studio.
3. Запустить проект

**Основная структура проекта:**
```
├── BlazorWebAppAutoRendering/
│   ├──program.cs            # Настройка серверной части, API и сервисов
│   └──appsettings.json      # Конфигурация приложения
│
├── BlazorWebAppAutoRendering.Client/
│   ├──  program.cs          # Инициализация Blazor WebAssembly
│   ├──  tsconfig.json       # Настройки компилятора TypeScript
│   └──  wwwroot
│        ├── css             # Стили приложения
│        └── js              # JS-скрипты преобразованные из .ts          
│
├── Pages/
│   └──  Component2.razor    # Главный компонент редактора схем
│
└── scripts/
    ├──  file.ts             # Логика работы с холстом, объектами и файлами
    └──  interface.ts        # Структура используемых объектов
```