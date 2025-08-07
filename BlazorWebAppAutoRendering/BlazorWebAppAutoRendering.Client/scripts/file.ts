(function () {
    let objects: Shape[] = [];
    let highlight: Shape[] = [];
    let ctx: CanvasRenderingContext2D | null = null;
    let selectedObject: Shape | null = null;
    let selectedObject_canv: Shape | null = null;
    let selectedObject_buf: Shape | null = null;
    let selectedObject_buf_connect: Shape | null = null;
    let startX: number, startY: number;
    let isPanning = false;
    let panStartX = 0;
    let panStartY = 0;
    let offsetX = 0;
    let offsetY = 0;
    let mouse_meaning_check = 0;
    let connectionServ = 2;
    const container = document.getElementById('table-container');
    let selectedObjectMass: Shape[] = [];
    let selectedLineStart = null;
    let selectedLineEnd = null;
    let selectedLineMid = null;

    const leftPanel = document.getElementById("button-panel");
    const rightPanel = document.getElementById("table-container");
    const debugPanel = document.getElementById("debug-panel");

    const resizeHandleLeft = document.getElementById("resize-handle-left");
    const resizeHandleRight = document.getElementById("resize-handle-right");

    let isResizingLeft = false;
    let isResizingRight = false;

    let isSchemaLoaded = false;

    let isSelecting = false;
    let selectionStartX = 0;
    let selectionStartY = 0;
    let selectionEndX = 0;
    let selectionEndY = 0;

    let activeConnector: { x: number, y: number, type: string } | null = null;

    let undoStack: Shape[][] = [];
    let redoStack: Shape[][] = [];
    let flag: string; 

    let gridVisible: boolean = true;

    ////////////////// test

    function resetEditorState(): void {
        objects = [];
        highlight = [];
        ctx = null;
        selectedObject = null;
        selectedObject_canv = null;
        selectedObject_buf = null;
        selectedObject_buf_connect = null;
        startX = 0;
        startY = 0;
        isPanning = false;
        panStartX = 0;
        panStartY = 0;
        offsetX = 0;
        offsetY = 0;
        mouse_meaning_check = 0;
        connectionServ = 2;
        selectedObjectMass = [];
        selectedLineStart = null;
        selectedLineEnd = null;
        selectedLineMid = null;
        isResizingLeft = false;
        isResizingRight = false;
        isSchemaLoaded = false;
        isSelecting = false;
        selectionStartX = 0;
        selectionStartY = 0;
        selectionEndX = 0;
        selectionEndY = 0;
        activeConnector = null;
        undoStack = [];
        redoStack = [];
        flag = '';
        gridVisible = true;
    }

    function saveMetricsAsCSV(data: string, filename: string = 'performance_metrics.csv') {
        const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    }


    function graphGenerationForTest(): void {
        const results: string[] = ['Size,ElapsedTimeSec,ObjectCount,MoveTimeMs'];

        for (let i = 1; i <= 100; i += 1) {
            console.log("i - ", i);
            const start = performance.now();

            for (let j = 0; j < i; j++) {
                addCircle();
                addLine();
                addRect();
                addTable();
                addStar();
                addCloud();
            }

            drawObjects();
            const end = performance.now();
            const elapsed = Math.round(end - start) / 1000;
            const objectCount = objects.length + (objects.length / 6) * 8; // добавил остальные прямоугольники кол-во таблиц + колво таблиц на 8 ячеек

            console.log(objects, selectedObjectMass);

            let moveTime = 0;
            if (objects.length > 0) {
                const moveStart = performance.now();
                const last = objects[objects.length - 1];
                
                if ('x_C' in last && 'y_C' in last) {
                    last.x_C += 10;
                    last.y_C += 10;
                }

                drawObjects();
                const moveEnd = performance.now();
                moveTime = +(moveEnd - moveStart).toFixed(2) / 1000;
            }

            if (elapsed > 10) {
                break;
            }

            results.push(`${i},${elapsed},${objectCount},${moveTime}`);
            objects = [];
        }

        saveMetricsAsCSV(results.join('\n'));
        console.log("выгружено");
    }





    document.getElementById('mytest')?.addEventListener('click', function () {
        saveStateForUndo();
        console.log("button pressed");
        graphGenerationForTest();
    });











    ////////////////// test


    function saveStateForUndo() {
        console.log(flag);
        function cleanShape(shape: Shape): any {
            const {
                selectionMarker,
                isHighlighted,
                image,
                imageSrc,
                ...rest
            } = shape;
            return rest;
        }

        const clean = (shapes: Shape[]) => shapes.map(cleanShape);

        const currentState = clean(objects);
        const lastState = undoStack.length > 0 ? clean(undoStack[undoStack.length - 1]) : null;

        if (lastState && JSON.stringify(currentState) === JSON.stringify(lastState)) {
            console.log("Изменений не было");
            return;
        }

        undoStack.push(structuredClone(objects));
        redoStack = [];

        if (undoStack.length > 10) undoStack.shift();
    }
    let counter = 0;
    function undo() {
        if (!undoStack.length) return;
        selectedObject_buf = null;
        highlight = [];
        selectedObjectMass = [];
        redoStack.push(structuredClone(objects));
        counter += 1;
        //console.log(counter, " - objs before - ", objects, undoStack[0], undoStack[1], undoStack[2]);
        objects = undoStack.pop();
        //console.log(" - objs after - ", objects, "\n");
        drawObjects();
    }

    function redo() {
        if (!redoStack.length) return;
        selectedObject_buf = null;
        highlight = [];
        selectedObjectMass = [];
        undoStack.push(structuredClone(objects));
        objects = redoStack.pop();
        drawObjects();
    }


    const expectedWidth = measureTextWidth("Добавить прямоугольник", "16px Roboto");
    //console.log("Ожидаемая ширина текста:", expectedWidth);

    function generateRandomId(length: number): string {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;

        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }

        return result;
    }

    let isDragging = false

    const popup = document.getElementById('popup') as HTMLElement;

    const closePopup = document.getElementById('closePopup') as HTMLElement;
    // Функция для показа окна
    //function openPopup(newText: string, popupType: string): void {
    //    const popupText = document.getElementById('popupText');
    //    if (popupType === "information") {
    //        if (popupText) {
    //            popupText.innerText = newText;
    //        }
    //    } else if (popupType === "editing") {

    //    }
    //    popup.classList.remove('hidden');
    //}

    function openPopup(newTextOrObject: string | Shape, popupType: "information" | "editing"): void {
        const popupText = document.getElementById('popupText');

        if (popupType === "information") {
            if (typeof newTextOrObject === "string" && popupText) {
                popupText.innerText = newTextOrObject;
            }
        } else if (popupType === "editing") {
            if (typeof newTextOrObject !== "object") return;

            const target = newTextOrObject as Shape;
            const container = popupText!;
            container.innerHTML = "";

            const title = document.createElement("h6");
            const t: ShapeType = target.type as ShapeType;
            title.innerText = `Редактирование объекта: ${shapeLabels[t]}`;
            title.style.userSelect = "none";
            container.appendChild(title);

            // Создаём форму параметров по типу
            const form = document.createElement("form");
            form.style.display = "flex";
            form.style.flexDirection = "column";
            form.style.gap = "10px";
            form.style.userSelect = "none";

            function addNumberField(labelText: string, value: number, onChange: (v: number) => void) {
                const label = document.createElement("label");
                label.innerText = labelText;

                const input = document.createElement("input");
                input.type = "number";
                input.value = value.toString();
                input.style.border = "none";
                input.style.marginLeft = "5px";
                input.addEventListener("input", () => onChange(parseFloat(input.value)));

                label.appendChild(input);
                form.appendChild(label);
            }

            function addCheckboxField(labelText: string, checked: boolean, onChange: (v: boolean) => void) {
                const label = document.createElement("label");
                label.innerText = labelText;

                const input = document.createElement("input");
                input.type = "checkbox";
                input.checked = checked;
                input.style.border = "none";
                input.style.marginLeft = "5px";
                input.addEventListener("change", () => onChange(input.checked));

                label.appendChild(input);
                label.style.display = "flex";
                label.style.justifyContent = "space-between";
                label.style.alignItems = "center";
                label.style.gap = "10px";
                form.appendChild(label);
            }

            function addSelectField<T extends string>(labelText: string, options: T[], value: T, onChange: (v: T) => void) {
                const label = document.createElement("label");
                label.innerText = labelText;

                const select = document.createElement("select");
                for (const opt of options) {
                    const option = document.createElement("option");
                    option.value = opt;
                    option.innerText = opt;
                    if (opt === value) option.selected = true;
                    select.appendChild(option);
                }
                select.style.border = "none";
                select.style.marginLeft = "5px";
                select.addEventListener("change", () => onChange(select.value as T));

                label.appendChild(select);
                form.appendChild(label);
            }

            switch (target.type) {
                case "rectangle":
                case "cloud":
                    const rect = target as Rectangle | Cloud;
                    addNumberField("Width", rect.width, val => rect.width = val);
                    addNumberField("Height", rect.height, val => rect.height = val);
                    addCheckboxField("Border", !!rect.border, val => rect.border = val);
                    break;
                case "table":
                    const table = target as ComplexShape;
                    addNumberField("Cols", table.cols, val => {
                        table.cols = val;
                        editTable(table);
                    });
                    addNumberField("Rows", table.rows, val => {
                        table.rows = val;
                        editTable(table);
                    });
                    addCheckboxField("Border", !!table.border, val => table.border = val);
                    //editTable(table);
                    break;
                case "circle":
                    const circle = target as Circle;
                    addNumberField("Radius", circle.radius, val => circle.radius = val);
                    break;
                case "line":
                    const line = target as Line;
                    addNumberField("Line Width", line.lineWidth || 1, val => line.lineWidth = val);
                    addSelectField("Start Arrow", ['-|->', '-0->', '-*->', '>', 'none'], line.startArrowType || 'none', val => line.startArrowType = val);
                    addSelectField("End Arrow", ['-|->', '-0->', '-*->', '>', 'none'], line.endArrowType || 'none', val => line.endArrowType = val);
                    break;
                case "star":
                    const star = target as Star;
                    addNumberField("Radius", star.rad, val => star.rad = val);
                    addNumberField("Points", star.amount_points, val => star.amount_points = val);
                    addNumberField("m", star.m, val => star.m = val);
                    break;
            }

            // Кнопка закрытия
            const closeBtn = document.createElement("button");
            closeBtn.innerText = "Применить";
            closeBtn.type = "button";
            closeBtn.addEventListener("click", () => {
                hidePopup();
                console.log(objects);
                drawObjects();
            });
            form.appendChild(closeBtn);

            container.appendChild(form);
        }

        popup.classList.remove('hidden');
    }

    function hidePopup(): void {
        popup.classList.add('hidden');
    }

    closePopup.addEventListener('click', hidePopup);

    popup.addEventListener('mousedown', (e: MouseEvent) => {
        // Игнорировать клик по кнопке закрытия, чтобы окно не начало перетаскиваться при попытке закрытия
        if ((e.target as HTMLElement).id === 'closePopup') return;
        if ((e.target as HTMLElement).closest('button, input, select, textarea')) return;

        isDragging = true;
        offsetX = e.clientX - popup.offsetLeft;
        offsetY = e.clientY - popup.offsetTop;
        popup.style.cursor = "grabbing";
    });

    document.addEventListener('mousemove', (e: MouseEvent) => {
        if (isDragging) {
            popup.style.left = `${e.clientX - offsetX}px`;
            popup.style.top = `${e.clientY - offsetY}px`;
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        popup.style.cursor = "grab";
    });


    //////////////////////////

    function extractObjectsFromCustomFormat(content: string): string {
        const lines = content.split("\n");
        const startIndex = lines.findIndex(line => line.trim().startsWith("Objects:("));
        if (startIndex === -1) throw new Error("Objects section not found");

        let collected = lines[startIndex].replace(/^Objects:\s*\(/, ""); // первая строка без "Objects:("
        for (let i = startIndex + 1; i < lines.length; i++) {
            const line = lines[i];
            if (line.trim().endsWith(")")) {
                collected += "\n" + line.replace(/\)$/, ""); // убираем закрывающую скобку
                break;
            }
            collected += "\n" + line;
        }

        return `[${collected.trim()}]`; // превращаем в JSON-массив
    }

    function processFileContent(content: string, objects: Shape[]): Shape[] {
        console.log("processFileContent here");

        try {
            if (!content) return objects;
            let schemaData: any;
            try {
                schemaData = JSON.parse(content);
            } catch {
                try {
                    const jsonLike = extractObjectsFromCustomFormat(content);
                    console.log(jsonLike)
                    schemaData = { objects: JSON.parse(jsonLike) };
                } catch (parseError) {
                    console.error("Ошибка при разборе custom-формата:", parseError);
                    return objects;
                }
            }

            if (!Array.isArray(schemaData.objects)) {
                console.error("Invalid schema format: objects must be an array.");
                return objects;
            }

            return schemaData.objects.map(obj => {
                if (!obj.type || typeof obj.type !== 'string') {
                    console.warn("Пропущен или некорректный тип:", obj);
                    return null;
                }

                const baseProps: Partial<Shape> = {
                    id: obj.id || generateUniqueId(),
                    type: obj.type,
                    color: obj.color || '#000',
                    rotation: obj.rotation || 0,
                    info: obj.info || '',
                    linkedObjects: obj.linkedObjects || [],
                    outgoingLinks: obj.outgoingLinks || [],
                    incomingLinks: obj.incomingLinks || [],
                    colorAlpha: obj.colorAlpha ?? 1,
                    borderPoints_X1: obj.borderPoints_X1,
                    borderPoints_Y1: obj.borderPoints_Y1,
                    borderPoints_X2: obj.borderPoints_X2,
                    borderPoints_Y2: obj.borderPoints_Y2,
                    dialect: obj.dialect || '',
                    x_C: obj.x_C,
                    y_C: obj.y_C,
                    selectionMarker: obj.selectionMarker,
                    imageSrc: obj.imageSrc,
                    isHighlighted: obj.isHighlighted,
                    connectors: obj.connectors,
                    lineConnectionStart: obj.lineConnectionStart,
                    lineConnectionEnd: obj.lineConnectionEnd
                };

                switch (obj.type) {
                    case 'rectangle':
                        if (obj.width == null || obj.height == null) return null;
                        return { ...baseProps, width: obj.width, height: obj.height } as Rectangle;

                    case 'circle':
                        if (obj.radius == null) return null;
                        return { ...baseProps, radius: obj.radius } as Circle;

                    case 'line':
                        if (obj.startX == null || obj.startY == null || obj.endX == null || obj.endY == null) return null;
                        return {
                            ...baseProps,
                            startX: obj.startX,
                            startY: obj.startY,
                            endX: obj.endX,
                            endY: obj.endY,
                            arrowDirection: obj.arrowDirection,
                            punctuation: obj.punctuation,
                            lineWidth: obj.lineWidth,
                            startArrowType: obj.startArrowType,
                            endArrowType: obj.endArrowType,
                            x_C: (obj.startX + obj.endX) / 2,
                            y_C: (obj.startY + obj.endY) / 2
                        } as Line;

                    case 'star':
                        return {
                            ...baseProps,
                            rad: obj.rad,
                            amount_points: obj.amount_points,
                            m: obj.m
                        } as Star;

                    case 'cloud':
                        if (obj.width == null || obj.height == null) return null;
                        return {
                            ...baseProps,
                            width: obj.width,
                            height: obj.height
                        } as Cloud;

                    case 'table':
                        if (!Array.isArray(obj.parts)) return null;
                        const parts: Shape[] = obj.parts.map((part: any) => {
                            const singleJson = JSON.stringify({ objects: [part] });
                            const parsed = processFileContent(singleJson, []);
                            return parsed[0];
                        }).filter(Boolean) as Shape[];

                        return {
                            ...baseProps,
                            width: obj.width,
                            height: obj.height,
                            cols: obj.cols ?? 1,
                            rows: obj.rows ?? 1,
                            parts
                        } as ComplexShape;

                    default:
                        console.warn("Unknown shape type:", obj.type);
                        return null;
                }
            }).filter((obj): obj is Shape => obj !== null);

        } catch (error) {
            console.error("Error processing file content:", error);
            return objects;
        }
    }

    document.getElementById('customJsonImport')?.addEventListener('change', function (event) {
        try {
            const input = event.target as HTMLInputElement;
            const file = input.files?.[0];

            if (file) {
                const reader = new FileReader();

                reader.onload = function (e) {
                    try {
                        const content = e.target?.result;
                        if (typeof content === 'string') {
                            objects = processFileContent(content, objects);
                        }
                        drawObjects();
                    } catch (error) {
                        console.error('Error processing file content:', error);
                    }
                };

                reader.readAsText(file);
            }
        } catch (error) {
            console.error('Error reading file:', error);
        }
    });

    document.getElementById('contextMenu').style.display = 'none';

    function saveToLocalStorage() {
        if (!objects || objects.length === 0) {
            console.warn("Cannot save: no objects present");
            return;
        }

        try {
            const schemaData = {
                size: { width: canvas.width, height: canvas.height },
                objects: objects
            };

            localStorage.setItem('savedSchema', JSON.stringify(schemaData));
            //console.log("Schema saved successfully.", JSON.stringify(schemaData));
        } catch (error) {
            console.error("Error saving schema:", error);
        }
    }


    // Запуск периодического сохранения и восстановления
    let lastSavedState = "";

    function autoSaveToLocalStorage() {
        const currentState = JSON.stringify(objects);
        if (currentState !== lastSavedState) {
            saveToLocalStorage();
            lastSavedState = currentState;
        }
    }

    setInterval(autoSaveToLocalStorage, 9000);

    function loadFromLocalStorage() {
        if (isSchemaLoaded) {
            console.warn("Schema is already loaded. Skipping duplicate call.");
            return;
        }

        try {
            const savedSchema = localStorage.getItem('savedSchema');
            if (!savedSchema) {
                console.warn("No saved schema found.");
                return;
            }

            const schemaData = JSON.parse(savedSchema);
            if (!schemaData.objects || !Array.isArray(schemaData.objects)) {
                console.error("Invalid schema format.");
                return;
            }

            objects = schemaData.objects.map(obj => {
                const baseProps = {
                    dialect: obj.dialect || 'base',
                    id: obj.id || generateUniqueId(),
                    type: obj.type,
                    rotation: obj.rotation || 0,
                    info: obj.info || '',
                    linkedObjects: obj.linkedObjects || [],
                    outgoingLinks: obj.outgoingLinks || [],
                    incomingLinks: obj.incomingLinks || [],
                    lineConnectionStart: obj.lineConnectionStart || [],
                    lineConnectionEnd: obj.lineConnectionEnd || [],
                    color: obj.color || '#000',
                    colorAlpha: obj.colorAlpha ?? 1,
                    x_C: obj.x_C,
                    y_C: obj.y_C,
                    borderPoints_X1: obj.borderPoints_X1,
                    borderPoints_Y1: obj.borderPoints_Y1,
                    borderPoints_X2: obj.borderPoints_X2,
                    borderPoints_Y2: obj.borderPoints_Y2,
                    connectors: obj.connectors || [],
                    selectionMarker: obj.selectionMarker || false,
                    isHighlighted: obj.isHighlighted || false
                };

                switch (obj.type) {
                    case 'rectangle':
                        return {
                            ...baseProps,
                            width: obj.width,
                            height: obj.height,
                            border: obj.border ?? false
                        } as Rectangle;

                    case 'circle':
                        return {
                            ...baseProps,
                            radius: obj.radius
                        } as Circle;

                    case 'line':
                        return {
                            ...baseProps,
                            startX: obj.startX,
                            startY: obj.startY,
                            endX: obj.endX,
                            endY: obj.endY,
                            arrowDirection: obj.arrowDirection || 'none',
                            punctuation: obj.punctuation || 'none',
                            lineWidth: obj.lineWidth || 2,
                            startArrowType: obj.startArrowType || 'none',
                            endArrowType: obj.endArrowType || 'none'
                        } as Line;

                    case 'star':
                        return {
                            ...baseProps,
                            rad: obj.rad,
                            amount_points: obj.amount_points,
                            m: obj.m
                        } as Star;

                    case 'cloud':
                        return {
                            ...baseProps,
                            width: obj.width,
                            height: obj.height
                        } as Cloud;

                    case 'table':
                        return {
                            ...baseProps,
                            width: obj.width,
                            height: obj.height,
                            cols: obj.cols || 1,
                            rows: obj.rows || 1,
                            parts: obj.parts || []
                        } as ComplexShape;

                    default:
                        console.warn("Unknown shape type:", obj.type);
                        return null;
                }
            }).filter(obj => obj !== null);

            isSchemaLoaded = true;
            drawObjects();
            console.log("Schema loaded successfully.", objects);
        } catch (error) {
            console.error("Error loading schema:", error);
        }
    }


    const canvas = document.getElementById('canvas') as HTMLCanvasElement;

    if (!canvas) {
        logDebug("Canvas element not found");
        return;
    } else {
        canvas.oncontextmenu = () => false;
        logDebug("Canvas element found");

    }

    window.addEventListener('DOMContentLoaded', () => {
        if (!isSchemaLoaded) {
            loadFromLocalStorage();
        }
    });
    // общение с бд
    async function loadItemsFromServer(): Promise<Item[]> {
        const response = await fetch("/api/items");

        if (!response.ok) {
            console.error("Ошибка при загрузке items:", response.statusText);
            return [];
        }

        const items: Item[] = await response.json();
        console.log("Загружено с сервера:", items);
        return items;
    }

    async function loadAndDrawItems() {
        const items = await loadItemsFromServer();
    }

    loadAndDrawItems();
    // общение с бд
    function resizeCanvas(canvas: HTMLCanvasElement) {

        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const width = window.innerWidth;
        const height = window.innerHeight;

        if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.resetTransform();
            ctx.scale(dpr, dpr);
            //drawObjects();
        }
    }

    function updateOffsets(canvas: HTMLCanvasElement) {

        const mainLayout = document.getElementById("main-layout") as HTMLCanvasElement;
        const debug = document.getElementById("debug-panel");

        if (!canvas || !mainLayout) return;

        const rect = canvas.getBoundingClientRect();
        const difference = mainLayout.getBoundingClientRect();


        offsetX = rect.left;
        offsetY = Math.max(0, rect.top - (difference.bottom - difference.top));

        debug.style.bottom += `${difference.bottom - difference.top}px`;
        //console.log(" top p pp ", offsetX, offsetY, difference.top, difference.bottom)
    }

    function updateLeftAndRightPanelHeight(canvas: HTMLCanvasElement) {
        const mainLayout = document.getElementById("main-layout") as HTMLDivElement;
        const leftPanel = document.getElementById("button-panel") as HTMLDivElement;
        const rightPanel = document.getElementById("table-container") as HTMLDivElement;

        if (!mainLayout || !leftPanel || !rightPanel) {
            console.error("Ошибка: Один из элементов не найден.");
            return;
        }

        const difference = mainLayout.getBoundingClientRect().bottom - mainLayout.getBoundingClientRect().top;

        // Преобразуем текущую высоту из строки в число
        const leftHeight = leftPanel.getBoundingClientRect().height;
        const rightHeight = rightPanel.getBoundingClientRect().height;

        // Устанавливаем новую высоту
        leftPanel.style.height = `${leftHeight - difference}px`;
        rightPanel.style.height = `${rightHeight - difference}px`;

        //console.log("he he he - ", leftHeight, rightHeight, leftPanel.style.height, rightPanel.style.height, difference);
    }

    function updateDebugPanelOffsets(): void {
        const leftPanel = document.getElementById("button-panel");
        const rightPanel = document.getElementById("table-container");
        const debugPanel = document.getElementById("debug-panel");

        if (!leftPanel || !rightPanel || !debugPanel) return;

        // Вычисляем текущие ширины левой и правой панелей
        const leftWidth = leftPanel.getBoundingClientRect().width;
        const rightWidth = rightPanel.getBoundingClientRect().width;

        // Задаем нижней панели отступы таким образом, чтобы она начиналась от края левой панели 
        // и заканчивалась перед правой панелью.
        debugPanel.style.left = leftWidth + "px";
        debugPanel.style.right = rightWidth + "px";
    }

    let deltaWidth: number = 0;

    const buttons = document.querySelectorAll('._button') as NodeListOf<HTMLElement>;
    const check = document.getElementById("mudpanel").getBoundingClientRect();
    let maxWidth = 0;
    let maxHeight = 0;
    logDebug("button resize")
    buttons.forEach(button => {
        const rect = button.getBoundingClientRect();
        if (rect.width > maxWidth) {
            maxWidth = rect.width;
        }
        if (rect.height > maxHeight) {
            maxHeight = rect.height;
        }
    });
    deltaWidth = check.width - maxWidth + 24;
    buttons.forEach(button => {
        button.style.width = `${maxWidth}px`;
        button.style.height = `${maxHeight}px`;
    });
    console.log("mudpanel", check);
    function uniformizeButtons(selector: string): void {
        const buttons = document.querySelectorAll(selector) as NodeListOf<HTMLElement>;
        const check = document.getElementById("mudpanel").getBoundingClientRect();
        //let maxWidth = 0;
        //let maxHeight = 0;
        //logDebug("button resize")
        //buttons.forEach(button => {
        //    const rect = button.getBoundingClientRect();
        //    if (rect.width > maxWidth) {
        //        maxWidth = rect.width;
        //    }
        //    if (rect.height > maxHeight) {
        //        maxHeight = rect.height;
        //    }
        //});
        
        let maxWidth = check.width - deltaWidth;

        buttons.forEach(button => {
            button.style.width = `${maxWidth}px`;
            button.style.height = `${maxHeight}px`;
        });
        //deltaWidth = check.width - maxWidth;
        console.log("mudpanel, maxWidth, deltaWidth", check.width, maxWidth, deltaWidth);
    }
    
    window.addEventListener("resize", function () {
        uniformizeButtons('._button');
        logDebug("button resize")
        console.log("button resize")
        resizeCanvas(canvas);
        updateOffsets(canvas);
        updateDebugPanelOffsets();
        drawObjects();
        //updateLeftAndRightPanelHeight(canvas)
    });
    uniformizeButtons('._button');
    updateDebugPanelOffsets();
    resizeCanvas(canvas)
    updateOffsets(canvas);
    updateLeftAndRightPanelHeight(canvas)

    function drawGrid(ctx: CanvasRenderingContext2D, w: number, h: number, size: number) {
        ctx.save();
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        // смещение сетки так, чтобы линии «следили» за offsetX/offsetY
        const ox = offsetX % size;
        const oy = offsetY % size;
        ctx.translate(ox, oy);

        for (let x = -size; x < w; x += size) {
            ctx.beginPath();
            ctx.moveTo(x, -size);
            ctx.lineTo(x, h);
            ctx.stroke();
        }
        for (let y = -size; y < h; y += size) {
            ctx.beginPath();
            ctx.moveTo(-size, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }

        ctx.restore();
    }

    

    if (canvas.getContext) {
        ctx = canvas.getContext('2d');
        if (!ctx) {
            logDebug("Failed to get canvas context");
        } else {
            logDebug("Canvas context obtained");
        }
        //console.log(objects);
        if (!isSchemaLoaded) {
            drawObjects();
        }

        drawGrid(ctx, canvas.width, canvas.height, 20);

        flag = "body";
        saveStateForUndo();

        document.getElementById('recovery-scheme')?.addEventListener('click', function () {
            logDebug("recovery-scheme button clicked");
            loadFromLocalStorage();
        });

        // Обработчики событий
        canvas.addEventListener('mousedown', function (e: MouseEvent) {
            saveStateForUndo();
            onMouseDown(e);
        });
        canvas.addEventListener('mousemove', function (e: MouseEvent) {
            onMouseMove(e);
        });
        canvas.addEventListener('mouseup', function (e: MouseEvent) {
            onMouseUp(e);
        });

        resizeHandleLeft.addEventListener("mousedown", function (e: MouseEvent) {
            isResizingLeft = true;
            document.addEventListener("mousemove", resizeLeftPanel);
            document.addEventListener("mouseup", stopResizing);
        });

        resizeHandleRight.addEventListener("mousedown", function (e: MouseEvent) {
            isResizingRight = true;
            document.addEventListener("mousemove", resizeRightPanel);
            document.addEventListener("mouseup", stopResizing);
        });

        document.getElementById("checkbox")?.addEventListener('change', function () {
            gridVisible = !gridVisible;
            drawObjects();
        })

        function resizeLeftPanel(e: MouseEvent) {
            if (!isResizingLeft) return;
            const newWidth = e.clientX;
            if (newWidth > 50 && newWidth < window.innerWidth / 2) {
                leftPanel.style.width = `${newWidth}px`;
                debugPanel.style.left = `${newWidth}px`; // Корректируем отладочную панель
                resizeHandleLeft.style.left = `${newWidth}px`;
                uniformizeButtons('._button');
            }
        }

        function resizeRightPanel(e: MouseEvent) {
            if (!isResizingRight) return;
            const newWidth = window.innerWidth - e.clientX;
            if (newWidth > 50 && newWidth < window.innerWidth / 2) {
                rightPanel.style.width = `${newWidth}px`;
                debugPanel.style.right = `${newWidth}px`; // Корректируем отладочную панель
                resizeHandleRight.style.right = `${newWidth}px`;
            }
        }

        function stopResizing() {
            isResizingLeft = false;
            isResizingRight = false;
            document.removeEventListener("mousemove", resizeLeftPanel);
            document.removeEventListener("mousemove", resizeRightPanel);
            document.removeEventListener("mouseup", stopResizing);
        }

        ////////////

        document.getElementById('short')?.addEventListener('click', function () {
            logDebug("Поиск кратчайшего пути (неориентированный граф)");
            highlightShortestPath("A", "D", false);
        });

        document.getElementById('cycle')?.addEventListener('click', function () {
            logDebug("Проверка циклов (неориентированный граф)");
            highlightCycles(false);
        });

        document.getElementById('shortor')?.addEventListener('click', function () {
            logDebug("Поиск кратчайшего пути (ориентированный граф)");
            highlightShortestPath("A", "D", true);
        });

        document.getElementById('cycleor')?.addEventListener('click', function () {
            logDebug("Проверка циклов (ориентированный граф)");
            highlightCycles(true);
        });

        function buildGraph(objects: Shape[], isDirected: boolean = true): Record<string, string[]> {
            const graph: Record<string, string[]> = {};

            // Добавляем все вершины в граф
            for (const obj of objects) {
                graph[obj.id] = [];
            }

            // Добавляем связи через линии
            for (const line of objects.filter(obj => obj.type === "line") as Line[]) {
                const startObj = objects.find(obj => obj.connectors?.some(c => c.id === line.lineConnectionStart?.[0]?.id_con));
                const endObj = objects.find(obj => obj.connectors?.some(c => c.id === line.lineConnectionEnd?.[0]?.id_con));

                if (!startObj || !endObj) continue;

                // Ориентированный граф
                if (isDirected) {
                    if (line.arrowDirection === "start") {
                        graph[endObj.id].push(startObj.id);
                    } else if (line.arrowDirection === "end") {
                        graph[startObj.id].push(endObj.id);
                    } else if (line.arrowDirection === "both" || line.arrowDirection === "none") {
                        graph[startObj.id].push(endObj.id);
                        graph[endObj.id].push(startObj.id);
                    }
                } else {
                    // Неориентированный граф (всегда двусторонняя связь)
                    graph[startObj.id].push(endObj.id);
                    graph[endObj.id].push(startObj.id);
                }
            }
            console.log("graph - ", graph)
            return graph;
        }

        function detectCycles2(objects: Shape[], isDirected: boolean = true): string[][] {
            const graph = buildGraph(objects, isDirected);
            const visited = new Set<string>();
            const recStack = new Set<string>();
            const allCycles: string[][] = [];

            function dfs(node: string, path: string[]) {
                if (recStack.has(node)) {
                    const cycleStartIndex = path.indexOf(node);
                    if (cycleStartIndex !== -1) {
                        allCycles.push(path.slice(cycleStartIndex));
                        console.log(`Найден цикл: ${path.slice(cycleStartIndex)}`);
                    }
                    return;
                }

                if (visited.has(node)) return;

                visited.add(node);
                recStack.add(node);
                path.push(node);

                for (const neighbor of graph[node] || []) {
                    dfs(neighbor, [...path]);
                }

                recStack.delete(node);
            }

            for (const node of Object.keys(graph)) {
                if (!visited.has(node)) {
                    dfs(node, []);
                }
            }
            console.log("allcycles - ", allCycles)
            return allCycles;
        }
        function bfsShortestPath2(objects: Shape[], startId: string, endId: string, isDirected: boolean = true): string[] | null {
            const graph = buildGraph(objects, isDirected);
            console.log("Граф перед BFS:", graph);
            const queue: string[][] = [[startId]];
            const visited = new Set<string>();

            while (queue.length > 0) {
                const path = queue.shift()!;
                const node = path[path.length - 1];

                if (node === endId) {
                    console.log("Найден кратчайший путь:", path);
                    return path;
                }
                
                if (!visited.has(node)) {
                    visited.add(node);
                    for (const neighbor of graph[node] || []) {
                        queue.push([...path, neighbor]);
                    }
                }
            }

            return null;
        }

        function highlightShortestPath(startId: string, endId: string, isDirected: boolean) {
            logDebug(`Поиск пути из ${startId} в ${endId}, isDirected = ${isDirected}`);

            highlight = []; // Сбрасываем прошлое выделение
            const path = bfsShortestPath2(objects, startId, endId, isDirected);

            if (path) {
                logDebug(`Кратчайший путь найден: ${path}`);
                path.forEach(id => {
                    const obj = objects.find(o => o.id === id);
                    if (obj) highlight.push(obj);
                });
            } else {
                logDebug("Путь не найден.");
            }

            drawObjects();
        }

        function highlightCycles(isDirected: boolean) {
            logDebug(`Проверка циклов, isDirected = ${isDirected}`);

            highlight = []; // Очищаем предыдущее выделение
            const cycles = detectCycles2(objects, isDirected);

            if (cycles.length > 0) {
                logDebug(`Найденные циклы: ${JSON.stringify(cycles)}`);
                cycles.forEach(cycle => {
                    cycle.forEach(id => {
                        const obj = objects.find(o => o.id === id);
                        if (obj) highlight.push(obj);
                    });
                });
            } else {
                logDebug("Циклов не найдено.");
            }

            drawObjects();
        }


        let selectedPathStart = null
        let selectedPathEnd = null

        //document.getElementById('longWayCheck')?.addEventListener('click', function (event) {
        //    //logDebug(`longWayCheck button clicked`);
        //    console.log("longWayCheck button clicked", selectedObject_buf, selectedObject_buf_connect)
        //    //connectionServ = 5;
        //    //waySelection();
        //    //console.log("longWayCheck button clicked WS", selectedObject_buf, selectedObject_buf_connect)
        //    //highlightShortestPath(selectedObject_buf.id, selectedObject_buf_connect.id, false);

        //    const clickedObject = selectedObject_buf;
        //    if (clickedObject) {
        //        if (!selectedPathStart) {
        //            selectedPathStart = clickedObject.id;
        //            console.log(`Выбран начальный объект: ${selectedPathStart}`);
        //        } else if (!selectedPathEnd) {
        //            selectedPathEnd = clickedObject.id;
        //            console.log(`Выбран конечный объект: ${selectedPathEnd}`);

        //            // Запускаем поиск кратчайшего пути
        //            highlightShortestPath(selectedPathStart, selectedPathEnd, true);

        //            // Сбрасываем выбор после поиска пути
        //            selectedPathStart = null;
        //            selectedPathEnd = null;
        //        }
        //    }
        //});
        document.getElementById('longWayCheck')?.addEventListener('click', function (event) {
            const button = document.getElementById('longWayCheck'); // Получаем кнопку
            const computedStyle = window.getComputedStyle(button); // Получаем стили
            const fontSize = computedStyle.fontSize; // Размер шрифта
            const fontFamily = computedStyle.fontFamily; // Тип шрифта

            console.log(`Размер шрифта: ${fontSize}`);
            console.log(`Тип шрифта: ${fontFamily}`);

            console.log("longWayCheck button clicked", selectedObject_buf, selectedObject_buf_connect);

            const clickedObject = selectedObject_buf;

            if (clickedObject) {
                if (!selectedPathStart) {
                    selectedPathStart = clickedObject.id;
                    console.log(`Выбран начальный объект: ${selectedPathStart}`);

                    if (button) {
                        button.textContent = "Выбор конечного объекта"; // Изменяем текст
                        //button.style.fontSize = fontSize;
                        //button.style.fontFamily = fontFamily;
                        //button.style.setProperty("font-size", fontSize, "important"); // Принудительное изменение
                        //button.style.setProperty("font-family", fontFamily, "important"); 
                    }
                } else if (!selectedPathEnd) {
                    selectedPathEnd = clickedObject.id;
                    console.log(`Выбран конечный объект: ${selectedPathEnd}`);
                    if (button) {
                        button.textContent = "Найти кратчайший путь"; // Изменяем текст
                        //button.style.fontSize = fontSize;
                        //button.style.fontFamily = fontFamily;

                        //button.style.setProperty("font-size", fontSize, "important"); // Принудительное изменение
                        //button.style.setProperty("font-family", fontFamily, "important"); 
                    }
                    // Запускаем поиск кратчайшего пути
                    highlightShortestPath(selectedPathStart, selectedPathEnd, true);

                    // Сбрасываем выбор после поиска пути
                    selectedPathStart = null;
                    selectedPathEnd = null;

                    //setTimeout(() => {
                    //    if (button) button.innerHTML = "<span>Выбор начального объекта</span>"; // Сброс текста через 1 секунду
                    //}, 1000);
                }
            }
        });

        //function highlighting(obj_: Shape, ctx_: CanvasRenderingContext2D) {
        //    if (highlight.includes(obj_)) {
        //        ctx_.save();
        //        ctx_.strokeStyle = 'red'; // Цвет контура для выделенных объектов
        //        ctx_.lineWidth = 4; // Толщина контура

        //        if (obj_.type === 'rectangle') {
        //            const rect = obj_ as Rectangle;
        //            ctx_.strokeRect(rect.x_C, rect.y_C, rect.width, rect.height);
        //        } else if (obj_.type === 'circle') {
        //            const circle = obj_ as Circle;
        //            ctx_.beginPath();
        //            ctx_.arc(circle.x_C, circle.y_C, circle.radius + 2, 0, 2 * Math.PI); // Добавляем 2 пикселя к радиусу для контурного выделения
        //            ctx_.stroke();
        //        } else if (obj_.type === 'line') {
        //            const line = obj_ as Line;
        //            ctx_.beginPath();
        //            ctx_.moveTo(line.startX, line.startY);
        //            ctx_.lineTo(line.endX, line.endY);
        //            ctx_.stroke();
        //        } else if (obj_.type === 'star') {
        //            const star = obj_ as Star;
        //            // Код для отрисовки контура звезды
        //            ctx_.beginPath();
        //            star.rad += 2
        //            drawStar(star as Star, ctx);
        //            ctx_.stroke();
        //        } else if (obj_.type === 'cloud') {
        //            const cloud = obj_ as Cloud;
        //            ctx_.beginPath();
        //            cloud.width += 4
        //            cloud.height += 4
        //            drawCloud(selectedObject_buf as Cloud, ctx);
        //            ctx_.stroke();
        //        }

        //        ctx_.restore();
        //    }
        //}
        function highlighting(obj_: Shape, ctx_: CanvasRenderingContext2D) {
            if (!highlight || highlight.length === 0) return; // Проверка на пустой массив

            if (highlight.includes(obj_)) {
                ctx_.save();
                ctx_.strokeStyle = 'red';
                ctx_.lineWidth = 4;

                if (obj_.type === 'rectangle') {
                    const rect = obj_ as Rectangle;
                    ctx_.strokeRect(rect.x_C, rect.y_C, rect.width, rect.height);
                } else if (obj_.type === 'circle') {
                    const circle = obj_ as Circle;
                    ctx_.beginPath();
                    ctx_.arc(circle.x_C, circle.y_C, circle.radius + 2, 0, 2 * Math.PI);
                    ctx_.stroke();
                } else if (obj_.type === 'line') {
                    const line = obj_ as Line;
                    ctx_.beginPath();
                    ctx_.moveTo(line.startX, line.startY);
                    ctx_.lineTo(line.endX, line.endY);
                    ctx_.stroke();
                }

                ctx_.restore();
            }
        }

        /////////// пунктирность линии хромает, таблица не строится как надо

        function exportGraphToFile(graph: Shape[], fileName: string) {
            let formatString = `<graph>\n`;
            formatString += `  <canvas height="${canvas.height}" width="${canvas.width}"/>\n`;

            graph.forEach(shape => {
                if (shape.type === "line") {
                    const line = shape as Line;
                    formatString += `  <edge dialect="${line.dialect}" id="${line.id}" type="${line.type}" label="${line.info || ""}" `;
                    formatString += `source="${line.lineConnectionStart?.[0]?.id_shape || ""}" target="${line.lineConnectionEnd?.[0]?.id_shape || ""}" `;
                    formatString += `endArrow="${line.endArrowType || "none"}" startArrow="${line.startArrowType || "none"}">\n`;
                    formatString += `    <lineGeometry startX="${line.startX}" startY="${line.startY}" endX="${line.endX}" endY="${line.endY}"/>\n`;
                    formatString += `    <background color="${line.color}"/>\n`;
                    formatString += `    <edgeStyle edgeColor="${line.color}" lineWidth="${line.lineWidth || 2}" alpha="${line.colorAlpha ?? 1}"/>\n`;

                    // Добавляем lineConnectionStart
                    if (line.lineConnectionStart) {
                        formatString += `    <lineConnectionStart>\n`;
                        line.lineConnectionStart.forEach(conn => {
                            formatString += `      <connection id_con="${conn.id_con}" id_shape="${conn.id_shape}"/>\n`;
                        });
                        formatString += `    </lineConnectionStart>\n`;
                    }

                    // Добавляем lineConnectionEnd
                    if (line.lineConnectionEnd) {
                        formatString += `    <lineConnectionEnd>\n`;
                        line.lineConnectionEnd.forEach(conn => {
                            formatString += `      <connection id_con="${conn.id_con}" id_shape="${conn.id_shape}"/>\n`;
                        });
                        formatString += `    </lineConnectionEnd>\n`;
                    }

                    formatString += `  </edge>\n`;
                } else {
                    formatString += `  <node dialect="${shape.dialect}" id="${shape.id}" type="${shape.type}" label="${shape.info || ""}" rotation="${shape.rotation || 0}">\n`;

                    if (shape.type === "circle") {
                        const circle = shape as Circle;
                        formatString += `    <geometry x="${circle.x_C}" y="${circle.y_C}" radius="${circle.radius}"/>\n`;
                    } else if (shape.type === "rectangle") {
                        const rect = shape as Rectangle;
                        formatString += `    <geometry x="${rect.x_C}" y="${rect.y_C}" width="${rect.width}" height="${rect.height}" border="${rect.border ? 'true' : 'false'}"/>\n`;
                    } else if (shape.type === "star") {
                        const star = shape as Star;
                        formatString += `    <geometry x="${star.x_C}" y="${star.y_C}" rad="${star.rad}" amount_points="${star.amount_points}" m="${star.m}"/>\n`;
                    } else if (shape.type === "cloud") {
                        const cloud = shape as Cloud;
                        formatString += `    <geometry x="${cloud.x_C}" y="${cloud.y_C}" width="${cloud.width}" height="${cloud.height}"/>\n`;
                    } else if (shape.type === "table") {
                        const table = shape as ComplexShape;
                        const rowHeight = table.parts.length ? (table.parts[0] as Rectangle).height : 1;
                        const colWidth = table.parts.length ? (table.parts[0] as Rectangle).width : 1;
                        const cols = Math.max(1, Math.round(table.width / colWidth));
                        const rows = Math.max(1, Math.round(table.height / rowHeight));

                        formatString += `    <geometry x="${table.x_C}" y="${table.y_C}" `;
                        formatString += `number_of_columns="${cols}" number_of_rows="${rows}" width="${table.width}" height="${table.height}"/>\n`;

                        for (let row = 0; row < rows; row++) {
                            formatString += `    <tableRow index="${row}">\n`;
                            formatString += `      <geometry height="${rowHeight}"/>\n`;

                            for (let col = 0; col < cols; col++) {
                                const cellIndex = row * cols + col;
                                if (cellIndex >= table.parts.length) break;
                                const cell = table.parts[cellIndex] as Rectangle;

                                formatString += `      <tableElement index="${col}">\n`;
                                formatString += `        <geometry x="${cell.x_C}" y="${cell.y_C}" width="${cell.width}" height="${cell.height}" border="${cell.border ? 'true' : 'false'}"/>\n`;//
                                formatString += `        <label>${cell.info || ""}</label>\n`;
                                if (cell.color) {
                                    formatString += `        <background color="${cell.color}"/>\n`;
                                }
                                formatString += `        <labelSettings font="14px Arial" color="gold"/>\n`;
                                formatString += `      </tableElement>\n`;
                            }
                            formatString += `    </tableRow>\n`;
                        }
                    }

                    formatString += `    <background color="${shape.color}"/>\n`;
                    formatString += `    <style alpha="${shape.colorAlpha ?? 1}" border="${shape.border ? 'true' : 'false'}"/>\n`;
                    formatString += `    <arealRect x1="${shape.borderPoints_X1}" y1="${shape.borderPoints_Y1}" x2="${shape.borderPoints_X2}" y2="${shape.borderPoints_Y2}"/>\n`;

                    // Добавляем lineConnectionStart
                    if (shape.lineConnectionStart) {
                        formatString += `    <lineConnectionStart>\n`;
                        shape.lineConnectionStart.forEach(conn => {
                            formatString += `      <connection id_con="${conn.id_con}" id_shape="${conn.id_shape}"/>\n`;
                        });
                        formatString += `    </lineConnectionStart>\n`;
                    }

                    // Добавляем lineConnectionEnd
                    if (shape.lineConnectionEnd) {
                        formatString += `    <lineConnectionEnd>\n`;
                        shape.lineConnectionEnd.forEach(conn => {
                            formatString += `      <connection id_con="${conn.id_con}" id_shape="${conn.id_shape}"/>\n`;
                        });
                        formatString += `    </lineConnectionEnd>\n`;
                    }

                    if (shape.linkedObjects && shape.linkedObjects.length > 0) {
                        formatString += `    <linkedObjects>\n`;
                        shape.linkedObjects.forEach(id => {
                            formatString += `      <linked id="${id}"/>\n`;
                        });
                        formatString += `    </linkedObjects>\n`;
                    }

                    if (shape.outgoingLinks && shape.outgoingLinks.length > 0) {
                        formatString += `    <outgoingLinks>\n`;
                        shape.outgoingLinks.forEach(id => {
                            formatString += `      <link id="${id}"/>\n`;
                        });
                        formatString += `    </outgoingLinks>\n`;
                    }

                    if (shape.incomingLinks && shape.incomingLinks.length > 0) {
                        formatString += `    <incomingLinks>\n`;
                        shape.incomingLinks.forEach(id => {
                            formatString += `      <link id="${id}"/>\n`;
                        });
                        formatString += `    </incomingLinks>\n`;
                    }

                    if (shape.connectors && shape.connectors.length > 0) {
                        formatString += `    <connectors>\n`;
                        shape.connectors.forEach(conn => {
                            formatString += `      <connector id="${conn.id}" x="${conn.x}" y="${conn.y}" type="${conn.type}"/>\n`;
                        });
                        formatString += `    </connectors>\n`;
                    }

                    formatString += `  </node>\n`;
                }
            });
            formatString += `</graph>\n`;

            formatString += `<dialect name="databaseSchema">\n`;

            formatString += `  <allowedNode type="table">\n`;
            formatString += `    <basedOnType type="rectangle" />\n`;
            formatString += `    <typeProperties setting="add">\n`;
            formatString += `      <property>\n`;
            formatString += `        <name>info</name>\n`;
            formatString += `        <valueType>string</valueType>\n`;
            formatString += `        <setValue>NewTable</setValue>\n`;
            formatString += `      </property>\n`;
            formatString += `      <complexProperty name="metadata">\n`;
            formatString += `        <property>\n`;
            formatString += `          <name>engine</name>\n`;
            formatString += `          <valueType>string</valueType>\n`;
            formatString += `          <setValue>InnoDB</setValue>\n`;
            formatString += `        </property>\n`;
            formatString += `        <property>\n`;
            formatString += `          <name>charset</name>\n`;
            formatString += `          <valueType>string</valueType>\n`;
            formatString += `          <setValue>utf8mb4</setValue>\n`;
            formatString += `        </property>\n`;
            formatString += `      </complexProperty>\n`;
            formatString += `    </typeProperties>\n`;
            formatString += `    <geometryProperties setting="add">\n`;
            formatString += `      <property><name>x_C</name><valueType>number</valueType></property>\n`;
            formatString += `      <property><name>y_C</name><valueType>number</valueType></property>\n`;
            formatString += `      <property><name>width</name><valueType>number</valueType></property>\n`;
            formatString += `      <property><name>height</name><valueType>number</valueType></property>\n`;
            formatString += `    </geometryProperties>\n`;
            formatString += `    <geometryLimits minWidth="100" maxWidth="600" minHeight="50" maxHeight="400" />\n`;
            formatString += `    <backgroundLimits allowAlpha="true" />\n`;
            formatString += `    <connectsWith>\n`;
            formatString += `      <edgeType name="line" />\n`;
            formatString += `    </connectsWith>\n`;
            formatString += `  </allowedNode>\n`;

            formatString += `  <allowedEdge type="line">\n`
            formatString += `    <basedOnType type="line" />\n`
            formatString += `    <typeProperties setting="add">\n`
            formatString += `      <property>\n`
            formatString += `        <name>constraintName</name>\n`
            formatString += `        <valueType>string</valueType>\n`
            formatString += `      </property>\n`
            formatString += `      <property>\n`
            formatString += `        <name>startArrowType</name>\n`
            formatString += `        <valueType>string</valueType>\n`
            formatString += `        <setValue>none</setValue>\n`
            formatString += `      </property>\n`
            formatString += `      <property>\n`
            formatString += `        <name>endArrowType</name>\n`
            formatString += `        <valueType>string</valueType>\n`
            formatString += `        <setValue>classic</setValue>\n`
            formatString += `      </property>\n`
            formatString += `    </typeProperties>\n`
            formatString += `    <geometryProperties setting="add">\n`
            formatString += `      <property><name>startX</name><valueType>number</valueType></property>\n`
            formatString += `      <property><name>startY</name><valueType>number</valueType></property>\n`
            formatString += `      <property><name>endX</name><valueType>number</valueType></property>\n`
            formatString += `      <property><name>endY</name><valueType>number</valueType></property>\n`
            formatString += `      <property><name>lineWidth</name><valueType>number</valueType><setValue>2</setValue></property>\n`
            formatString += `    </geometryProperties>\n`
            formatString += `    <requireArrow setting="end"/>\n`
            formatString += `    <allowedArrowheads>\n`
            formatString += `      <arrowheadType name="classic" position="end"/>\n`
            formatString += `      <arrowheadType name="diamond" position="start"/>\n`
            formatString += `      <arrowheadType name="none" position="both"/>\n`
            formatString += `    </allowedArrowheads>\n`
            formatString += `    <allowedConnections>\n`
            formatString += `      <nodeType name="table" position="source"/>\n`
            formatString += `      <nodeType name="table" position="target"/>\n`
            formatString += `    </allowedConnections>\n`
            formatString += `    <limits>\n`
            formatString += `      <propertyLimits name="startArrowType" allowedValues="none, -|->, -0->, -*->, >"/>\n`
            formatString += `      <propertyLimits name="endArrowType" allowedValues="none, -|->, -0->, -*->, >"/>\n`
            formatString += `    </limits>\n`
            formatString += `  </allowedEdge>\n`

            formatString += `  <allowedArrowhead type="-|->">\n`
            formatString += `    <basedOnType type="none"/>\n`
            formatString += `    <geometryLimits width="10" height="10"/>\n`
            formatString += `    <styleLimits fill="black"/>\n`
            formatString += `    <connectsWith>\n`
            formatString += `      <edgeType name="line" position="end"/>\n`
            formatString += `      <edgeType name="line" position="start"/>\n`
            formatString += `    </connectsWith>\n`
            formatString += `  </allowedArrowhead>\n`

            formatString += `  <allowedArrowhead type="-0->">\n`
            formatString += `    <basedOnType type="none"/>\n`
            formatString += `    <geometryLimits width="10" height="10"/>\n`
            formatString += `    <styleLimits fill="black"/>\n`
            formatString += `    <connectsWith>\n`
            formatString += `      <edgeType name="line" position="end"/>\n`
            formatString += `      <edgeType name="line" position="start"/>\n`
            formatString += `    </connectsWith>\n`
            formatString += `  </allowedArrowhead>\n`

            formatString += `  <allowedArrowhead type="-*->">\n`
            formatString += `    <basedOnType type="none"/>\n`
            formatString += `    <geometryLimits width="10" height="10"/>\n`
            formatString += `    <styleLimits fill="black"/>\n`
            formatString += `    <connectsWith>\n`
            formatString += `      <edgeType name="line" position="end"/>\n`
            formatString += `      <edgeType name="line" position="start"/>\n`
            formatString += `    </connectsWith>\n`
            formatString += `  </allowedArrowhead>\n`

            formatString += `  <allowedArrowhead type=">">\n`
            formatString += `    <basedOnType type="none"/>\n`
            formatString += `    <geometryLimits width="10" height="10"/>\n`
            formatString += `    <styleLimits fill="black"/>\n`
            formatString += `    <connectsWith>\n`
            formatString += `      <edgeType name="line" position="end"/>\n`
            formatString += `      <edgeType name="line" position="start"/>\n`
            formatString += `    </connectsWith>\n`
            formatString += `  </allowedArrowhead>\n`

            formatString += `  <graphSettings>\n`;
            formatString += `    <nodeSettings defaultColor="#eaeaea" />\n`;
            formatString += `    <edgeSettings requireAllArrow="end" />\n`;
            formatString += `    <backgroundSettings color="#ffffff" grid="true" />\n`;
            formatString += `  </graphSettings>\n`;

            formatString += `</dialect>\n`;

            const blob = new Blob([formatString], { type: "text/plain" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = fileName;
            link.click();
        }

        function extractColor(el: Element): string {
            //console.log("el --- ", el)
            const bg = el.getElementsByTagName("background")[0];
            //console.log("el2 --- ", bg?.getAttribute("color") || "#ffffff")
            return bg?.getAttribute("color") || "#ffffff";
        }

        function extractConnections(el: Element, tag: string): { id_con: string, id_shape: string }[] {
            const connections: { id_con: string, id_shape: string }[] = [];
            const container = el.getElementsByTagName(tag)[0];
            if (container) {
                const connEls = container.getElementsByTagName("connection");
                for (let i = 0; i < connEls.length; i++) {
                    connections.push({
                        id_con: connEls[i].getAttribute("id_con") || "",
                        id_shape: connEls[i].getAttribute("id_shape") || ""
                    });
                }
            }
            return connections;
        }


        function importGraphFromXml(xml: string): Shape[] {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xml, "text/xml");

            const shapes: Shape[] = [];

            const nodeElements = Array.from(xmlDoc.getElementsByTagName("node"));
            nodeElements.forEach(nodeEl => {
                const type = nodeEl.getAttribute("type") || "unknown";
                const id = nodeEl.getAttribute("id") || "";
                const dialect = nodeEl.getAttribute("dialect") || "";
                const label = nodeEl.getAttribute("label") || "";
                const rotation = parseFloat(nodeEl.getAttribute("rotation") || "0");

                let shape: Shape;

                const geometryEl = nodeEl.getElementsByTagName("geometry")[0];

                const baseProps = {
                    id,
                    type,
                    dialect,
                    info: label,
                    rotation,
                    color: extractColor(nodeEl),
                    x_C: parseFloat(geometryEl?.getAttribute("x") || "0"),
                    y_C: parseFloat(geometryEl?.getAttribute("y") || "0"),
                    borderPoints_X1: parseFloat(nodeEl.getElementsByTagName("arealRect")[0]?.getAttribute("x1") || "0"),
                    borderPoints_Y1: parseFloat(nodeEl.getElementsByTagName("arealRect")[0]?.getAttribute("y1") || "0"),
                    borderPoints_X2: parseFloat(nodeEl.getElementsByTagName("arealRect")[0]?.getAttribute("x2") || "0"),
                    borderPoints_Y2: parseFloat(nodeEl.getElementsByTagName("arealRect")[0]?.getAttribute("y2") || "0"),
                    colorAlpha: parseFloat(nodeEl.getElementsByTagName("style")[0]?.getAttribute("alpha") || "1"),
                    border: nodeEl.getElementsByTagName("style")[0]?.getAttribute("border") === "true"
                };
                switch (type) {
                    case "rectangle":
                        shape = {
                            ...baseProps,
                            width: parseFloat(geometryEl?.getAttribute("width") || "0"),
                            height: parseFloat(geometryEl?.getAttribute("height") || "0"),
                            border: geometryEl?.getAttribute("border") === "true"//
                        } as Rectangle;
                        break;
                    case "circle":
                        shape = {
                            ...baseProps,
                            radius: parseFloat(geometryEl?.getAttribute("radius") || "0"),
                        } as Circle;
                        break;
                    case "star":
                        shape = {
                            ...baseProps,
                            rad: parseFloat(geometryEl?.getAttribute("rad") || "0"),
                            amount_points: parseInt(geometryEl?.getAttribute("amount_points") || "5"),
                            m: parseFloat(geometryEl?.getAttribute("m") || "2"),
                        } as Star;
                        break;
                    case "cloud":
                        shape = {
                            ...baseProps,
                            width: parseFloat(geometryEl?.getAttribute("width") || "0"),
                            height: parseFloat(geometryEl?.getAttribute("height") || "0"),
                        } as Cloud;
                        break;
                    case "table":
                        console.log("import shape 1")
                        const parts: Shape[] = [];
                        const tableRows = Array.from(nodeEl.getElementsByTagName("tableRow"));
                        tableRows.forEach(rowEl => {
                            const elements = Array.from(rowEl.getElementsByTagName("tableElement"));
                            elements.forEach((cellEl, i) => {
                                const geom = cellEl.getElementsByTagName("geometry")[0];
                                console.log("geom - ", geom)
                                const rect: Rectangle = {
                                    ...baseProps,
                                    id: `${id}_cell_${i}`,
                                    type: "rectangle",
                                    dialect,
                                    info: cellEl.getElementsByTagName("label")[0]?.textContent || "",
                                    width: parseFloat(geom?.getAttribute("width") || "0"),
                                    height: parseFloat(geom?.getAttribute("height") || "0"),
                                    x_C: parseFloat(geom?.getAttribute("x") || "0"),
                                    y_C: parseFloat(geom?.getAttribute("y") || "0"),
                                    borderPoints_X1: 0, borderPoints_Y1: 0, borderPoints_X2: 0, borderPoints_Y2: 0,
                                    color: cellEl.getElementsByTagName("background")[0]?.getAttribute("color") || "#ffffff",
                                    border: geom?.getAttribute("border") === "true"
                                };
                                parts.push(rect);
                            });
                        });
                        shape = {
                            ...baseProps,
                            width: parseFloat(geometryEl?.getAttribute("width") || "0"),
                            height: parseFloat(geometryEl?.getAttribute("height") || "0"),
                            cols: parseInt(geometryEl?.getAttribute("number_of_columns") || "1"),
                            rows: parseInt(geometryEl?.getAttribute("number_of_rows") || "1"),
                            parts,
                        } as ComplexShape;
                        break;
                    default:
                        shape = { ...baseProps } as Shape;
                        break;
                }

                const connectorEls = Array.from(nodeEl.getElementsByTagName("connector"));
                if (connectorEls.length) {
                    shape.connectors = connectorEls.map(el => ({
                        id: el.getAttribute("id") || "",
                        x: parseFloat(el.getAttribute("x") || "0"),
                        y: parseFloat(el.getAttribute("y") || "0"),
                        type: el.getAttribute("type") || "",
                    }));
                }
                shape.lineConnectionStart = extractConnections(nodeEl, "lineConnectionStart");
                shape.lineConnectionEnd = extractConnections(nodeEl, "lineConnectionEnd");

                shapes.push(shape);
            });

            // обрабатываем линии
            const edgeElements = Array.from(xmlDoc.getElementsByTagName("edge"));
            edgeElements.forEach(edgeEl => {
                const line: Line = {
                    id: edgeEl.getAttribute("id") || "",
                    type: edgeEl.getAttribute("type") || "line",
                    dialect: edgeEl.getAttribute("dialect") || "",
                    info: edgeEl.getAttribute("label") || "",
                    color: extractColor(edgeEl),
                    startArrowType: edgeEl.getAttribute("startArrow") as Line["startArrowType"],
                    endArrowType: edgeEl.getAttribute("endArrow") as Line["endArrowType"],
                    lineWidth: parseFloat(edgeEl.getElementsByTagName("edgeStyle")[0]?.getAttribute("lineWidth") || "2"),
                    x_C: 0, y_C: 0, borderPoints_X1: 0, borderPoints_Y1: 0, borderPoints_X2: 0, borderPoints_Y2: 0,
                    startX: parseFloat(edgeEl.getElementsByTagName("lineGeometry")[0]?.getAttribute("startX") || "0"),
                    startY: parseFloat(edgeEl.getElementsByTagName("lineGeometry")[0]?.getAttribute("startY") || "0"),
                    endX: parseFloat(edgeEl.getElementsByTagName("lineGeometry")[0]?.getAttribute("endX") || "0"),
                    endY: parseFloat(edgeEl.getElementsByTagName("lineGeometry")[0]?.getAttribute("endY") || "0"),
                    lineConnectionStart: extractConnections(edgeEl, "lineConnectionStart"),
                    lineConnectionEnd: extractConnections(edgeEl, "lineConnectionEnd"),
                    punctuation: edgeEl.getAttribute("punctuation") || "none"
                };
                shapes.push(line);
            });

            return shapes;
        }


        let currentDialect: string = 'none';
        let dialectButtonClickedFlag: string = 'none';

        document.getElementById('formatExport')?.addEventListener('click', function () {
            logDebug("Add table button clicked");
            exportGraphToFile(objects, "shapes");
        });


        document.getElementById('formatImport')?.addEventListener('change', function () {
            try {
                const fileInput = this as HTMLInputElement;
                const file = fileInput?.files?.[0];

                if (file) {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        try {
                            const content = e.target?.result as string;
                            objects = importGraphFromXml(content);
                            console.log('Импортированные объекты:', objects);
                            drawObjects();
                        } catch (error) {
                            console.error('Error processing file content:', error);
                        }
                    };
                    reader.readAsText(file);
                }
            } catch (error) {
                console.error('Error reading file:', error);
            } 
        });

        function dialectControl<T extends Shape>(flag: string, currentDialect_: string, func: (x: string) => T, onObjectAdded?: (obj: T) => void): string {
            if (currentDialect_ === 'none') {
                currentDialect_ = flag;
                const result = func(currentDialect_);
                onObjectAdded?.(result);
            } else if (currentDialect_ === flag) {
                const result = func(currentDialect_);
                onObjectAdded?.(result);
            } else {
                openPopup("Неверный диалект! Выберите другую фигуру", "information");
            }
            return currentDialect_;
        }

        // DB dialect

        document.getElementById('addLineBtnDB')?.addEventListener('click', function () {
            saveStateForUndo();
            logDebug("Add line button clicked");
            console.log("1 - ", currentDialect)
            dialectButtonClickedFlag = "DB";
            currentDialect = dialectControl(dialectButtonClickedFlag, currentDialect, dialectButtonClickedFlag => addLine(dialectButtonClickedFlag), (added) => openPopup(added, "editing"));
            
        });

        document.getElementById('addTableDB')?.addEventListener('click', function () {
            saveStateForUndo();
            logDebug("Add table button clicked");
            dialectButtonClickedFlag = "DB";
            currentDialect = dialectControl(dialectButtonClickedFlag, currentDialect, (dialectButtonClickedFlag) => addTable(dialectButtonClickedFlag), (added) => openPopup(added, "editing"));
            
        });

        // Base dialect

        document.getElementById('addTable')?.addEventListener('click', function () {
            saveStateForUndo();
            logDebug("Add table button clicked");
            dialectButtonClickedFlag = "base";
            currentDialect = dialectControl(dialectButtonClickedFlag, currentDialect, (dialectButtonClickedFlag) => addTable(dialectButtonClickedFlag), (added) => openPopup(added, "editing"));
            
        });

        document.getElementById('addRectBtn')?.addEventListener('click', function () {
            saveStateForUndo();
            logDebug("Add rectangle button clicked");
            dialectButtonClickedFlag = "base";
            currentDialect = dialectControl(dialectButtonClickedFlag, currentDialect, (dialectButtonClickedFlag) => addRect(dialectButtonClickedFlag), (added) => openPopup(added, "editing"));
        });

        document.getElementById('addCircleBtn')?.addEventListener('click', function () {
            saveStateForUndo();
            logDebug("Add circle button clicked");
            dialectButtonClickedFlag = "base";
            currentDialect = dialectControl(dialectButtonClickedFlag, currentDialect, (dialectButtonClickedFlag) => addCircle(dialectButtonClickedFlag), (added) => openPopup(added, "editing"));
            
        });

        document.getElementById('addLineBtn')?.addEventListener('click', function () {
            saveStateForUndo();
            logDebug("Add line button clicked");
            dialectButtonClickedFlag = "base";
            currentDialect = dialectControl(dialectButtonClickedFlag, currentDialect, (dialectButtonClickedFlag) => addLine(dialectButtonClickedFlag), (added) => openPopup(added, "editing"));
            
        });

        document.getElementById('addCloudBtn')?.addEventListener('click', function () {
            saveStateForUndo();
            logDebug("Add cloud button clicked");
            dialectButtonClickedFlag = "base";
            currentDialect = dialectControl(dialectButtonClickedFlag, currentDialect, (dialectButtonClickedFlag) => addCloud(dialectButtonClickedFlag), (added) => openPopup(added, "editing"));
            
        });

        document.getElementById('addStarBtn')?.addEventListener('click', function () {
            saveStateForUndo();
            logDebug("Add star button clicked");
            dialectButtonClickedFlag = "base";
            currentDialect = dialectControl(dialectButtonClickedFlag, currentDialect, (dialectButtonClickedFlag) => addStar(dialectButtonClickedFlag), (added) => openPopup(added, "editing"));
            
        });

        //

        document.getElementById('delShapeBtn')?.addEventListener('click', function () {
            saveStateForUndo();
            logDebug("Delete shape button clicked");
            deleteShape();
            
        });

        document.getElementById('rotateLeftBtn')?.addEventListener('click', function () {
            saveStateForUndo();
            logDebug("Rotate left button clicked");
            rotateSelectedObject(-10);
            
        });

        document.getElementById('rotateRightBtn')?.addEventListener('click', function () {
            saveStateForUndo();
            logDebug("Rotate right button clicked");
            rotateSelectedObject(10);
            
        });
        document.getElementById('deleteItem')?.addEventListener('click', function () {
            saveStateForUndo();
            if (selectedObject_buf) {
                deleteShape();
            }
            selectedObject_buf = null;
            
        });

        document.addEventListener('keydown', (event) => {
            const activeTag = document.activeElement?.tagName.toLowerCase();
            if (['input', 'textarea', 'select'].includes(activeTag)) return;

            if (event.ctrlKey && (event.key.toLowerCase() === 'z' || event.key.toLowerCase() === 'я')) {
                event.preventDefault();
                undo();
            }

            if (event.ctrlKey && (event.key.toLowerCase() === 'y' || event.key.toLowerCase() === 'н')) {
                event.preventDefault();
                redo();
            }

            if (event.key === 'Delete') {
                saveStateForUndo();
                event.preventDefault();
                deleteShape();
            }
        });


        document.getElementById('rotateLeftItem')?.addEventListener('click', function () {
            saveStateForUndo();
            if (selectedObject_buf) {
                rotateSelectedObject(-10);
            }
            selectedObject_buf = null;
            drawObjects();
            
        });

        document.getElementById('rotateRightItem')?.addEventListener('click', function () {
            saveStateForUndo();
            if (selectedObject_buf) {
                rotateSelectedObject(10);
            }
            selectedObject_buf = null;
            drawObjects();
        });

        document.getElementById('cycleCheck')?.addEventListener('click', function () {
            const cycles = detectCycles(objects); // Находим все циклы
            highlight = []; // Сбрасываем выделение перед каждым новым поиском циклов

            if (cycles.length > 0) {
                console.log("Циклы найдены:", cycles);

                // Для каждого цикла добавляем его объекты в массив highlight
                cycles.forEach(cyclePath => {
                    highlight = highlight.concat(cyclePath.map(id => objects.find(obj => obj.id === id)));
                });

                drawObjects(); // Перерисовываем объекты с выделением
                console.log(highlight);
            } else {
                console.log("Циклы не найдены");
            }
        });

        document.getElementById('connect_objects')?.addEventListener('click', function () {
            saveStateForUndo();
            logDebug(`connectionObjects button clicked`);
            connectionServ = 1;
            connectionObjects();
            
        });

        document.getElementById('remove_connection')?.addEventListener('click', function () {
            saveStateForUndo();
            logDebug(`remove_connection button clicked`);
            connectionServ = 0;
            removeObjects();
            
        });

        document.getElementById('outgoing_connect')?.addEventListener('click', function () {
            saveStateForUndo();
            logDebug(`outgoingConnectionObjects button clicked`);
            connectionServ = 3;
            connectionObjects();
            
        });

        document.getElementById('remove_outgoing_connection')?.addEventListener('click', function () {
            saveStateForUndo();
            logDebug(`remove_connection button clicked`);
            connectionServ = 4;
            removeObjects();
        });

        document.getElementById('additionInfo')?.addEventListener('click', function () {
            saveStateForUndo();
            addInfo(selectedObject_buf);
        });

        document.addEventListener('contextmenu', function (e: MouseEvent) {
            e.preventDefault();
        });

        document.getElementById('insert_img')?.addEventListener('click', function () {
            logDebug("Insert img button clicked");
            document.getElementById('imageInput')?.click(); // Открываем диалог выбора файлов
        });

        document.getElementById('debugInfo')?.addEventListener('click', function () {
            logDebug("debugInfo clicked");
            debugHide();
        });

        document.getElementById('imageInput')?.addEventListener('change', function (event) {
            const file = (event.target as HTMLInputElement)?.files?.[0];
            if (file && selectedObject_buf) {
                console.log("Выбран файл:", file.name);
                insertionImage(selectedObject_buf, file);
            } else {
                console.error("Не выбран объект или файл.");
            }
        });

        canvas.addEventListener('dblclick', function (event: MouseEvent) {
            const canvasRect = canvas.getBoundingClientRect();
            const mouseX = event.clientX - canvasRect.left - offsetX;
            const mouseY = event.clientY - canvasRect.top - offsetY;
            const clickedObject = objects.find(obj => {
                switch (obj.type) {
                    case 'rectangle': {
                        const rect = obj as Rectangle;
                        return isPointInRotatedRect(mouseX, mouseY, rect);
                    }
                    case 'circle': {
                        const circle = obj as Circle;
                        const dx = mouseX - circle.x_C;
                        const dy = mouseY - circle.y_C;
                        return dx * dx + dy * dy <= circle.radius * circle.radius;
                    }
                    case 'line': {
                        const line = obj as Line;
                        const distStart = Math.sqrt((mouseX - line.startX) ** 2 + (mouseY - line.startY) ** 2);
                        const distEnd = Math.sqrt((mouseX - line.endX) ** 2 + (mouseY - line.endY) ** 2);
                        const distToLine = Math.abs((line.endY - line.startY) * mouseX - (line.endX - line.startX) * mouseY +
                            line.endX * line.startY - line.endY * line.startX) /
                            Math.sqrt((line.endY - line.startY) ** 2 + (line.endX - line.startX) ** 2);
                        return distStart < 10 || distEnd < 10 || distToLine < 10;
                    }
                    case 'star': {
                        const star = obj as Star;
                        const points = [];
                        for (let i = 0; i < 2 * star.amount_points; i++) {
                            const angle = Math.PI * i / star.amount_points;
                            const radius = (i % 2 === 0) ? star.rad : star.rad * star.m;
                            const x = star.x_C + radius * Math.sin(angle);
                            const y = star.y_C + radius * Math.cos(angle);
                            points.push({ x, y });
                        }
                        return pointInPolygon(mouseX, mouseY, points);
                    }
                    case 'cloud': {
                        const cloud = obj as Cloud;
                        const startX_Cloud = cloud.x_C - cloud.width / 2;
                        const startY_Cloud = cloud.y_C - cloud.height / 2;
                        return mouseX >= startX_Cloud && mouseX <= startX_Cloud + cloud.width &&
                            mouseY >= startY_Cloud && mouseY <= startY_Cloud + cloud.height;
                    }
                    case 'table': {
                        const table = obj as ComplexShape;
                        return mouseX >= table.x_C && mouseX <= table.x_C + table.width &&
                            mouseY >= table.y_C && mouseY <= table.y_C + table.height;
                    }
                    default:
                        return false;
                }
            });

            if (clickedObject) {
                if (clickedObject.type === "table") {
                    // Поиск конкретной ячейки (rectangle) внутри таблицы
                    const table = clickedObject as ComplexShape;
                    const clickedCell = table.parts.find(cell =>
                        mouseX >= cell.x_C &&
                        mouseX <= cell.x_C + (cell as Rectangle).width &&
                        mouseY >= cell.y_C &&
                        mouseY <= cell.y_C + (cell as Rectangle).height
                    );

                    if (clickedCell) {
                        createTextInput(clickedCell, mouseX, mouseY);
                    }
                } else {
                    createTextInput(clickedObject, mouseX, mouseY);
                }
            } 
        });

        function createTextInput(obj: Shape, x: number, y: number) {
            const mainLayout = document.getElementById("main-layout") as HTMLCanvasElement;
            const difference = mainLayout.getBoundingClientRect();

            // Создаем input-элемент
            const input = document.createElement('input');
            input.type = 'text';
            input.value = obj.info || "";
            input.style.position = 'absolute';
            input.style.fontSize = '14px';
            input.style.outline = 'none';
            input.style.border = 'none';
            input.style.padding = '2px';
            input.style.background = 'none';
            input.style.zIndex = '1000';

            input.style.whiteSpace = 'nowrap';
            input.style.overflow = 'visible';
            input.style.boxSizing = 'border-box';

            switch (obj.type) {
                case 'rectangle':
                    const rect = obj as Rectangle;
                    input.style.left = `${canvas.offsetLeft + rect.x_C + offsetX}px`;
                    input.style.top = `${canvas.offsetTop + rect.y_C + rect.height / 3 + offsetY + difference.bottom - difference.top}px`;
                    input.style.width = `${rect.width + 100}px`;
                    /*input.style.width = 'none';*/
                    input.style.height = `${rect.height / 3}px`;
                    console.log(canvas.offsetLeft, canvas.offsetTop, rect.y_C, rect.x_C, x, y, canvas.offsetLeft + rect.x_C, canvas.offsetTop + rect.y_C, canvas.offsetLeft - rect.x_C, canvas.offsetTop - rect.y_C)
                    break;

                case 'circle':
                    const circle = obj as Circle;
                    input.style.left = `${canvas.offsetLeft + circle.x_C - circle.radius / 2 + offsetX}px`;
                    input.style.top = `${canvas.offsetTop + circle.y_C - circle.radius / 3 + offsetY + difference.bottom - difference.top}px`;
                    input.style.width = `${circle.radius}px`;
                    input.style.height = `${circle.radius * 2 / 3}px`;
                    input.style.textAlign = 'center';
                    break;

                case 'line':
                    const line = obj as Line;
                    input.style.left = `${canvas.offsetLeft + (line.startX + line.endX) / 2 - 30 + offsetX}px`;
                    input.style.top = `${canvas.offsetTop + (line.startY + line.endY) / 2 - 10 + offsetY + difference.bottom - difference.top}px`;
                    input.style.width = `60px`;
                    input.style.height = `20px`;
                    input.style.textAlign = 'center';
                    break;

                case 'star':
                    const star = obj as Star;
                    input.style.left = `${canvas.offsetLeft + star.x_C - star.rad / 2 + offsetX}px`;
                    input.style.top = `${canvas.offsetTop + star.y_C - star.rad / 3 + offsetY + difference.bottom - difference.top}px`;
                    input.style.width = `${star.rad}px`;
                    input.style.height = `${star.rad / 3}px`;
                    input.style.textAlign = 'center';
                    break;

                case 'cloud':
                    const cloud = obj as Cloud;
                    input.style.left = `${canvas.offsetLeft + cloud.x_C - cloud.width / 2 + offsetX}px`;
                    input.style.top = `${canvas.offsetTop + cloud.y_C - cloud.height / 3 + offsetY + difference.bottom - difference.top}px`;
                    input.style.width = `${cloud.width}px`;
                    input.style.height = `${cloud.height / 3}px`;
                    input.style.textAlign = 'center';
                    break;

                default:
                    logDebug(`Unknown object type: ${JSON.stringify(obj)}`);
                    return;
            }

            // Добавляем input в body
            document.body.appendChild(input);
            input.focus();

            // Функция сохранения текста и удаления input
            function saveText() {
                obj.info = input.value;
                document.body.removeChild(input);
                drawObjects(); // Перерисовываем холст с новым текстом
            }

            input.addEventListener('blur', saveText);  // Потеря фокуса
            input.addEventListener('keydown', function (e: KeyboardEvent) {
                if (e.key === 'Enter') saveText();
            });
        }

        function insertionImage(selectedObject_buf: Shape, file: File) {
            const reader = new FileReader();
            const img = new Image();
            const shape = objects.find(shape => shape.id === selectedObject_buf.id);

            if (!shape) {
                console.error("Shape not found");
                return;
            }

            // Когда изображение будет загружено, отрисовываем его внутри фигуры
            reader.onload = function (event) {
                img.src = event.target?.result as string;

                img.onload = function () {
                    shape.image = img; // Сохраняем изображение внутри фигуры
                    //shape.imageSrc = img.src;
                    drawObjects(); // Перерисовываем фигуры
                };
            };

            // Если чтение файла завершено с ошибкой
            reader.onerror = function () {
                console.error("Failed to load image");
            };

            reader.readAsDataURL(file); // Преобразуем изображение в строку Base64
        }

        function drawLineWithArrow(
            ctx: CanvasRenderingContext2D,
            startX: number,
            startY: number,
            endX: number,
            endY: number,
            color: string,
            arrowPosition: string = 'none',
            headLength: number = 10,
            startCardinality: '-|->' | '-0->' | '-*->' | '>' | 'none' = 'none',
            endCardinality: '-|->' | '-0->' | '-*->' | '>' | 'none' = 'none'
        ): void {
            // Вычисляем угол наклона линии
            const angle = Math.atan2(endY - startY, endX - startX);

            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = color;
            ctx.stroke();
            const drawHead = (x: number, y: number, directionAngle: number) => {
                const arrowX1 = x - headLength * Math.cos(directionAngle - Math.PI / 6);
                const arrowY1 = y - headLength * Math.sin(directionAngle - Math.PI / 6);
                const arrowX2 = x - headLength * Math.cos(directionAngle + Math.PI / 6);
                const arrowY2 = y - headLength * Math.sin(directionAngle + Math.PI / 6);

                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(arrowX1, arrowY1);
                ctx.lineTo(arrowX2, arrowY2);
                ctx.closePath(); // Закрываем треугольник
                ctx.fillStyle = color;
                ctx.fill();
                ctx.strokeStyle = color;
                ctx.stroke();
            };

            const drawBar = (x: number, y: number, angle: number) => {
                const dx = Math.cos(angle + Math.PI / 2) * 6;
                const dy = Math.sin(angle + Math.PI / 2) * 6;
                ctx.beginPath();
                ctx.moveTo(x - dx, y - dy);
                ctx.lineTo(x + dx, y + dy);
                ctx.stroke();
            };

            const drawCircle = (x: number, y: number) => {
                ctx.beginPath();
                ctx.arc(x, y, 5, 0, Math.PI * 2);
                ctx.stroke();
            };

            const drawCrowFoot = (x: number, y: number, angle: number) => {
                const spread = Math.PI / 10;
                const len = 14;
                for (let i = -1; i <= 1; i++) {
                    const a = angle + i * spread;
                    const dx = Math.cos(a) * len;
                    const dy = Math.sin(a) * len;
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(x - dx, y - dy);
                    ctx.stroke();
                }
            };

            const drawMarker = (type: string | null, x: number, y: number, angle: number) => {
                if (!type) return;
                if (type === '-|->') drawBar(x, y, angle);
                if (type === '-0->') { drawCircle(x, y); }
                if (type === '-*->') { drawCrowFoot(x + Math.cos(angle) * 10, y + Math.sin(angle) * 10, angle); }
            };

            const startOffsetX = startX + Math.cos(angle) * 8;
            const startOffsetY = startY + Math.sin(angle) * 8;
            const endOffsetX = endX - Math.cos(angle) * 8;
            const endOffsetY = endY - Math.sin(angle) * 8;

            
            if (startCardinality !== ">") {
                drawMarker(startCardinality, startOffsetX, startOffsetY, angle);
            } else {
                drawHead(startX, startY, angle + Math.PI)
            }
            if (endCardinality !== ">") {
                drawMarker(endCardinality, endOffsetX, endOffsetY, angle + Math.PI);
            } else {
                drawHead(endX, endY, angle)
            }


            if ((arrowPosition === 'start' || arrowPosition === 'both') && startCardinality === "none") {
                drawHead(startX, startY, angle + Math.PI);
                //startCardinality = ">";
            }
            if ((arrowPosition === 'end' || arrowPosition === 'both') && endCardinality === "none") {
                drawHead(endX, endY, angle);
                //endCardinality = ">";
            }

            if (arrowPosition === 'mid') {
                const midX = (startX + startY) / 2;
                const midY = (endX + endY) / 2;
                drawHead(midX, midY, angle);
            }
        }

        document.addEventListener('click', function () {
            hideContextMenu();
        });
        function showContextMenu(x, y) {
            const menu = document.getElementById('contextMenu');
            const canvasRect = canvas.getBoundingClientRect();
            const menuWidth = menu.offsetWidth;
            const menuHeight = menu.offsetHeight;
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;

            // Корректируем x и y с учетом `canvas.offsetLeft` и `canvas.offsetTop`
            x = x - canvasRect.left;
            y = y - canvasRect.top;

            // Adjust position if menu goes beyond window boundaries
            if (x + menuWidth > windowWidth) {
                x = windowWidth - menuWidth;
            }
            if (y + menuHeight > windowHeight) {
                y = windowHeight - menuHeight;
            }

            menu.style.left = `${x}px`;
            menu.style.top = `${y}px`;
            menu.hidden = false;
            menu.style.display = 'block';
        }
        function hideContextMenu() {
            const menu = document.getElementById('contextMenu');
            if (menu) {
                menu.style.display = 'none';
                menu.hidden = true;
            }
        }

        function debugHide() {
            const debug_element = document.getElementById("debugOutput");
            if (debug_element.style.display == 'none') {
                debug_element.style.display = 'block';
            } else {
                debug_element.style.display = 'none';
            }

        }

        function getObjectCenter(obj: Shape): [number, number] {
            switch (obj.type) {
                case 'rectangle':
                    const rect = obj as Rectangle;
                    return [rect.x_C + rect.width / 2, rect.y_C + rect.height / 2];
                case 'circle':
                    const circle = obj as Circle;
                    return [circle.x_C, circle.y_C];
                case 'line':
                    const line = obj as Line;
                    return [(line.startX + line.endX) / 2, (line.startY + line.endY) / 2];
                case 'star':
                    const star = obj as Star;
                    return [star.x_C, star.y_C];
                case 'cloud':
                    const cloud = obj as Cloud;
                    return [cloud.x_C, cloud.y_C];
                default:
                    return [0, 0];
            }
        }
        function addDirectedLink(fromObj: Shape, toObj: Shape): void {
            // Инициализируем массивы, если они не существуют
            if (!fromObj.outgoingLinks) {
                fromObj.outgoingLinks = [];
            }
            if (!toObj.incomingLinks) {
                toObj.incomingLinks = [];
            }

            // Проверяем, чтобы не было дублирования
            if (!fromObj.outgoingLinks.includes(toObj.id)) {
                fromObj.outgoingLinks.push(toObj.id);
                logDebug(`Added directed link from ${fromObj.id} to ${toObj.id}`);
            }

            // Проверяем, чтобы не было дублирования во входящих ссылках
            if (!toObj.incomingLinks.includes(fromObj.id)) {
                toObj.incomingLinks.push(fromObj.id);
                logDebug(`Added incoming link to ${toObj.id} from ${fromObj.id}`);
            }
        }
        function removeDirectedLink(fromObj: Shape, toObj: Shape): void {
            // Удаляем исходящую ссылку из fromObj
            if (fromObj.outgoingLinks) {
                fromObj.outgoingLinks = fromObj.outgoingLinks.filter(id => id !== toObj.id);
                logDebug(`Removed directed link from ${fromObj.id} to ${toObj.id}`);
            }

            // Удаляем входящую ссылку в toObj
            if (toObj.incomingLinks) {
                toObj.incomingLinks = toObj.incomingLinks.filter(id => id !== fromObj.id);
                logDebug(`Removed incoming link to ${toObj.id} from ${fromObj.id}`);
            }
        }

        // Функция для добавления связи между объектами
        function addLink(obj1: Shape, obj2: Shape): void {
            if (!obj1.linkedObjects) obj1.linkedObjects = [];
            if (!obj2.linkedObjects) obj2.linkedObjects = [];

            if (!obj1.linkedObjects.includes(obj2.id)) {
                obj1.linkedObjects.push(obj2.id);
            }

            if (!obj2.linkedObjects.includes(obj1.id)) {
                obj2.linkedObjects.push(obj1.id);
            }
        }

        // Функция для удаления связи между объектами
        function removeLink(obj1: Shape, obj2: Shape): void {
            if (obj1.linkedObjects) {
                obj1.linkedObjects = obj1.linkedObjects.filter(id => id !== obj2.id);
            }

            if (obj2.linkedObjects) {
                obj2.linkedObjects = obj2.linkedObjects.filter(id => id !== obj1.id);
            }
        }
        function connectionObjects() {
            if (selectedObject_buf) {
                selectedObject_buf_connect = selectedObject_buf;
                logDebug(`connectionObjects inside`);
                logDebug(`connectionObjects_buf_connect - (${JSON.stringify(selectedObject_buf_connect)})`);
                logDebug(`connectionObjects_buf - (${JSON.stringify(selectedObject_buf)})`);
            }
        }
        function waySelection() {
            if (selectedObject_buf) {
                selectedObject_buf_connect = selectedObject_buf;
                logDebug(`waySelection inside`);
                logDebug(`waySelection_buf_connect - (${JSON.stringify(selectedObject_buf_connect)})`);
                logDebug(`waySelection_buf - (${JSON.stringify(selectedObject_buf)})`);
            }
        }
        function removeObjects() {
            if (selectedObject_buf) {
                selectedObject_buf_connect = selectedObject_buf;
                logDebug(`removeObjects inside`);
                logDebug(`removeObjects_buf_connect - (${JSON.stringify(selectedObject_buf_connect)})`);
                logDebug(`removeObjects_buf - (${JSON.stringify(selectedObject_buf)})`);
            }
        }

        let allConnectors: { id: string, x: number, y: number, type: string }[] = [];

        function updateConnectors(obj: Shape) {
            // Если у объекта уже есть коннекторы, сохраняем их ID
            const existingConnectors = obj.connectors || [];
            const getConnectorId = (type: string): string => {
                const existing = existingConnectors.find(connector => connector.type === type);
                return existing ? existing.id : generateRandomId(16);
            };

            let connectors = [];

            switch (obj.type) {
                case 'rectangle': {
                    const rect = obj as Rectangle;
                    const { x_C, y_C, width, height } = rect;
                    connectors = [
                        { id: getConnectorId('left'), x: x_C, y: y_C + height / 2, type: 'left' },
                        { id: getConnectorId('right'), x: x_C + width, y: y_C + height / 2, type: 'right' },
                        { id: getConnectorId('top'), x: x_C + width / 2, y: y_C, type: 'top' },
                        { id: getConnectorId('bottom'), x: x_C + width / 2, y: y_C + height, type: 'bottom' }
                    ];
                    break;
                }
                case 'circle': {
                    const circle = obj as Circle;
                    const { x_C, y_C, radius } = circle;
                    connectors = [
                        { id: getConnectorId('left'), x: x_C - radius, y: y_C, type: 'left' },
                        { id: getConnectorId('right'), x: x_C + radius, y: y_C, type: 'right' },
                        { id: getConnectorId('top'), x: x_C, y: y_C - radius, type: 'top' },
                        { id: getConnectorId('bottom'), x: x_C, y: y_C + radius, type: 'bottom' }
                    ];
                    break;
                }
                case 'line': {
                    const line = obj as Line;
                    // Для линии удобно использовать ее концевые точки в качестве коннекторов
                    connectors = [
                        { id: getConnectorId('start'), x: line.startX, y: line.startY, type: 'start' },
                        { id: getConnectorId('end'), x: line.endX, y: line.endY, type: 'end' }
                    ];
                    break;
                }
                case 'star': {
                    const star = obj as Star;
                    // Предположим, что мы используем bounding box звезды
                    const left = star.x_C - star.rad;
                    const right = star.x_C + star.rad;
                    const top = star.y_C - star.rad;
                    const bottom = star.y_C + star.rad;
                    connectors = [
                        { id: getConnectorId('left'), x: left, y: star.y_C, type: 'left' },
                        { id: getConnectorId('right'), x: right, y: star.y_C, type: 'right' },
                        { id: getConnectorId('top'), x: star.x_C, y: top, type: 'top' },
                        { id: getConnectorId('bottom'), x: star.x_C, y: bottom, type: 'bottom' }
                    ];
                    break;
                }
                case 'cloud': {
                    const cloud = obj as Cloud;
                    const left = cloud.x_C - cloud.width / 2;
                    const top = cloud.y_C - cloud.height / 2;
                    connectors = [
                        { id: getConnectorId('left'), x: left, y: cloud.y_C, type: 'left' },
                        { id: getConnectorId('right'), x: left + cloud.width, y: cloud.y_C, type: 'right' },
                        { id: getConnectorId('top'), x: cloud.x_C, y: top, type: 'top' },
                        { id: getConnectorId('bottom'), x: cloud.x_C, y: top + cloud.height, type: 'bottom' }
                    ];
                    break;
                }
                default:
                    logDebug(`Unknown object type: ${JSON.stringify(obj)}`);
                    return;
            }

            // Обновляем коннекторы в объекте
            obj.connectors = connectors;

            // Синхронизируем данные с массивом allConnectors
            connectors.forEach(connector => {
                const index = allConnectors.findIndex(existing => existing.id === connector.id);
                if (index !== -1) {
                    // Если коннектор уже существует в allConnectors, обновляем его координаты и тип
                    allConnectors[index] = { ...allConnectors[index], x: connector.x, y: connector.y, type: connector.type };
                } else {
                    // Если коннектор отсутствует, добавляем его
                    allConnectors.push({ id: connector.id, x: connector.x, y: connector.y, type: connector.type });
                }
            });
        }

        // Создание объектов
        function objectAdditionPreprocessing(obj: Shape, complex: boolean = false) {
            updateConnectors(obj);
            selectedObject_buf = obj;
            selectedObject_buf.selectionMarker = true;
            switch (obj.type) {
                case 'rectangle':
                    drawRect(selectedObject_buf as Rectangle, ctx);
                    break;
                case 'circle':
                    drawCircle(selectedObject_buf as Circle, ctx);
                    break;
                case 'line':
                    drawLine(selectedObject_buf as Line, ctx);
                    break;
                case 'star':
                    drawStar(selectedObject_buf as Star, ctx);
                    break;
                case 'cloud':
                    drawCloud(selectedObject_buf as Cloud, ctx);
                    break;
                default:
                    console.warn("Unknown shape type:", obj.type);
                    return null;
            }
            selectedObject_buf.selectionMarker = false;
            if (!complex) objects.push(selectedObject_buf);
            selectedObject_buf = null;
            if (!complex) drawObjects();
        }
        function addRect(
            dialect: string = "base",
            x_C: number = canvas.width / 2,
            y_C: number = canvas.height / 2,
            width: number = 50,
            height: number = 50,
            color: string = getRandomColor(),
            rotation: number = 0,
            border: boolean = false
        ): Rectangle {
            const newRect: Rectangle = {
                dialect,
                id: generateRandomId(16),
                type: 'rectangle',
                x_C,
                y_C,
                width,
                height,
                color,
                rotation,
                borderPoints_X1: 0,
                borderPoints_Y1: 0,
                borderPoints_X2: 0,
                borderPoints_Y2: 0,
                selectionMarker: false,
                colorAlpha: 1,
                border: border
            };
            objectAdditionPreprocessing(newRect);
            return newRect;
        }
        function addCircle(
            dialect: string = "base",
            x_C: number = canvas.width / 2,
            y_C: number = canvas.height / 2,
            radius: number = 25,
            color: string = getRandomColor(),
            rotation: number = 0
        ): Circle {
            const newCircle: Circle = {
                dialect,
                id: generateRandomId(16),
                type: 'circle',
                x_C,
                y_C,
                radius,
                color,
                rotation,
                borderPoints_X1: 0,
                borderPoints_Y1: 0,
                borderPoints_X2: 0,
                borderPoints_Y2: 0,
                selectionMarker: false,
                colorAlpha: 1
            };
            objectAdditionPreprocessing(newCircle);
            return newCircle;
        }
        function addLine(
            dialect: string = "base",
            startX: number = canvas.width / 2 - 50,
            startY: number = canvas.height / 2,
            endX: number = canvas.width / 2 + 50,
            endY: number = canvas.height / 2,
            color: string = getRandomColor(),
            rotation: number = 0,
            arrowDirection: string = "none",
            punctuation: string = "none",
            lineWidth: number = 2,
            startArrowType: '-|->' | '-0->' | '-*->' | 'none' = 'none',
            endArrowType: '-|->' | '-0->' | '-*->' | 'none' = 'none'
        ): Line {
            const centerX = (startX + endX) / 2;
            const centerY = (startY + endY) / 2;

            const newLine: Line = {
                dialect,
                id: generateRandomId(16),
                type: 'line',
                startX,
                startY,
                endX,
                endY,
                color,
                rotation,
                x_C: centerX,
                y_C: centerY,
                borderPoints_X1: startX + 2,
                borderPoints_Y1: startY + 2,
                borderPoints_X2: endX + 2,
                borderPoints_Y2: endY + 2,
                selectionMarker: false,
                arrowDirection,
                colorAlpha: 1,
                punctuation,
                lineWidth,
                startArrowType,
                endArrowType
            };
            objectAdditionPreprocessing(newLine);
            return newLine;
        }
        function addStar(
            dialect: string = "base",
            x_C: number = canvas.width / 2,
            y_C: number = canvas.height / 2,
            rad: number = 100,
            amount_points: number = 6,
            m: number = 0.5,
            color: string = getRandomColor(),
            rotation: number = 0
        ): Star {
            const newStar: Star = {
                dialect,
                id: generateRandomId(16),
                type: 'star',
                x_C,
                y_C,
                rad,
                amount_points,
                m,
                color,
                rotation,
                borderPoints_X1: 0,
                borderPoints_Y1: 0,
                borderPoints_X2: 0,
                borderPoints_Y2: 0,
                selectionMarker: false,
                colorAlpha: 1
            };
            objectAdditionPreprocessing(newStar);
            return newStar;
        }
        function addCloud(
            dialect: string = "base",
            x_C: number = canvas.width / 2,
            y_C: number = canvas.height / 2,
            width: number = 200,
            height: number = 120,
            color: string = getRandomColor(),
            rotation: number = 0
        ): Cloud {
            const newCloud: Cloud = {
                dialect,
                id: generateRandomId(16),
                type: 'cloud',
                x_C,
                y_C,
                width,
                height,
                color,
                rotation,
                borderPoints_X1: 0,
                borderPoints_Y1: 0,
                borderPoints_X2: 0,
                borderPoints_Y2: 0,
                selectionMarker: false,
                colorAlpha: 1
            };
            objectAdditionPreprocessing(newCloud);
            return newCloud;
        }

        function addTable(
            dialect: string = "base",
            x_C: number = canvas.width / 2,
            y_C: number = canvas.height / 2,
            rows: number = 3,
            cols: number = 3,
            cellWidth: number = 50,
            cellHeight: number = 50,
            color: string = getRandomColor(),
            rotation: number = 0
        ): ComplexShape {
            //console.log("begin", rows, cols);
            const newTable: ComplexShape = {
                dialect,
                id: generateRandomId(16),
                type: 'table',
                x_C,
                y_C,
                width: cols * cellWidth,
                height: rows * cellHeight,
                color,
                rotation,
                parts: [],
                borderPoints_X1: x_C,
                borderPoints_Y1: y_C,
                borderPoints_X2: x_C + cols * cellWidth,
                borderPoints_Y2: y_C + rows * cellHeight,
                cols: cols,
                rows: rows
            };

            // Создание ячеек таблицы
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    const cell: Rectangle = {
                        dialect,
                        id: generateRandomId(16),
                        type: 'rectangle',
                        x_C: x_C + col * cellWidth,
                        y_C: y_C + row * cellHeight,
                        width: cellWidth,
                        height: cellHeight,
                        color,
                        rotation,
                        borderPoints_X1: 0,
                        borderPoints_Y1: 0,
                        borderPoints_X2: 0,
                        borderPoints_Y2: 0,
                        selectionMarker: false,
                        colorAlpha: 1,
                        border: true
                    };

                    objectAdditionPreprocessing(cell, true);
                    
                    console.log(row, col, cell);
                    newTable.parts.push(cell);
                }
            }
            objects.push(newTable);
            //console.log(objects, "\n");
            drawObjects();
            return newTable;
        }

        function editTable(editedTable: ComplexShape): void {
            const cellWidth = 50;
            const cellHeight = 50;
            saveStateForUndo();
            console.log("edit");
            const table = objects.find(o => o.id === editedTable.id && o.type === 'table') as ComplexShape;
            if (!table) {
                console.error(`Таблица ${editedTable} не найдена`);
                return;
            }
            for (const cell of table.parts) {
                const idx = objects.findIndex(o => o.id === cell.id);
                if (idx >= 0) objects.splice(idx, 1);
            }
            table.parts.length = 0;

            table.x_C = editedTable.x_C;
            table.y_C = editedTable.y_C;
            table.cols = editedTable.cols;
            table.rows = editedTable.rows;
            table.width = editedTable.cols * cellWidth;
            table.height = editedTable.rows * cellHeight;
            table.color = editedTable.color;
            table.rotation = editedTable.rotation;
            table.borderPoints_X1 = editedTable.x_C;
            table.borderPoints_Y1 = editedTable.y_C;
            table.borderPoints_X2 = table.borderPoints_X1 + table.width;
            table.borderPoints_Y2 = table.borderPoints_Y1 + table.height;

            for (let row = 0; row < table.rows; row++) {
                for (let col = 0; col < table.cols; col++) {
                    const cell: Rectangle = {
                        dialect: table.dialect,
                        id: generateRandomId(16),
                        type: 'rectangle',
                        x_C: table.x_C + col * cellWidth,
                        y_C: table.y_C + row * cellHeight,
                        width: cellWidth,
                        height: cellHeight,
                        color: editedTable.color,
                        rotation: editedTable.rotation,
                        borderPoints_X1: 0,
                        borderPoints_Y1: 0,
                        borderPoints_X2: 0,
                        borderPoints_Y2: 0,
                        selectionMarker: false,
                        colorAlpha: 1,
                        border: true
                    };
                    objectAdditionPreprocessing(cell, true);
                    table.parts.push(cell);
                }
            }
        }

        function drawTable(table: ComplexShape, ctx: CanvasRenderingContext2D) {
            table.parts.forEach(part => {
                drawRect(part as Rectangle, ctx);
                updateConnectors(part as Rectangle);
                enteringText(part as Rectangle);
            });
            table.borderPoints_X1 = table.x_C;
            table.borderPoints_Y1 = table.y_C;
            table.borderPoints_X2 = table.x_C + table.width;
            table.borderPoints_Y2 = table.y_C + table.height;
        }


        // Отрисовка/удаление объектов
        function drawSquare(ctx, x, y, size) {
            ctx.fillStyle = 'black';
            ctx.fillRect(x - size / 2, y - size / 2, size, size);
        }
        function drawRect(rect: Rectangle, ctx: CanvasRenderingContext2D): void {
            const colorWithAlpha = hexToRgba(rect.color, rect.colorAlpha);
            ctx.fillStyle = colorWithAlpha;
            ctx.fillRect(rect.x_C, rect.y_C, rect.width, rect.height);
            if (rect.image) {
                ctx.drawImage(rect.image, rect.x_C, rect.y_C, rect.width!, rect.height!);
            }
            if (rect.border) { // чтобы в таблице были непунктирные границы
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 1;
                ctx.strokeRect(rect.x_C, rect.y_C, rect.width, rect.height);
            }
            //console.log(rect.selectionMarker, (rect.selectionMarker && selectedObject_buf === rect));
            if (rect.selectionMarker || selectedObject_buf === rect) {
                ctx.strokeStyle = 'rgba(0, 120, 255, 0.7)';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 3]);  // Длина штриха и промежутка
                ctx.strokeRect(rect.x_C, rect.y_C, rect.width, rect.height);
                ctx.setLineDash([]);  // Сбрасываем пунктир
                rect.borderPoints_X1 = rect.x_C;
                rect.borderPoints_Y1 = rect.y_C;
                rect.borderPoints_X2 = rect.x_C + rect.width;
                rect.borderPoints_Y2 = rect.y_C + rect.height;
                updateConnectors(rect);
                rect.connectors.forEach(connector => {
                    ctx.fillStyle = 'black';
                    ctx.fillRect(connector.x - 3, connector.y - 3, 6, 6);
                    //console.log(connector.x - 3, connector.y - 3);
                });
            }
        }
        function drawLine(line: Line, ctx: CanvasRenderingContext2D): void {
            const colorWithAlpha = hexToRgba(line.color, line.colorAlpha);
            if (line.punctuation === "none") {
                ctx.beginPath();
                ctx.moveTo(line.startX, line.startY);
                ctx.lineTo(line.endX, line.endY);
                ctx.strokeStyle = colorWithAlpha;
                ctx.lineWidth = line.lineWidth;
                ctx.stroke();
            } else {
                ctx.setLineDash([5, 3]);
                ctx.beginPath();
                ctx.moveTo(line.startX, line.startY);
                ctx.lineTo(line.endX, line.endY);
                ctx.strokeStyle = colorWithAlpha;
                ctx.lineWidth = line.lineWidth;
                ctx.stroke();
                ctx.setLineDash([]);
            }

            if (line.selectionMarker || selectedObject_buf === line) {
                ctx.strokeStyle = 'rgba(0, 120, 255, 0.7)';
                ctx.lineWidth = line.lineWidth;
                ctx.setLineDash([5, 3]);

                // Определяем верхний левый угол прямоугольника
                const rectX = Math.min(line.startX, line.endX);
                const rectY = Math.min(line.startY, line.endY);

                const rectWidth = Math.abs(line.endX - line.startX);
                const rectHeight = Math.abs(line.endY - line.startY);

                ctx.strokeRect(rectX, rectY, rectWidth, rectHeight);
                ctx.setLineDash([]);

                line.borderPoints_X1 = rectX;
                line.borderPoints_Y1 = rectY;
                line.borderPoints_X2 = rectX + rectWidth;
                line.borderPoints_Y2 = rectY + rectHeight;

                updateConnectors(line);
                line.connectors.forEach(connector => {
                    ctx.fillStyle = 'black';
                    ctx.fillRect(connector.x - 3, connector.y - 3, 6, 6);
                    //console.log(connector.x - 3, connector.y - 3);
                });
            }
            //drawArrow(ctx, line);
            drawLineWithArrow(ctx, line.startX, line.startY, line.endX, line.endY, line.color, line.arrowDirection, 10, line.startArrowType, line.endArrowType);
        }
        function drawCircle(circle: Circle, ctx: CanvasRenderingContext2D): void {
            const colorWithAlpha = hexToRgba(circle.color, circle.colorAlpha);
            ctx.beginPath();
            ctx.arc(circle.x_C, circle.y_C, circle.radius, 0, 2 * Math.PI);
            ctx.fillStyle = colorWithAlpha;
            ctx.fill();
            if (circle.image) {
                // Клипируем область круга, чтобы ограничить изображение
                ctx.save();
                ctx.beginPath();
                ctx.arc(circle.x_C, circle.y_C, circle.radius, 0, 2 * Math.PI);
                ctx.clip();
                ctx.drawImage(circle.image, circle.x_C - circle.radius, circle.y_C - circle.radius, circle.radius * 2, circle.radius * 2);
                ctx.restore();
            }
            if (circle.selectionMarker || selectedObject_buf === circle) {
                ctx.strokeStyle = 'rgba(0, 120, 255, 0.7)';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 3]);  // Длина штриха и промежутка
                ctx.strokeRect(circle.x_C - circle.radius - 2, circle.y_C - circle.radius - 2, circle.radius * 2 + 4, circle.radius * 2 + 4);
                ctx.setLineDash([]);  // Сбрасываем пунктир
                circle.borderPoints_X1 = circle.x_C - circle.radius - 2;
                circle.borderPoints_Y1 = circle.y_C - circle.radius - 2;
                circle.borderPoints_X2 = circle.x_C + circle.radius + 2;
                circle.borderPoints_Y2 = circle.y_C + circle.radius + 2;

                updateConnectors(circle);
                circle.connectors.forEach(connector => {
                    ctx.fillStyle = 'black';
                    ctx.fillRect(connector.x - 3, connector.y - 3, 6, 6);
                    //console.log(connector.x - 3, connector.y - 3);
                });
            }
        }
        function drawStar(star: Star, ctx: CanvasRenderingContext2D): void {
            let x_C = star.x_C
            let y_C = star.y_C
            let rad = star.rad
            let amount_points = star.amount_points
            let m = star.m

            const colorWithAlpha = hexToRgba(star.color, star.colorAlpha);
            ctx.beginPath();
            let points = [];
            ctx.moveTo(x_C, y_C + rad);
            for (let i = 0; i < 2 * amount_points; i++) {
                let angle = Math.PI * i / amount_points;
                let radius = i % 2 === 0 ? rad : rad * m;
                let x = x_C + radius * Math.sin(angle);
                let y = y_C + radius * Math.cos(angle);
                points.push({ x, y });
                ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fillStyle = colorWithAlpha;
            ctx.fill();

            if (star.selectionMarker || selectedObject_buf === star) {

                ctx.strokeStyle = 'rgba(0, 120, 255, 0.7)';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 3]);
                ctx.strokeRect(star.x_C - star.rad - 2, star.y_C - star.rad - 2, star.rad * 2 + 4, star.rad * 2 + 4);
                ctx.setLineDash([]);  // Сбрасываем пунктир
                star.borderPoints_X1 = star.x_C - star.rad - 2;
                star.borderPoints_Y1 = star.y_C - star.rad - 2;
                star.borderPoints_X2 = star.x_C + star.rad + 2;
                star.borderPoints_Y2 = star.y_C + star.rad + 2;

                // Отрисовка квадратов на вершинах звезды
                //points.forEach(point => drawSquare(ctx, point.x, point.y, 10));
                updateConnectors(star);
                star.connectors.forEach(connector => {
                    ctx.fillStyle = 'black';
                    ctx.fillRect(connector.x - 3, connector.y - 3, 6, 6);
                    //console.log(connector.x - 3, connector.y - 3);
                });
            }
        }
        function drawCloud(cloud: Cloud, ctx: CanvasRenderingContext2D): void {
            let x_C = cloud.x_C
            let y_C = cloud.y_C
            let width = cloud.width
            let height = cloud.height

            const colorWithAlpha = hexToRgba(cloud.color, cloud.colorAlpha);
            ctx.beginPath();
            let startX_Cloud = x_C - width / 2;
            let startY_Cloud = y_C - height / 2;

            let points = [
                { x: startX_Cloud + 0.25 * width, y: startY_Cloud + 0.25 * height },
                { x: startX_Cloud + 0.75 * width, y: startY_Cloud + 0.25 * height },
                { x: startX_Cloud + 0.75 * width, y: startY_Cloud + 0.75 * height },
                { x: startX_Cloud + 0.25 * width, y: startY_Cloud + 0.75 * height }
            ];

            ctx.moveTo(points[0].x, points[0].y);

            ctx.bezierCurveTo(
                points[0].x, startY_Cloud,
                points[1].x, startY_Cloud,
                points[1].x, points[1].y
            );

            ctx.bezierCurveTo(
                startX_Cloud + width, points[1].y,
                startX_Cloud + width, points[2].y,
                points[2].x, points[2].y
            );

            ctx.bezierCurveTo(
                points[2].x, startY_Cloud + height,
                points[3].x, startY_Cloud + height,
                points[3].x, points[3].y
            );

            ctx.bezierCurveTo(
                startX_Cloud, points[3].y,
                startX_Cloud, points[0].y,
                points[0].x, points[0].y
            );

            ctx.closePath();
            ctx.fillStyle = colorWithAlpha;
            ctx.fill();

            if (cloud.selectionMarker || selectedObject_buf === cloud) {
                // Отрисовка голубой пунктирной рамки
                ctx.save();
                ctx.strokeStyle = 'rgba(0, 120, 255, 0.7)';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 3]);
                //ctx.strokeRect(startX_Cloud - 2, startY_Cloud - 2, width + 1, height + 1);
                ctx.strokeRect(startX_Cloud, startY_Cloud, width, height);
                ctx.setLineDash([]);  // Сбрасываем пунктир
                ctx.restore();


                //cloud.borderPoints_X1 = startX_Cloud - 2;
                //cloud.borderPoints_Y1 = startY_Cloud - 2;
                //cloud.borderPoints_X2 = startX_Cloud - 2 + (width + 1);
                //cloud.borderPoints_Y2 = startY_Cloud - 2 + (height + 1);

                cloud.borderPoints_X1 = startX_Cloud;
                cloud.borderPoints_Y1 = startY_Cloud;
                cloud.borderPoints_X2 = startX_Cloud + width;
                cloud.borderPoints_Y2 = startY_Cloud + height;

                // Отрисовка квадратов на контрольных точках
                //points.forEach(point => drawSquare(ctx, point.x, point.y, 10));
                updateConnectors(cloud);
                cloud.connectors.forEach(connector => {
                    ctx.fillStyle = 'black';
                    ctx.fillRect(connector.x - 3, connector.y - 3, 6, 6);
                    //console.log(connector.x - 3, connector.y - 3);
                });
            }
        }

        function removeReferences(shapeToRemove: Shape) {
            for (const obj of objects) {
                if (obj.linkedObjects) {
                    obj.linkedObjects = obj.linkedObjects.filter(id => id !== shapeToRemove.id);
                }
                if (obj.outgoingLinks) {
                    obj.outgoingLinks = obj.outgoingLinks.filter(id => id !== shapeToRemove.id);
                }
                if (obj.incomingLinks) {
                    obj.incomingLinks = obj.incomingLinks.filter(id => id !== shapeToRemove.id);
                }
                if (obj.lineConnectionStart) {
                    obj.lineConnectionStart = obj.lineConnectionStart.filter(conn => conn.id_con !== shapeToRemove.id);
                }
                if (obj.lineConnectionEnd) {
                    obj.lineConnectionEnd = obj.lineConnectionEnd.filter(conn => conn.id_con !== shapeToRemove.id);
                }
            }
        }

        function deleteShape() {
            console.log(objects)
            if (selectedObjectMass.length > 0) {
                // Удаляем ссылки на удаляемые фигуры из других объектов
                for (const shapeToRemove of selectedObjectMass) {

                    removeReferences(shapeToRemove);
                    const indexToRemove = objects.indexOf(shapeToRemove);
                    //const indexToRemove = selectedObjectMass.indexOf(shapeToRemove);
                    if (indexToRemove !== -1) {
                        if (shapeToRemove.type === 'line') {
                            const lineToRemove = shapeToRemove as Line;
                            for (const obj of objects) {
                                obj.lineConnectionStart = obj.lineConnectionStart?.filter(conn => conn.id_shape !== lineToRemove.id) || [];
                                obj.lineConnectionEnd = obj.lineConnectionEnd?.filter(conn => conn.id_shape !== lineToRemove.id) || [];
                            }
                        } else if (shapeToRemove.type === "table") {
                            const table = shapeToRemove as ComplexShape;
                            table.parts.forEach(part => removeReferences(part));
                            objects = objects.filter(obj => !table.parts.includes(obj));
                        }
                        objects.splice(indexToRemove, 1);
                    }
                }

                // Очищаем массив выделенных объектов
                selectedObjectMass = [];
                drawObjects();
                logDebug("All selected shapes deleted.");
            }
            if (selectedObject_buf) {
                // Удаление одного объекта, если selectedObjectMass пустой
                const indexToRemove = objects.indexOf(selectedObject_buf);
                if (indexToRemove !== -1) {
                    const shapeToRemove = objects[indexToRemove];
                    removeReferences(selectedObject_buf);
                    if (shapeToRemove.type === 'line') {
                        const lineToRemove = shapeToRemove as Line;
                        for (const obj of objects) {
                            obj.lineConnectionStart = obj.lineConnectionStart?.filter(conn => conn.id_shape !== lineToRemove.id) || [];
                            obj.lineConnectionEnd = obj.lineConnectionEnd?.filter(conn => conn.id_shape !== lineToRemove.id) || [];
                        }
                    } else if (shapeToRemove.type === "table") {
                        const table = selectedObject_buf as ComplexShape;
                        table.parts.forEach(part => removeReferences(part));
                        objects = objects.filter(obj => !table.parts.includes(obj));
                    }
                    objects.splice(indexToRemove, 1);
                    drawObjects();
                    selectedObject_buf = null;
                }
            } else {
                logDebug("No shape selected to delete");
            }

            // Очищаем контейнер для описания
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }
            if (objects.length == 0) {
                currentDialect = "none";
            }
            isSchemaLoaded = false;
        }

        let userInput: any;
        // Управление объектами
        function rotateSelectedObject(angle: number) {
            if (selectedObject_buf) {
                selectedObject_buf.rotation = (selectedObject_buf.rotation || 0) + angle;
                logDebug(`Rotated object: ${JSON.stringify(selectedObject_buf)}`);
                updateConnectors(selectedObject_buf as Rectangle);
                drawObjects();
            }
        }
        function addInfo(selectedObject_buf_: Shape) {
            showPrompt(userInput,"Введите текст:");
            selectedObject_buf_.info = userInput;
        }
        function pointInPolygon(x, y, points) {
            let inside = false;
            for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
                const xi = points[i].x, yi = points[i].y;
                const xj = points[j].x, yj = points[j].y;
                const intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
                if (intersect) inside = !inside;
            }
            return inside;
        }
        function selectionCheck(selectedObject_buf_connect_: Shape, selectedObject_buf_: Shape, connectionServ_: number) {
            if (selectedObject_buf_connect_ && connectionServ_ == 1) {
                logDebug(`Selected object to connect_mouse_down - (${JSON.stringify(selectedObject_buf_connect_)})`);
                addLink(selectedObject_buf_connect_, selectedObject_buf_);
                selectedObject_buf_connect_ = null;
            } else if (selectedObject_buf_connect_ && connectionServ_ == 0) {
                logDebug(`Selected object to remove_mouse_down - (${JSON.stringify(selectedObject_buf_connect_)})`);
                removeLink(selectedObject_buf_connect_, selectedObject_buf_);
                selectedObject_buf_connect_ = null;
            } else if (selectedObject_buf_connect_ && connectionServ_ == 3) {
                logDebug(`Selected object to connect_mouse_down - (${JSON.stringify(selectedObject_buf_connect_)})`);
                addDirectedLink(selectedObject_buf_connect_, selectedObject_buf_);
                selectedObject_buf_connect_ = null;
            } else if (selectedObject_buf_connect_ && connectionServ_ == 4) {
                logDebug(`Selected object to remove_mouse_down - (${JSON.stringify(selectedObject_buf_connect_)})`);
                removeDirectedLink(selectedObject_buf_connect_, selectedObject_buf_);
                selectedObject_buf_connect_ = null;
            } else if (selectedObject_buf_connect_ && connectionServ_ == 5) {
                logDebug(`Selected object to remove_mouse_down - (${JSON.stringify(selectedObject_buf_connect_)})`);
                londWayCheck(objects, selectedObject_buf_connect_, selectedObject_buf_);
                selectedObject_buf_connect_ = null;
            }
            return selectedObject_buf_connect_;
        }
        function londWayCheck(objects_: Shape[], selectedObject_buf_connect_: Shape, selectedObject_buf_: Shape) {
            logDebug(`londWayCheck - (${JSON.stringify(selectedObject_buf_connect_)})`);
            logDebug(`londWayCheck - (${JSON.stringify(selectedObject_buf_)})`);
            logDebug(`londWayCheck - (${JSON.stringify(objects_)})`);

            const shortestPath = bfsShortestPath(objects_, selectedObject_buf_connect_.id, selectedObject_buf_.id);
            logDebug(`londWayCheck - (${JSON.stringify(selectedObject_buf_connect_)})`);
            if (shortestPath) {
                console.log('Кратчайший путь найден:', shortestPath);
            } else {
                console.log('Кратчайший путь не найден');
            }

            highlight = []; // Сбрасываем выделение перед каждым новым поиском пути

            if (shortestPath && shortestPath.length > 0) {
                logDebug(`londWayCheck_now_there - (${JSON.stringify(shortestPath)})`);

                // Добавляем объекты кратчайшего пути в массив highlight
                highlight = shortestPath.map(id => objects.find(obj => obj.id === id));
                logDebug(`londWayCheck_now_highlight - (${JSON.stringify(highlight)})`);
                drawObjects(); // Перерисовываем объекты с выделением
                console.log(highlight);
            }
        }
        function tableObjectCheck(selectedObject_buf_: Shape) {
            if (selectedObject_buf_) {
                const table = createVerticalTable(selectedObject_buf_);
                if (container) {
                    while (container.firstChild) {
                        container.removeChild(container.firstChild);
                    }
                }
                container?.appendChild(table);
            }
        }

        function isPointInRotatedRect(mouseX: number, mouseY: number, rect: Rectangle): boolean {
            // Центр вращения
            const centerX = rect.x_C + rect.width / 2;
            const centerY = rect.y_C + rect.height / 2;

            // Преобразуем координаты мыши обратно, чтобы исключить поворот фигуры
            const angle = -(rect.rotation || 0) * Math.PI / 180; // Отрицательный угол для обратного вращения

            const rotatedX = Math.cos(angle) * (mouseX - centerX) - Math.sin(angle) * (mouseY - centerY) + centerX;
            const rotatedY = Math.sin(angle) * (mouseX - centerX) + Math.cos(angle) * (mouseY - centerY) + centerY;

            // Теперь проверяем, находится ли преобразованная точка внутри исходного прямоугольника без поворота
            return (
                rotatedX >= rect.x_C &&
                rotatedX <= rect.x_C + rect.width &&
                rotatedY >= rect.y_C &&
                rotatedY <= rect.y_C + rect.height
            );
        }

        let help_X: number = 0
        let help_Y: number = 0

        let help_Xm: number = 0
        let help_Ym: number = 0

        function clickedObjectPreprocessing(objects_: Shape[], obj_: Shape, mouseX: number, mouseY: number, foundObject_: boolean) {
            if (!selectedObjectMass.some(object => object.id === obj_.id)) {
                for (let i = objects_.length - 1; i >= 0; i--) {
                    objects_[i].selectionMarker = false;
                }
            }
            foundObject_ = true;
            obj_.selectionMarker = true;
            selectedObject = obj_;
            selectedObject_buf = obj_;
            startX = mouseX - obj_.x_C;
            startY = mouseY - obj_.y_C;
            //logDebug(`Selected rectangle: ${JSON.stringify(rect)}`);
            selectedObject_buf_connect = selectionCheck(selectedObject_buf_connect, selectedObject_buf, connectionServ);
            connectionServ = 2;
            tableObjectCheck(selectedObject_buf);
            return foundObject_;
        }

        function mouseLineCheck(mouse_x: number, mouse_y: number, line: Line): boolean {
            const x = mouse_x;
            const y = mouse_y;

            const minX = Math.min(line.startX, line.endX) - 2;
            const maxX = Math.max(line.startX, line.endX) + 2;
            const minY = Math.min(line.startY, line.endY) - 2;
            const maxY = Math.max(line.startY, line.endY) + 2;

            return x >= minX && x <= maxX && y >= minY && y <= maxY;
        }

        function distancePointToSegment(
            px: number, py: number,
            x1: number, y1: number,
            x2: number, y2: number
        ): number {
            const dx = x2 - x1;
            const dy = y2 - y1;

            if (dx === 0 && dy === 0) {
                // Отрезок вырожден в точку
                return Math.hypot(px - x1, py - y1);
            }

            // Вычисляем t (положение проекции точки на прямую относительно отрезка)
            const t = ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy);

            let closestX: number, closestY: number;

            if (t < 0) {
                // Ближайшая точка — x1, y1
                closestX = x1;
                closestY = y1;
            } else if (t > 1) {
                // Ближайшая точка — x2, y2
                closestX = x2;
                closestY = y2;
            } else {
                // Проекция попадает на отрезок
                closestX = x1 + t * dx;
                closestY = y1 + t * dy;
            }

            // Расстояние от точки до ближайшей точки на отрезке
            return Math.hypot(px - closestX, py - closestY);
        }


        function leftButtonDown(e: MouseEvent, mouseX: number, mouseY: number) {
            logDebug("mouse_down");
            let foundObject = false;
            hideContextMenu();
            if (highlight.length != 0) {
                logDebug(`highlight - (${highlight})`);
                highlight = [];
            }
            help_X = mouseX
            help_Y = mouseY
            help_Xm = mouseX
            help_Ym = mouseY
            //logDebug(`onMouseDown - ${selectionStartX}, ${selectionStartY}, ${selectionEndX}, ${selectionEndY}`);
            for (let i = objects.length - 1; i >= 0; i--) {
                const obj = objects[i];
                if (obj.type === "table") {
                    const table = obj as ComplexShape;
                    if (
                        mouseX >= table.x_C &&
                        mouseX <= table.x_C + table.width &&
                        mouseY >= table.y_C &&
                        mouseY <= table.y_C + table.height
                    ) {

                        if (!table.parts.some(part => selectedObjectMass.some(sel => sel.id === part.id))) {
                            selectedObjectMass = [];
                        }
                        if (!selectedObjectMass.some(object => object.id === table.id)) {
                            for (let i = objects.length - 1; i >= 0; i--) {
                                objects[i].selectionMarker = false;
                                if (objects[i].type === "table") {
                                    (objects[i] as ComplexShape).parts.forEach(part => part.selectionMarker = false);
                                }
                            }
                        }
                        console.log(`Выбрана таблица ${table.id}`);
                        foundObject = true;
                        table.selectionMarker = true;
                        if (selectedObjectMass.length == 0) { // предохраняет от лишних пушей в som
                            table.parts.forEach(part => {
                                part.selectionMarker = true;
                                selectedObjectMass.push(part);
                            });
                            selectedObjectMass.push(table)
                        }
                        selectedObject = table;
                        selectedObject_buf = table;

                        startX = mouseX - table.x_C;
                        startY = mouseY - table.y_C;
                        drawObjects();
                    }
                } else if (obj.type === 'rectangle') {
                    const rect = obj as Rectangle;
                    if (/*mouseX >= rect.x_C && mouseX <= rect.x_C + rect.width && mouseY >= rect.y_C && mouseY <= rect.y_C + rect.height*/isPointInRotatedRect(mouseX, mouseY, rect)) {
                        foundObject = clickedObjectPreprocessing(objects, obj, mouseX, mouseY, foundObject);
                        break;
                    }
                } else if (obj.type === 'circle') {
                    const circle = obj as Circle;
                    const dx = mouseX - circle.x_C;
                    const dy = mouseY - circle.y_C;
                    if (dx * dx + dy * dy <= circle.radius * circle.radius) {
                        foundObject = clickedObjectPreprocessing(objects, obj, mouseX, mouseY, foundObject);
                        break;
                    }
                } else if (obj.type === 'line') {
                    const line = obj as Line;
                    //if (!mouseLineCheck(mouseX, mouseY, line)) continue;
                    //const distStart = Math.sqrt((mouseX - line.startX) ** 2 + (mouseY - line.startY) ** 2);
                    //const distEnd = Math.sqrt((mouseX - line.endX) ** 2 + (mouseY - line.endY) ** 2);

                    //const distToLine = Math.abs((line.endY - line.startY) * mouseX - (line.endX - line.startX) * mouseY + line.endX * line.startY - line.endY * line.startX) /
                    //    Math.sqrt((line.endY - line.startY) ** 2 + (line.endX - line.startX) ** 2);

                    const dx = line.endX - line.startX;
                    const dy = line.endY - line.startY;
                    const length = Math.sqrt(dx * dx + dy * dy) || 1;

                    const distStart = Math.hypot(mouseX - line.startX, mouseY - line.startY);
                    const distEnd = Math.hypot(mouseX - line.endX, mouseY - line.endY);
                    //const distToLine = Math.abs(dy * mouseX - dx * mouseY + line.endX * line.startY - line.endY * line.startX) / length;

                    const distToLine = distancePointToSegment(mouseX, mouseY, line.startX, line.startY, line.endX, line.endY);

                    console.log("leftbuttondown check - obj, mX, mY, sob", objects, mouseX, mouseY, selectedObject_buf);
                    console.log("leftbuttondown check c - distStart, distEnd, distToLine", distStart, distEnd, distToLine);
                    if (distStart < 5 || distEnd < 5 || distToLine < 5) {
                        if (!selectedObjectMass.some(object => object.id === obj.id)) {
                            for (let i = objects.length - 1; i >= 0; i--) {
                                objects[i].selectionMarker = false;
                            }
                        }
                        foundObject = true;
                        line.selectionMarker = true;
                        selectedObject = line;
                        selectedObject_buf = line;
                        logDebug(`Selected line: ${JSON.stringify(line)}`);
                        selectedObject_buf_connect = selectionCheck(selectedObject_buf_connect, selectedObject_buf, connectionServ);
                        connectionServ = 2;
                        tableObjectCheck(selectedObject_buf);
                        if (distStart < 5) {
                            selectedLineStart = true;
                            startX = mouseX - line.startX;
                            startY = mouseY - line.startY;
                            logDebug(`Line start point selected`);
                        } else if (distEnd < 5) {
                            selectedLineEnd = true;
                            startX = mouseX - line.endX;
                            startY = mouseY - line.endY;
                            logDebug(`Line end point selected`);
                        } else if (distToLine < 10) {
                            selectedLineMid = true;
                            startX = mouseX - line.x_C;
                            startY = mouseY - line.y_C;
                            logDebug(`Line body selected`);
                        }
                        break;
                    }
                } else if (obj.type === 'star') {
                    const star = obj as Star;
                    const points = [];
                    for (let i = 0; i < 2 * star.amount_points; i++) {
                        let angle = Math.PI * i / star.amount_points;
                        let radius = i % 2 === 0 ? star.rad : star.rad * star.m;
                        let x = star.x_C + radius * Math.sin(angle);
                        let y = star.y_C + radius * Math.cos(angle);
                        points.push({ x, y });
                    }
                    if (pointInPolygon(mouseX, mouseY, points)) {
                        foundObject = clickedObjectPreprocessing(objects, obj, mouseX, mouseY, foundObject);
                    }

                } else if (obj.type === 'cloud') {
                    const cloud = obj as Cloud;
                    let startX_Cloud = cloud.x_C - cloud.width / 2;
                    let startY_Cloud = cloud.y_C - cloud.height / 2;
                    if (mouseX >= startX_Cloud && mouseX <= startX_Cloud + cloud.width && mouseY >= startY_Cloud && mouseY <= startY_Cloud + cloud.height) {
                        foundObject = clickedObjectPreprocessing(objects, obj, mouseX, mouseY, foundObject);
                    }
                }
            }


            if (foundObject === false) {
                const infoPanel = document.getElementById("infoPanel");
                if (infoPanel) {
                    infoPanel.innerHTML = "";
                }
                selectedObject = null;
                selectedObject_buf = null;
                for (let i = objects.length - 1; i >= 0; i--) {
                    objects[i].selectionMarker = false;
                    if (objects[i].type === 'table') {
                        (objects[i] as ComplexShape).parts.forEach(part => part.selectionMarker = false);
                    }
                }
                selectedObjectMass = [];
                isSelecting = true;
                selectionStartX = e.clientX - canvas.offsetLeft;
                selectionStartY = e.clientY - canvas.offsetTop;
                selectionEndX = e.clientX - canvas.offsetLeft;
                selectionEndY = e.clientY - canvas.offsetTop;
                //console.log("now is selecting");
            } else { // если клик был сделан по объекту не яляющимся частью группы выделенных, то чистим группу выделенных (не считая таблицы)
                if (selectedObjectMass.length > 0 && !selectedObjectMass.some(selObj => selObj.id === selectedObject_buf.id) && selectedObject_buf.type !== 'table') {
                    selectedObjectMass = [];
                    for (let i = objects.length - 1; i >= 0; i--) {
                        if (objects[i].type === 'table') {
                            objects[i].selectionMarker = false;
                            (objects[i] as ComplexShape).parts.forEach(part => part.selectionMarker = false);
                        }
                    }
                }
                if (selectedObjectMass.length > 0 && selectedObjectMass.every(selObj =>
                        objects.some(obj =>
                            obj.type === 'table' &&
                            (obj as ComplexShape).parts.includes(selObj)
                        )
                    )
                ) {
                    objects.forEach(obj => {
                        if (obj.type !== 'table' || !selectedObjectMass.every(sel => (obj as ComplexShape).parts.includes(sel))) {
                            obj.selectionMarker = false;
                        }
                    });
                }
                console.log("foundO true")

            }
            drawObjects();
            if (selectedObject_buf && selectedObject_buf.connectors) {
                activeConnector = selectedObject_buf.connectors.find(connector => {
                    return (
                        mouseX >= connector.x - 5 &&
                        mouseX <= connector.x + 5 &&
                        mouseY >= connector.y - 5 &&
                        mouseY <= connector.y + 5
                    );
                });
            }
            //console.log("status check - ", foundObject, selectedObject, )
        }
        function rigtButtonDown(e: MouseEvent, mouseX: number, mouseY: number) {
            //e.preventDefault();
            for (let i = objects.length - 1; i >= 0; i--) {
                const obj = objects[i];
                if (obj.type === "table") {
                    const table = obj as ComplexShape;
                    if (
                        mouseX >= table.x_C &&
                        mouseX <= table.x_C + table.width &&
                        mouseY >= table.y_C &&
                        mouseY <= table.y_C + table.height
                    ) {
                        selectedObject_buf = table;
                        startX = mouseX - table.x_C;
                        startY = mouseY - table.y_C;
                        drawObjects();
                        showContextMenu(e.clientX, e.clientY);
                    }
                } else if (obj.type === 'rectangle') {
                    const rect = obj as Rectangle;
                    if (/*mouseX >= rect.x_C && mouseX <= rect.x_C + rect.width && mouseY >= rect.y_C && mouseY <= rect.y_C + rect.height*/isPointInRotatedRect(mouseX, mouseY, rect)) {
                        selectedObject_buf = rect;
                        startX = mouseX - rect.x_C;
                        startY = mouseY - rect.y_C;
                        drawObjects();
                        showContextMenu(e.clientX, e.clientY);
                        logDebug(`Selected rectangle: ${JSON.stringify(rect)}`);
                        break;
                    }
                } else if (obj.type === 'circle') {
                    const circle = obj as Circle;
                    const dx = mouseX - circle.x_C;
                    const dy = mouseY - circle.y_C;
                    if (dx * dx + dy * dy <= circle.radius * circle.radius) {
                        selectedObject_buf = circle;
                        startX = dx;
                        startY = dy;
                        drawObjects();
                        showContextMenu(e.clientX, e.clientY);
                        logDebug(`Selected circle: ${JSON.stringify(circle)}`);
                        break;
                    }
                } else if (obj.type === 'line') {
                    const line = obj as Line;
                    // Simplified line hit detection for example purposes
                    const distStart = Math.sqrt((mouseX - line.startX) ** 2 + (mouseY - line.startY) ** 2);
                    const distEnd = Math.sqrt((mouseX - line.endX) ** 2 + (mouseY - line.endY) ** 2);

                    const distToLine = Math.abs((line.endY - line.startY) * mouseX - (line.endX - line.startX) * mouseY + line.endX * line.startY - line.endY * line.startX) /
                        Math.sqrt((line.endY - line.startY) ** 2 + (line.endX - line.startX) ** 2);


                    if (distStart < 5 || distEnd < 5 || distToLine < 10) {
                        selectedObject = line;
                        selectedObject_buf = line;
                        startX = mouseX;
                        startY = mouseY;
                        drawObjects();
                        showContextMenu(e.clientX, e.clientY);
                        logDebug(`Selected line: ${JSON.stringify(line)}`);
                        break;
                    }

                } else if (obj.type === 'star') {
                    const star = obj as Star;
                    const points = [];
                    for (let i = 0; i < 2 * star.amount_points; i++) {
                        let angle = Math.PI * i / star.amount_points;
                        let radius = i % 2 === 0 ? star.rad : star.rad * star.m;
                        let x = star.x_C + radius * Math.sin(angle);
                        let y = star.y_C + radius * Math.cos(angle);
                        points.push({ x, y });
                    }
                    if (pointInPolygon(mouseX, mouseY, points)) {
                        selectedObject_buf = star;
                        startX = mouseX - star.x_C;
                        startY = mouseY - star.y_C;
                        drawObjects();
                        showContextMenu(e.clientX, e.clientY);
                        logDebug(`Selected star: ${JSON.stringify(star)}`);
                        break;
                    }

                } else if (obj.type === 'cloud') {
                    const cloud = obj as Cloud;
                    let startX_Cloud = cloud.x_C - cloud.width / 2;
                    let startY_Cloud = cloud.y_C - cloud.height / 2;
                    if (mouseX >= startX_Cloud && mouseX <= startX_Cloud + cloud.width && mouseY >= startY_Cloud && mouseY <= startY_Cloud + cloud.height) {
                        selectedObject_buf = cloud;
                        startX_Cloud = mouseX - cloud.x_C;
                        startY_Cloud = mouseY - cloud.y_C;
                        drawObjects();
                        showContextMenu(e.clientX, e.clientY);
                        logDebug(`Selected cloud: ${JSON.stringify(cloud)}`);
                        break;
                    }

                }
            }
        }
        function scrollingButtonDown(e: MouseEvent, mouseX: number, mouseY: number) {
            hideContextMenu();
            e.preventDefault();
            //startX = e.offsetX;
            //startY = e.offsetY;


            const rect = canvas.getBoundingClientRect();
            startX = e.clientX - rect.left;
            startY = e.clientY - rect.top;


            if (e.button === 1) {
                isPanning = true;
                panStartX = e.clientX;
                panStartY = e.clientY;
                canvas.style.cursor = 'move';
                return;
            }
            selectedObject_canv = objects.find(obj => {
                switch (obj.type) {
                    case 'rectangle':
                        const rect = obj as Rectangle;
                        return startX >= rect.x_C && startX <= rect.x_C + rect.width && startY >= rect.y_C && startY <= rect.y_C + rect.height;
                    case 'circle':
                        const circle = obj as Circle;
                        const dx = startX - circle.x_C;
                        const dy = startY - circle.y_C;
                        return dx * dx + dy * dy <= circle.radius * circle.radius;
                    case 'line':
                        const line = obj as Line;
                        const length = Math.sqrt((line.endX - line.startX) ** 2 + (line.endY - line.startY) ** 2);
                        const dotProduct = ((startX - line.startX) * (line.endX - line.startX) + (startY - line.startY) * (line.endY - line.startY)) / length ** 2;
                        const closestX = line.startX + dotProduct * (line.endX - line.startX);
                        const closestY = line.startY + dotProduct * (line.endY - line.startY);
                        const distX = startX - closestX;
                        const distY = startY - closestY;
                        const distance = Math.sqrt(distX * distX + distY * distY);
                        return distance <= 10;
                    case 'star':
                        const star = obj as Star;
                        const points = [];
                        for (let i = 0; i < 2 * star.amount_points; i++) {
                            let angle = Math.PI * i / star.amount_points;
                            let radius = i % 2 === 0 ? star.rad : star.rad * star.m;
                            let x = star.x_C + radius * Math.sin(angle);
                            let y = star.y_C + radius * Math.cos(angle);
                            points.push({ x, y });
                        }
                        return pointInPolygon(mouseX, mouseY, points);
                    case 'cloud':
                        const cloud = obj as Cloud;
                        let startX_Cloud = cloud.x_C - cloud.width / 2;
                        let startY_Cloud = cloud.y_C - cloud.height / 2;
                        return startX >= startX_Cloud && startX <= startX_Cloud + cloud.width && startY >= startY_Cloud && startY <= startY_Cloud + cloud.height;
                    default:
                        return false;
                }
            }) || null;
            drawObjects();
        }
        function selectionBoxObjects(x_s: number, y_s: number, w_e: number, h_e: number) {
            // Очищаем массив выбранных объектов перед каждой новой проверкой
            selectedObject = null;
            selectedObject_buf = null;
            for (let i = objects.length - 1; i >= 0; i--) {
                objects[i].selectionMarker = false;
                if (objects[i].type === "table") {
                    (objects[i] as ComplexShape).parts.forEach(part => part.selectionMarker = false);
                }
            }
            selectedObjectMass = [];

            // Координаты прямоугольника выделения
            const selectionBoxX1 = Math.min(x_s, w_e);
            const selectionBoxY1 = Math.min(y_s, h_e);
            const selectionBoxX2 = Math.max(x_s, w_e);
            const selectionBoxY2 = Math.max(y_s, h_e);

            // Проходим по всем объектам и проверяем их на пересечение с полем выделения
            for (const obj of objects) {
                // Координаты объекта
                const objX1 = obj.borderPoints_X1 + offsetX;
                const objY1 = obj.borderPoints_Y1 + offsetY;
                const objX2 = obj.borderPoints_X2 + offsetX;
                const objY2 = obj.borderPoints_Y2 + offsetY;

                // Проверяем, пересекаются ли прямоугольники (поле выделения и объект)
                if (
                    objX2 >= selectionBoxX1 &&
                    objX1 <= selectionBoxX2 &&
                    objY2 >= selectionBoxY1 &&
                    objY1 <= selectionBoxY2
                ) {
                    // Если объект попадает в поле выделения, добавляем его в массив выбранных объектов
                    obj.selectionMarker = true;
                    selectedObjectMass.push(obj);

                    if (obj.type === "table") {
                        const table = obj as ComplexShape;
                        table.parts.forEach(part => {
                            part.selectionMarker = true;
                            selectedObjectMass.push(part);
                        });
                    }
                }
            }
            //console.log("result selOM - ", selectedObjectMass);
        }

        // Функция для отрисовки рамки выделения
        function drawSelectionBox() {/////////////////////////////
            const rect = canvas.getBoundingClientRect();
            logDebug("drawSelectionBox");
            ctx.setLineDash([5, 3]);  // Делаем линию пунктирной
            ctx.strokeStyle = 'rgba(0, 120, 255, 0.7)';
            ctx.lineWidth = 2;

            let x = Math.min(selectionStartX, selectionEndX) - rect.left;
            let y = Math.min(selectionStartY, selectionEndY) - rect.top;
            let w = Math.abs(selectionEndX - selectionStartX);
            let h = Math.abs(selectionEndY - selectionStartY);

            ctx.strokeRect(x, y, w, h);
            ctx.setLineDash([]);

            // Пересчет выделенных объектов
            selectionBoxObjects(
                selectionStartX - rect.left,
                selectionStartY - rect.top,
                selectionEndX - rect.left,
                selectionEndY - rect.top
            );
        }
        function onMouseDown(e: MouseEvent) {
            //logDebug(`(${objects})`);
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left - offsetX;
            const mouseY = e.clientY - rect.top - offsetY;

            const mouse_meaning = e.button;
            if (mouse_meaning === 1) {
                mouse_meaning_check = 1;
            }
            //logDebug(`Mouse down at (${mouseX}, ${mouseY}, ${mouse_meaning})`);
            if (mouse_meaning === 0 && mouse_meaning_check != 1) {
                leftButtonDown(e, mouseX, mouseY);
            } else if (mouse_meaning == 2 /*&& selectedObject_buf != null*/ && mouse_meaning_check != 1) { // тут селект объект равен нулю
                rigtButtonDown(e, mouseX, mouseY);
            } else if (mouse_meaning_check === 1) {
                scrollingButtonDown(e, mouseX, mouseY);
            }
        }

        function isLineEndpointNearConnector_Start(line: Line, connectors: { id: string, x: number, y: number }[], threshold: number = 5) {
            const calculateDistance = (x1: number, y1: number, x2: number, y2: number): number =>
                Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);

            let previousConnection = line.lineConnectionStart?.[0]; // Сохраняем предыдущее соединение
            let isConnected = false;

            for (const connector of connectors) {
                if (calculateDistance(line.startX, line.startY, connector.x, connector.y) <= threshold) {
                    isConnected = true;
                    line.startX = connector.x;
                    line.startY = connector.y;

                    for (const obj of objects) {
                        if (obj.id !== line.id && obj.connectors?.some(conn => conn.id === connector.id)) {
                            obj.lineConnectionStart = obj.lineConnectionStart || [];
                            line.lineConnectionStart = line.lineConnectionStart || [];

                            // Удаляем старое соединение, если линия была прикреплена к другому объекту
                            if (previousConnection && previousConnection.id_con !== connector.id) {
                                const previousObj = objects.find(o => o.id === previousConnection.id_shape);
                                if (previousObj) {
                                    previousObj.lineConnectionStart = previousObj.lineConnectionStart?.filter(entry => entry.id_shape !== line.id) || [];
                                }
                                line.lineConnectionStart = [];
                            }

                            if (!obj.lineConnectionStart.find(entry => entry.id_shape === line.id)) {
                                obj.lineConnectionStart.push({ id_con: connector.id, id_shape: line.id });
                            }
                            if (!line.lineConnectionStart.find(entry => entry.id_con === connector.id)) {
                                line.lineConnectionStart.push({ id_con: connector.id, id_shape: obj.id });
                            }

                            console.log(`Линия ${line.id} соединена с объектом ${obj.id} в точке ${connector.id}`);
                            break;
                        }
                    }
                }
            }

            // Если линия была привязана, но теперь не находится рядом с коннектором - удаляем связь
            if (!isConnected && previousConnection) {
                console.log(`Линия ${line.id} отключена от объекта ${previousConnection.id_shape}`);
                const previousObj = objects.find(o => o.id === previousConnection.id_shape);
                if (previousObj) {
                    previousObj.lineConnectionStart = previousObj.lineConnectionStart?.filter(entry => entry.id_shape !== line.id) || [];
                }
                line.lineConnectionStart = [];
            }
        }

        function isLineEndpointNearConnector_End(line: Line, connectors: { id: string, x: number, y: number }[], threshold: number = 5) {
            const calculateDistance = (x1: number, y1: number, x2: number, y2: number): number =>
                Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);

            let previousConnection = line.lineConnectionEnd?.[0]; // Сохраняем предыдущее соединение
            let isConnected = false;

            for (const connector of connectors) {
                if (calculateDistance(line.endX, line.endY, connector.x, connector.y) <= threshold) {
                    isConnected = true;
                    line.endX = connector.x;
                    line.endY = connector.y;

                    for (const obj of objects) {
                        if (obj.id !== line.id && obj.connectors?.some(conn => conn.id === connector.id)) {
                            obj.lineConnectionEnd = obj.lineConnectionEnd || [];
                            line.lineConnectionEnd = line.lineConnectionEnd || [];

                            // Удаляем старое соединение, если линия была прикреплена к другому объекту
                            if (previousConnection && previousConnection.id_con !== connector.id) {
                                const previousObj = objects.find(o => o.id === previousConnection.id_shape);
                                if (previousObj) {
                                    previousObj.lineConnectionEnd = previousObj.lineConnectionEnd?.filter(entry => entry.id_shape !== line.id) || [];
                                }
                                line.lineConnectionEnd = [];
                            }

                            if (!obj.lineConnectionEnd.find(entry => entry.id_shape === line.id)) {
                                obj.lineConnectionEnd.push({ id_con: connector.id, id_shape: line.id });
                            }
                            if (!line.lineConnectionEnd.find(entry => entry.id_con === connector.id)) {
                                line.lineConnectionEnd.push({ id_con: connector.id, id_shape: obj.id });
                            }

                            console.log(`Линия ${line.id} соединена с объектом ${obj.id} в точке ${connector.id}`);
                            break;
                        }
                    }
                }
            }

            // Если линия была привязана, но теперь не находится рядом с коннектором - удаляем связь
            if (!isConnected && previousConnection) {
                console.log(`Линия ${line.id} отключена от объекта ${previousConnection.id_shape}`);
                const previousObj = objects.find(o => o.id === previousConnection.id_shape);
                if (previousObj) {
                    previousObj.lineConnectionEnd = previousObj.lineConnectionEnd?.filter(entry => entry.id_shape !== line.id) || [];
                }
                line.lineConnectionEnd = [];
            }
        }

        function removeConnectionOnLineMove(line: Line, connectors: { id: string, x: number, y: number }[], threshold: number = 10) {
            // Проверяем, есть ли у линии связи
            if ((!line.lineConnectionStart || line.lineConnectionStart.length === 0) &&
                (!line.lineConnectionEnd || line.lineConnectionEnd.length === 0)) {
                return; // Если связи нет, ничего не делаем
            }

            for (const connector of connectors) {
                // Определяем минимальное расстояние от коннектора до самой линии
                const distanceToLine = pointToSegmentDistance(connector.x, connector.y, line.startX, line.startY, line.endX, line.endY);

                // Если расстояние больше threshold, удаляем связь
                if (distanceToLine > threshold) {
                    console.log(`Удаляем связь между линией ${line.id} и коннектором ${connector.id}`);

                    // Удаляем связь из объекта
                    for (const obj of objects) {
                        if (obj.lineConnectionStart) {
                            obj.lineConnectionStart = obj.lineConnectionStart.filter(entry => entry.id_shape !== line.id);
                        }
                        if (obj.lineConnectionEnd) {
                            obj.lineConnectionEnd = obj.lineConnectionEnd.filter(entry => entry.id_shape !== line.id);
                        }
                    }

                    // Удаляем связь из самой линии
                    line.lineConnectionStart = line.lineConnectionStart?.filter(entry => entry.id_con !== connector.id) || [];
                    line.lineConnectionEnd = line.lineConnectionEnd?.filter(entry => entry.id_con !== connector.id) || [];
                }
            }
        }

        function pointToSegmentDistance(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number): number {
            const A = x0 - x1;
            const B = y0 - y1;
            const C = x2 - x1;
            const D = y2 - y1;

            const dot = A * C + B * D;
            const len_sq = C * C + D * D;
            let param = -1;

            if (len_sq !== 0) { // во избежание деления на ноль
                param = dot / len_sq;
            }

            let xx, yy;

            if (param < 0) {
                xx = x1;
                yy = y1;
            } else if (param > 1) {
                xx = x2;
                yy = y2;
            } else {
                xx = x1 + param * C;
                yy = y1 + param * D;
            }

            const dx = x0 - xx;
            const dy = y0 - yy;
            return Math.sqrt(dx * dx + dy * dy);
        }

        function rectMoving(rect: Rectangle, mouseX: number, mouseY: number) {
            if (activeConnector) {
                switch (activeConnector.type) {
                    case 'left':
                        // Изменяем ширину и смещаем объект, если двигаем левый коннектор
                        const deltaXLeft = rect.x_C - mouseX;
                        rect.width += deltaXLeft;
                        rect.x_C = mouseX;  // Двигаем левый край фигуры

                        // Если ширина стала отрицательной, меняем направление (делаем фигуру перевёрнутой)
                        if (rect.width <= 0) {
                            rect.x_C += rect.width;
                            rect.width = Math.abs(rect.width);
                            activeConnector.type = 'right';  // Меняем тип активного коннектора
                        }
                        break;
                    case 'right':
                        const deltaXRight = mouseX - rect.x_C;
                        rect.width = deltaXRight;
                        if (rect.width <= 0) {
                            rect.x_C += rect.width;
                            rect.width = Math.abs(rect.width);
                            activeConnector.type = 'left';
                        }
                        break;
                    case 'top':
                        const deltaYTop = rect.y_C - mouseY;
                        rect.height += deltaYTop;
                        rect.y_C = mouseY;
                        if (rect.height <= 0) {
                            rect.y_C += rect.height;
                            rect.height = Math.abs(rect.height);
                            activeConnector.type = 'bottom';
                        }
                        break;
                    case 'bottom':

                        const deltaYBottom = mouseY - rect.y_C;
                        rect.height = deltaYBottom;

                        if (rect.height <= 0) {
                            rect.y_C += rect.height;
                            rect.height = Math.abs(rect.height);
                            activeConnector.type = 'top';
                        }
                        break;
                }
                updateConnectors(rect);
                drawObjects();
            } else {
                rect.x_C = mouseX - startX;
                rect.y_C = mouseY - startY;
            }
            updateLineConnectorConnection(rect)
        }
        function updateLineConnectorConnection(obj_: Shape) {
            for (const connector of obj_.connectors) {
                // Перемещаем линии, связанные с коннектором
                for (const line of objects.filter(obj => obj.type === 'line') as Line[]) {
                    if (obj_.lineConnectionStart?.some(entry => entry.id_con === connector.id && entry.id_shape === line.id)) {
                        line.startX = connector.x;
                        line.startY = connector.y;
                    }
                    if (obj_.lineConnectionEnd?.some(entry => entry.id_con === connector.id && entry.id_shape === line.id)) {
                        line.endX = connector.x;
                        line.endY = connector.y;
                    }
                }
            }
        }


        function leftButtonMove(selectedObject: Shape, mouseX: number, mouseY: number) {
            //console.log("selec - ", selectedObjectMass)
            if (selectedObjectMass.length > 0) {

                //console.log("mx - ", mouseX, "my - ", mouseY, "sx - sy --", help_X, help_Y)
                const dx = mouseX - help_X;
                const dy = mouseY - help_Y;

                let helper = false
                //console.log(helper)
                //if (selectedObject_buf.type === 'table') { // если перемещаем только таблицу
                    //selectedObject_buf.x_C += dx;
                    //selectedObject_buf.y_C += dy;
                    //console.log("table x-y", selectedObject_buf.x_C, selectedObject_buf.y_C);
                    //helper = true;
                //}
                console.log(helper)
                for (const obj of selectedObjectMass) {
                    switch (obj.type) {
                        case 'table':
                            //if (!helper) { // а если не только таблицу
                            (obj as ComplexShape).x_C += dx;
                            (obj as ComplexShape).y_C += dy;
                            //}
                            //console.log("table x-y selOM", (obj as ComplexShape).x_C, (obj as ComplexShape).y_C);
                            break;
                        case 'rectangle':
                            (obj as Rectangle).x_C += dx;
                            (obj as Rectangle).y_C += dy;
                            updateConnectors(obj as Rectangle);
                            break;
                        case 'circle':
                            (obj as Circle).x_C += dx;
                            (obj as Circle).y_C += dy;
                            break;
                        case 'line':
                            (obj as Line).startX += dx;
                            (obj as Line).startY += dy;
                            (obj as Line).endX += dx;
                            (obj as Line).endY += dy;
                            break;
                        case 'star':
                            (obj as Star).x_C += dx;
                            (obj as Star).y_C += dy;
                            break;
                        case 'cloud':
                            (obj as Cloud).x_C += dx;
                            (obj as Cloud).y_C += dy;
                            break;
                    }
                }

                objects.forEach(obj => {
                    if (obj.type === "table") {
                        //console.log("there - ", (obj as ComplexShape).x_C, (obj as ComplexShape).y_C)
                    }
                })


                console.log()

                // Обновляем стартовые координаты
                help_X = mouseX
                help_Y = mouseY

                drawObjects();
                return;
            }


            if (selectedObject.type === 'rectangle') {
                const rect = selectedObject as Rectangle;
                rectMoving(rect, mouseX, mouseY)
            } else if (selectedObject.type === 'circle') {
                const circle = selectedObject as Circle;
                circle.x_C = mouseX - startX;
                circle.y_C = mouseY - startY;
                updateLineConnectorConnection(circle)
            } else if (selectedObject.type === 'line') {
                const line = selectedObject as Line;
                const dx = mouseX - startX;
                const dy = mouseY - startY;

                const dxm = mouseX - help_Xm;
                const dym = mouseY - help_Ym;

                if (selectedLineStart) {
                    line.startX = dx;
                    line.startY = dy;
                    isLineEndpointNearConnector_Start(line, allConnectors);
                } else if (selectedLineEnd) {
                    line.endX = dx;
                    line.endY = dy;
                    isLineEndpointNearConnector_End(line, allConnectors);
                } else if (selectedLineMid) {
                    line.startX += dxm;
                    line.startY += dym;
                    line.endX += dxm;
                    line.endY += dym;
                    removeConnectionOnLineMove(line, allConnectors);
                }

                // Обновление центра линии
                line.x_C = (line.startX + line.endX) / 2;
                line.y_C = (line.startY + line.endY) / 2;

                help_Xm = mouseX
                help_Ym = mouseY

            } else if (selectedObject.type === 'star') {
                const star = selectedObject as Star;

                star.x_C = mouseX - startX;
                star.y_C = mouseY - startY;
                updateLineConnectorConnection(star)
            } else if (selectedObject.type === 'cloud') {
                const cloud = selectedObject as Cloud;
                cloud.x_C = mouseX - startX;
                cloud.y_C = mouseY - startY;
                updateLineConnectorConnection(cloud)
            } else if (selectedObject.type === 'table') {
                const table = selectedObject as ComplexShape;
                table.x_C = mouseX - startX;
                table.y_C = mouseY - startY;
            }
            drawObjects();
        }
        function scrollingButtonMove(e: MouseEvent) {
            e.preventDefault();
            if (isPanning) {
                const dx = e.clientX - panStartX;
                const dy = e.clientY - panStartY;
                offsetX += dx;
                offsetY += dy;
                panStartX = e.clientX;
                panStartY = e.clientY;
                drawObjects();
                return;
            }

            if (selectedObject_canv && (e.buttons & 1) === 1) {
                const dx = e.offsetX - startX;
                const dy = e.offsetY - startY;
                switch (selectedObject_canv.type) {
                    case 'rectangle':
                        const rect = selectedObject_canv as Rectangle;
                        rect.x_C += dx;
                        rect.y_C += dy;
                        break;
                    case 'circle':
                        const circle = selectedObject_canv as Circle;
                        circle.x_C += dx;
                        circle.y_C += dy;
                        break;
                    case 'line':
                        const line = selectedObject_canv as Line;
                        line.startX += dx;
                        line.startY += dy;
                        line.endX += dx;
                        line.endY += dy;
                        break;
                    case 'cloud':
                        const cloud = selectedObject_canv as Cloud;
                        cloud.x_C += dx;
                        cloud.y_C += dy;
                        break;
                    case 'star':
                        const star = selectedObject_canv as Star;
                        star.x_C += dx;
                        star.y_C += dy;
                        break;
                }
                startX = e.offsetX;
                startY = e.offsetY;
                drawObjects();
            }
        }
        function onMouseMove(e: MouseEvent) {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left - offsetX;
            const mouseY = e.clientY - rect.top - offsetY;

            const mouse_meaning = e.button;

            if (isSelecting) {
                selectionEndX = e.clientX - canvas.offsetLeft;
                selectionEndY = e.clientY - canvas.offsetTop;
                drawObjects();
                drawSelectionBox();  // Рисуем текущую рамку выделения
            }

            if (selectedObject && (mouse_meaning === 0) && mouse_meaning_check != 1) {
                leftButtonMove(selectedObject, mouseX, mouseY);
            } else if (mouse_meaning_check === 1) {
                scrollingButtonMove(e);
            }
        }
        function onMouseUp(e: MouseEvent) {
            let mouse_meaning = e.button;
            if (isSelecting) {
                isSelecting = false;
                selectionStartX = 0;
                selectionStartY = 0;
                selectionEndX = 0;
                selectionEndY = 0;
            }
            selectedLineStart = false;
            selectedLineEnd = false;
            selectedLineMid = false;
            if (selectedObject && (mouse_meaning == 0) && mouse_meaning_check != 1) {
                tableObjectCheck(selectedObject_buf);
            } else if (mouse_meaning == 0 && mouse_meaning_check != 1) {
                logDebug("Mouse up, no object selected");
                selectedObject_buf = null;
                drawObjects();
            } else if (mouse_meaning_check === 1) {
                logDebug(`Button unpressed id - 1`);
                e.preventDefault();
                if (isPanning && mouse_meaning === 1) {
                    isPanning = false;
                    canvas.style.cursor = 'default';
                }
                selectedObject_canv = null;
                mouse_meaning_check = 0;
            }
            activeConnector = null;
            selectedObject = null;
            selectedLineEnd = null;
            console.log(selectedObjectMass)
        }
        function downloadFile(filename: string, content: string) {
            const blob = new Blob([content], { type: 'text/plain' }); //Создание нового объекта Blob (Binary Large Object)
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob); //Создание временного URL для объекта blob
            link.download = filename;
            document.body.appendChild(link);
            link.click(); // Программное кликанье по ссылке
            document.body.removeChild(link); //Удаление ссылки из документа. Это делается для очистки DOM после скачивания файла, так как ссылка больше не нужна
        }

        document.getElementById('customJsonExport')?.addEventListener('click', function () {
            const size = { width: canvas.width, height: canvas.height };
            const shapes = JSON.stringify(objects, null, 2);
            const content = `Size:${JSON.stringify(size)}\nObjects:(${shapes.slice(1, -1)})`;

            downloadFile('shapes.txt', content);
        })

        //пробуем сделать с загрузкой на сервер
        document.getElementById('uploadCssBtn')?.addEventListener('click', function () {
            const fileInput = document.getElementById('cssFileInput') as HTMLInputElement;
            const file = fileInput?.files?.[0];

            if (file) {
                uploadCssFile(file);
            } else {
                logDebug("No file selected for upload");
            }
        });
        function uploadCssFile(file: File): void {
            const formData = new FormData(); // https://learn.javascript.ru/formdata
            formData.append('file', file);

            fetch('/api/upload/upload-css', { //upload это имя контроллера в program.cs
                method: 'POST',
                body: formData
            })
                .then(response => response.json())
                .then(data => {
                    logDebug(`File uploaded successfully: ${JSON.stringify(data)}`);
                    applyCssFile(data.filePath);
                })
                .catch(error => {
                    console.error('Error uploading file:', error);
                    logDebug(`Error uploading file: ${error}`);
                });
        }
        function applyCssFile(filePath: string): void {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.type = 'text/css';
            //link.href = filePath;
            link.href = "https://localhost:7172/BlazorWebAppAutoRendering.styles.css";
            document.getElementsByTagName('head')[0].appendChild(link);
        }
        //пробуем сделать с локальным хранилищем
        function applyCssFromLocalStorage(): void {
            logDebug("entering into applyCssFromLocalStorage");
            const cssContent = localStorage.getItem('uploadedCss2');
            if (cssContent) {
                logDebug(`Mouse move at (${cssContent}`);
                const style = document.createElement('style');
                style.textContent = cssContent;
                document.head.appendChild(style);
            } else {
                console.error('No CSS found in local storage');
            }
        }

        document.getElementById('uploadCssBtn2')?.addEventListener('click', function () {
            const fileInput = document.getElementById('cssFileInput2') as HTMLInputElement;
            const file = fileInput?.files?.[0];

            if (file) {
                applyCssFromLocalStorage();
            } else {
                logDebug("No file selected for upload");
            }
        });

        document.getElementById('cssFileInput2')?.addEventListener('change', function (event) {
            const input = event.target as HTMLInputElement;
            if (input.files && input.files[0]) {
                const file = input.files[0];
                const reader = new FileReader();

                reader.onload = function (e) {
                    const content = e.target.result as string;
                    localStorage.setItem('uploadedCss2', content);
                    applyCssFromLocalStorage();
                };

                reader.readAsText(file);
            }
        });
        function processOWLFileContent(content: string) {
            try {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(content, "application/xml");

                const sizeElement = xmlDoc.getElementsByTagName('size')[0];
                const objectsElements = xmlDoc.getElementsByTagName('object');

                const size = {
                    width: parseInt(sizeElement?.getAttribute('width') || '0'),
                    height: parseInt(sizeElement?.getAttribute('height') || '0')
                };

                let objects_: Shape[];

                return objects_ = Array.from(objectsElements).map((elem) => {
                    const type = elem.getAttribute('type');
                    const id = elem.getAttribute('id') || generateUniqueId();

                    const baseProps: Shape = {
                        id,
                        type: type || 'unknown',
                        dialect: elem.getAttribute('dialect') || 'default',
                        rotation: parseFloat(elem.getAttribute('rotation') || '0'),
                        info: elem.getAttribute('info') || '',
                        color: elem.getAttribute('color') || '#000000',
                        colorAlpha: parseFloat(elem.getAttribute('colorAlpha') || '1'),
                        selectionMarker: elem.getAttribute('selectionMarker') === 'true',
                        isHighlighted: elem.getAttribute('isHighlighted') === 'true',
                        imageSrc: elem.getAttribute('imageSrc') || undefined,
                        image: undefined,
                        x_C: parseFloat(elem.getAttribute('x') || elem.getAttribute('x_C') || '0'),
                        y_C: parseFloat(elem.getAttribute('y') || elem.getAttribute('y_C') || '0'),
                        borderPoints_X1: parseFloat(elem.getAttribute('borderPoints_X1') || '0'),
                        borderPoints_Y1: parseFloat(elem.getAttribute('borderPoints_Y1') || '0'),
                        borderPoints_X2: parseFloat(elem.getAttribute('borderPoints_X2') || '0'),
                        borderPoints_Y2: parseFloat(elem.getAttribute('borderPoints_Y2') || '0'),
                        linkedObjects: (elem.getAttribute('linkedObjects') || '').split(',').filter(Boolean),
                        outgoingLinks: (elem.getAttribute('outgoingLinks') || '').split(',').filter(Boolean),
                        incomingLinks: (elem.getAttribute('incomingLinks') || '').split(',').filter(Boolean),
                        lineConnectionStart: [],
                        lineConnectionEnd: [],
                        connectors: []
                    };

                    const startEl = elem.getElementsByTagName('lineConnectionStart')[0];
                    if (startEl) {
                        baseProps.lineConnectionStart = Array.from(startEl.getElementsByTagName('connection')).map(conn => ({
                            id_con: conn.getAttribute('id_con') || '',
                            id_shape: conn.getAttribute('id_shape') || ''
                        }));
                    }

                    const endEl = elem.getElementsByTagName('lineConnectionEnd')[0];
                    if (endEl) {
                        baseProps.lineConnectionEnd = Array.from(endEl.getElementsByTagName('connection')).map(conn => ({
                            id_con: conn.getAttribute('id_con') || '',
                            id_shape: conn.getAttribute('id_shape') || ''
                        }));
                    }

                    const connectorsEl = elem.getElementsByTagName('connectors')[0];
                    if (connectorsEl) {
                        baseProps.connectors = Array.from(connectorsEl.getElementsByTagName('connector')).map(c => ({
                            id: c.getAttribute('id') || '',
                            x: parseFloat(c.getAttribute('x') || '0'),
                            y: parseFloat(c.getAttribute('y') || '0'),
                            type: c.getAttribute('type') || ''
                        }));
                    }

                    switch (type) {
                        case 'rectangle':
                            return {
                                ...baseProps,
                                width: parseFloat(elem.getAttribute('width') || '0'),
                                height: parseFloat(elem.getAttribute('height') || '0'),
                                border: elem.getAttribute('border') === 'true'
                            } as Rectangle;

                        case 'circle':
                            return {
                                ...baseProps,
                                radius: parseFloat(elem.getAttribute('radius') || '0')
                            } as Circle;

                        case 'line':
                            return {
                                ...baseProps,
                                startX: parseFloat(elem.getAttribute('startX') || '0'),
                                startY: parseFloat(elem.getAttribute('startY') || '0'),
                                endX: parseFloat(elem.getAttribute('endX') || '0'),
                                endY: parseFloat(elem.getAttribute('endY') || '0'),
                                lineWidth: parseFloat(elem.getAttribute('lineWidth') || '2'),
                                arrowDirection: elem.getAttribute('arrowDirection') || 'none',
                                punctuation: elem.getAttribute('punctuation') || '',
                                startArrowType: elem.getAttribute('startArrowType') as Line['startArrowType'],
                                endArrowType: elem.getAttribute('endArrowType') as Line['endArrowType']
                            } as Line;

                        case 'star':
                            return {
                                ...baseProps,
                                rad: parseFloat(elem.getAttribute('rad') || '0'),
                                amount_points: parseInt(elem.getAttribute('amount_points') || '5'),
                                m: parseFloat(elem.getAttribute('m') || '2')
                            } as Star;

                        case 'cloud':
                            return {
                                ...baseProps,
                                width: parseFloat(elem.getAttribute('width') || '0'),
                                height: parseFloat(elem.getAttribute('height') || '0')
                            } as Cloud;

                        case 'table': {
                            const parts: Rectangle[] = Array.from(elem.getElementsByTagName('cell')).map(cell => ({
                                ...baseProps,
                                id: generateUniqueId(),
                                type: 'rectangle',
                                x_C: parseFloat(cell.getAttribute('x') || '0'),
                                y_C: parseFloat(cell.getAttribute('y') || '0'),
                                width: parseFloat(cell.getAttribute('width') || '0'),
                                height: parseFloat(cell.getAttribute('height') || '0'),
                                color: cell.getAttribute('color') || '#999999',
                                info: cell.getAttribute('info') || '',
                                borderPoints_X1: 0,
                                borderPoints_Y1: 0,
                                borderPoints_X2: 0,
                                borderPoints_Y2: 0,
                                connectors: [],
                                border: cell.getAttribute('border') === 'true'
                            }));

                            return {
                                ...baseProps,
                                width: parseFloat(elem.getAttribute('width') || '0'),
                                height: parseFloat(elem.getAttribute('height') || '0'),
                                cols: parseInt(elem.getAttribute('cols') || '1'),
                                rows: parseInt(elem.getAttribute('rows') || '1'),
                                parts
                            } as ComplexShape;
                        }

                        default:
                            console.warn(`Unknown shape type: ${type}`);
                            return baseProps;
                    }
                });

                drawObjects();

            } catch (error) {
                console.error('Error processing OWL file content:', error);
            }
        }

        function convertObjectsToOWL(objects: Shape[]): string {
            const size = { width: canvas.width, height: canvas.height };
            const sizeXML = `<size width="${size.width}" height="${size.height}"/>`;

            const objectsXML = objects.map(obj => {
                const baseProps = `
                    id="${obj.id}" 
                    type="${obj.type}" 
                    color="${obj.color}" 
                    rotation="${obj.rotation || 0}" 
                    info="${obj.info || ''}"
                    linkedObjects="${obj.linkedObjects?.join(',') || ''}" 
                    outgoingLinks="${obj.outgoingLinks?.join(',') || ''}" 
                    incomingLinks="${obj.incomingLinks?.join(',') || ''}"
                    borderPoints_X1="${obj.borderPoints_X1}" borderPoints_Y1="${obj.borderPoints_Y1}" borderPoints_X2="${obj.borderPoints_X2}" borderPoints_Y2="${obj.borderPoints_Y2}"
                    selectionMarker="${obj.selectionMarker ?? false}" 
                    colorAlpha="${obj.colorAlpha ?? 1}" 
                    imageSrc="${obj.imageSrc || ''}"`.trim();

                switch (obj.type) {
                    case 'rectangle':
                        const rect = obj as Rectangle;
                        return `<object ${baseProps} x="${rect.x_C}" y="${rect.y_C}" width="${rect.width}" height="${rect.height}" border="${rect.border}"/>`;
                    case 'circle':
                        const circle = obj as Circle;
                        return `<object ${baseProps} x="${circle.x_C}" y="${circle.y_C}" radius="${circle.radius}"/>`;
                    case 'line':
                        const line = obj as Line;
                        return `<object ${baseProps} startX="${line.startX}" startY="${line.startY}" endX="${line.endX}" endY="${line.endY}" lineWidth="${line.lineWidth || 2}" startArrowType="${line.startArrowType || 'none'}" endArrowType="${line.endArrowType || 'none'}"/>`;
                    case 'star':
                        const star = obj as Star;
                        return `<object ${baseProps} x_C="${star.x_C}" y_C="${star.y_C}" rad="${star.rad}" amount_points="${star.amount_points}" m="${star.m}"/>`;
                    case 'cloud':
                        const cloud = obj as Cloud;
                        return `<object ${baseProps} x_C="${cloud.x_C}" y_C="${cloud.y_C}" width="${cloud.width}" height="${cloud.height}"/>`;
                    case 'table':
                        const table = obj as ComplexShape;
                        const partXML = table.parts.map((p, i) => {
                            const pr = p as Rectangle;
                            return `<cell index="${i}" x="${pr.x_C}" y="${pr.y_C}" width="${pr.width}" height="${pr.height}" info="${pr.info || ''}" color="${pr.color}" border="${pr.border}"/>`;
                        }).join('\n');
                        return `<object ${baseProps} x_C="${table.x_C}" y_C="${table.y_C}" width="${table.width}" height="${table.height}" cols="${table.cols}" rows="${table.rows}">\n${partXML}\n</object>`;
                    default:
                        throw new Error('Unknown object type');
                }
            }).join('\n');

            return `<diagram>\n${sizeXML}\n${objectsXML}\n</diagram>`;
        }

        document.getElementById('owlImport')?.addEventListener('change', function (event) {
            try {
                const input = event.target as HTMLInputElement;
                const file = input.files?.[0];

                if (file) {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        try {
                            const content = e.target?.result;
                            if (typeof content === 'string') {
                                if (file.name.endsWith('.owl')) {
                                    objects = processOWLFileContent(content);
                                } else {
                                    objects = processFileContent(content, objects);
                                }
                                drawObjects();
                            }
                        } catch (error) {
                            console.error('Error processing file content:', error);
                        }
                    };
                    reader.readAsText(file);
                }
            } catch (error) {
                console.error('Error reading file:', error);
            }
        });

        document.getElementById('owlExport')?.addEventListener('click', function () {
            const owlContent = convertObjectsToOWL(objects);
            downloadFile('shapes.owl', owlContent);
        });

        function createVerticalTable(object: Shape): HTMLTableElement {
            const table = document.createElement('table');
            table.style.border = '1px solid black';
            table.style.borderCollapse = 'collapse';
            table.style.width = '340px';
            table.style.tableLayout = 'fixed';

            for (const key in object) {
                if (object.hasOwnProperty(key)) {
                    if (
                        key === "imageSrc" ||
                        (object as any)[key] === "" ||
                        (object as any)[key].length === 0 ||
                        key === "connectors" ||
                        key === "borderPoints_X1" ||
                        key === "borderPoints_Y1" ||
                        key === "borderPoints_X2" ||
                        key === "borderPoints_Y2" ||
                        key === "lineConnectionStart" ||
                        key === "lineConnectionEnd" ||
                        key === "parts"
                    ) {
                        continue;
                    }

                    const row = table.insertRow();

                    // Ячейка с названием свойства
                    const cellKey = row.insertCell();
                    cellKey.style.border = '1px solid black';
                    cellKey.style.padding = '5px';
                    cellKey.style.width = '40%';

                    const label = (propertyLabels as Record<string, string>)[key] || key;
                    cellKey.innerText = label;

                    // Ячейка со значением свойства
                    const cellValue = row.insertCell();
                    cellValue.style.border = '1px solid black';
                    cellValue.style.padding = '5px';
                    cellValue.style.width = '60%';

                    const valueElement = document.createElement('span');
                    valueElement.innerText = (object as any)[key];
                    cellValue.appendChild(valueElement);

                    // Если свойство подлежит редактированию (число, цвет, arrowDirection или punctuation)
                    if (
                        typeof ((object as any)[key]) === "number" ||
                        key === "color" ||
                        key === "arrowDirection" ||
                        key === "punctuation" ||
                        key === "startArrowType" ||
                        key === "endArrowType" ||
                        key === "border"
                    ) {
                        cellValue.style.cursor = "pointer";

                        cellValue.addEventListener('click', () => {

                            const optionsEntering = (object: Shape, options: string[], input: HTMLInputElement | HTMLSelectElement) => {
                                options.forEach(option => {
                                    const opt = document.createElement('option');
                                    opt.value = option;
                                    opt.textContent = option;
                                    if ((object as any)[key] === option) {
                                        opt.selected = true;
                                    }
                                    input.appendChild(opt);
                                });
                            }

                            if (cellValue.querySelector('input, select')) return;

                            // Очистим содержимое ячейки
                            cellValue.innerHTML = '';

                            let input: HTMLInputElement | HTMLSelectElement;

                            if (key === "color") {
                                input = document.createElement('input');
                                input.type = 'color';
                                input.value = (object as any)[key];
                            } else if (key === "arrowDirection") {
                                input = document.createElement('select');
                                const options = ["start", "end", "both","mid", "none"];
                                //const options = [ "mid landmark", "none"];
                                optionsEntering(object, options, input);
                            } else if (key === "punctuation") {
                                input = document.createElement('select');
                                const options = ["yes", "none"];
                                optionsEntering(object, options, input);
                            } else if (key === "startArrowType" || key === "endArrowType") {
                                input = document.createElement('select');
                                const options = ["-|->", "-0->", "-*->", ">", "none"];
                                optionsEntering(object, options, input);
                            } else if (key === "border") {
                                input = document.createElement('select');
                                const options = ["false", "true"];
                                optionsEntering(object, options, input);
                            } else {
                                input = document.createElement('input');
                                input.type = 'text';
                                input.value = valueElement.innerText;
                            }
                            
                            input.focus();

                            //const editButton = document.createElement('button');
                            //editButton.innerText = 'Изменить';
                            //editButton.style.float = 'right';
                            //editButton.style.margin = '0 auto';

                            //cellValue.innerHTML = '';
                            //cellValue.appendChild(input);
                            //cellValue.appendChild(editButton);


                            const applyNewValue = () => {
                                const newValue = input.value.trim();

                                if (typeof (object as any)[key] === 'number') {
                                    const parsed = parseFloat(newValue);
                                    if (isNaN(parsed)) {
                                        alert("Некорректное числовое значение.");
                                        return;
                                    }
                                    (object as any)[key] = parsed;
                                    valueElement.innerText = parsed.toString();
                                } else if (typeof (object as any)[key] === 'string') {
                                    (object as any)[key] = newValue;
                                    valueElement.innerText = newValue;
                                } else if (typeof (object as any)[key] === 'boolean') {
                                    (object as any)[key] = newValue === "true";
                                    valueElement.innerText = newValue;
                                }

                                //if (object.type === "line") {
                                //    console.log("enter the func - ", object)
                                //    const myline = object as Line;
                                //    if (myline.startArrowType === ">") {
                                //        myline.arrowDirection = "start"
                                //    }
                                //    if (myline.endArrowType === ">") {
                                //        myline.arrowDirection = "end"
                                //    }
                                //    if (myline.arrowDirection === "start") {
                                //        myline.startArrowType = ">"
                                //        console.log("i an here - ", object, myline)
                                //    }
                                //    if (myline.arrowDirection === "end") {
                                //        myline.endArrowType = ">"
                                //    }
                                //}
                                if (object.type === "line") {
                                    const line = object as Line;
                                    if (key === "arrowDirection") {
                                        switch (newValue) {
                                            case "start":
                                                line.startArrowType = ">";
                                                line.endArrowType = "none";
                                                break;
                                            case "end":
                                                line.startArrowType = "none";
                                                line.endArrowType = ">";
                                                break;
                                            case "both":
                                                line.startArrowType = ">";
                                                line.endArrowType = ">";
                                                break;
                                            default:
                                                line.startArrowType = "none";
                                                line.endArrowType = "none";
                                                break;
                                        }
                                    }
                            
                                    if (key === "startArrowType" || key === "endArrowType") {
                                        const start = line.startArrowType;
                                        const end = line.endArrowType;
                                        if (start === ">" && end === ">") {
                                            line.arrowDirection = "both";
                                        } else if (start === ">" && end !== ">") {
                                            line.arrowDirection = "start";
                                        } else if (start !== ">" && end === ">") {
                                            line.arrowDirection = "end";
                                        } else {
                                            line.arrowDirection = "none";
                                        }
                                    }
                                }
                                cellValue.innerHTML = '';
                                cellValue.appendChild(valueElement);

                                const debugPanel = document.getElementById('table-container');
                                if (debugPanel) {
                                    debugPanel.innerHTML = '';
                                    debugPanel.appendChild(createVerticalTable(object));
                                }
                                drawObjects();
                            };

                            

                            input.addEventListener('keydown', (e: KeyboardEvent) => {
                                if (e.key === 'Enter') {
                                    applyNewValue();
                                }
                            });

                            //editButton.addEventListener('click', applyNewValue);

                            input.addEventListener('blur', () => {
                                //setTimeout(() => {
                                    // Если кнопка не в фокусе, возвращаем span
                                    //if (document.activeElement !== editButton) {
                                        cellValue.innerHTML = '';
                                        cellValue.appendChild(valueElement);
                                    //}
                                //}, 50); // 100 мс — достаточно
                            });
                            cellValue.appendChild(input);
                        });
                    }
                }
            }
            drawObjects();
            return table;
        }

        function dfsCycleDetection(
            node: Shape,
            graph: Shape[],
            visited: Set<string>,
            recStack: Set<string>,
            path: string[],
            allCycles: string[][]
        ): boolean {
            if (recStack.has(node.id)) {
                const cycleStartIndex = path.indexOf(node.id);
                const cycle = path.slice(cycleStartIndex);
                cycle.push(node.id);
                allCycles.push(cycle);
                return true;
            }

            if (visited.has(node.id)) {
                return false;
            }

            visited.add(node.id);
            recStack.add(node.id);
            path.push(node.id);

            const neighbors = node.outgoingLinks || [];
            for (const neighborId of neighbors) {
                const neighbor = graph.find(n => n.id === neighborId);
                if (neighbor) {
                    dfsCycleDetection(neighbor, graph, visited, recStack, path, allCycles);
                }
            }

            recStack.delete(node.id);
            path.pop();
            return false;
        }
        function detectCycles(graph: Shape[]): string[][] {
            const visited = new Set<string>();
            const recStack = new Set<string>();
            const allCycles: string[][] = [];

            for (const node of graph) {
                const path: string[] = [];
                if (!visited.has(node.id)) {
                    dfsCycleDetection(node, graph, visited, recStack, path, allCycles);
                }
            }

            return allCycles;
        }
        function clearHighlighting() {
            highlight = [];
            drawObjects();
        }
        function highlightCycle(cyclePath: string[], graph: Shape[]): void {
            for (const nodeId of cyclePath) {
                const node = graph.find(n => n.id === nodeId);
                if (node) {
                    // Например, меняем цвет линии или фигуры на красный
                    if (node.type === 'line') {
                        (node as Line).color = 'red';
                    } else if (node.type === 'rectangle' || node.type === 'circle' || node.type === 'star' || node.type === 'cloud') {
                        node.color = 'red';
                    }
                }
            }
            drawObjects(); // Перерисовываем объекты на холсте
        }
        function bfsShortestPath(graph: Shape[], startId: string, endId: string): string[] | null {
            const queue: string[] = [];
            const distances: Record<string, number> = {};
            const previous: Record<string, string | null> = {};

            // Инициализация
            for (const node of graph) {
                distances[node.id] = Infinity;
                previous[node.id] = null;
            }
            distances[startId] = 0;
            queue.push(startId);

            while (queue.length > 0) {
                const currentId = queue.shift() as string;
                const currentNode = graph.find(node => node.id === currentId);

                if (currentNode && currentNode.linkedObjects) {
                    for (const neighborId of currentNode.linkedObjects) {
                        if (distances[neighborId] === Infinity) {
                            distances[neighborId] = distances[currentId] + 1;
                            previous[neighborId] = currentId;
                            queue.push(neighborId);
                        }
                    }
                }
            }

            // Восстановление пути
            const path: string[] = [];
            let currentNodeId: string | null = endId;

            while (currentNodeId) {
                path.unshift(currentNodeId);
                currentNodeId = previous[currentNodeId];
            }

            // Если начальная вершина не соответствует первой в пути, значит пути нет
            if (path[0] !== startId) {
                return null;
            }

            return path;
        }
        //function enteringText(obj: Shape) {
        //    if (obj.info) {
        //        ctx.fillStyle = 'black';
        //        ctx.font = '16px Arial';
        //        ctx.textAlign = 'center';
        //        ctx.textBaseline = 'middle';
        //        let textX = obj.x_C /*+ (obj.width || obj.radius * 2) / 2*/;
        //        let textY = obj.y_C /*+ (obj.height || obj.radius * 2) / 2*/;
        //        if (obj.type === "rectangle") {
        //            textX = obj.x_C + (obj as Rectangle).width / 2;
        //            textY = obj.y_C + (obj as Rectangle).height / 2;
        //        }
        //        ctx.fillText(obj.info, textX, textY/*, 70*/); // убрал ограничение || надо реализовать возможность разбиения на строки
        //    }
        //}

        //function wrapTextForRectangle(
        //    ctx: CanvasRenderingContext2D,
        //    text: string,
        //    x: number,
        //    y: number,
        //    maxWidth: number,
        //    lineHeight: number
        //) {
        //    const words = text.split(' ');
        //    let line = '';
            
        //    const lines: string[] = [];

        //    for (let n = 0; n < words.length; n++) {
        //        const testLine = line + words[n] + ' ';
        //        const testWidth = ctx.measureText(testLine).width;
        //        if (testWidth > maxWidth && n > 0) {
        //            lines.push(line.trim());
        //            line = words[n] + ' ';
        //        } else {
        //            line = testLine;
        //        }
        //    }
        //    lines.push(line.trim());
        //    console.log(lines, lines.length);
        //    if (lines.length == 1) {
        //        //console.log("line.length === 1");
        //        ctx.fillText(lines[0], x, y);
        //    } else {
        //        for (let i = 0; i < lines.length; i++) {
        //            ctx.fillText(lines[i], x, y - lineHeight + i * lineHeight);
        //        }
        //    }
            
        //}
        function wrapTextForRectangle(
            ctx: CanvasRenderingContext2D,
            text: string,
            x: number,
            y: number,
            maxWidth: number,
            lineHeight: number
        ) {
            const words = text.split(' ');
            let line = '';
            const lines: string[] = [];

            for (let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + ' ';
                const testWidth = ctx.measureText(testLine).width;
                if (testWidth > maxWidth && n > 0) {
                    lines.push(line.trim());
                    line = words[n] + ' ';
                } else {
                    line = testLine;
                }
            }
            lines.push(line.trim());

            // Центрируем блок: поправка — (lines.length - 1) вместо lines.length
            const totalHeight = (lines.length - 1) * lineHeight;
            const startY = y - totalHeight / 2;

            for (let i = 0; i < lines.length; i++) {
                ctx.fillText(lines[i], x, startY + i * lineHeight);
            }
        }


        function enteringText(obj: Shape) {
            if (!obj.info) return;

            ctx.fillStyle = 'black';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            let textX = obj.x_C;
            let textY = obj.y_C;
            let maxWidth = 150;
            let lineHeight = 18;

            if (obj.type === "rectangle") {
                const rect = obj as Rectangle;
                maxWidth = rect.width - 8; // небольшой отступ с боков
                textX = rect.x_C + rect.width / 2;
                textY = rect.y_C + rect.height / 2; // начальная Y-координата

                wrapTextForRectangle(ctx, obj.info, textX, textY, maxWidth, lineHeight);
            } else {
                // для других фигур — одна строка, как раньше
                ctx.fillText(obj.info, textX, textY);
            }
        }


        function drawingConnection(obj_s: Shape[], ctx: CanvasRenderingContext2D) {
            // Сначала отрисовываем связи между объектами
            for (const obj of obj_s) {
                if (obj.linkedObjects) {
                    obj.linkedObjects.forEach(linkedId => {
                        const linkedObj = objects.find(o => o.id === linkedId);
                        if (linkedObj) {
                            ctx.beginPath();
                            const [startX, startY] = getObjectCenter(obj);
                            const [endX, endY] = getObjectCenter(linkedObj);
                            ctx.moveTo(startX, startY);
                            ctx.lineTo(endX, endY);
                            ctx.strokeStyle = 'black';
                            ctx.lineWidth = 2;
                            ctx.stroke();
                        }
                    });
                }
                if (obj.outgoingLinks) {
                    obj.outgoingLinks.forEach(linkedId => {
                        const linkedObj = objects.find(o => o.id === linkedId);
                        if (linkedObj) {
                            const [startX, startY] = getObjectCenter(obj);
                            const [endX, endY] = getObjectCenter(linkedObj);
                            //drawDirectedLine_Mid(ctx, startX, startY, endX, endY, 'blue');
                            drawLineWithArrow(ctx, startX, startY, endX, endY, 'blue', "mid")
                        }
                    });
                }
            }
        }
        function rotationCheck(obj: Shape, ctx: CanvasRenderingContext2D) {
            ctx.save();
            let centerX = 0;
            let centerY = 0;
            if (obj.rotation) {
                if (obj.type === 'rectangle') {
                    centerX = (obj as Rectangle).x_C + (obj as Rectangle).width / 2;
                    centerY = (obj as Rectangle).y_C + (obj as Rectangle).height / 2;
                } else if (obj.type === 'circle') {
                    centerX = (obj as Circle).x_C;
                    centerY = (obj as Circle).y_C;
                } else if (obj.type === 'line') {
                    centerX = ((obj as Line).startX + (obj as Line).endX) / 2;
                    centerY = ((obj as Line).startY + (obj as Line).endY) / 2;
                } else if (obj.type === 'star') {
                    centerX = (obj as Star).x_C;
                    centerY = (obj as Star).y_C;
                } else if (obj.type === 'cloud') {
                    centerX = (obj as Cloud).x_C;
                    centerY = (obj as Cloud).y_C;
                }
                ctx.translate(centerX, centerY);
                ctx.rotate((obj.rotation * Math.PI) / 180);
                ctx.translate(-centerX, -centerY);
            }
        }

        function drawRectangleByPoints(
            ctx: CanvasRenderingContext2D,
            points: { x: number; y: number }[],
            strokeStyle: string = "black",
            fillStyle: string = "transparent"
        ) {
            if (points.length !== 4) {
                console.error("Функция требует ровно 4 точки");
                return;
            }

            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < 4; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.closePath();

            ctx.strokeStyle = strokeStyle;
            ctx.fillStyle = fillStyle;
            ctx.fill();
            ctx.stroke();
        }

        function drawObjects() {
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                if (gridVisible) {
                    drawGrid(ctx, canvas.width, canvas.height, 20);
                }
                ctx.save();
                ctx.translate(offsetX, offsetY);
                drawingConnection(objects, ctx);

                // Затем отрисовываем сами объекты
                for (const obj of objects) {
                    //logDebug(`Drawing object: ${JSON.stringify(obj)}`);
                    rotationCheck(obj, ctx);
                    switch (obj.type) {
                        case 'table':
                            const table = obj as ComplexShape;
                            drawTable(table, ctx)
                            const points = [
                                { x: table.x_C - 1, y: table.y_C - 1},
                                { x: table.x_C + 1, y: table.y_C - 1},
                                { x: table.x_C + 1, y: table.y_C + 1},
                                { x: table.x_C - 1, y: table.y_C + 1}
                            ];

                            drawRectangleByPoints(ctx,points,"black")
                            break;
                        case 'rectangle':
                            const rect = obj as Rectangle;
                            //console.log("rect - ", rect);
                            drawRect(rect, ctx);
                            updateConnectors(rect);
                            enteringText(obj);
                            break;
                        case 'circle':
                            const circle = obj as Circle;
                            drawCircle(circle, ctx);
                            updateConnectors(circle);
                            enteringText(obj);
                            break;
                        case 'line':
                            const line = obj as Line;
                            drawLine(line, ctx);
                            updateConnectors(line);
                            enteringText(obj);
                            break;
                        case 'star':
                            const star = obj as Star;
                            drawStar(star as Star, ctx);
                            updateConnectors(star);
                            enteringText(obj);
                            break;
                        case 'cloud':
                            const cloud = obj as Cloud;
                            drawCloud(cloud as Cloud, ctx);
                            updateConnectors(cloud);
                            enteringText(obj);
                            break;
                        default:
                            logDebug(`Unknown object type: ${JSON.stringify(obj)}`);
                    }
                    
                    highlighting(obj, ctx); // Подсветка выбранного объекта
                    ctx.restore();
                }

                ctx.restore();
            } else {
                logDebug("Canvas context is not available");
            }
        }

    } else {
        console.error("Canvas context is not supported");
        logDebug("Canvas context is not supported");
    }
})();
