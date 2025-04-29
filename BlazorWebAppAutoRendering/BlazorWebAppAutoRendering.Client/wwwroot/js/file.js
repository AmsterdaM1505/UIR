(function () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13;
    let objects = [];
    let highlight = [];
    let ctx = null;
    let selectedObject = null;
    let selectedObject_canv = null;
    let selectedObject_buf = null;
    let selectedObject_buf_connect = null;
    let startX, startY;
    let isPanning = false;
    let panStartX = 0;
    let panStartY = 0;
    let offsetX = 0;
    let offsetY = 0;
    let mouse_meaning_check = 0;
    let connectionServ = 2;
    const container = document.getElementById('table-container');
    let cyclePath = null;
    let savedSchema = null;
    let selectedObjectMass = [];
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
    let activeConnector = null;
    //let complexObjects: ComplexShape[] = [];
    // Пример вызова:
    const expectedWidth = measureTextWidth("Добавить прямоугольник", "16px Roboto");
    console.log("Ожидаемая ширина текста:", expectedWidth);
    function generateRandomId(length) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
    //////////////////////////
    //const openPopupBtn = document.getElementById('openPopupBtn') as HTMLElement;
    let isDragging = false;
    //openPopupBtn.addEventListener('click', openPopup());
    const popup = document.getElementById('popup');
    const closePopup = document.getElementById('closePopup');
    const popupHeader = document.getElementById('popupHeader');
    // Функция для показа окна
    function openPopup(newText, popupType) {
        const popupText = document.getElementById('popupText');
        if (popupType === "information") {
            if (popupText) {
                popupText.innerText = newText;
            }
        }
        else if (popupType === "editing") {
        }
        popup.classList.remove('hidden');
    }
    function hidePopup() {
        popup.classList.add('hidden');
    }
    closePopup.addEventListener('click', hidePopup);
    popup.addEventListener('mousedown', (e) => {
        // Игнорировать клик по кнопке закрытия, чтобы окно не начало перетаскиваться при попытке закрытия
        if (e.target.id === 'closePopup')
            return;
        isDragging = true;
        offsetX = e.clientX - popup.offsetLeft;
        offsetY = e.clientY - popup.offsetTop;
        popup.style.cursor = "grabbing";
    });
    document.addEventListener('mousemove', (e) => {
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
    function extractObjectsFromCustomFormat(content) {
        const lines = content.split("\n");
        const startIndex = lines.findIndex(line => line.trim().startsWith("Objects:("));
        if (startIndex === -1)
            throw new Error("Objects section not found");
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
    function processFileContent(content, objects) {
        console.log("processFileContent here");
        try {
            if (!content)
                return objects;
            let schemaData;
            try {
                schemaData = JSON.parse(content);
            }
            catch (_a) {
                try {
                    const jsonLike = extractObjectsFromCustomFormat(content);
                    console.log(jsonLike);
                    schemaData = { objects: JSON.parse(jsonLike) };
                }
                catch (parseError) {
                    console.error("Ошибка при разборе custom-формата:", parseError);
                    return objects;
                }
            }
            if (!Array.isArray(schemaData.objects)) {
                console.error("Invalid schema format: objects must be an array.");
                return objects;
            }
            return schemaData.objects.map(obj => {
                var _a, _b, _c;
                if (!obj.type || typeof obj.type !== 'string') {
                    console.warn("Пропущен или некорректный тип:", obj);
                    return null;
                }
                const baseProps = {
                    id: obj.id || generateUniqueId(),
                    type: obj.type,
                    color: obj.color || '#000',
                    rotation: obj.rotation || 0,
                    info: obj.info || '',
                    linkedObjects: obj.linkedObjects || [],
                    outgoingLinks: obj.outgoingLinks || [],
                    incomingLinks: obj.incomingLinks || [],
                    colorAlpha: (_a = obj.colorAlpha) !== null && _a !== void 0 ? _a : 1,
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
                        if (obj.width == null || obj.height == null)
                            return null;
                        return Object.assign(Object.assign({}, baseProps), { width: obj.width, height: obj.height });
                    case 'circle':
                        if (obj.radius == null)
                            return null;
                        return Object.assign(Object.assign({}, baseProps), { radius: obj.radius });
                    case 'line':
                        if (obj.startX == null || obj.startY == null || obj.endX == null || obj.endY == null)
                            return null;
                        return Object.assign(Object.assign({}, baseProps), { startX: obj.startX, startY: obj.startY, endX: obj.endX, endY: obj.endY, arrowDirection: obj.arrowDirection, punctuation: obj.punctuation, lineWidth: obj.lineWidth, startArrowType: obj.startArrowType, endArrowType: obj.endArrowType, x_C: (obj.startX + obj.endX) / 2, y_C: (obj.startY + obj.endY) / 2 });
                    case 'star':
                        return Object.assign(Object.assign({}, baseProps), { rad: obj.rad, amount_points: obj.amount_points, m: obj.m });
                    case 'cloud':
                        if (obj.width == null || obj.height == null)
                            return null;
                        return Object.assign(Object.assign({}, baseProps), { width: obj.width, height: obj.height });
                    case 'table':
                        if (!Array.isArray(obj.parts))
                            return null;
                        const parts = obj.parts.map((part) => {
                            const singleJson = JSON.stringify({ objects: [part] });
                            const parsed = processFileContent(singleJson, []);
                            return parsed[0];
                        }).filter(Boolean);
                        return Object.assign(Object.assign({}, baseProps), { width: obj.width, height: obj.height, cols: (_b = obj.cols) !== null && _b !== void 0 ? _b : 1, rows: (_c = obj.rows) !== null && _c !== void 0 ? _c : 1, parts });
                    default:
                        console.warn("Unknown shape type:", obj.type);
                        return null;
                }
            }).filter((obj) => obj !== null);
        }
        catch (error) {
            console.error("Error processing file content:", error);
            return objects;
        }
    }
    (_a = document.getElementById('customJsonImport')) === null || _a === void 0 ? void 0 : _a.addEventListener('change', function (event) {
        var _a;
        try {
            const input = event.target;
            const file = (_a = input.files) === null || _a === void 0 ? void 0 : _a[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    var _a;
                    try {
                        const content = (_a = e.target) === null || _a === void 0 ? void 0 : _a.result;
                        if (typeof content === 'string') {
                            objects = processFileContent(content, objects);
                        }
                        drawObjects();
                    }
                    catch (error) {
                        console.error('Error processing file content:', error);
                    }
                };
                reader.readAsText(file);
            }
        }
        catch (error) {
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
        }
        catch (error) {
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
                var _a, _b;
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
                    colorAlpha: (_a = obj.colorAlpha) !== null && _a !== void 0 ? _a : 1,
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
                        return Object.assign(Object.assign({}, baseProps), { width: obj.width, height: obj.height, border: (_b = obj.border) !== null && _b !== void 0 ? _b : false });
                    case 'circle':
                        return Object.assign(Object.assign({}, baseProps), { radius: obj.radius });
                    case 'line':
                        return Object.assign(Object.assign({}, baseProps), { startX: obj.startX, startY: obj.startY, endX: obj.endX, endY: obj.endY, arrowDirection: obj.arrowDirection || 'none', punctuation: obj.punctuation || 'none', lineWidth: obj.lineWidth || 2, startArrowType: obj.startArrowType || 'none', endArrowType: obj.endArrowType || 'none' });
                    case 'star':
                        return Object.assign(Object.assign({}, baseProps), { rad: obj.rad, amount_points: obj.amount_points, m: obj.m });
                    case 'cloud':
                        return Object.assign(Object.assign({}, baseProps), { width: obj.width, height: obj.height });
                    case 'table':
                        return Object.assign(Object.assign({}, baseProps), { width: obj.width, height: obj.height, cols: obj.cols || 1, rows: obj.rows || 1, parts: obj.parts || [] });
                    default:
                        console.warn("Unknown shape type:", obj.type);
                        return null;
                }
            }).filter(obj => obj !== null);
            isSchemaLoaded = true;
            drawObjects();
            console.log("Schema loaded successfully.", objects);
        }
        catch (error) {
            console.error("Error loading schema:", error);
        }
    }
    const canvas = document.getElementById('canvas');
    if (!canvas) {
        logDebug("Canvas element not found");
        return;
    }
    else {
        canvas.oncontextmenu = () => false;
        logDebug("Canvas element found");
    }
    window.addEventListener('DOMContentLoaded', () => {
        if (!isSchemaLoaded) {
            loadFromLocalStorage();
        }
    });
    function resizeCanvas(canvas) {
        if (!canvas)
            return;
        const ctx = canvas.getContext("2d");
        if (!ctx)
            return;
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
    function updateOffsets(canvas) {
        const mainLayout = document.getElementById("main-layout");
        const debug = document.getElementById("debug-panel");
        if (!canvas || !mainLayout)
            return;
        const rect = canvas.getBoundingClientRect();
        const difference = mainLayout.getBoundingClientRect();
        offsetX = rect.left;
        offsetY = Math.max(0, rect.top - (difference.bottom - difference.top));
        debug.style.bottom += `${difference.bottom - difference.top}px`;
        //console.log(" top p pp ", offsetX, offsetY, difference.top, difference.bottom)
    }
    function updateLeftAndRightPanelHeight(canvas) {
        const mainLayout = document.getElementById("main-layout");
        const leftPanel = document.getElementById("button-panel");
        const rightPanel = document.getElementById("table-container");
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
        console.log("he he he - ", leftHeight, rightHeight, leftPanel.style.height, rightPanel.style.height, difference);
    }
    function updateDebugPanelOffsets() {
        const leftPanel = document.getElementById("button-panel");
        const rightPanel = document.getElementById("table-container");
        const debugPanel = document.getElementById("debug-panel");
        if (!leftPanel || !rightPanel || !debugPanel)
            return;
        // Вычисляем текущие ширины левой и правой панелей
        const leftWidth = leftPanel.getBoundingClientRect().width;
        const rightWidth = rightPanel.getBoundingClientRect().width;
        // Задаем нижней панели отступы таким образом, чтобы она начиналась от края левой панели 
        // и заканчивалась перед правой панелью.
        debugPanel.style.left = leftWidth + "px";
        debugPanel.style.right = rightWidth + "px";
    }
    function uniformizeButtons(selector) {
        const buttons = document.querySelectorAll(selector);
        let maxWidth = 0;
        let maxHeight = 0;
        logDebug("button resize");
        buttons.forEach(button => {
            const rect = button.getBoundingClientRect();
            if (rect.width > maxWidth) {
                maxWidth = rect.width;
            }
            if (rect.height > maxHeight) {
                maxHeight = rect.height;
            }
        });
        buttons.forEach(button => {
            button.style.width = `${maxWidth}px`;
            button.style.height = `${maxHeight}px`;
        });
    }
    window.addEventListener("resize", function () {
        uniformizeButtons('._button');
        logDebug("button resize");
        console.log("button resize");
        resizeCanvas(canvas);
        updateOffsets(canvas);
        updateDebugPanelOffsets();
        //updateLeftAndRightPanelHeight(canvas)
    });
    updateDebugPanelOffsets();
    resizeCanvas(canvas);
    updateOffsets(canvas);
    updateLeftAndRightPanelHeight(canvas);
    const gridCanvas = document.createElement('canvas');
    const gridCtx = gridCanvas.getContext('2d');
    gridCanvas.width = canvas.width;
    gridCanvas.height = canvas.height;
    console.log("w-h", gridCanvas.width, gridCanvas.height);
    //Функция для рисования сетки
    function drawGrid(ctx, width, height, gridSize) {
        //ctx.clearRect(0, 0, width, height); // Очищаем холст перед рисованием
        ctx.strokeStyle = '#e0e0e0'; // Цвет линий сетки
        ctx.lineWidth = 1;
        // Вертикальные линии
        for (let x = 0; x <= width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        // Горизонтальные линии
        for (let y = 0; y <= height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
    }
    drawGrid(gridCtx, gridCanvas.width, gridCanvas.height, 20);
    // Рисуем сетку на фоновом холсте
    if (canvas.getContext) {
        ctx = canvas.getContext('2d');
        if (!ctx) {
            logDebug("Failed to get canvas context");
        }
        else {
            logDebug("Canvas context obtained");
        }
        //console.log(objects);
        if (!isSchemaLoaded) {
            drawObjects();
        }
        (_b = document.getElementById('recovery-scheme')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', function () {
            logDebug("recovery-scheme button clicked");
            loadFromLocalStorage();
        });
        // Обработчики событий
        canvas.addEventListener('mousedown', function (e) {
            onMouseDown(e);
        });
        canvas.addEventListener('mousemove', function (e) {
            onMouseMove(e);
        });
        canvas.addEventListener('mouseup', function (e) {
            onMouseUp(e);
        });
        resizeHandleLeft.addEventListener("mousedown", function (e) {
            isResizingLeft = true;
            document.addEventListener("mousemove", resizeLeftPanel);
            document.addEventListener("mouseup", stopResizing);
        });
        resizeHandleRight.addEventListener("mousedown", function (e) {
            isResizingRight = true;
            document.addEventListener("mousemove", resizeRightPanel);
            document.addEventListener("mouseup", stopResizing);
        });
        function resizeLeftPanel(e) {
            if (!isResizingLeft)
                return;
            const newWidth = e.clientX;
            if (newWidth > 50 && newWidth < window.innerWidth / 2) {
                leftPanel.style.width = `${newWidth}px`;
                debugPanel.style.left = `${newWidth}px`; // Корректируем отладочную панель
                resizeHandleLeft.style.left = `${newWidth}px`;
            }
        }
        function resizeRightPanel(e) {
            if (!isResizingRight)
                return;
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
        (_c = document.getElementById('short')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', function () {
            logDebug("Поиск кратчайшего пути (неориентированный граф)");
            highlightShortestPath("A", "D", false);
        });
        (_d = document.getElementById('cycle')) === null || _d === void 0 ? void 0 : _d.addEventListener('click', function () {
            logDebug("Проверка циклов (неориентированный граф)");
            highlightCycles(false);
        });
        (_e = document.getElementById('shortor')) === null || _e === void 0 ? void 0 : _e.addEventListener('click', function () {
            logDebug("Поиск кратчайшего пути (ориентированный граф)");
            highlightShortestPath("A", "D", true);
        });
        (_f = document.getElementById('cycleor')) === null || _f === void 0 ? void 0 : _f.addEventListener('click', function () {
            logDebug("Проверка циклов (ориентированный граф)");
            highlightCycles(true);
        });
        function buildGraph(objects, isDirected = true) {
            const graph = {};
            // Добавляем все вершины в граф
            for (const obj of objects) {
                graph[obj.id] = [];
            }
            // Добавляем связи через линии
            for (const line of objects.filter(obj => obj.type === "line")) {
                const startObj = objects.find(obj => { var _a; return (_a = obj.connectors) === null || _a === void 0 ? void 0 : _a.some(c => { var _a, _b; return c.id === ((_b = (_a = line.lineConnectionStart) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.id_con); }); });
                const endObj = objects.find(obj => { var _a; return (_a = obj.connectors) === null || _a === void 0 ? void 0 : _a.some(c => { var _a, _b; return c.id === ((_b = (_a = line.lineConnectionEnd) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.id_con); }); });
                if (!startObj || !endObj)
                    continue;
                // Ориентированный граф
                if (isDirected) {
                    if (line.arrowDirection === "start") {
                        graph[endObj.id].push(startObj.id);
                    }
                    else if (line.arrowDirection === "end") {
                        graph[startObj.id].push(endObj.id);
                    }
                    else if (line.arrowDirection === "both" || line.arrowDirection === "none") {
                        graph[startObj.id].push(endObj.id);
                        graph[endObj.id].push(startObj.id);
                    }
                }
                else {
                    // Неориентированный граф (всегда двусторонняя связь)
                    graph[startObj.id].push(endObj.id);
                    graph[endObj.id].push(startObj.id);
                }
            }
            console.log("graph - ", graph);
            return graph;
        }
        function detectCycles2(objects, isDirected = true) {
            const graph = buildGraph(objects, isDirected);
            const visited = new Set();
            const recStack = new Set();
            const allCycles = [];
            function dfs(node, path) {
                if (recStack.has(node)) {
                    const cycleStartIndex = path.indexOf(node);
                    if (cycleStartIndex !== -1) {
                        allCycles.push(path.slice(cycleStartIndex));
                        console.log(`Найден цикл: ${path.slice(cycleStartIndex)}`);
                    }
                    return;
                }
                if (visited.has(node))
                    return;
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
            console.log("allcycles - ", allCycles);
            return allCycles;
        }
        function bfsShortestPath2(objects, startId, endId, isDirected = true) {
            const graph = buildGraph(objects, isDirected);
            console.log("Граф перед BFS:", graph);
            const queue = [[startId]];
            const visited = new Set();
            while (queue.length > 0) {
                const path = queue.shift();
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
        function highlightShortestPath(startId, endId, isDirected) {
            logDebug(`Поиск пути из ${startId} в ${endId}, isDirected = ${isDirected}`);
            highlight = []; // Сбрасываем прошлое выделение
            const path = bfsShortestPath2(objects, startId, endId, isDirected);
            if (path) {
                logDebug(`Кратчайший путь найден: ${path}`);
                path.forEach(id => {
                    const obj = objects.find(o => o.id === id);
                    if (obj)
                        highlight.push(obj);
                });
            }
            else {
                logDebug("Путь не найден.");
            }
            drawObjects();
        }
        function highlightCycles(isDirected) {
            logDebug(`Проверка циклов, isDirected = ${isDirected}`);
            highlight = []; // Очищаем предыдущее выделение
            const cycles = detectCycles2(objects, isDirected);
            if (cycles.length > 0) {
                logDebug(`Найденные циклы: ${JSON.stringify(cycles)}`);
                cycles.forEach(cycle => {
                    cycle.forEach(id => {
                        const obj = objects.find(o => o.id === id);
                        if (obj)
                            highlight.push(obj);
                    });
                });
            }
            else {
                logDebug("Циклов не найдено.");
            }
            drawObjects();
        }
        let selectedPathStart = null;
        let selectedPathEnd = null;
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
        (_g = document.getElementById('longWayCheck')) === null || _g === void 0 ? void 0 : _g.addEventListener('click', function (event) {
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
                }
                else if (!selectedPathEnd) {
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
        function highlighting(obj_, ctx_) {
            if (!highlight || highlight.length === 0)
                return; // Проверка на пустой массив
            if (highlight.includes(obj_)) {
                ctx_.save();
                ctx_.strokeStyle = 'red';
                ctx_.lineWidth = 4;
                if (obj_.type === 'rectangle') {
                    const rect = obj_;
                    ctx_.strokeRect(rect.x_C, rect.y_C, rect.width, rect.height);
                }
                else if (obj_.type === 'circle') {
                    const circle = obj_;
                    ctx_.beginPath();
                    ctx_.arc(circle.x_C, circle.y_C, circle.radius + 2, 0, 2 * Math.PI);
                    ctx_.stroke();
                }
                else if (obj_.type === 'line') {
                    const line = obj_;
                    ctx_.beginPath();
                    ctx_.moveTo(line.startX, line.startY);
                    ctx_.lineTo(line.endX, line.endY);
                    ctx_.stroke();
                }
                ctx_.restore();
            }
        }
        /////////// пунктирность линии хромает, таблица не строится как надо
        function exportGraphToFile(graph, fileName) {
            let formatString = `<graph>\n`;
            formatString += `  <canvas height="${canvas.height}" width="${canvas.width}"/>\n`;
            graph.forEach(shape => {
                var _a, _b, _c, _d, _e, _f;
                if (shape.type === "line") {
                    const line = shape;
                    formatString += `  <edge dialect="${line.dialect}" id="${line.id}" type="${line.type}" label="${line.info || ""}" `;
                    formatString += `source="${((_b = (_a = line.lineConnectionStart) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.id_shape) || ""}" target="${((_d = (_c = line.lineConnectionEnd) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.id_shape) || ""}" `;
                    formatString += `endArrow="${line.endArrowType || "none"}" startArrow="${line.startArrowType || "none"}">\n`;
                    formatString += `    <lineGeometry startX="${line.startX}" startY="${line.startY}" endX="${line.endX}" endY="${line.endY}"/>\n`;
                    formatString += `    <background color="${line.color}"/>\n`;
                    formatString += `    <edgeStyle edgeColor="${line.color}" lineWidth="${line.lineWidth || 2}" alpha="${(_e = line.colorAlpha) !== null && _e !== void 0 ? _e : 1}"/>\n`;
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
                }
                else {
                    formatString += `  <node dialect="${shape.dialect}" id="${shape.id}" type="${shape.type}" label="${shape.info || ""}" rotation="${shape.rotation || 0}">\n`;
                    if (shape.type === "circle") {
                        const circle = shape;
                        formatString += `    <geometry x="${circle.x_C}" y="${circle.y_C}" radius="${circle.radius}"/>\n`;
                    }
                    else if (shape.type === "rectangle") {
                        const rect = shape;
                        formatString += `    <geometry x="${rect.x_C}" y="${rect.y_C}" width="${rect.width}" height="${rect.height}" border="${rect.border ? 'true' : 'false'}"/>\n`;
                    }
                    else if (shape.type === "star") {
                        const star = shape;
                        formatString += `    <geometry x="${star.x_C}" y="${star.y_C}" rad="${star.rad}" amount_points="${star.amount_points}" m="${star.m}"/>\n`;
                    }
                    else if (shape.type === "cloud") {
                        const cloud = shape;
                        formatString += `    <geometry x="${cloud.x_C}" y="${cloud.y_C}" width="${cloud.width}" height="${cloud.height}"/>\n`;
                    }
                    else if (shape.type === "table") {
                        const table = shape;
                        const rowHeight = table.parts.length ? table.parts[0].height : 1;
                        const colWidth = table.parts.length ? table.parts[0].width : 1;
                        const cols = Math.max(1, Math.round(table.width / colWidth));
                        const rows = Math.max(1, Math.round(table.height / rowHeight));
                        formatString += `    <geometry x="${table.x_C}" y="${table.y_C}" `;
                        formatString += `number_of_columns="${cols}" number_of_rows="${rows}" width="${table.width}" height="${table.height}"/>\n`;
                        for (let row = 0; row < rows; row++) {
                            formatString += `    <tableRow index="${row}">\n`;
                            formatString += `      <geometry height="${rowHeight}"/>\n`;
                            for (let col = 0; col < cols; col++) {
                                const cellIndex = row * cols + col;
                                if (cellIndex >= table.parts.length)
                                    break;
                                const cell = table.parts[cellIndex];
                                formatString += `      <tableElement index="${col}">\n`;
                                formatString += `        <geometry x="${cell.x_C}" y="${cell.y_C}" width="${cell.width}" height="${cell.height}" border="${cell.border ? 'true' : 'false'}"/>\n`; //
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
                    formatString += `    <style alpha="${(_f = shape.colorAlpha) !== null && _f !== void 0 ? _f : 1}"/>\n`;
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
            formatString += `  <allowedEdge type="line">\n`;
            formatString += `    <basedOnType type="line" />\n`;
            formatString += `    <typeProperties setting="add">\n`;
            formatString += `      <property>\n`;
            formatString += `        <name>constraintName</name>\n`;
            formatString += `        <valueType>string</valueType>\n`;
            formatString += `      </property>\n`;
            formatString += `      <property>\n`;
            formatString += `        <name>startArrowType</name>\n`;
            formatString += `        <valueType>string</valueType>\n`;
            formatString += `        <setValue>none</setValue>\n`;
            formatString += `      </property>\n`;
            formatString += `      <property>\n`;
            formatString += `        <name>endArrowType</name>\n`;
            formatString += `        <valueType>string</valueType>\n`;
            formatString += `        <setValue>classic</setValue>\n`;
            formatString += `      </property>\n`;
            formatString += `    </typeProperties>\n`;
            formatString += `    <geometryProperties setting="add">\n`;
            formatString += `      <property><name>startX</name><valueType>number</valueType></property>\n`;
            formatString += `      <property><name>startY</name><valueType>number</valueType></property>\n`;
            formatString += `      <property><name>endX</name><valueType>number</valueType></property>\n`;
            formatString += `      <property><name>endY</name><valueType>number</valueType></property>\n`;
            formatString += `      <property><name>lineWidth</name><valueType>number</valueType><setValue>2</setValue></property>\n`;
            formatString += `    </geometryProperties>\n`;
            formatString += `    <requireArrow setting="end"/>\n`;
            formatString += `    <allowedArrowheads>\n`;
            formatString += `      <arrowheadType name="classic" position="end"/>\n`;
            formatString += `      <arrowheadType name="diamond" position="start"/>\n`;
            formatString += `      <arrowheadType name="none" position="both"/>\n`;
            formatString += `    </allowedArrowheads>\n`;
            formatString += `    <allowedConnections>\n`;
            formatString += `      <nodeType name="table" position="source"/>\n`;
            formatString += `      <nodeType name="table" position="target"/>\n`;
            formatString += `    </allowedConnections>\n`;
            formatString += `    <limits>\n`;
            formatString += `      <propertyLimits name="startArrowType" allowedValues="none, -|->, -0->, -*->, >"/>\n`;
            formatString += `      <propertyLimits name="endArrowType" allowedValues="none, -|->, -0->, -*->, >"/>\n`;
            formatString += `    </limits>\n`;
            formatString += `  </allowedEdge>\n`;
            formatString += `  <allowedArrowhead type="-|->">\n`;
            formatString += `    <basedOnType type="none"/>\n`;
            formatString += `    <geometryLimits width="10" height="10"/>\n`;
            formatString += `    <styleLimits fill="black"/>\n`;
            formatString += `    <connectsWith>\n`;
            formatString += `      <edgeType name="line" position="end"/>\n`;
            formatString += `      <edgeType name="line" position="start"/>\n`;
            formatString += `    </connectsWith>\n`;
            formatString += `  </allowedArrowhead>\n`;
            formatString += `  <allowedArrowhead type="-0->">\n`;
            formatString += `    <basedOnType type="none"/>\n`;
            formatString += `    <geometryLimits width="10" height="10"/>\n`;
            formatString += `    <styleLimits fill="black"/>\n`;
            formatString += `    <connectsWith>\n`;
            formatString += `      <edgeType name="line" position="end"/>\n`;
            formatString += `      <edgeType name="line" position="start"/>\n`;
            formatString += `    </connectsWith>\n`;
            formatString += `  </allowedArrowhead>\n`;
            formatString += `  <allowedArrowhead type="-*->">\n`;
            formatString += `    <basedOnType type="none"/>\n`;
            formatString += `    <geometryLimits width="10" height="10"/>\n`;
            formatString += `    <styleLimits fill="black"/>\n`;
            formatString += `    <connectsWith>\n`;
            formatString += `      <edgeType name="line" position="end"/>\n`;
            formatString += `      <edgeType name="line" position="start"/>\n`;
            formatString += `    </connectsWith>\n`;
            formatString += `  </allowedArrowhead>\n`;
            formatString += `  <allowedArrowhead type=">">\n`;
            formatString += `    <basedOnType type="none"/>\n`;
            formatString += `    <geometryLimits width="10" height="10"/>\n`;
            formatString += `    <styleLimits fill="black"/>\n`;
            formatString += `    <connectsWith>\n`;
            formatString += `      <edgeType name="line" position="end"/>\n`;
            formatString += `      <edgeType name="line" position="start"/>\n`;
            formatString += `    </connectsWith>\n`;
            formatString += `  </allowedArrowhead>\n`;
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
        function extractColor(el) {
            //console.log("el --- ", el)
            const bg = el.getElementsByTagName("background")[0];
            //console.log("el2 --- ", bg?.getAttribute("color") || "#ffffff")
            return (bg === null || bg === void 0 ? void 0 : bg.getAttribute("color")) || "#ffffff";
        }
        function extractConnections(el, tag) {
            const connections = [];
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
        function importGraphFromXml(xml) {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xml, "text/xml");
            const shapes = [];
            const nodeElements = Array.from(xmlDoc.getElementsByTagName("node"));
            nodeElements.forEach(nodeEl => {
                var _a, _b, _c, _d, _e;
                const type = nodeEl.getAttribute("type") || "unknown";
                const id = nodeEl.getAttribute("id") || "";
                const dialect = nodeEl.getAttribute("dialect") || "";
                const label = nodeEl.getAttribute("label") || "";
                const rotation = parseFloat(nodeEl.getAttribute("rotation") || "0");
                let shape;
                const geometryEl = nodeEl.getElementsByTagName("geometry")[0];
                const baseProps = {
                    id,
                    type,
                    dialect,
                    info: label,
                    rotation,
                    color: extractColor(nodeEl),
                    x_C: parseFloat((geometryEl === null || geometryEl === void 0 ? void 0 : geometryEl.getAttribute("x")) || "0"),
                    y_C: parseFloat((geometryEl === null || geometryEl === void 0 ? void 0 : geometryEl.getAttribute("y")) || "0"),
                    borderPoints_X1: parseFloat(((_a = nodeEl.getElementsByTagName("arealRect")[0]) === null || _a === void 0 ? void 0 : _a.getAttribute("x1")) || "0"),
                    borderPoints_Y1: parseFloat(((_b = nodeEl.getElementsByTagName("arealRect")[0]) === null || _b === void 0 ? void 0 : _b.getAttribute("y1")) || "0"),
                    borderPoints_X2: parseFloat(((_c = nodeEl.getElementsByTagName("arealRect")[0]) === null || _c === void 0 ? void 0 : _c.getAttribute("x2")) || "0"),
                    borderPoints_Y2: parseFloat(((_d = nodeEl.getElementsByTagName("arealRect")[0]) === null || _d === void 0 ? void 0 : _d.getAttribute("y2")) || "0"),
                    colorAlpha: parseFloat(((_e = nodeEl.getElementsByTagName("style")[0]) === null || _e === void 0 ? void 0 : _e.getAttribute("alpha")) || "1"),
                };
                switch (type) {
                    case "rectangle":
                        shape = Object.assign(Object.assign({}, baseProps), { width: parseFloat((geometryEl === null || geometryEl === void 0 ? void 0 : geometryEl.getAttribute("width")) || "0"), height: parseFloat((geometryEl === null || geometryEl === void 0 ? void 0 : geometryEl.getAttribute("height")) || "0"), border: (geometryEl === null || geometryEl === void 0 ? void 0 : geometryEl.getAttribute("border")) === "true" //
                         });
                        break;
                    case "circle":
                        shape = Object.assign(Object.assign({}, baseProps), { radius: parseFloat((geometryEl === null || geometryEl === void 0 ? void 0 : geometryEl.getAttribute("radius")) || "0") });
                        break;
                    case "star":
                        shape = Object.assign(Object.assign({}, baseProps), { rad: parseFloat((geometryEl === null || geometryEl === void 0 ? void 0 : geometryEl.getAttribute("rad")) || "0"), amount_points: parseInt((geometryEl === null || geometryEl === void 0 ? void 0 : geometryEl.getAttribute("amount_points")) || "5"), m: parseFloat((geometryEl === null || geometryEl === void 0 ? void 0 : geometryEl.getAttribute("m")) || "2") });
                        break;
                    case "cloud":
                        shape = Object.assign(Object.assign({}, baseProps), { width: parseFloat((geometryEl === null || geometryEl === void 0 ? void 0 : geometryEl.getAttribute("width")) || "0"), height: parseFloat((geometryEl === null || geometryEl === void 0 ? void 0 : geometryEl.getAttribute("height")) || "0") });
                        break;
                    case "table":
                        console.log("import shape 1");
                        const parts = [];
                        const tableRows = Array.from(nodeEl.getElementsByTagName("tableRow"));
                        tableRows.forEach(rowEl => {
                            const elements = Array.from(rowEl.getElementsByTagName("tableElement"));
                            elements.forEach((cellEl, i) => {
                                var _a, _b;
                                const geom = cellEl.getElementsByTagName("geometry")[0];
                                console.log("geom - ", geom);
                                const rect = Object.assign(Object.assign({}, baseProps), { id: `${id}_cell_${i}`, type: "rectangle", dialect, info: ((_a = cellEl.getElementsByTagName("label")[0]) === null || _a === void 0 ? void 0 : _a.textContent) || "", width: parseFloat((geom === null || geom === void 0 ? void 0 : geom.getAttribute("width")) || "0"), height: parseFloat((geom === null || geom === void 0 ? void 0 : geom.getAttribute("height")) || "0"), x_C: parseFloat((geom === null || geom === void 0 ? void 0 : geom.getAttribute("x")) || "0"), y_C: parseFloat((geom === null || geom === void 0 ? void 0 : geom.getAttribute("y")) || "0"), borderPoints_X1: 0, borderPoints_Y1: 0, borderPoints_X2: 0, borderPoints_Y2: 0, color: ((_b = cellEl.getElementsByTagName("background")[0]) === null || _b === void 0 ? void 0 : _b.getAttribute("color")) || "#ffffff", border: (geom === null || geom === void 0 ? void 0 : geom.getAttribute("border")) === "true" });
                                parts.push(rect);
                            });
                        });
                        shape = Object.assign(Object.assign({}, baseProps), { width: parseFloat((geometryEl === null || geometryEl === void 0 ? void 0 : geometryEl.getAttribute("width")) || "0"), height: parseFloat((geometryEl === null || geometryEl === void 0 ? void 0 : geometryEl.getAttribute("height")) || "0"), cols: parseInt((geometryEl === null || geometryEl === void 0 ? void 0 : geometryEl.getAttribute("number_of_columns")) || "1"), rows: parseInt((geometryEl === null || geometryEl === void 0 ? void 0 : geometryEl.getAttribute("number_of_rows")) || "1"), parts });
                        break;
                    default:
                        shape = Object.assign({}, baseProps);
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
                var _a, _b, _c, _d, _e;
                const line = {
                    id: edgeEl.getAttribute("id") || "",
                    type: edgeEl.getAttribute("type") || "line",
                    dialect: edgeEl.getAttribute("dialect") || "",
                    info: edgeEl.getAttribute("label") || "",
                    color: extractColor(edgeEl),
                    startArrowType: edgeEl.getAttribute("startArrow"),
                    endArrowType: edgeEl.getAttribute("endArrow"),
                    lineWidth: parseFloat(((_a = edgeEl.getElementsByTagName("edgeStyle")[0]) === null || _a === void 0 ? void 0 : _a.getAttribute("lineWidth")) || "2"),
                    x_C: 0, y_C: 0, borderPoints_X1: 0, borderPoints_Y1: 0, borderPoints_X2: 0, borderPoints_Y2: 0,
                    startX: parseFloat(((_b = edgeEl.getElementsByTagName("lineGeometry")[0]) === null || _b === void 0 ? void 0 : _b.getAttribute("startX")) || "0"),
                    startY: parseFloat(((_c = edgeEl.getElementsByTagName("lineGeometry")[0]) === null || _c === void 0 ? void 0 : _c.getAttribute("startY")) || "0"),
                    endX: parseFloat(((_d = edgeEl.getElementsByTagName("lineGeometry")[0]) === null || _d === void 0 ? void 0 : _d.getAttribute("endX")) || "0"),
                    endY: parseFloat(((_e = edgeEl.getElementsByTagName("lineGeometry")[0]) === null || _e === void 0 ? void 0 : _e.getAttribute("endY")) || "0"),
                    lineConnectionStart: extractConnections(edgeEl, "lineConnectionStart"),
                    lineConnectionEnd: extractConnections(edgeEl, "lineConnectionEnd"),
                    punctuation: edgeEl.getAttribute("punctuation") || "none"
                };
                shapes.push(line);
            });
            return shapes;
        }
        let currentDialect = 'none';
        let dialectButtonClickedFlag = 'none';
        (_h = document.getElementById('formatExport')) === null || _h === void 0 ? void 0 : _h.addEventListener('click', function () {
            logDebug("Add table button clicked");
            exportGraphToFile(objects, "shapes");
        });
        (_j = document.getElementById('formatImport')) === null || _j === void 0 ? void 0 : _j.addEventListener('change', function () {
            var _a;
            try {
                const fileInput = this;
                const file = (_a = fileInput === null || fileInput === void 0 ? void 0 : fileInput.files) === null || _a === void 0 ? void 0 : _a[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        var _a;
                        try {
                            const content = (_a = e.target) === null || _a === void 0 ? void 0 : _a.result;
                            objects = importGraphFromXml(content);
                            console.log('Импортированные объекты:', objects);
                            drawObjects();
                        }
                        catch (error) {
                            console.error('Error processing file content:', error);
                        }
                    };
                    reader.readAsText(file);
                }
            }
            catch (error) {
                console.error('Error reading file:', error);
            }
        });
        function dialectControl(flag, currentDialect_, func) {
            if (currentDialect_ === 'none') {
                currentDialect_ = flag;
                func(currentDialect_);
                console.log("func currentDialect ===", flag, currentDialect_);
            }
            else if (currentDialect_ === flag) {
                func(currentDialect_);
                console.log("func currentDialect ===", flag, currentDialect_);
            }
            else {
                openPopup("Неверный диалект! Выберите другую фигуру", "information");
            }
        }
        // DB dialect
        (_k = document.getElementById('addLineBtnDB')) === null || _k === void 0 ? void 0 : _k.addEventListener('click', function () {
            logDebug("Add line button clicked");
            //console.log("1 - ", currentDialect)
            dialectButtonClickedFlag = "DB";
            dialectControl(dialectButtonClickedFlag, currentDialect, dialectButtonClickedFlag => addLine(dialectButtonClickedFlag));
        });
        (_l = document.getElementById('addTableDB')) === null || _l === void 0 ? void 0 : _l.addEventListener('click', function () {
            logDebug("Add table button clicked");
            dialectButtonClickedFlag = "DB";
            dialectControl(dialectButtonClickedFlag, currentDialect, (dialectButtonClickedFlag) => addTable(dialectButtonClickedFlag));
        });
        // Base dialect
        (_m = document.getElementById('addTable')) === null || _m === void 0 ? void 0 : _m.addEventListener('click', function () {
            logDebug("Add table button clicked");
            dialectButtonClickedFlag = "base";
            dialectControl(dialectButtonClickedFlag, currentDialect, (dialectButtonClickedFlag) => addTable(dialectButtonClickedFlag));
        });
        (_o = document.getElementById('addRectBtn')) === null || _o === void 0 ? void 0 : _o.addEventListener('click', function () {
            logDebug("Add rectangle button clicked");
            dialectButtonClickedFlag = "base";
            dialectControl(dialectButtonClickedFlag, currentDialect, (dialectButtonClickedFlag) => addRect(dialectButtonClickedFlag));
        });
        (_p = document.getElementById('addCircleBtn')) === null || _p === void 0 ? void 0 : _p.addEventListener('click', function () {
            logDebug("Add circle button clicked");
            dialectButtonClickedFlag = "base";
            dialectControl(dialectButtonClickedFlag, currentDialect, (dialectButtonClickedFlag) => addCircle(dialectButtonClickedFlag));
        });
        (_q = document.getElementById('addLineBtn')) === null || _q === void 0 ? void 0 : _q.addEventListener('click', function () {
            logDebug("Add line button clicked");
            dialectButtonClickedFlag = "base";
            dialectControl(dialectButtonClickedFlag, currentDialect, (dialectButtonClickedFlag) => addLine(dialectButtonClickedFlag));
        });
        (_r = document.getElementById('addCloudBtn')) === null || _r === void 0 ? void 0 : _r.addEventListener('click', function () {
            logDebug("Add cloud button clicked");
            dialectButtonClickedFlag = "base";
            dialectControl(dialectButtonClickedFlag, currentDialect, (dialectButtonClickedFlag) => addCloud(dialectButtonClickedFlag));
        });
        (_s = document.getElementById('addStarBtn')) === null || _s === void 0 ? void 0 : _s.addEventListener('click', function () {
            logDebug("Add star button clicked");
            dialectButtonClickedFlag = "base";
            dialectControl(dialectButtonClickedFlag, currentDialect, (dialectButtonClickedFlag) => addStar(dialectButtonClickedFlag));
        });
        //
        (_t = document.getElementById('delShapeBtn')) === null || _t === void 0 ? void 0 : _t.addEventListener('click', function () {
            logDebug("Delete shape button clicked");
            deleteShape();
        });
        (_u = document.getElementById('rotateLeftBtn')) === null || _u === void 0 ? void 0 : _u.addEventListener('click', function () {
            logDebug("Rotate left button clicked");
            rotateSelectedObject(-10);
        });
        (_v = document.getElementById('rotateRightBtn')) === null || _v === void 0 ? void 0 : _v.addEventListener('click', function () {
            logDebug("Rotate right button clicked");
            rotateSelectedObject(10);
        });
        (_w = document.getElementById('deleteItem')) === null || _w === void 0 ? void 0 : _w.addEventListener('click', function () {
            if (selectedObject_buf) {
                deleteShape();
            }
            selectedObject_buf = null;
        });
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Delete') {
                deleteShape();
            }
            selectedObject_buf = null;
        });
        (_x = document.getElementById('rotateLeftItem')) === null || _x === void 0 ? void 0 : _x.addEventListener('click', function () {
            if (selectedObject_buf) {
                rotateSelectedObject(-10);
            }
            selectedObject_buf = null;
            drawObjects();
        });
        (_y = document.getElementById('rotateRightItem')) === null || _y === void 0 ? void 0 : _y.addEventListener('click', function () {
            if (selectedObject_buf) {
                rotateSelectedObject(10);
            }
            selectedObject_buf = null;
            drawObjects();
        });
        (_z = document.getElementById('cycleCheck')) === null || _z === void 0 ? void 0 : _z.addEventListener('click', function () {
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
            }
            else {
                console.log("Циклы не найдены");
            }
        });
        (_0 = document.getElementById('connect_objects')) === null || _0 === void 0 ? void 0 : _0.addEventListener('click', function () {
            logDebug(`connectionObjects button clicked`);
            connectionServ = 1;
            connectionObjects();
        });
        (_1 = document.getElementById('remove_connection')) === null || _1 === void 0 ? void 0 : _1.addEventListener('click', function () {
            logDebug(`remove_connection button clicked`);
            connectionServ = 0;
            removeObjects();
        });
        (_2 = document.getElementById('outgoing_connect')) === null || _2 === void 0 ? void 0 : _2.addEventListener('click', function () {
            logDebug(`outgoingConnectionObjects button clicked`);
            connectionServ = 3;
            connectionObjects();
        });
        (_3 = document.getElementById('remove_outgoing_connection')) === null || _3 === void 0 ? void 0 : _3.addEventListener('click', function () {
            logDebug(`remove_connection button clicked`);
            connectionServ = 4;
            removeObjects();
        });
        (_4 = document.getElementById('additionInfo')) === null || _4 === void 0 ? void 0 : _4.addEventListener('click', function () {
            addInfo(selectedObject_buf);
        });
        document.addEventListener('contextmenu', function (e) {
            e.preventDefault();
            onMouseDown(e);
        });
        (_5 = document.getElementById('insert_img')) === null || _5 === void 0 ? void 0 : _5.addEventListener('click', function () {
            var _a;
            logDebug("Insert img button clicked");
            (_a = document.getElementById('imageInput')) === null || _a === void 0 ? void 0 : _a.click(); // Открываем диалог выбора файлов
        });
        (_6 = document.getElementById('debugInfo')) === null || _6 === void 0 ? void 0 : _6.addEventListener('click', function () {
            logDebug("debugInfo clicked");
            debugHide();
        });
        (_7 = document.getElementById('imageInput')) === null || _7 === void 0 ? void 0 : _7.addEventListener('change', function (event) {
            var _a, _b;
            const file = (_b = (_a = event.target) === null || _a === void 0 ? void 0 : _a.files) === null || _b === void 0 ? void 0 : _b[0];
            if (file && selectedObject_buf) {
                console.log("Выбран файл:", file.name);
                insertionImage(selectedObject_buf, file);
            }
            else {
                console.error("Не выбран объект или файл.");
            }
        });
        canvas.addEventListener('dblclick', function (event) {
            const canvasRect = canvas.getBoundingClientRect();
            const mouseX = event.clientX - canvasRect.left - offsetX;
            const mouseY = event.clientY - canvasRect.top - offsetY;
            const clickedObject = objects.find(obj => {
                switch (obj.type) {
                    case 'rectangle': {
                        const rect = obj;
                        return isPointInRotatedRect(mouseX, mouseY, rect);
                    }
                    case 'circle': {
                        const circle = obj;
                        const dx = mouseX - circle.x_C;
                        const dy = mouseY - circle.y_C;
                        return dx * dx + dy * dy <= circle.radius * circle.radius;
                    }
                    case 'line': {
                        const line = obj;
                        const distStart = Math.sqrt(Math.pow((mouseX - line.startX), 2) + Math.pow((mouseY - line.startY), 2));
                        const distEnd = Math.sqrt(Math.pow((mouseX - line.endX), 2) + Math.pow((mouseY - line.endY), 2));
                        const distToLine = Math.abs((line.endY - line.startY) * mouseX - (line.endX - line.startX) * mouseY +
                            line.endX * line.startY - line.endY * line.startX) /
                            Math.sqrt(Math.pow((line.endY - line.startY), 2) + Math.pow((line.endX - line.startX), 2));
                        return distStart < 10 || distEnd < 10 || distToLine < 10;
                    }
                    case 'star': {
                        const star = obj;
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
                        const cloud = obj;
                        const startX_Cloud = cloud.x_C - cloud.width / 2;
                        const startY_Cloud = cloud.y_C - cloud.height / 2;
                        return mouseX >= startX_Cloud && mouseX <= startX_Cloud + cloud.width &&
                            mouseY >= startY_Cloud && mouseY <= startY_Cloud + cloud.height;
                    }
                    case 'table': {
                        const table = obj;
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
                    const table = clickedObject;
                    const clickedCell = table.parts.find(cell => mouseX >= cell.x_C &&
                        mouseX <= cell.x_C + cell.width &&
                        mouseY >= cell.y_C &&
                        mouseY <= cell.y_C + cell.height);
                    if (clickedCell) {
                        createTextInput(clickedCell, mouseX, mouseY);
                    }
                }
                else {
                    createTextInput(clickedObject, mouseX, mouseY);
                }
            }
        });
        function createTextInput(obj, x, y) {
            const mainLayout = document.getElementById("main-layout");
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
                    const rect = obj;
                    input.style.left = `${canvas.offsetLeft + rect.x_C + offsetX}px`;
                    input.style.top = `${canvas.offsetTop + rect.y_C + rect.height / 3 + offsetY + difference.bottom - difference.top}px`;
                    input.style.width = `${rect.width + 100}px`;
                    /*input.style.width = 'none';*/
                    input.style.height = `${rect.height / 3}px`;
                    console.log(canvas.offsetLeft, canvas.offsetTop, rect.y_C, rect.x_C, x, y, canvas.offsetLeft + rect.x_C, canvas.offsetTop + rect.y_C, canvas.offsetLeft - rect.x_C, canvas.offsetTop - rect.y_C);
                    break;
                case 'circle':
                    const circle = obj;
                    input.style.left = `${canvas.offsetLeft + circle.x_C - circle.radius / 2 + offsetX}px`;
                    input.style.top = `${canvas.offsetTop + circle.y_C - circle.radius / 3 + offsetY + difference.bottom - difference.top}px`;
                    input.style.width = `${circle.radius}px`;
                    input.style.height = `${circle.radius * 2 / 3}px`;
                    input.style.textAlign = 'center';
                    break;
                case 'line':
                    const line = obj;
                    input.style.left = `${canvas.offsetLeft + (line.startX + line.endX) / 2 - 30 + offsetX}px`;
                    input.style.top = `${canvas.offsetTop + (line.startY + line.endY) / 2 - 10 + offsetY + difference.bottom - difference.top}px`;
                    input.style.width = `60px`;
                    input.style.height = `20px`;
                    input.style.textAlign = 'center';
                    break;
                case 'star':
                    const star = obj;
                    input.style.left = `${canvas.offsetLeft + star.x_C - star.rad / 2 + offsetX}px`;
                    input.style.top = `${canvas.offsetTop + star.y_C - star.rad / 3 + offsetY + difference.bottom - difference.top}px`;
                    input.style.width = `${star.rad}px`;
                    input.style.height = `${star.rad / 3}px`;
                    input.style.textAlign = 'center';
                    break;
                case 'cloud':
                    const cloud = obj;
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
            input.addEventListener('blur', saveText); // Потеря фокуса
            input.addEventListener('keydown', function (e) {
                if (e.key === 'Enter')
                    saveText();
            });
        }
        function insertionImage(selectedObject_buf, file) {
            const reader = new FileReader();
            const img = new Image();
            const shape = objects.find(shape => shape.id === selectedObject_buf.id);
            if (!shape) {
                console.error("Shape not found");
                return;
            }
            // Когда изображение будет загружено, отрисовываем его внутри фигуры
            reader.onload = function (event) {
                var _a;
                img.src = (_a = event.target) === null || _a === void 0 ? void 0 : _a.result;
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
        function drawLineWithArrow(ctx, startX, startY, endX, endY, color, arrowPosition = 'none', headLength = 10, startCardinality = 'none', endCardinality = 'none') {
            // Вычисляем угол наклона линии
            const angle = Math.atan2(endY - startY, endX - startX);
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = color;
            ctx.stroke();
            const drawHead = (x, y, directionAngle) => {
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
            const drawBar = (x, y, angle) => {
                const dx = Math.cos(angle + Math.PI / 2) * 6;
                const dy = Math.sin(angle + Math.PI / 2) * 6;
                ctx.beginPath();
                ctx.moveTo(x - dx, y - dy);
                ctx.lineTo(x + dx, y + dy);
                ctx.stroke();
            };
            const drawCircle = (x, y) => {
                ctx.beginPath();
                ctx.arc(x, y, 5, 0, Math.PI * 2);
                ctx.stroke();
            };
            const drawCrowFoot = (x, y, angle) => {
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
            const drawMarker = (type, x, y, angle) => {
                if (!type)
                    return;
                if (type === '-|->')
                    drawBar(x, y, angle);
                if (type === '-0->') {
                    drawCircle(x, y);
                }
                if (type === '-*->') {
                    drawCrowFoot(x + Math.cos(angle) * 10, y + Math.sin(angle) * 10, angle);
                }
            };
            const startOffsetX = startX + Math.cos(angle) * 8;
            const startOffsetY = startY + Math.sin(angle) * 8;
            const endOffsetX = endX - Math.cos(angle) * 8;
            const endOffsetY = endY - Math.sin(angle) * 8;
            if (startCardinality !== ">") {
                drawMarker(startCardinality, startOffsetX, startOffsetY, angle);
            }
            else {
                drawHead(startX, startY, angle + Math.PI);
            }
            if (endCardinality !== ">") {
                drawMarker(endCardinality, endOffsetX, endOffsetY, angle + Math.PI);
            }
            else {
                drawHead(endX, endY, angle);
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
            }
            else {
                debug_element.style.display = 'none';
            }
        }
        function getObjectCenter(obj) {
            switch (obj.type) {
                case 'rectangle':
                    const rect = obj;
                    return [rect.x_C + rect.width / 2, rect.y_C + rect.height / 2];
                case 'circle':
                    const circle = obj;
                    return [circle.x_C, circle.y_C];
                case 'line':
                    const line = obj;
                    return [(line.startX + line.endX) / 2, (line.startY + line.endY) / 2];
                case 'star':
                    const star = obj;
                    return [star.x_C, star.y_C];
                case 'cloud':
                    const cloud = obj;
                    return [cloud.x_C, cloud.y_C];
                default:
                    return [0, 0];
            }
        }
        function addDirectedLink(fromObj, toObj) {
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
        function removeDirectedLink(fromObj, toObj) {
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
        function addLink(obj1, obj2) {
            if (!obj1.linkedObjects)
                obj1.linkedObjects = [];
            if (!obj2.linkedObjects)
                obj2.linkedObjects = [];
            if (!obj1.linkedObjects.includes(obj2.id)) {
                obj1.linkedObjects.push(obj2.id);
            }
            if (!obj2.linkedObjects.includes(obj1.id)) {
                obj2.linkedObjects.push(obj1.id);
            }
        }
        // Функция для удаления связи между объектами
        function removeLink(obj1, obj2) {
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
        let allConnectors = [];
        function updateConnectors(obj) {
            // Если у объекта уже есть коннекторы, сохраняем их ID
            const existingConnectors = obj.connectors || [];
            const getConnectorId = (type) => {
                const existing = existingConnectors.find(connector => connector.type === type);
                return existing ? existing.id : generateRandomId(16);
            };
            let connectors = [];
            switch (obj.type) {
                case 'rectangle': {
                    const rect = obj;
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
                    const circle = obj;
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
                    const line = obj;
                    // Для линии удобно использовать ее концевые точки в качестве коннекторов
                    connectors = [
                        { id: getConnectorId('start'), x: line.startX, y: line.startY, type: 'start' },
                        { id: getConnectorId('end'), x: line.endX, y: line.endY, type: 'end' }
                    ];
                    break;
                }
                case 'star': {
                    const star = obj;
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
                    const cloud = obj;
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
                    allConnectors[index] = Object.assign(Object.assign({}, allConnectors[index]), { x: connector.x, y: connector.y, type: connector.type });
                }
                else {
                    // Если коннектор отсутствует, добавляем его
                    allConnectors.push({ id: connector.id, x: connector.x, y: connector.y, type: connector.type });
                }
            });
        }
        // Создание объектов
        function objectAdditionPreprocessing(obj, complex = false) {
            updateConnectors(obj);
            selectedObject_buf = obj;
            selectedObject_buf.selectionMarker = true;
            switch (obj.type) {
                case 'rectangle':
                    drawRect(selectedObject_buf, ctx);
                    break;
                case 'circle':
                    drawCircle(selectedObject_buf, ctx);
                    break;
                case 'line':
                    drawLine(selectedObject_buf, ctx);
                    break;
                case 'star':
                    drawStar(selectedObject_buf, ctx);
                    break;
                case 'cloud':
                    drawCloud(selectedObject_buf, ctx);
                    break;
                default:
                    console.warn("Unknown shape type:", obj.type);
                    return null;
            }
            selectedObject_buf.selectionMarker = false;
            if (!complex)
                objects.push(selectedObject_buf);
            selectedObject_buf = null;
            if (!complex)
                drawObjects();
        }
        function addRect(dialect = "base", x_C = canvas.width / 2, y_C = canvas.height / 2, width = 50, height = 50, color = getRandomColor(), rotation = 0, border = false) {
            const newRect = {
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
        }
        function addCircle(dialect = "base", x_C = canvas.width / 2, y_C = canvas.height / 2, radius = 25, color = getRandomColor(), rotation = 0) {
            const newCircle = {
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
        }
        function addLine(dialect = "base", startX = canvas.width / 2 - 50, startY = canvas.height / 2, endX = canvas.width / 2 + 50, endY = canvas.height / 2, color = getRandomColor(), rotation = 0, arrowDirection = "none", punctuation = "none", lineWidth = 2, startArrowType = 'none', endArrowType = 'none') {
            const centerX = (startX + endX) / 2;
            const centerY = (startY + endY) / 2;
            const newLine = {
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
        }
        function addStar(dialect = "base", x_C = canvas.width / 2, y_C = canvas.height / 2, rad = 100, amount_points = 6, m = 0.5, color = getRandomColor(), rotation = 0) {
            const newStar = {
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
        }
        function addCloud(dialect = "base", x_C = canvas.width / 2, y_C = canvas.height / 2, width = 200, height = 120, color = getRandomColor(), rotation = 0) {
            const newCloud = {
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
        }
        function addTable(dialect = "base", x_C = canvas.width / 2, y_C = canvas.height / 2, rows = 3, // Количество строк
        cols = 3, // Количество столбцов
        cellWidth = 50, cellHeight = 50, color = getRandomColor(), rotation = 0) {
            const newTable = {
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
                    const cell = {
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
                    newTable.parts.push(cell);
                }
            }
            objects.push(newTable);
            drawObjects();
        }
        function drawTable(table, ctx) {
            table.parts.forEach(part => {
                drawRect(part, ctx);
                updateConnectors(part);
                enteringText(part);
                //console.log("draw")
            });
            //console.log("table border upd")
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
        function drawRect(rect, ctx) {
            const colorWithAlpha = hexToRgba(rect.color, rect.colorAlpha);
            ctx.fillStyle = colorWithAlpha;
            ctx.fillRect(rect.x_C, rect.y_C, rect.width, rect.height);
            if (rect.image) {
                ctx.drawImage(rect.image, rect.x_C, rect.y_C, rect.width, rect.height);
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
                ctx.setLineDash([5, 3]); // Длина штриха и промежутка
                ctx.strokeRect(rect.x_C, rect.y_C, rect.width, rect.height);
                ctx.setLineDash([]); // Сбрасываем пунктир
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
        function drawLine(line, ctx) {
            const colorWithAlpha = hexToRgba(line.color, line.colorAlpha);
            if (line.punctuation === "none") {
                ctx.beginPath();
                ctx.moveTo(line.startX, line.startY);
                ctx.lineTo(line.endX, line.endY);
                ctx.strokeStyle = colorWithAlpha;
                ctx.lineWidth = line.lineWidth;
                ctx.stroke();
            }
            else {
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
                // Вычисляем ширину и высоту прямоугольника
                const rectWidth = Math.abs(line.endX - line.startX);
                const rectHeight = Math.abs(line.endY - line.startY);
                // Рисуем пунктирный прямоугольник вокруг линии
                ctx.strokeRect(rectX, rectY, rectWidth, rectHeight);
                ctx.setLineDash([]);
                // Обновляем координаты крайних точек прямоугольника
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
        function drawCircle(circle, ctx) {
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
                ctx.setLineDash([5, 3]); // Длина штриха и промежутка
                ctx.strokeRect(circle.x_C - circle.radius - 2, circle.y_C - circle.radius - 2, circle.radius * 2 + 4, circle.radius * 2 + 4);
                ctx.setLineDash([]); // Сбрасываем пунктир
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
        function drawStar(star, ctx) {
            let x_C = star.x_C;
            let y_C = star.y_C;
            let rad = star.rad;
            let amount_points = star.amount_points;
            let m = star.m;
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
                ctx.setLineDash([]); // Сбрасываем пунктир
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
        function drawCloud(cloud, ctx) {
            let x_C = cloud.x_C;
            let y_C = cloud.y_C;
            let width = cloud.width;
            let height = cloud.height;
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
            ctx.bezierCurveTo(points[0].x, startY_Cloud, points[1].x, startY_Cloud, points[1].x, points[1].y);
            ctx.bezierCurveTo(startX_Cloud + width, points[1].y, startX_Cloud + width, points[2].y, points[2].x, points[2].y);
            ctx.bezierCurveTo(points[2].x, startY_Cloud + height, points[3].x, startY_Cloud + height, points[3].x, points[3].y);
            ctx.bezierCurveTo(startX_Cloud, points[3].y, startX_Cloud, points[0].y, points[0].x, points[0].y);
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
                ctx.setLineDash([]); // Сбрасываем пунктир
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
        function removeReferences(shapeToRemove) {
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
            var _a, _b, _c, _d;
            console.log(objects);
            if (selectedObjectMass.length > 0) {
                // Удаляем ссылки на удаляемые фигуры из других объектов
                for (const shapeToRemove of selectedObjectMass) {
                    removeReferences(shapeToRemove);
                    const indexToRemove = objects.indexOf(shapeToRemove);
                    //const indexToRemove = selectedObjectMass.indexOf(shapeToRemove);
                    if (indexToRemove !== -1) {
                        if (shapeToRemove.type === 'line') {
                            const lineToRemove = shapeToRemove;
                            for (const obj of objects) {
                                obj.lineConnectionStart = ((_a = obj.lineConnectionStart) === null || _a === void 0 ? void 0 : _a.filter(conn => conn.id_shape !== lineToRemove.id)) || [];
                                obj.lineConnectionEnd = ((_b = obj.lineConnectionEnd) === null || _b === void 0 ? void 0 : _b.filter(conn => conn.id_shape !== lineToRemove.id)) || [];
                            }
                        }
                        else if (shapeToRemove.type === "table") {
                            const table = shapeToRemove;
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
                        const lineToRemove = shapeToRemove;
                        for (const obj of objects) {
                            obj.lineConnectionStart = ((_c = obj.lineConnectionStart) === null || _c === void 0 ? void 0 : _c.filter(conn => conn.id_shape !== lineToRemove.id)) || [];
                            obj.lineConnectionEnd = ((_d = obj.lineConnectionEnd) === null || _d === void 0 ? void 0 : _d.filter(conn => conn.id_shape !== lineToRemove.id)) || [];
                        }
                    }
                    else if (shapeToRemove.type === "table") {
                        const table = selectedObject_buf;
                        table.parts.forEach(part => removeReferences(part));
                        objects = objects.filter(obj => !table.parts.includes(obj));
                    }
                    objects.splice(indexToRemove, 1);
                    drawObjects();
                    selectedObject_buf = null;
                }
            }
            else {
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
        // Управление объектами
        function rotateSelectedObject(angle) {
            if (selectedObject_buf) {
                selectedObject_buf.rotation = (selectedObject_buf.rotation || 0) + angle;
                logDebug(`Rotated object: ${JSON.stringify(selectedObject_buf)}`);
                updateConnectors(selectedObject_buf);
                drawObjects();
            }
        }
        function addInfo(selectedObject_buf_) {
            showPrompt("Введите текст:");
            selectedObject_buf_.info = userInput;
        }
        function pointInPolygon(x, y, points) {
            let inside = false;
            for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
                const xi = points[i].x, yi = points[i].y;
                const xj = points[j].x, yj = points[j].y;
                const intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
                if (intersect)
                    inside = !inside;
            }
            return inside;
        }
        function selectionCheck(selectedObject_buf_connect_, selectedObject_buf_, connectionServ_) {
            if (selectedObject_buf_connect_ && connectionServ_ == 1) {
                logDebug(`Selected object to connect_mouse_down - (${JSON.stringify(selectedObject_buf_connect_)})`);
                addLink(selectedObject_buf_connect_, selectedObject_buf_);
                selectedObject_buf_connect_ = null;
            }
            else if (selectedObject_buf_connect_ && connectionServ_ == 0) {
                logDebug(`Selected object to remove_mouse_down - (${JSON.stringify(selectedObject_buf_connect_)})`);
                removeLink(selectedObject_buf_connect_, selectedObject_buf_);
                selectedObject_buf_connect_ = null;
            }
            else if (selectedObject_buf_connect_ && connectionServ_ == 3) {
                logDebug(`Selected object to connect_mouse_down - (${JSON.stringify(selectedObject_buf_connect_)})`);
                addDirectedLink(selectedObject_buf_connect_, selectedObject_buf_);
                selectedObject_buf_connect_ = null;
            }
            else if (selectedObject_buf_connect_ && connectionServ_ == 4) {
                logDebug(`Selected object to remove_mouse_down - (${JSON.stringify(selectedObject_buf_connect_)})`);
                removeDirectedLink(selectedObject_buf_connect_, selectedObject_buf_);
                selectedObject_buf_connect_ = null;
            }
            else if (selectedObject_buf_connect_ && connectionServ_ == 5) {
                logDebug(`Selected object to remove_mouse_down - (${JSON.stringify(selectedObject_buf_connect_)})`);
                londWayCheck(objects, selectedObject_buf_connect_, selectedObject_buf_);
                selectedObject_buf_connect_ = null;
            }
            return selectedObject_buf_connect_;
        }
        function londWayCheck(objects_, selectedObject_buf_connect_, selectedObject_buf_) {
            logDebug(`londWayCheck - (${JSON.stringify(selectedObject_buf_connect_)})`);
            logDebug(`londWayCheck - (${JSON.stringify(selectedObject_buf_)})`);
            logDebug(`londWayCheck - (${JSON.stringify(objects_)})`);
            const shortestPath = bfsShortestPath(objects_, selectedObject_buf_connect_.id, selectedObject_buf_.id);
            logDebug(`londWayCheck - (${JSON.stringify(selectedObject_buf_connect_)})`);
            if (shortestPath) {
                console.log('Кратчайший путь найден:', shortestPath);
            }
            else {
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
        function tableObjectCheck(selectedObject_buf_) {
            if (selectedObject_buf_) {
                const table = createVerticalTable(selectedObject_buf_);
                if (container) {
                    while (container.firstChild) {
                        container.removeChild(container.firstChild);
                    }
                }
                container === null || container === void 0 ? void 0 : container.appendChild(table);
            }
        }
        function additionGrid(obj) {
            const x_grid1 = Math.floor(obj.borderPoints_X1 / canvas.width);
            const y_grid1 = Math.floor(obj.borderPoints_Y1 / canvas.height);
            const x_grid2 = Math.floor(obj.borderPoints_X2 / canvas.width);
            const y_grid2 = Math.floor(obj.borderPoints_Y2 / canvas.height);
            if (x_grid1 < 0 || y_grid1 < 0) {
                const newWidth = canvas.width * Math.abs(x_grid1);
                const newHeight = canvas.height * Math.abs(y_grid1);
                drawGrid(gridCtx, canvas.width + newWidth, canvas.height + newHeight, 20);
                logDebug(`additionGrid ${(canvas.width + newWidth)}, ${(canvas.height + newHeight)}`);
            }
            if (x_grid2 > 0 || y_grid2 > 0) {
                const newWidth = canvas.width * x_grid2;
                const newHeight = canvas.height * y_grid2;
                drawGrid(gridCtx, canvas.width + newWidth, canvas.height + newHeight, 20);
            }
        }
        function isPointInRotatedRect(mouseX, mouseY, rect) {
            // Центр вращения
            const centerX = rect.x_C + rect.width / 2;
            const centerY = rect.y_C + rect.height / 2;
            // Преобразуем координаты мыши обратно, чтобы исключить поворот фигуры
            const angle = -(rect.rotation || 0) * Math.PI / 180; // Отрицательный угол для обратного вращения
            const rotatedX = Math.cos(angle) * (mouseX - centerX) - Math.sin(angle) * (mouseY - centerY) + centerX;
            const rotatedY = Math.sin(angle) * (mouseX - centerX) + Math.cos(angle) * (mouseY - centerY) + centerY;
            // Теперь проверяем, находится ли преобразованная точка внутри исходного прямоугольника без поворота
            return (rotatedX >= rect.x_C &&
                rotatedX <= rect.x_C + rect.width &&
                rotatedY >= rect.y_C &&
                rotatedY <= rect.y_C + rect.height);
        }
        let help_X = 0;
        let help_Y = 0;
        let help_Xm = 0;
        let help_Ym = 0;
        function clickedObjectPreprocessing(objects_, obj_, mouseX, mouseY, foundObject_) {
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
        function leftButtonDown(e, mouseX, mouseY) {
            //console.log("so - ", selectedObject);
            //console.log("sob - ", selectedObject_buf);
            //console.log("obj - ", objects)
            //console.log("som - ", selectedObjectMass)
            console.log("sob - ", selectedObject_buf);
            logDebug("mouse_down");
            let foundObject = false;
            hideContextMenu();
            if (highlight.length != 0) {
                //console.log("i am here");
                logDebug(`highlight - (${highlight})`);
                highlight = [];
            }
            help_X = mouseX;
            help_Y = mouseY;
            help_Xm = mouseX;
            help_Ym = mouseY;
            //logDebug(`onMouseDown - ${selectionStartX}, ${selectionStartY}, ${selectionEndX}, ${selectionEndY}`);
            for (let i = objects.length - 1; i >= 0; i--) {
                const obj = objects[i];
                if (obj.type === "table") {
                    const table = obj;
                    if (mouseX >= table.x_C &&
                        mouseX <= table.x_C + table.width &&
                        mouseY >= table.y_C &&
                        mouseY <= table.y_C + table.height) {
                        if (!table.parts.some(part => selectedObjectMass.some(sel => sel.id === part.id))) {
                            selectedObjectMass = [];
                        }
                        if (!selectedObjectMass.some(object => object.id === table.id)) {
                            for (let i = objects.length - 1; i >= 0; i--) {
                                objects[i].selectionMarker = false;
                                if (objects[i].type === "table") {
                                    objects[i].parts.forEach(part => part.selectionMarker = false);
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
                            selectedObjectMass.push(table);
                        }
                        selectedObject = table;
                        selectedObject_buf = table;
                        startX = mouseX - table.x_C;
                        startY = mouseY - table.y_C;
                        drawObjects();
                    }
                }
                else if (obj.type === 'rectangle') {
                    const rect = obj;
                    if ( /*mouseX >= rect.x_C && mouseX <= rect.x_C + rect.width && mouseY >= rect.y_C && mouseY <= rect.y_C + rect.height*/isPointInRotatedRect(mouseX, mouseY, rect)) {
                        foundObject = clickedObjectPreprocessing(objects, obj, mouseX, mouseY, foundObject);
                        break;
                    }
                }
                else if (obj.type === 'circle') {
                    const circle = obj;
                    const dx = mouseX - circle.x_C;
                    const dy = mouseY - circle.y_C;
                    if (dx * dx + dy * dy <= circle.radius * circle.radius) {
                        foundObject = clickedObjectPreprocessing(objects, obj, mouseX, mouseY, foundObject);
                        break;
                    }
                }
                else if (obj.type === 'line') {
                    const line = obj;
                    const distStart = Math.sqrt(Math.pow((mouseX - line.startX), 2) + Math.pow((mouseY - line.startY), 2));
                    const distEnd = Math.sqrt(Math.pow((mouseX - line.endX), 2) + Math.pow((mouseY - line.endY), 2));
                    const distToLine = Math.abs((line.endY - line.startY) * mouseX - (line.endX - line.startX) * mouseY + line.endX * line.startY - line.endY * line.startX) /
                        Math.sqrt(Math.pow((line.endY - line.startY), 2) + Math.pow((line.endX - line.startX), 2));
                    if (distStart < 5 || distEnd < 5 || distToLine < 10) {
                        for (let i = objects.length - 1; i >= 0; i--) {
                            objects[i].selectionMarker = false;
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
                        }
                        else if (distEnd < 5) {
                            selectedLineEnd = true;
                            startX = mouseX - line.endX;
                            startY = mouseY - line.endY;
                            logDebug(`Line end point selected`);
                        }
                        else if (distToLine < 10) {
                            selectedLineMid = true;
                            startX = mouseX - line.x_C;
                            startY = mouseY - line.y_C;
                            logDebug(`Line body selected`);
                        }
                    }
                }
                else if (obj.type === 'star') {
                    const star = obj;
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
                }
                else if (obj.type === 'cloud') {
                    const cloud = obj;
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
                        objects[i].parts.forEach(part => part.selectionMarker = false);
                    }
                }
                selectedObjectMass = [];
                isSelecting = true;
                selectionStartX = e.clientX - canvas.offsetLeft;
                selectionStartY = e.clientY - canvas.offsetTop;
                selectionEndX = e.clientX - canvas.offsetLeft;
                selectionEndY = e.clientY - canvas.offsetTop;
                //console.log("now is selecting");
            }
            else { // если клик был сделан по объекту не яляющимся частью группы выделенных, то чистим группу выделенных (не считая таблицы)
                console.log("so, sob, sm - ", selectedObject, selectedObject_buf, selectedObjectMass);
                //console.log("logic check - selectedObjectMass.length > 0 && !selectedObjectMass.some(selObj => selObj.id === selectedObject_buf.id) && selectedObject_buf.type !== table", selectedObjectMass.length > 0, !selectedObjectMass.some(selObj => selObj.id === selectedObject_buf.id), selectedObject_buf.type !== 'table')
                if (selectedObjectMass.length > 0 && !selectedObjectMass.some(selObj => selObj.id === selectedObject_buf.id) && selectedObject_buf.type !== 'table') {
                    selectedObjectMass = [];
                    for (let i = objects.length - 1; i >= 0; i--) {
                        if (objects[i].type === 'table') {
                            objects[i].selectionMarker = false;
                            objects[i].parts.forEach(part => part.selectionMarker = false);
                        }
                    }
                }
                if (selectedObjectMass.length > 0 && selectedObjectMass.every(selObj => objects.some(obj => obj.type === 'table' &&
                    obj.parts.includes(selObj)))) {
                    objects.forEach(obj => {
                        if (obj.type !== 'table' || !selectedObjectMass.every(sel => obj.parts.includes(sel))) {
                            obj.selectionMarker = false;
                        }
                    });
                }
                console.log("foundO true");
            }
            drawObjects();
            if (selectedObject_buf && selectedObject_buf.connectors) {
                activeConnector = selectedObject_buf.connectors.find(connector => {
                    return (mouseX >= connector.x - 5 &&
                        mouseX <= connector.x + 5 &&
                        mouseY >= connector.y - 5 &&
                        mouseY <= connector.y + 5);
                });
            }
            //console.log("status check - ", foundObject, selectedObject, )
        }
        function rigtButtonDown(e, mouseX, mouseY) {
            for (let i = objects.length - 1; i >= 0; i--) {
                const obj = objects[i];
                if (obj.type === "table") {
                    const table = obj;
                    if (mouseX >= table.x_C &&
                        mouseX <= table.x_C + table.width &&
                        mouseY >= table.y_C &&
                        mouseY <= table.y_C + table.height) {
                        selectedObject_buf = table;
                        startX = mouseX - table.x_C;
                        startY = mouseY - table.y_C;
                        drawObjects();
                        showContextMenu(e.clientX, e.clientY);
                    }
                }
                else if (obj.type === 'rectangle') {
                    const rect = obj;
                    if ( /*mouseX >= rect.x_C && mouseX <= rect.x_C + rect.width && mouseY >= rect.y_C && mouseY <= rect.y_C + rect.height*/isPointInRotatedRect(mouseX, mouseY, rect)) {
                        selectedObject_buf = rect;
                        startX = mouseX - rect.x_C;
                        startY = mouseY - rect.y_C;
                        drawObjects();
                        showContextMenu(e.clientX, e.clientY);
                        logDebug(`Selected rectangle: ${JSON.stringify(rect)}`);
                        break;
                    }
                }
                else if (obj.type === 'circle') {
                    const circle = obj;
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
                }
                else if (obj.type === 'line') {
                    const line = obj;
                    // Simplified line hit detection for example purposes
                    const distStart = Math.sqrt(Math.pow((mouseX - line.startX), 2) + Math.pow((mouseY - line.startY), 2));
                    const distEnd = Math.sqrt(Math.pow((mouseX - line.endX), 2) + Math.pow((mouseY - line.endY), 2));
                    const distToLine = Math.abs((line.endY - line.startY) * mouseX - (line.endX - line.startX) * mouseY + line.endX * line.startY - line.endY * line.startX) /
                        Math.sqrt(Math.pow((line.endY - line.startY), 2) + Math.pow((line.endX - line.startX), 2));
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
                }
                else if (obj.type === 'star') {
                    const star = obj;
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
                }
                else if (obj.type === 'cloud') {
                    const cloud = obj;
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
        function scrollingButtonDown(e, mouseX, mouseY) {
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
                        const rect = obj;
                        return startX >= rect.x_C && startX <= rect.x_C + rect.width && startY >= rect.y_C && startY <= rect.y_C + rect.height;
                    case 'circle':
                        const circle = obj;
                        const dx = startX - circle.x_C;
                        const dy = startY - circle.y_C;
                        return dx * dx + dy * dy <= circle.radius * circle.radius;
                    case 'line':
                        const line = obj;
                        const length = Math.sqrt(Math.pow((line.endX - line.startX), 2) + Math.pow((line.endY - line.startY), 2));
                        const dotProduct = ((startX - line.startX) * (line.endX - line.startX) + (startY - line.startY) * (line.endY - line.startY)) / Math.pow(length, 2);
                        const closestX = line.startX + dotProduct * (line.endX - line.startX);
                        const closestY = line.startY + dotProduct * (line.endY - line.startY);
                        const distX = startX - closestX;
                        const distY = startY - closestY;
                        const distance = Math.sqrt(distX * distX + distY * distY);
                        return distance <= 10;
                    case 'star':
                        const star = obj;
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
                        const cloud = obj;
                        let startX_Cloud = cloud.x_C - cloud.width / 2;
                        let startY_Cloud = cloud.y_C - cloud.height / 2;
                        return startX >= startX_Cloud && startX <= startX_Cloud + cloud.width && startY >= startY_Cloud && startY <= startY_Cloud + cloud.height;
                    default:
                        return false;
                }
            }) || null;
            drawObjects();
        }
        function selectionBoxObjects(x_s, y_s, w_e, h_e) {
            // Очищаем массив выбранных объектов перед каждой новой проверкой
            selectedObject = null;
            selectedObject_buf = null;
            for (let i = objects.length - 1; i >= 0; i--) {
                objects[i].selectionMarker = false;
                if (objects[i].type === "table") {
                    objects[i].parts.forEach(part => part.selectionMarker = false);
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
                if (objX2 >= selectionBoxX1 &&
                    objX1 <= selectionBoxX2 &&
                    objY2 >= selectionBoxY1 &&
                    objY1 <= selectionBoxY2) {
                    // Если объект попадает в поле выделения, добавляем его в массив выбранных объектов
                    obj.selectionMarker = true;
                    selectedObjectMass.push(obj);
                    if (obj.type === "table") {
                        const table = obj;
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
        function drawSelectionBox() {
            const rect = canvas.getBoundingClientRect();
            logDebug("drawSelectionBox");
            ctx.setLineDash([5, 3]); // Делаем линию пунктирной
            ctx.strokeStyle = 'rgba(0, 120, 255, 0.7)';
            ctx.lineWidth = 2;
            let x = Math.min(selectionStartX, selectionEndX) - rect.left;
            let y = Math.min(selectionStartY, selectionEndY) - rect.top;
            let w = Math.abs(selectionEndX - selectionStartX);
            let h = Math.abs(selectionEndY - selectionStartY);
            ctx.strokeRect(x, y, w, h);
            ctx.setLineDash([]);
            // Пересчет выделенных объектов
            selectionBoxObjects(selectionStartX - rect.left, selectionStartY - rect.top, selectionEndX - rect.left, selectionEndY - rect.top);
        }
        function onMouseDown(e) {
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
            }
            else if (mouse_meaning == 2 /*&& selectedObject_buf != null*/ && mouse_meaning_check != 1) { // тут селект объект равен нулю
                rigtButtonDown(e, mouseX, mouseY);
            }
            else if (mouse_meaning_check === 1) {
                scrollingButtonDown(e, mouseX, mouseY);
            }
        }
        function isLineEndpointNearConnector_Start(line, connectors, threshold = 5) {
            var _a, _b, _c, _d;
            const calculateDistance = (x1, y1, x2, y2) => Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));
            let previousConnection = (_a = line.lineConnectionStart) === null || _a === void 0 ? void 0 : _a[0]; // Сохраняем предыдущее соединение
            let isConnected = false;
            for (const connector of connectors) {
                if (calculateDistance(line.startX, line.startY, connector.x, connector.y) <= threshold) {
                    isConnected = true;
                    line.startX = connector.x;
                    line.startY = connector.y;
                    for (const obj of objects) {
                        if (obj.id !== line.id && ((_b = obj.connectors) === null || _b === void 0 ? void 0 : _b.some(conn => conn.id === connector.id))) {
                            obj.lineConnectionStart = obj.lineConnectionStart || [];
                            line.lineConnectionStart = line.lineConnectionStart || [];
                            // Удаляем старое соединение, если линия была прикреплена к другому объекту
                            if (previousConnection && previousConnection.id_con !== connector.id) {
                                const previousObj = objects.find(o => o.id === previousConnection.id_shape);
                                if (previousObj) {
                                    previousObj.lineConnectionStart = ((_c = previousObj.lineConnectionStart) === null || _c === void 0 ? void 0 : _c.filter(entry => entry.id_shape !== line.id)) || [];
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
                    previousObj.lineConnectionStart = ((_d = previousObj.lineConnectionStart) === null || _d === void 0 ? void 0 : _d.filter(entry => entry.id_shape !== line.id)) || [];
                }
                line.lineConnectionStart = [];
            }
        }
        function isLineEndpointNearConnector_End(line, connectors, threshold = 5) {
            var _a, _b, _c, _d;
            const calculateDistance = (x1, y1, x2, y2) => Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));
            let previousConnection = (_a = line.lineConnectionEnd) === null || _a === void 0 ? void 0 : _a[0]; // Сохраняем предыдущее соединение
            let isConnected = false;
            for (const connector of connectors) {
                if (calculateDistance(line.endX, line.endY, connector.x, connector.y) <= threshold) {
                    isConnected = true;
                    line.endX = connector.x;
                    line.endY = connector.y;
                    for (const obj of objects) {
                        if (obj.id !== line.id && ((_b = obj.connectors) === null || _b === void 0 ? void 0 : _b.some(conn => conn.id === connector.id))) {
                            obj.lineConnectionEnd = obj.lineConnectionEnd || [];
                            line.lineConnectionEnd = line.lineConnectionEnd || [];
                            // Удаляем старое соединение, если линия была прикреплена к другому объекту
                            if (previousConnection && previousConnection.id_con !== connector.id) {
                                const previousObj = objects.find(o => o.id === previousConnection.id_shape);
                                if (previousObj) {
                                    previousObj.lineConnectionEnd = ((_c = previousObj.lineConnectionEnd) === null || _c === void 0 ? void 0 : _c.filter(entry => entry.id_shape !== line.id)) || [];
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
                    previousObj.lineConnectionEnd = ((_d = previousObj.lineConnectionEnd) === null || _d === void 0 ? void 0 : _d.filter(entry => entry.id_shape !== line.id)) || [];
                }
                line.lineConnectionEnd = [];
            }
        }
        function removeConnectionOnLineMove(line, connectors, threshold = 10) {
            var _a, _b;
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
                    line.lineConnectionStart = ((_a = line.lineConnectionStart) === null || _a === void 0 ? void 0 : _a.filter(entry => entry.id_con !== connector.id)) || [];
                    line.lineConnectionEnd = ((_b = line.lineConnectionEnd) === null || _b === void 0 ? void 0 : _b.filter(entry => entry.id_con !== connector.id)) || [];
                }
            }
        }
        function pointToSegmentDistance(x0, y0, x1, y1, x2, y2) {
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
            }
            else if (param > 1) {
                xx = x2;
                yy = y2;
            }
            else {
                xx = x1 + param * C;
                yy = y1 + param * D;
            }
            const dx = x0 - xx;
            const dy = y0 - yy;
            return Math.sqrt(dx * dx + dy * dy);
        }
        function rectMoving(rect, mouseX, mouseY) {
            if (activeConnector) {
                switch (activeConnector.type) {
                    case 'left':
                        // Изменяем ширину и смещаем объект, если двигаем левый коннектор
                        const deltaXLeft = rect.x_C - mouseX;
                        rect.width += deltaXLeft;
                        rect.x_C = mouseX; // Двигаем левый край фигуры
                        // Если ширина стала отрицательной, меняем направление (делаем фигуру перевёрнутой)
                        if (rect.width <= 0) {
                            rect.x_C += rect.width;
                            rect.width = Math.abs(rect.width);
                            activeConnector.type = 'right'; // Меняем тип активного коннектора
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
            }
            else {
                rect.x_C = mouseX - startX;
                rect.y_C = mouseY - startY;
            }
            updateLineConnectorConnection(rect);
        }
        function updateLineConnectorConnection(obj_) {
            var _a, _b;
            for (const connector of obj_.connectors) {
                // Перемещаем линии, связанные с коннектором
                for (const line of objects.filter(obj => obj.type === 'line')) {
                    if ((_a = obj_.lineConnectionStart) === null || _a === void 0 ? void 0 : _a.some(entry => entry.id_con === connector.id && entry.id_shape === line.id)) {
                        line.startX = connector.x;
                        line.startY = connector.y;
                    }
                    if ((_b = obj_.lineConnectionEnd) === null || _b === void 0 ? void 0 : _b.some(entry => entry.id_con === connector.id && entry.id_shape === line.id)) {
                        line.endX = connector.x;
                        line.endY = connector.y;
                    }
                }
            }
        }
        function leftButtonMove(selectedObject, mouseX, mouseY) {
            console.log("selec - ", selectedObjectMass);
            if (selectedObjectMass.length > 0) {
                //console.log("mx - ", mouseX, "my - ", mouseY, "sx - sy --", help_X, help_Y)
                const dx = mouseX - help_X;
                const dy = mouseY - help_Y;
                let helper = false;
                console.log(helper);
                //if (selectedObject_buf.type === 'table') { // если перемещаем только таблицу
                //selectedObject_buf.x_C += dx;
                //selectedObject_buf.y_C += dy;
                //console.log("table x-y", selectedObject_buf.x_C, selectedObject_buf.y_C);
                //helper = true;
                //}
                console.log(helper);
                for (const obj of selectedObjectMass) {
                    switch (obj.type) {
                        case 'table':
                            //if (!helper) { // а если не только таблицу
                            obj.x_C += dx;
                            obj.y_C += dy;
                            //}
                            //console.log("table x-y selOM", (obj as ComplexShape).x_C, (obj as ComplexShape).y_C);
                            break;
                        case 'rectangle':
                            obj.x_C += dx;
                            obj.y_C += dy;
                            updateConnectors(obj);
                            break;
                        case 'circle':
                            obj.x_C += dx;
                            obj.y_C += dy;
                            break;
                        case 'line':
                            obj.startX += dx;
                            obj.startY += dy;
                            obj.endX += dx;
                            obj.endY += dy;
                            break;
                        case 'star':
                            obj.x_C += dx;
                            obj.y_C += dy;
                            break;
                        case 'cloud':
                            obj.x_C += dx;
                            obj.y_C += dy;
                            break;
                    }
                }
                objects.forEach(obj => {
                    if (obj.type === "table") {
                        console.log("there - ", obj.x_C, obj.y_C);
                    }
                });
                console.log();
                // Обновляем стартовые координаты
                help_X = mouseX;
                help_Y = mouseY;
                drawObjects();
                return;
            }
            if (selectedObject.type === 'rectangle') {
                const rect = selectedObject;
                rectMoving(rect, mouseX, mouseY);
            }
            else if (selectedObject.type === 'circle') {
                const circle = selectedObject;
                circle.x_C = mouseX - startX;
                circle.y_C = mouseY - startY;
                updateLineConnectorConnection(circle);
            }
            else if (selectedObject.type === 'line') {
                const line = selectedObject;
                const dx = mouseX - startX;
                const dy = mouseY - startY;
                const dxm = mouseX - help_Xm;
                const dym = mouseY - help_Ym;
                if (selectedLineStart) {
                    line.startX = dx;
                    line.startY = dy;
                    isLineEndpointNearConnector_Start(line, allConnectors);
                }
                else if (selectedLineEnd) {
                    line.endX = dx;
                    line.endY = dy;
                    isLineEndpointNearConnector_End(line, allConnectors);
                }
                else if (selectedLineMid) {
                    line.startX += dxm;
                    line.startY += dym;
                    line.endX += dxm;
                    line.endY += dym;
                    removeConnectionOnLineMove(line, allConnectors);
                }
                // Обновление центра линии
                line.x_C = (line.startX + line.endX) / 2;
                line.y_C = (line.startY + line.endY) / 2;
                help_Xm = mouseX;
                help_Ym = mouseY;
            }
            else if (selectedObject.type === 'star') {
                const star = selectedObject;
                star.x_C = mouseX - startX;
                star.y_C = mouseY - startY;
                updateLineConnectorConnection(star);
            }
            else if (selectedObject.type === 'cloud') {
                const cloud = selectedObject;
                cloud.x_C = mouseX - startX;
                cloud.y_C = mouseY - startY;
                updateLineConnectorConnection(cloud);
            }
            else if (selectedObject.type === 'table') {
                const table = selectedObject;
                table.x_C = mouseX - startX;
                table.y_C = mouseY - startY;
            }
            drawObjects();
        }
        function scrollingButtonMove(e) {
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
                        const rect = selectedObject_canv;
                        rect.x_C += dx;
                        rect.y_C += dy;
                        break;
                    case 'circle':
                        const circle = selectedObject_canv;
                        circle.x_C += dx;
                        circle.y_C += dy;
                        break;
                    case 'line':
                        const line = selectedObject_canv;
                        line.startX += dx;
                        line.startY += dy;
                        line.endX += dx;
                        line.endY += dy;
                        break;
                    case 'cloud':
                        const cloud = selectedObject_canv;
                        cloud.x_C += dx;
                        cloud.y_C += dy;
                        break;
                    case 'star':
                        const star = selectedObject_canv;
                        star.x_C += dx;
                        star.y_C += dy;
                        break;
                }
                startX = e.offsetX;
                startY = e.offsetY;
                drawObjects();
            }
        }
        function onMouseMove(e) {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left - offsetX;
            const mouseY = e.clientY - rect.top - offsetY;
            const mouse_meaning = e.button;
            if (isSelecting) {
                selectionEndX = e.clientX - canvas.offsetLeft;
                selectionEndY = e.clientY - canvas.offsetTop;
                drawObjects();
                drawSelectionBox(); // Рисуем текущую рамку выделения
            }
            if (selectedObject && (mouse_meaning === 0) && mouse_meaning_check != 1) {
                leftButtonMove(selectedObject, mouseX, mouseY);
            }
            else if (mouse_meaning_check === 1) {
                scrollingButtonMove(e);
            }
        }
        function onMouseUp(e) {
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
            }
            else if (mouse_meaning == 0 && mouse_meaning_check != 1) {
                logDebug("Mouse up, no object selected");
                selectedObject_buf = null;
                drawObjects();
            }
            else if (mouse_meaning_check === 1) {
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
            console.log(selectedObjectMass);
        }
        function downloadFile(filename, content) {
            const blob = new Blob([content], { type: 'text/plain' }); //Создание нового объекта Blob (Binary Large Object)
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob); //Создание временного URL для объекта blob
            link.download = filename;
            document.body.appendChild(link);
            link.click(); // Программное кликанье по ссылке
            document.body.removeChild(link); //Удаление ссылки из документа. Это делается для очистки DOM после скачивания файла, так как ссылка больше не нужна
        }
        (_8 = document.getElementById('customJsonExport')) === null || _8 === void 0 ? void 0 : _8.addEventListener('click', function () {
            const size = { width: canvas.width, height: canvas.height };
            const shapes = JSON.stringify(objects, null, 2);
            const content = `Size:${JSON.stringify(size)}\nObjects:(${shapes.slice(1, -1)})`;
            downloadFile('shapes.txt', content);
        });
        //пробуем сделать с загрузкой на сервер
        (_9 = document.getElementById('uploadCssBtn')) === null || _9 === void 0 ? void 0 : _9.addEventListener('click', function () {
            var _a;
            const fileInput = document.getElementById('cssFileInput');
            const file = (_a = fileInput === null || fileInput === void 0 ? void 0 : fileInput.files) === null || _a === void 0 ? void 0 : _a[0];
            if (file) {
                uploadCssFile(file);
            }
            else {
                logDebug("No file selected for upload");
            }
        });
        function uploadCssFile(file) {
            const formData = new FormData(); // https://learn.javascript.ru/formdata
            formData.append('file', file);
            fetch('/api/upload/upload-css', {
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
        function applyCssFile(filePath) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.type = 'text/css';
            //link.href = filePath;
            link.href = "https://localhost:7172/BlazorWebAppAutoRendering.styles.css";
            document.getElementsByTagName('head')[0].appendChild(link);
        }
        //пробуем сделать с локальным хранилищем
        function applyCssFromLocalStorage() {
            logDebug("entering into applyCssFromLocalStorage");
            const cssContent = localStorage.getItem('uploadedCss2');
            if (cssContent) {
                logDebug(`Mouse move at (${cssContent}`);
                const style = document.createElement('style');
                style.textContent = cssContent;
                document.head.appendChild(style);
            }
            else {
                console.error('No CSS found in local storage');
            }
        }
        (_10 = document.getElementById('uploadCssBtn2')) === null || _10 === void 0 ? void 0 : _10.addEventListener('click', function () {
            var _a;
            const fileInput = document.getElementById('cssFileInput2');
            const file = (_a = fileInput === null || fileInput === void 0 ? void 0 : fileInput.files) === null || _a === void 0 ? void 0 : _a[0];
            if (file) {
                applyCssFromLocalStorage();
            }
            else {
                logDebug("No file selected for upload");
            }
        });
        (_11 = document.getElementById('cssFileInput2')) === null || _11 === void 0 ? void 0 : _11.addEventListener('change', function (event) {
            const input = event.target;
            if (input.files && input.files[0]) {
                const file = input.files[0];
                const reader = new FileReader();
                reader.onload = function (e) {
                    const content = e.target.result;
                    localStorage.setItem('uploadedCss2', content);
                    applyCssFromLocalStorage();
                };
                reader.readAsText(file);
            }
        });
        function processOWLFileContent(content) {
            try {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(content, "application/xml");
                const sizeElement = xmlDoc.getElementsByTagName('size')[0];
                const objectsElements = xmlDoc.getElementsByTagName('object');
                const size = {
                    width: parseInt((sizeElement === null || sizeElement === void 0 ? void 0 : sizeElement.getAttribute('width')) || '0'),
                    height: parseInt((sizeElement === null || sizeElement === void 0 ? void 0 : sizeElement.getAttribute('height')) || '0')
                };
                let objects_;
                return objects_ = Array.from(objectsElements).map((elem) => {
                    const type = elem.getAttribute('type');
                    const id = elem.getAttribute('id') || generateUniqueId();
                    const baseProps = {
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
                            return Object.assign(Object.assign({}, baseProps), { width: parseFloat(elem.getAttribute('width') || '0'), height: parseFloat(elem.getAttribute('height') || '0'), border: elem.getAttribute('border') === 'true' });
                        case 'circle':
                            return Object.assign(Object.assign({}, baseProps), { radius: parseFloat(elem.getAttribute('radius') || '0') });
                        case 'line':
                            return Object.assign(Object.assign({}, baseProps), { startX: parseFloat(elem.getAttribute('startX') || '0'), startY: parseFloat(elem.getAttribute('startY') || '0'), endX: parseFloat(elem.getAttribute('endX') || '0'), endY: parseFloat(elem.getAttribute('endY') || '0'), lineWidth: parseFloat(elem.getAttribute('lineWidth') || '2'), arrowDirection: elem.getAttribute('arrowDirection') || 'none', punctuation: elem.getAttribute('punctuation') || '', startArrowType: elem.getAttribute('startArrowType'), endArrowType: elem.getAttribute('endArrowType') });
                        case 'star':
                            return Object.assign(Object.assign({}, baseProps), { rad: parseFloat(elem.getAttribute('rad') || '0'), amount_points: parseInt(elem.getAttribute('amount_points') || '5'), m: parseFloat(elem.getAttribute('m') || '2') });
                        case 'cloud':
                            return Object.assign(Object.assign({}, baseProps), { width: parseFloat(elem.getAttribute('width') || '0'), height: parseFloat(elem.getAttribute('height') || '0') });
                        case 'table': {
                            const parts = Array.from(elem.getElementsByTagName('cell')).map(cell => (Object.assign(Object.assign({}, baseProps), { id: generateUniqueId(), type: 'rectangle', x_C: parseFloat(cell.getAttribute('x') || '0'), y_C: parseFloat(cell.getAttribute('y') || '0'), width: parseFloat(cell.getAttribute('width') || '0'), height: parseFloat(cell.getAttribute('height') || '0'), color: cell.getAttribute('color') || '#999999', info: cell.getAttribute('info') || '', borderPoints_X1: 0, borderPoints_Y1: 0, borderPoints_X2: 0, borderPoints_Y2: 0, connectors: [], border: cell.getAttribute('border') === 'true' })));
                            return Object.assign(Object.assign({}, baseProps), { width: parseFloat(elem.getAttribute('width') || '0'), height: parseFloat(elem.getAttribute('height') || '0'), cols: parseInt(elem.getAttribute('cols') || '1'), rows: parseInt(elem.getAttribute('rows') || '1'), parts });
                        }
                        default:
                            console.warn(`Unknown shape type: ${type}`);
                            return baseProps;
                    }
                });
                drawObjects();
            }
            catch (error) {
                console.error('Error processing OWL file content:', error);
            }
        }
        function convertObjectsToOWL(objects) {
            const size = { width: canvas.width, height: canvas.height };
            const sizeXML = `<size width="${size.width}" height="${size.height}"/>`;
            const objectsXML = objects.map(obj => {
                var _a, _b, _c, _d, _e;
                const baseProps = `
                    id="${obj.id}" 
                    type="${obj.type}" 
                    color="${obj.color}" 
                    rotation="${obj.rotation || 0}" 
                    info="${obj.info || ''}"
                    linkedObjects="${((_a = obj.linkedObjects) === null || _a === void 0 ? void 0 : _a.join(',')) || ''}" 
                    outgoingLinks="${((_b = obj.outgoingLinks) === null || _b === void 0 ? void 0 : _b.join(',')) || ''}" 
                    incomingLinks="${((_c = obj.incomingLinks) === null || _c === void 0 ? void 0 : _c.join(',')) || ''}"
                    borderPoints_X1="${obj.borderPoints_X1}" borderPoints_Y1="${obj.borderPoints_Y1}" borderPoints_X2="${obj.borderPoints_X2}" borderPoints_Y2="${obj.borderPoints_Y2}"
                    selectionMarker="${(_d = obj.selectionMarker) !== null && _d !== void 0 ? _d : false}" 
                    colorAlpha="${(_e = obj.colorAlpha) !== null && _e !== void 0 ? _e : 1}" 
                    imageSrc="${obj.imageSrc || ''}"`.trim();
                switch (obj.type) {
                    case 'rectangle':
                        const rect = obj;
                        return `<object ${baseProps} x="${rect.x_C}" y="${rect.y_C}" width="${rect.width}" height="${rect.height}" border="${rect.border}"/>`;
                    case 'circle':
                        const circle = obj;
                        return `<object ${baseProps} x="${circle.x_C}" y="${circle.y_C}" radius="${circle.radius}"/>`;
                    case 'line':
                        const line = obj;
                        return `<object ${baseProps} startX="${line.startX}" startY="${line.startY}" endX="${line.endX}" endY="${line.endY}" lineWidth="${line.lineWidth || 2}" startArrowType="${line.startArrowType || 'none'}" endArrowType="${line.endArrowType || 'none'}"/>`;
                    case 'star':
                        const star = obj;
                        return `<object ${baseProps} x_C="${star.x_C}" y_C="${star.y_C}" rad="${star.rad}" amount_points="${star.amount_points}" m="${star.m}"/>`;
                    case 'cloud':
                        const cloud = obj;
                        return `<object ${baseProps} x_C="${cloud.x_C}" y_C="${cloud.y_C}" width="${cloud.width}" height="${cloud.height}"/>`;
                    case 'table':
                        const table = obj;
                        const partXML = table.parts.map((p, i) => {
                            const pr = p;
                            return `<cell index="${i}" x="${pr.x_C}" y="${pr.y_C}" width="${pr.width}" height="${pr.height}" info="${pr.info || ''}" color="${pr.color}" border="${pr.border}"/>`;
                        }).join('\n');
                        return `<object ${baseProps} x_C="${table.x_C}" y_C="${table.y_C}" width="${table.width}" height="${table.height}" cols="${table.cols}" rows="${table.rows}">\n${partXML}\n</object>`;
                    default:
                        throw new Error('Unknown object type');
                }
            }).join('\n');
            return `<diagram>\n${sizeXML}\n${objectsXML}\n</diagram>`;
        }
        (_12 = document.getElementById('owlImport')) === null || _12 === void 0 ? void 0 : _12.addEventListener('change', function (event) {
            var _a;
            try {
                const input = event.target;
                const file = (_a = input.files) === null || _a === void 0 ? void 0 : _a[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        var _a;
                        try {
                            const content = (_a = e.target) === null || _a === void 0 ? void 0 : _a.result;
                            if (typeof content === 'string') {
                                if (file.name.endsWith('.owl')) {
                                    objects = processOWLFileContent(content);
                                }
                                else {
                                    objects = processFileContent(content, objects);
                                }
                                drawObjects();
                            }
                        }
                        catch (error) {
                            console.error('Error processing file content:', error);
                        }
                    };
                    reader.readAsText(file);
                }
            }
            catch (error) {
                console.error('Error reading file:', error);
            }
        });
        (_13 = document.getElementById('owlExport')) === null || _13 === void 0 ? void 0 : _13.addEventListener('click', function () {
            const owlContent = convertObjectsToOWL(objects);
            downloadFile('shapes.owl', owlContent);
        });
        function createVerticalTable(object) {
            const table = document.createElement('table');
            table.style.border = '1px solid black';
            table.style.borderCollapse = 'collapse';
            table.style.width = '340px';
            table.style.tableLayout = 'fixed';
            for (const key in object) {
                if (object.hasOwnProperty(key)) {
                    if (key === "imageSrc" ||
                        object[key] === "" ||
                        key === "connectors" ||
                        key === "borderPoints_X1" ||
                        key === "borderPoints_Y1" ||
                        key === "borderPoints_X2" ||
                        key === "borderPoints_Y2" ||
                        key === "lineConnectionStart" ||
                        key === "lineConnectionEnd") {
                        continue;
                    }
                    const row = table.insertRow();
                    // Ячейка с названием свойства
                    const cellKey = row.insertCell();
                    cellKey.style.border = '1px solid black';
                    cellKey.style.padding = '5px';
                    cellKey.style.width = '40%';
                    cellKey.innerText = key;
                    // Ячейка со значением свойства
                    const cellValue = row.insertCell();
                    cellValue.style.border = '1px solid black';
                    cellValue.style.padding = '5px';
                    cellValue.style.width = '60%';
                    const valueElement = document.createElement('span');
                    valueElement.innerText = object[key];
                    cellValue.appendChild(valueElement);
                    // Если свойство подлежит редактированию (число, цвет, arrowDirection или punctuation)
                    if (typeof (object[key]) === "number" ||
                        key === "color" ||
                        key === "arrowDirection" ||
                        key === "punctuation" ||
                        key === "startArrowType" ||
                        key === "endArrowType") {
                        cellValue.style.cursor = "pointer";
                        cellValue.addEventListener('click', () => {
                            const optionsEntering = (object, options, input) => {
                                options.forEach(option => {
                                    const opt = document.createElement('option');
                                    opt.value = option;
                                    opt.textContent = option;
                                    if (object[key] === option) {
                                        opt.selected = true;
                                    }
                                    input.appendChild(opt);
                                });
                            };
                            if (cellValue.querySelector('input, select'))
                                return;
                            // Очистим содержимое ячейки
                            cellValue.innerHTML = '';
                            let input;
                            if (key === "color") {
                                input = document.createElement('input');
                                input.type = 'color';
                                input.value = object[key];
                            }
                            else if (key === "arrowDirection") {
                                input = document.createElement('select');
                                const options = ["start", "end", "both", "mid", "none"];
                                //const options = [ "mid landmark", "none"];
                                optionsEntering(object, options, input);
                            }
                            else if (key === "punctuation") {
                                input = document.createElement('select');
                                const options = ["yes", "none"];
                                optionsEntering(object, options, input);
                            }
                            else if (key === "startArrowType" || key === "endArrowType") {
                                input = document.createElement('select');
                                const options = ["-|->", "-0->", "-*->", ">", "none"];
                                optionsEntering(object, options, input);
                            }
                            else {
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
                                if (typeof object[key] === 'number') {
                                    const parsed = parseFloat(newValue);
                                    if (isNaN(parsed)) {
                                        alert("Некорректное числовое значение.");
                                        return;
                                    }
                                    object[key] = parsed;
                                    valueElement.innerText = parsed.toString();
                                }
                                else if (typeof object[key] === 'string') {
                                    object[key] = newValue;
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
                                    const line = object;
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
                                        }
                                        else if (start === ">" && end !== ">") {
                                            line.arrowDirection = "start";
                                        }
                                        else if (start !== ">" && end === ">") {
                                            line.arrowDirection = "end";
                                        }
                                        else {
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
                            input.addEventListener('keydown', (e) => {
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
        function dfsCycleDetection(node, graph, visited, recStack, path, allCycles) {
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
        function detectCycles(graph) {
            const visited = new Set();
            const recStack = new Set();
            const allCycles = [];
            for (const node of graph) {
                const path = [];
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
        function highlightCycle(cyclePath, graph) {
            for (const nodeId of cyclePath) {
                const node = graph.find(n => n.id === nodeId);
                if (node) {
                    // Например, меняем цвет линии или фигуры на красный
                    if (node.type === 'line') {
                        node.color = 'red';
                    }
                    else if (node.type === 'rectangle' || node.type === 'circle' || node.type === 'star' || node.type === 'cloud') {
                        node.color = 'red';
                    }
                }
            }
            drawObjects(); // Перерисовываем объекты на холсте
        }
        function bfsShortestPath(graph, startId, endId) {
            const queue = [];
            const distances = {};
            const previous = {};
            // Инициализация
            for (const node of graph) {
                distances[node.id] = Infinity;
                previous[node.id] = null;
            }
            distances[startId] = 0;
            queue.push(startId);
            while (queue.length > 0) {
                const currentId = queue.shift();
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
            const path = [];
            let currentNodeId = endId;
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
        function enteringText(obj) {
            if (obj.info) {
                ctx.fillStyle = 'black';
                ctx.font = '16px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                let textX = obj.x_C /*+ (obj.width || obj.radius * 2) / 2*/;
                let textY = obj.y_C /*+ (obj.height || obj.radius * 2) / 2*/;
                if (obj.type === "rectangle") {
                    textX = obj.x_C + obj.width / 2;
                    textY = obj.y_C + obj.height / 2;
                }
                ctx.fillText(obj.info, textX, textY /*, 70*/); // убрал ограничение || надо реализовать возможность разбиения на строки
            }
        }
        function drawingConnection(obj_s, ctx) {
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
                            drawLineWithArrow(ctx, startX, startY, endX, endY, 'blue', "mid");
                        }
                    });
                }
            }
        }
        function rotationCheck(obj, ctx) {
            ctx.save();
            let centerX = 0;
            let centerY = 0;
            if (obj.rotation) {
                if (obj.type === 'rectangle') {
                    centerX = obj.x_C + obj.width / 2;
                    centerY = obj.y_C + obj.height / 2;
                }
                else if (obj.type === 'circle') {
                    centerX = obj.x_C;
                    centerY = obj.y_C;
                }
                else if (obj.type === 'line') {
                    centerX = (obj.startX + obj.endX) / 2;
                    centerY = (obj.startY + obj.endY) / 2;
                }
                else if (obj.type === 'star') {
                    centerX = obj.x_C;
                    centerY = obj.y_C;
                }
                else if (obj.type === 'cloud') {
                    centerX = obj.x_C;
                    centerY = obj.y_C;
                }
                ctx.translate(centerX, centerY);
                ctx.rotate((obj.rotation * Math.PI) / 180);
                ctx.translate(-centerX, -centerY);
            }
        }
        function drawRectangleByPoints(ctx, points, strokeStyle = "black", fillStyle = "transparent") {
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
                //logDebug("NOW I AM DRAWING OBJECTS");
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.save();
                ctx.translate(offsetX, offsetY);
                ctx.drawImage(gridCanvas, 0, 0);
                drawingConnection(objects, ctx);
                // Затем отрисовываем сами объекты
                for (const obj of objects) {
                    //logDebug(`Drawing object: ${JSON.stringify(obj)}`);
                    rotationCheck(obj, ctx);
                    switch (obj.type) {
                        case 'table':
                            const table = obj;
                            drawTable(table, ctx);
                            const points = [
                                { x: table.x_C - 1, y: table.y_C - 1 },
                                { x: table.x_C + 1, y: table.y_C - 1 },
                                { x: table.x_C + 1, y: table.y_C + 1 },
                                { x: table.x_C - 1, y: table.y_C + 1 }
                            ];
                            drawRectangleByPoints(ctx, points, "black");
                            break;
                        case 'rectangle':
                            const rect = obj;
                            drawRect(rect, ctx);
                            updateConnectors(rect);
                            enteringText(obj);
                            break;
                        case 'circle':
                            const circle = obj;
                            drawCircle(circle, ctx);
                            updateConnectors(circle);
                            enteringText(obj);
                            break;
                        case 'line':
                            const line = obj;
                            drawLine(line, ctx);
                            updateConnectors(line);
                            enteringText(obj);
                            break;
                        case 'star':
                            const star = obj;
                            drawStar(star, ctx);
                            updateConnectors(star);
                            enteringText(obj);
                            break;
                        case 'cloud':
                            const cloud = obj;
                            drawCloud(cloud, ctx);
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
            }
            else {
                logDebug("Canvas context is not available");
            }
        }
    }
    else {
        console.error("Canvas context is not supported");
        logDebug("Canvas context is not supported");
    }
})();
