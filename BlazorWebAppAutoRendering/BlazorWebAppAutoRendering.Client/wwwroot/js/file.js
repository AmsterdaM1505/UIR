(function () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4;
    let objects = [];
    let highlight = [];
    let allConnectors;
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
    //let complexObjects: ComplexShape[] = [];
    function measureTextWidth(text, font) {
        // Создаём временный span
        const span = document.createElement('span');
        const help = document.getElementById("addRectBtn");
        console.log("мой текст", help.style);
        // Делаем его невидимым и не влияющим на layout
        span.style.visibility = 'hidden';
        span.style.whiteSpace = 'nowrap';
        // Устанавливаем шрифт, который используется в кнопке (например, "16px Roboto")
        span.style.font = font;
        span.textContent = text;
        // Добавляем элемент в body, чтобы он был отрендерен
        document.body.appendChild(span);
        // Измеряем его ширину
        const width = span.getBoundingClientRect().width;
        // Удаляем временный элемент
        document.body.removeChild(span);
        return width;
    }
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
    //function processFileContent(content: string, objects: Shape[]) {
    //    try {
    //        const sizeMatch = content.match(/Size:({[^}]+})/);
    //        const objectsMatch = content.match(/Objects:\(([^)]+)\)/);
    //        if (sizeMatch && objectsMatch) {
    //            const size = JSON.parse(sizeMatch[1]);
    //            const shapes = JSON.parse(`[${objectsMatch[1]}]`);
    //            objects = shapes.map((obj: any) => {
    //                //if (obj.imageSrc) {
    //                //    insertionImageFromFile(obj);
    //                //}
    //                const baseProps = {
    //                    id: obj.id || generateUniqueId(),
    //                    type: obj.type,
    //                    color: obj.color || '#000',
    //                    rotation: obj.rotation || 0,
    //                    info: obj.info || '',
    //                    linkedObjects: obj.linkedObjects || [],
    //                    outgoingLinks: obj.outgoingLinks || [],
    //                    incomingLinks: obj.incomingLinks || [],
    //                    //imageSrc: obj.imageScr || []
    //                };
    //                if (obj.type === 'rectangle') {
    //                    return {
    //                        ...baseProps,
    //                        x_C: obj.x,
    //                        y_C: obj.y,
    //                        width: obj.width,
    //                        height: obj.height
    //                    } as Rectangle;
    //                } else if (obj.type === 'circle') {
    //                    return {
    //                        ...baseProps,
    //                        x_C: obj.x,
    //                        y_C: obj.y,
    //                        radius: obj.radius
    //                    } as Circle;
    //                } else if (obj.type === 'line') {
    //                    return {
    //                        ...baseProps,
    //                        startX: obj.startX,
    //                        startY: obj.startY,
    //                        endX: obj.endX,
    //                        endY: obj.endY
    //                    } as Line;
    //                } else if (obj.type === 'star') {
    //                    return {
    //                        ...baseProps,
    //                        x_C: obj.x_C,
    //                        y_C: obj.y_C,
    //                        rad: obj.rad,
    //                        amount_points: obj.amount_points,
    //                        m: obj.m
    //                    } as Star;
    //                } else if (obj.type === 'cloud') {
    //                    return {
    //                        ...baseProps,
    //                        x_C: obj.x_C,
    //                        y_C: obj.y_C,
    //                        width: obj.width,
    //                        height: obj.height
    //                    } as Cloud;
    //                } else {
    //                    throw new Error('Unknown shape type');
    //                }
    //            });
    //            return objects;
    //        } else if (sizeMatch && !objectsMatch) {
    //            const size = JSON.parse(sizeMatch[1]);
    //            objects = [];
    //            return objects;
    //        } else {
    //            throw new Error('Invalid file format');
    //        }
    //    } catch (error) {
    //        console.error('Error processing file content:', error);
    //    }
    //}
    function processFileContent(content, objects) {
        try {
            if (!content)
                return objects; // Проверяем, есть ли данные
            const schemaData = JSON.parse(content);
            if (!schemaData.objects || !Array.isArray(schemaData.objects)) {
                console.error("Invalid schema format.");
                return objects;
            }
            return schemaData.objects.map(obj => {
                const baseProps = {
                    id: obj.id || generateUniqueId(),
                    type: obj.type,
                    color: obj.color || '#000',
                    rotation: obj.rotation || 0,
                    info: obj.info || '',
                    linkedObjects: obj.linkedObjects || [],
                    outgoingLinks: obj.outgoingLinks || [],
                    incomingLinks: obj.incomingLinks || [],
                    colorAlpha: obj.colorAlpha || 1,
                    borderPoints_X1: obj.borderPoints_X1,
                    borderPoints_Y1: obj.borderPoints_Y1,
                    borderPoints_X2: obj.borderPoints_X2,
                    borderPoints_Y2: obj.borderPoints_Y2
                };
                switch (obj.type) {
                    case 'rectangle':
                        return Object.assign(Object.assign({}, baseProps), { x_C: obj.x_C, y_C: obj.y_C, width: obj.width, height: obj.height });
                    case 'circle':
                        return Object.assign(Object.assign({}, baseProps), { x_C: obj.x_C, y_C: obj.y_C, radius: obj.radius });
                    case 'line':
                        return Object.assign(Object.assign({}, baseProps), { startX: obj.startX, startY: obj.startY, endX: obj.endX, endY: obj.endY });
                    case 'star':
                        return Object.assign(Object.assign({}, baseProps), { x_C: obj.x_C, y_C: obj.y_C, rad: obj.rad, amount_points: obj.amount_points, m: obj.m });
                    case 'cloud':
                        return Object.assign(Object.assign({}, baseProps), { x_C: obj.x_C, y_C: obj.y_C, width: obj.width, height: obj.height });
                    default:
                        console.warn("Unknown shape type:", obj.type);
                        return null;
                }
            }).filter(obj => obj !== null);
        }
        catch (error) {
            console.error("Error processing file content:", error);
            return objects; // Если ошибка, возвращаем текущий массив объектов
        }
    }
    (_a = document.getElementById('fileInput')) === null || _a === void 0 ? void 0 : _a.addEventListener('change', function (event) {
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
                            processFileContent(content, objects);
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
            console.log("Schema saved successfully.", JSON.stringify(schemaData));
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
    let isSchemaLoaded = false;
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
                    id: obj.id || generateUniqueId(),
                    type: obj.type,
                    color: obj.color || '#000',
                    rotation: obj.rotation || 0,
                    info: obj.info || '',
                    linkedObjects: obj.linkedObjects || [],
                    outgoingLinks: obj.outgoingLinks || [],
                    incomingLinks: obj.incomingLinks || [],
                    colorAlpha: obj.colorAlpha || 1,
                    borderPoints_X1: obj.borderPoints_X1,
                    borderPoints_Y1: obj.borderPoints_Y1,
                    borderPoints_X2: obj.borderPoints_X2,
                    borderPoints_Y2: obj.borderPoints_Y2
                };
                switch (obj.type) {
                    case 'rectangle':
                        return Object.assign(Object.assign({}, baseProps), { x_C: obj.x_C, y_C: obj.y_C, width: obj.width, height: obj.height });
                    case 'circle':
                        return Object.assign(Object.assign({}, baseProps), { x_C: obj.x_C, y_C: obj.y_C, radius: obj.radius });
                    case 'line':
                        return Object.assign(Object.assign({}, baseProps), { startX: obj.startX, startY: obj.startY, endX: obj.endX, endY: obj.endY });
                    case 'star':
                        return Object.assign(Object.assign({}, baseProps), { x_C: obj.x_C, y_C: obj.y_C, rad: obj.rad, amount_points: obj.amount_points, m: obj.m });
                    case 'cloud':
                        return Object.assign(Object.assign({}, baseProps), { x_C: obj.x_C, y_C: obj.y_C, width: obj.width, height: obj.height });
                    default:
                        console.warn("Unknown shape type:", obj.type);
                        return null;
                }
            }).filter(obj => obj !== null);
            isSchemaLoaded = true; // Устанавливаем флаг после успешной загрузки
            drawObjects();
            console.log("Schema loaded successfully.");
            //console.log(objects);
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
    //window.addEventListener('DOMContentLoaded', () => {
    //    loadFromLocalStorage();
    //});
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
        //console.log(offsetX, offsetY, difference.top, difference.bottom)
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
    });
    updateDebugPanelOffsets();
    resizeCanvas(canvas);
    updateOffsets(canvas);
    const gridCanvas = document.createElement('canvas');
    const gridCtx = gridCanvas.getContext('2d');
    gridCanvas.width = canvas.width;
    gridCanvas.height = canvas.height;
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
    // Рисуем сетку на фоновом холсте
    drawGrid(gridCtx, gridCanvas.width, gridCanvas.height, 20);
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
        const leftPanel = document.getElementById("button-panel");
        const rightPanel = document.getElementById("table-container");
        const debugPanel = document.getElementById("debug-panel");
        const resizeHandleLeft = document.getElementById("resize-handle-left");
        const resizeHandleRight = document.getElementById("resize-handle-right");
        let isResizingLeft = false;
        let isResizingRight = false;
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
        (_c = document.getElementById('addRectBtn')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', function () {
            logDebug("Add rectangle button clicked");
            addRect();
        });
        (_d = document.getElementById('addCircleBtn')) === null || _d === void 0 ? void 0 : _d.addEventListener('click', function () {
            logDebug("Add circle button clicked");
            addCircle();
        });
        (_e = document.getElementById('addLineBtn')) === null || _e === void 0 ? void 0 : _e.addEventListener('click', function () {
            logDebug("Add line button clicked");
            addLine();
        });
        (_f = document.getElementById('addCloudBtn')) === null || _f === void 0 ? void 0 : _f.addEventListener('click', function () {
            logDebug("Add cloud button clicked");
            addCloud();
        });
        (_g = document.getElementById('addStarBtn')) === null || _g === void 0 ? void 0 : _g.addEventListener('click', function () {
            logDebug("Add star button clicked");
            addStar();
        });
        (_h = document.getElementById('delShapeBtn')) === null || _h === void 0 ? void 0 : _h.addEventListener('click', function () {
            logDebug("Delete shape button clicked");
            deleteShape();
        });
        (_j = document.getElementById('rotateLeftBtn')) === null || _j === void 0 ? void 0 : _j.addEventListener('click', function () {
            logDebug("Rotate left button clicked");
            rotateSelectedObject(-10);
        });
        (_k = document.getElementById('rotateRightBtn')) === null || _k === void 0 ? void 0 : _k.addEventListener('click', function () {
            logDebug("Rotate right button clicked");
            rotateSelectedObject(10);
        });
        (_l = document.getElementById('deleteItem')) === null || _l === void 0 ? void 0 : _l.addEventListener('click', function () {
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
        (_m = document.getElementById('rotateLeftItem')) === null || _m === void 0 ? void 0 : _m.addEventListener('click', function () {
            if (selectedObject_buf) {
                rotateSelectedObject(-10);
            }
            selectedObject_buf = null;
            drawObjects();
        });
        (_o = document.getElementById('rotateRightItem')) === null || _o === void 0 ? void 0 : _o.addEventListener('click', function () {
            if (selectedObject_buf) {
                rotateSelectedObject(10);
            }
            selectedObject_buf = null;
            drawObjects();
        });
        (_p = document.getElementById('cycleCheck')) === null || _p === void 0 ? void 0 : _p.addEventListener('click', function () {
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
        (_q = document.getElementById('longWayCheck')) === null || _q === void 0 ? void 0 : _q.addEventListener('click', function () {
            logDebug(`longWayCheck button clicked`);
            connectionServ = 5;
            waySelection();
        });
        (_r = document.getElementById('connect_objects')) === null || _r === void 0 ? void 0 : _r.addEventListener('click', function () {
            logDebug(`connectionObjects button clicked`);
            connectionServ = 1;
            connectionObjects();
        });
        (_s = document.getElementById('remove_connection')) === null || _s === void 0 ? void 0 : _s.addEventListener('click', function () {
            logDebug(`remove_connection button clicked`);
            connectionServ = 0;
            removeObjects();
        });
        (_t = document.getElementById('outgoing_connect')) === null || _t === void 0 ? void 0 : _t.addEventListener('click', function () {
            logDebug(`outgoingConnectionObjects button clicked`);
            connectionServ = 3;
            connectionObjects();
        });
        (_u = document.getElementById('remove_outgoing_connection')) === null || _u === void 0 ? void 0 : _u.addEventListener('click', function () {
            logDebug(`remove_connection button clicked`);
            connectionServ = 4;
            removeObjects();
        });
        (_v = document.getElementById('additionInfo')) === null || _v === void 0 ? void 0 : _v.addEventListener('click', function () {
            addInfo(selectedObject_buf);
        });
        document.addEventListener('contextmenu', function (e) {
            e.preventDefault();
            //showContextMenu(e.clientX, e.clientY);
            onMouseDown(e);
        });
        (_w = document.getElementById('insert_img')) === null || _w === void 0 ? void 0 : _w.addEventListener('click', function () {
            var _a;
            logDebug("Insert img button clicked");
            (_a = document.getElementById('imageInput')) === null || _a === void 0 ? void 0 : _a.click(); // Открываем диалог выбора файлов
        });
        (_x = document.getElementById('debugInfo')) === null || _x === void 0 ? void 0 : _x.addEventListener('click', function () {
            logDebug("debugInfo clicked");
            debugHide();
        });
        (_y = document.getElementById('imageInput')) === null || _y === void 0 ? void 0 : _y.addEventListener('change', function (event) {
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
        //canvas.addEventListener('dblclick', function (event: MouseEvent) {
        //    // Получаем координаты клика относительно канваса
        //    const canvasRect = canvas.getBoundingClientRect();
        //    const mouseX = event.clientX - canvasRect.left - offsetX;
        //    const mouseY = event.clientY - canvasRect.top - offsetY;
        //    // Поиск объекта, по которому сделан двойной клик
        //    const clickedObject = objects.find(obj => {
        //        switch (obj.type) {
        //            case 'rectangle':
        //                const rect = obj as Rectangle;
        //                return /*mouseX >= rect.x_C && mouseX <= rect.x_C + rect.width && mouseY >= rect.y_C && mouseY <= rect.y_C + rect.height*/isPointInRotatedRect(mouseX, mouseY, rect);
        //            case 'circle':
        //                const circle = obj as Circle;
        //                const dx = mouseX - circle.x_C;
        //                const dy = mouseY - circle.y_C;
        //                return dx * dx + dy * dy <= circle.radius * circle.radius;
        //            // Добавьте другие типы объектов по аналогии
        //            default:
        //                return false;
        //        }
        //    });
        //    if (clickedObject) {
        //        // Запрашиваем текст у пользователя с помощью prompt
        //        const text = prompt("Введите текст для объекта", clickedObject.info || "");
        //        if (text !== null) {
        //            // Сохраняем введенный текст в объекте
        //            clickedObject.info = text;
        //            drawObjects();  // Перерисовываем холст с новым текстом
        //        }
        //    }
        //});
        //function insertionImageFromFile(shape: Shape) {
        //    const img = new Image();
        //    if (!shape) {
        //        console.error("Shape not found");
        //        return;
        //    }
        //    img.src = shape.imageSrc;
        //    img.onload = function () {
        //        shape.image = img;
        //    };
        //}
        canvas.addEventListener('dblclick', function (event) {
            // Получаем координаты клика относительно канваса
            const canvasRect = canvas.getBoundingClientRect();
            const mouseX = event.clientX - canvasRect.left - offsetX;
            const mouseY = event.clientY - canvasRect.top - offsetY;
            // Поиск объекта, по которому сделан двойной клик
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
                    default:
                        return false;
                }
            });
            if (clickedObject) {
                createTextInput(clickedObject, mouseX, mouseY);
            }
        });
        //const mainLayout = document.getElementById("main-layout") as HTMLCanvasElement;
        //const debug = document.getElementById("debug-panel");
        //if (!canvas || !mainLayout) return;
        //const rect = canvas.getBoundingClientRect();
        //const difference = mainLayout.getBoundingClientRect();
        //offsetX = rect.left;
        //offsetY = Math.max(0, rect.top - (difference.bottom - difference.top));
        //debug.style.bottom += `${difference.bottom - difference.top}px`;
        ////console.log(offsetX, offsetY, difference.top, difference.bottom)
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
        function drawHeadArrow(ctx, x, y, angle, color) {
            const headlen = 10; // Длина головы стрелки
            // Координаты концов стрелки
            const arrowX1 = x - headlen * Math.cos(angle - Math.PI / 6);
            const arrowY1 = y - headlen * Math.sin(angle - Math.PI / 6);
            const arrowX2 = x - headlen * Math.cos(angle + Math.PI / 6);
            const arrowY2 = y - headlen * Math.sin(angle + Math.PI / 6);
            // Рисуем треугольник стрелки
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(arrowX1, arrowY1);
            ctx.lineTo(arrowX2, arrowY2);
            ctx.lineTo(x, y);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.strokeStyle = color;
            ctx.stroke();
        }
        function drawArow(ctx, line) {
            // Вычисляем угол наклона линии
            const drawArrowAt = line.arrowDirection;
            const angle = Math.atan2(line.endY - line.startY, line.endX - line.startX);
            // Рисуем стрелки
            if (drawArrowAt === "start" || drawArrowAt === "both") {
                drawHeadArrow(ctx, line.startX, line.startY, angle + Math.PI, line.color);
            }
            if (drawArrowAt === "end" || drawArrowAt === "both") {
                drawHeadArrow(ctx, line.endX, line.endY, angle, line.color);
            }
        }
        function drawDirectedLine(ctx, startX, startY, endX, endY, color) {
            // Рисуем линию
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = color;
            ctx.stroke();
            // Вычисляем середину линии
            const midX = (startX + endX) / 2;
            const midY = (startY + endY) / 2;
            // Вычисляем угол наклона линии
            const angle = Math.atan2(endY - startY, endX - startX);
            // Длина головы стрелки
            const headlen = 10;
            // Рисуем стрелку в середине линии
            ctx.beginPath();
            ctx.moveTo(midX, midY);
            ctx.lineTo(midX - headlen * Math.cos(angle - Math.PI / 6), midY - headlen * Math.sin(angle - Math.PI / 6));
            ctx.lineTo(midX - headlen * Math.cos(angle + Math.PI / 6), midY - headlen * Math.sin(angle + Math.PI / 6));
            ctx.lineTo(midX, midY);
            ctx.lineTo(midX - headlen * Math.cos(angle - Math.PI / 6), midY - headlen * Math.sin(angle - Math.PI / 6));
            ctx.strokeStyle = color;
            ctx.stroke();
            ctx.fillStyle = color;
            ctx.fill();
        }
        document.addEventListener('click', function () {
            hideContextMenu();
        });
        function showContextMenu(x, y) {
            //const menu = document.getElementById('contextMenu');
            //const menuWidth = menu.offsetWidth;
            //const menuHeight = menu.offsetHeight;
            //const windowWidth = window.innerWidth;
            //const windowHeight = window.innerHeight;
            const menu = document.getElementById('contextMenu');
            const canvasRect = canvas.getBoundingClientRect(); // Получаем координаты canvas
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
        function highlighting(obj_, ctx_) {
            if (highlight.includes(obj_)) {
                ctx_.save();
                ctx_.strokeStyle = 'red'; // Цвет контура для выделенных объектов
                ctx_.lineWidth = 4; // Толщина контура
                if (obj_.type === 'rectangle') {
                    const rect = obj_;
                    ctx_.strokeRect(rect.x_C, rect.y_C, rect.width, rect.height);
                }
                else if (obj_.type === 'circle') {
                    const circle = obj_;
                    ctx_.beginPath();
                    ctx_.arc(circle.x_C, circle.y_C, circle.radius + 2, 0, 2 * Math.PI); // Добавляем 2 пикселя к радиусу для контурного выделения
                    ctx_.stroke();
                }
                else if (obj_.type === 'line') {
                    const line = obj_;
                    ctx_.beginPath();
                    ctx_.moveTo(line.startX, line.startY);
                    ctx_.lineTo(line.endX, line.endY);
                    ctx_.stroke();
                }
                else if (obj_.type === 'star') {
                    const star = obj_;
                    // Код для отрисовки контура звезды
                    ctx_.beginPath();
                    drawStar(ctx_, star.x_C, star.y_C, star.rad + 2, star.amount_points, star.m, star); // Увеличиваем радиус для контурного выделения
                    ctx_.stroke();
                }
                else if (obj_.type === 'cloud') {
                    const cloud = obj_;
                    ctx_.beginPath();
                    drawCloud(ctx_, cloud.x_C, cloud.y_C, cloud.width + 4, cloud.height + 4, cloud); // Увеличиваем размеры для контурного выделения
                    ctx_.stroke();
                }
                ctx_.restore();
            }
        }
        // Инициализация отрисовки объектов на холсте
        //drawObjects();
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
        function addRect() {
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const newRect = {
                id: generateRandomId(16),
                type: 'rectangle',
                x_C: centerX,
                y_C: centerY,
                width: 50,
                height: 50,
                color: getRandomColor(),
                rotation: 0,
                borderPoints_X1: 0,
                borderPoints_Y1: 0,
                borderPoints_X2: 0,
                borderPoints_Y2: 0,
                selectionMarker: false,
                colorAlpha: 1
            };
            console.log(newRect.x_C, newRect.y_C);
            updateConnectors(newRect);
            selectedObject_buf = newRect;
            selectedObject_buf.selectionMarker = true;
            drawRect(selectedObject_buf, ctx);
            selectedObject_buf.selectionMarker = false;
            objects.push(selectedObject_buf);
            selectedObject_buf = null;
            drawObjects();
            //console.log(newRect)
        }
        function addCircle() {
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const newCircle = {
                id: generateRandomId(16),
                type: 'circle',
                x_C: centerX,
                y_C: centerY,
                radius: 25,
                color: getRandomColor(),
                rotation: 0,
                borderPoints_X1: 0,
                borderPoints_Y1: 0,
                borderPoints_X2: 0,
                borderPoints_Y2: 0,
                selectionMarker: false,
                colorAlpha: 1
            };
            selectedObject_buf = newCircle;
            selectedObject_buf.selectionMarker = true;
            drawCircle(selectedObject_buf, ctx);
            selectedObject_buf.selectionMarker = false;
            objects.push(selectedObject_buf);
            selectedObject_buf = null;
            drawObjects();
        }
        function addLine() {
            //const startX = Math.random() * canvas.width;
            //const startY = Math.random() * canvas.height;
            //const endX = Math.random() * canvas.width;
            //const endY = Math.random() * canvas.height;
            //const newLine: Line = {
            //    id: generateRandomId(16),
            //    type: 'line',
            //    startX: startX,
            //    startY: startY,
            //    endX: endX,
            //    endY: endY,
            //    color: getRandomColor(),
            //    rotation: 0,
            //    x_C: (startX + endX) / 2,  // Вычисляем центр по X
            //    y_C: (startY + endY) / 2,   // Вычисляем центр по Y
            //    borderPoints_X1: startX + 2,
            //    borderPoints_Y1: startY + 2,
            //    borderPoints_X2: endX + 2,
            //    borderPoints_Y2: endY + 2,
            //    selectionMarker: false,
            //    arrowDirection: "none",
            //    colorAlpha: 1,
            //    punctuation: "none"
            //};
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const offset = 50; // половина длины линии
            const newLine = {
                id: generateRandomId(16),
                type: 'line',
                startX: centerX - offset,
                startY: centerY,
                endX: centerX + offset,
                endY: centerY,
                color: getRandomColor(),
                rotation: 0,
                x_C: centerX, // Центр линии
                y_C: centerY,
                borderPoints_X1: centerX - offset + 2,
                borderPoints_Y1: centerY + 2,
                borderPoints_X2: centerX + offset + 2,
                borderPoints_Y2: centerY + 2,
                selectionMarker: false,
                arrowDirection: "none",
                colorAlpha: 1,
                punctuation: "none"
            };
            selectedObject_buf = newLine;
            selectedObject_buf.selectionMarker = true;
            drawLine(selectedObject_buf, ctx);
            selectedObject_buf.selectionMarker = false;
            objects.push(selectedObject_buf);
            selectedObject_buf = null;
            drawObjects();
        }
        function addStar() {
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const newStar = {
                id: generateRandomId(16),
                type: 'star',
                x_C: centerX,
                y_C: centerY,
                rad: 100, // Радиус звезды
                amount_points: 6, // Количество точек звезды
                m: 0.5, // Коэффициент внутреннего радиуса
                color: getRandomColor(),
                rotation: 0,
                borderPoints_X1: 0,
                borderPoints_Y1: 0,
                borderPoints_X2: 0,
                borderPoints_Y2: 0,
                selectionMarker: false,
                colorAlpha: 1
            };
            selectedObject_buf = newStar;
            selectedObject_buf.selectionMarker = true;
            drawStar(ctx, selectedObject_buf.x_C, selectedObject_buf.y_C, selectedObject_buf.rad, selectedObject_buf.amount_points, selectedObject_buf.m, selectedObject_buf);
            selectedObject_buf.selectionMarker = false;
            objects.push(selectedObject_buf);
            selectedObject_buf = null;
            drawObjects();
            logDebug(`Star added: ${JSON.stringify(newStar)}`);
        }
        function addCloud() {
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const newCloud = {
                id: generateRandomId(16),
                type: 'cloud',
                x_C: centerX,
                y_C: centerY,
                width: 200,
                height: 120,
                color: getRandomColor(),
                rotation: 0,
                borderPoints_X1: 0,
                borderPoints_Y1: 0,
                borderPoints_X2: 0,
                borderPoints_Y2: 0,
                selectionMarker: false,
                colorAlpha: 1
            };
            selectedObject_buf = newCloud;
            selectedObject_buf.selectionMarker = true;
            drawCloud(ctx, selectedObject_buf.x_C, selectedObject_buf.y_C, selectedObject_buf.width, selectedObject_buf.height, selectedObject_buf);
            selectedObject_buf.selectionMarker = false;
            objects.push(selectedObject_buf);
            selectedObject_buf = null;
            drawObjects();
            logDebug(`Cloud added: ${JSON.stringify(newCloud)}`);
        }
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
            //console.log(rect.selectionMarker, (rect.selectionMarker && selectedObject_buf === rect));
            if (rect.selectionMarker || selectedObject_buf === rect) {
                //ctx.fillStyle = 'black';
                //ctx.fillRect(rect.x - 5, rect.y - 5, 10, 10);
                //ctx.fillRect(rect.x + rect.width - 5, rect.y - 5, 10, 10);
                //ctx.fillRect(rect.x - 5, rect.y + rect.height - 5, 10, 10);
                //ctx.fillRect(rect.x + rect.width - 5, rect.y + rect.height - 5, 10, 10);
                ctx.strokeStyle = 'rgba(0, 120, 255, 0.7)';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 3]); // Длина штриха и промежутка
                ctx.strokeRect(rect.x_C - 2, rect.y_C - 2, rect.width + 4, rect.height + 4);
                ctx.setLineDash([]); // Сбрасываем пунктир
                rect.borderPoints_X1 = rect.x_C - 2;
                rect.borderPoints_Y1 = rect.y_C - 2;
                rect.borderPoints_X2 = rect.x_C + rect.width + 2;
                rect.borderPoints_Y2 = rect.y_C + rect.height + 2;
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
                ctx.lineWidth = 5;
                ctx.stroke();
            }
            else {
                ctx.setLineDash([5, 3]);
                ctx.beginPath();
                ctx.moveTo(line.startX, line.startY);
                ctx.lineTo(line.endX, line.endY);
                ctx.strokeStyle = colorWithAlpha;
                ctx.lineWidth = 5;
                ctx.stroke();
                ctx.setLineDash([]);
            }
            if (line.selectionMarker || selectedObject_buf === line) {
                ctx.strokeStyle = 'rgba(0, 120, 255, 0.7)';
                ctx.lineWidth = 2;
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
            drawArow(ctx, line);
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
        function drawStar(ctx, x_C, y_C, rad, amount_points, m, star) {
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
        function drawCloud(ctx, x_C, y_C, width, height, cloud) {
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
        function deleteShape() {
            var _a, _b, _c, _d;
            if (selectedObjectMass.length > 0) {
                logDebug(`Deleting multiple shapes: ${JSON.stringify(selectedObjectMass)}`);
                // Удаляем ссылки на удаляемые фигуры из других объектов
                for (const shapeToRemove of selectedObjectMass) {
                    // Удаляем ссылки на коннекторы и линии
                    for (const obj of objects) {
                        // Удаление из linkedObjects
                        if (obj.linkedObjects) {
                            obj.linkedObjects = obj.linkedObjects.filter(id => id !== shapeToRemove.id);
                        }
                        // Удаление из outgoingLinks
                        if (obj.outgoingLinks) {
                            obj.outgoingLinks = obj.outgoingLinks.filter(id => id !== shapeToRemove.id);
                        }
                        // Удаление из incomingLinks
                        if (obj.incomingLinks) {
                            obj.incomingLinks = obj.incomingLinks.filter(id => id !== shapeToRemove.id);
                        }
                        // Удаление ссылок на линии в lineConnectionStart
                        if (obj.lineConnectionStart) {
                            obj.lineConnectionStart = obj.lineConnectionStart.filter(conn => conn.id_con !== shapeToRemove.id);
                        }
                        // Удаление ссылок на линии в lineConnectionEnd
                        if (obj.lineConnectionEnd) {
                            obj.lineConnectionEnd = obj.lineConnectionEnd.filter(conn => conn.id_con !== shapeToRemove.id);
                        }
                    }
                    // Удаляем объект из массива objects
                    const indexToRemove = objects.indexOf(shapeToRemove);
                    if (indexToRemove !== -1) {
                        // Если удаляемый объект — линия, удаляем ее id из lineConnectionStart и lineConnectionEnd
                        if (shapeToRemove.type === 'line') {
                            const lineToRemove = shapeToRemove;
                            for (const obj of objects) {
                                obj.lineConnectionStart = ((_a = obj.lineConnectionStart) === null || _a === void 0 ? void 0 : _a.filter(conn => conn.id_line !== lineToRemove.id)) || [];
                                obj.lineConnectionEnd = ((_b = obj.lineConnectionEnd) === null || _b === void 0 ? void 0 : _b.filter(conn => conn.id_line !== lineToRemove.id)) || [];
                            }
                        }
                        objects.splice(indexToRemove, 1);
                    }
                }
                // Очищаем массив выделенных объектов
                selectedObjectMass = [];
                drawObjects();
                logDebug("All selected shapes deleted.");
            }
            else if (selectedObject_buf) {
                // Удаление одного объекта, если selectedObjectMass пустой
                const indexToRemove = objects.indexOf(selectedObject_buf);
                if (indexToRemove !== -1) {
                    const shapeToRemove = objects[indexToRemove];
                    logDebug(`Deleting shape: ${JSON.stringify(shapeToRemove)}`);
                    // Удаляем ссылки на удаляемую фигуру из других объектов
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
                    // Удаляем сам объект
                    if (shapeToRemove.type === 'line') {
                        const lineToRemove = shapeToRemove;
                        for (const obj of objects) {
                            obj.lineConnectionStart = ((_c = obj.lineConnectionStart) === null || _c === void 0 ? void 0 : _c.filter(conn => conn.id_line !== lineToRemove.id)) || [];
                            obj.lineConnectionEnd = ((_d = obj.lineConnectionEnd) === null || _d === void 0 ? void 0 : _d.filter(conn => conn.id_line !== lineToRemove.id)) || [];
                        }
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
        }
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
        function getRandomColor() {
            const letters = '0123456789ABCDEF';
            let color = '#';
            for (let i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
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
        let isSelecting = false;
        let selectionStartX = 0;
        let selectionStartY = 0;
        let selectionEndX = 0;
        let selectionEndY = 0;
        let activeConnector = null;
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
        function leftButtonDown(e, mouseX, mouseY) {
            logDebug("mouse_down");
            let foundObject = false;
            hideContextMenu();
            if (highlight.length != 0) {
                //console.log("i am here");
                logDebug(`highlight - (${highlight})`);
                highlight = [];
            }
            //if (objects.length === 0) {
            //    try {
            //        const savedSchema = localStorage.getItem('savedSchema');
            //        if (savedSchema) {
            //            objects = processFileContent(savedSchema, objects);
            //        }
            //    } catch (error) {
            //        console.error("Ошибка загрузки схемы:", error);
            //    }
            //}
            //logDebug(`onMouseDown - ${selectionStartX}, ${selectionStartY}, ${selectionEndX}, ${selectionEndY}`);
            for (let i = objects.length - 1; i >= 0; i--) {
                const obj = objects[i];
                if (obj.type === 'rectangle') {
                    const rect = obj;
                    if ( /*mouseX >= rect.x_C && mouseX <= rect.x_C + rect.width && mouseY >= rect.y_C && mouseY <= rect.y_C + rect.height*/isPointInRotatedRect(mouseX, mouseY, rect)) {
                        //console.log("i am here");
                        for (let i = objects.length - 1; i >= 0; i--) {
                            objects[i].selectionMarker = false;
                        }
                        foundObject = true;
                        rect.selectionMarker = true;
                        selectedObject = rect;
                        selectedObject_buf = rect;
                        startX = mouseX - rect.x_C;
                        startY = mouseY - rect.y_C;
                        //logDebug(`Selected rectangle: ${JSON.stringify(rect)}`);
                        selectedObject_buf_connect = selectionCheck(selectedObject_buf_connect, selectedObject_buf, connectionServ);
                        connectionServ == 2;
                        tableObjectCheck(selectedObject_buf);
                        break;
                    }
                }
                else if (obj.type === 'circle') {
                    const circle = obj;
                    const dx = mouseX - circle.x_C;
                    const dy = mouseY - circle.y_C;
                    if (dx * dx + dy * dy <= circle.radius * circle.radius) {
                        for (let i = objects.length - 1; i >= 0; i--) {
                            objects[i].selectionMarker = false;
                        }
                        foundObject = true;
                        circle.selectionMarker = true;
                        selectedObject = circle;
                        selectedObject_buf = circle;
                        startX = dx;
                        startY = dy;
                        logDebug(`Selected circle: ${JSON.stringify(circle)}`);
                        selectedObject_buf_connect = selectionCheck(selectedObject_buf_connect, selectedObject_buf, connectionServ);
                        connectionServ == 2;
                        tableObjectCheck(selectedObject_buf);
                        break;
                    }
                }
                else if (obj.type === 'line') {
                    const line = obj;
                    const distStart = Math.sqrt(Math.pow((mouseX - line.startX), 2) + Math.pow((mouseY - line.startY), 2));
                    const distEnd = Math.sqrt(Math.pow((mouseX - line.endX), 2) + Math.pow((mouseY - line.endY), 2));
                    const distToLine = Math.abs((line.endY - line.startY) * mouseX - (line.endX - line.startX) * mouseY + line.endX * line.startY - line.endY * line.startX) /
                        Math.sqrt(Math.pow((line.endY - line.startY), 2) + Math.pow((line.endX - line.startX), 2));
                    //const distToLine = pointToSegmentDistance(mouseX, mouseY, line.startX, line.startY, line.endX, line.endY);
                    if (distStart < 5 || distEnd < 5 || distToLine < 10) {
                        for (let i = objects.length - 1; i >= 0; i--) {
                            objects[i].selectionMarker = false;
                        }
                        foundObject = true;
                        line.selectionMarker = true;
                        selectedObject = line;
                        selectedObject_buf = line;
                        startX = mouseX;
                        startY = mouseY;
                        logDebug(`Selected line: ${JSON.stringify(line)}`);
                        selectedObject_buf_connect = selectionCheck(selectedObject_buf_connect, selectedObject_buf, connectionServ);
                        connectionServ == 2;
                        tableObjectCheck(selectedObject_buf);
                        if (distStart < 10) {
                            selectedLineStart = true;
                            selectedObject = line;
                            selectedObject_buf = line;
                            startX = mouseX;
                            startY = mouseY;
                            logDebug(`Line start point selected`);
                            break;
                        }
                        else if (distEnd < 10) {
                            selectedLineEnd = true;
                            selectedObject = line;
                            selectedObject_buf = line;
                            startX = mouseX;
                            startY = mouseY;
                            logDebug(`Line end point selected`);
                            break;
                        }
                        else if (distToLine < 10) {
                            selectedLineMid = true;
                            selectedObject = line;
                            selectedObject_buf = line;
                            startX = mouseX;
                            startY = mouseY;
                            logDebug(`Line body selected`);
                            break;
                        }
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
                        for (let i = objects.length - 1; i >= 0; i--) {
                            objects[i].selectionMarker = false;
                        }
                        foundObject = true;
                        star.selectionMarker = true;
                        selectedObject = star;
                        selectedObject_buf = star;
                        startX = mouseX - star.x_C;
                        startY = mouseY - star.y_C;
                        logDebug(`Selected star: ${JSON.stringify(star)}`);
                        selectedObject_buf_connect = selectionCheck(selectedObject_buf_connect, selectedObject_buf, connectionServ);
                        connectionServ == 2;
                        tableObjectCheck(selectedObject_buf);
                        break;
                    }
                }
                else if (obj.type === 'cloud') {
                    const cloud = obj;
                    let startX_Cloud = cloud.x_C - cloud.width / 2;
                    let startY_Cloud = cloud.y_C - cloud.height / 2;
                    if (mouseX >= startX_Cloud && mouseX <= startX_Cloud + cloud.width && mouseY >= startY_Cloud && mouseY <= startY_Cloud + cloud.height) {
                        for (let i = objects.length - 1; i >= 0; i--) {
                            objects[i].selectionMarker = false;
                        }
                        foundObject = true;
                        cloud.selectionMarker = true;
                        selectedObject = cloud;
                        selectedObject_buf = cloud;
                        startX = mouseX - cloud.x_C;
                        startY = mouseY - cloud.y_C;
                        logDebug(`Selected cloud: ${JSON.stringify(cloud)}`);
                        selectedObject_buf_connect = selectionCheck(selectedObject_buf_connect, selectedObject_buf, connectionServ);
                        connectionServ == 2;
                        tableObjectCheck(selectedObject_buf);
                        break;
                    }
                }
            }
            if (foundObject === false) {
                selectedObject = null;
                selectedObject_buf = null;
                for (let i = objects.length - 1; i >= 0; i--) {
                    objects[i].selectionMarker = false;
                }
                isSelecting = true;
                selectionStartX = e.clientX - canvas.offsetLeft;
                selectionStartY = e.clientY - canvas.offsetTop;
                selectionEndX = e.clientX - canvas.offsetLeft;
                selectionEndY = e.clientY - canvas.offsetTop;
                //console.log("now is selecting");
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
        }
        function rigtButtonDown(e, mouseX, mouseY) {
            for (let i = objects.length - 1; i >= 0; i--) {
                const obj = objects[i];
                if (obj.type === 'rectangle') {
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
                }
            }
        }
        // Функция для отрисовки рамки выделения
        function drawSelectionBox() {
            const rect = canvas.getBoundingClientRect();
            logDebug("drawSelectionBox");
            ctx.setLineDash([5, 3]); // Делаем линию пунктирной
            ctx.strokeStyle = 'rgba(0, 120, 255, 0.7)';
            ctx.lineWidth = 2;
            //logDebug(`drawSelectionBox - ${selectionStartX}, ${selectionStartY}, ${selectionEndX}, ${selectionEndY}`);
            //let x = Math.min(selectionStartX, selectionEndX);
            //let y = Math.min(selectionStartY, selectionEndY);
            //let w = Math.abs(selectionEndX - selectionStartX);
            //let h = Math.abs(selectionEndY - selectionStartY);
            //ctx.strokeRect(x, y, w, h);
            //ctx.setLineDash([]);  // Сбрасываем пунктир
            //selectionBoxObjects(selectionStartX - offsetX, selectionStartY - offsetY, selectionEndX - offsetX, selectionEndY - offsetY);
            let x = Math.min(selectionStartX, selectionEndX) - rect.left;
            let y = Math.min(selectionStartY, selectionEndY) - rect.top;
            let w = Math.abs(selectionEndX - selectionStartX);
            let h = Math.abs(selectionEndY - selectionStartY);
            ctx.strokeRect(x, y, w, h);
            ctx.setLineDash([]);
            // Пересчет выделенных объектов
            selectionBoxObjects(selectionStartX - rect.left, selectionStartY - rect.top, selectionEndX - rect.left, selectionEndY - rect.top);
            //console.log("Выбранные объекты:", selectedObjectMass);
            //console.log("Объекты на холсте:", objects);
            console.log(x, y, w, h);
        }
        function onMouseDown(e) {
            //logDebug(`(${objects})`);
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left - offsetX;
            const mouseY = e.clientY - rect.top - offsetY;
            //const mouseX = e.clientX - canvas.offsetLeft - offsetX;
            //const mouseY = e.clientY - canvas.offsetTop - offsetY;
            console.log(mouseX, mouseY);
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
        function isLineEndpointNearConnector(line, connectors, threshold = 5) {
            var _a, _b;
            const calculateDistance = (x1, y1, x2, y2) => Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));
            for (const connector of connectors) {
                if (calculateDistance(line.startX, line.startY, connector.x, connector.y) <= threshold) {
                    line.startX = connector.x;
                    line.startY = connector.y;
                    for (const obj of objects) {
                        if ((_a = obj.connectors) === null || _a === void 0 ? void 0 : _a.some(conn => conn.id === connector.id)) {
                            obj.lineConnectionStart = obj.lineConnectionStart || [];
                            if (!obj.lineConnectionStart.find(entry => entry.id_line === line.id)) {
                                obj.lineConnectionStart.push({ id_con: connector.id, id_line: line.id });
                            }
                            break;
                        }
                    }
                }
                if (calculateDistance(line.endX, line.endY, connector.x, connector.y) <= threshold) {
                    line.endX = connector.x;
                    line.endY = connector.y;
                    for (const obj of objects) {
                        if ((_b = obj.connectors) === null || _b === void 0 ? void 0 : _b.some(conn => conn.id === connector.id)) {
                            obj.lineConnectionEnd = obj.lineConnectionEnd || [];
                            if (!obj.lineConnectionEnd.find(entry => entry.id_line === line.id)) {
                                obj.lineConnectionEnd.push({ id_con: connector.id, id_line: line.id });
                            }
                            break;
                        }
                    }
                }
            }
        }
        function pointToSegmentDistance(px, py, x1, y1, x2, y2) {
            const A = px - x1;
            const B = py - y1;
            const C = x2 - x1;
            const D = y2 - y1;
            const dot = A * C + B * D;
            const lenSq = C * C + D * D;
            let param = lenSq !== 0 ? dot / lenSq : -1;
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
            const dx = px - xx;
            const dy = py - yy;
            return Math.sqrt(dx * dx + dy * dy);
        }
        function leftButtonMove(selectedObject, mouseX, mouseY) {
            //console.log(mouseX, mouseY, startX, startY);
            var _a, _b;
            // Если есть несколько выделенных объектов
            if (selectedObjectMass.length > 0) {
                // Перемещаем все выделенные объекты
                for (const obj of selectedObjectMass) {
                    switch (obj.type) {
                        case 'rectangle':
                            const rect = obj;
                            rect.x_C = mouseX - startX;
                            rect.y_C = mouseY - startY;
                            updateConnectors(rect);
                            break;
                        case 'circle':
                            const circle = obj;
                            circle.x_C += mouseX - startX;
                            circle.y_C += mouseY - startY;
                            break;
                        case 'line':
                            const line = obj;
                            //line.startX += deltaX;
                            //line.startY += deltaY;
                            //line.endX += deltaX;
                            //line.endY += deltaY;
                            break;
                        case 'star':
                            const star = obj;
                            star.x_C += mouseX - startX;
                            star.y_C += mouseY - startY;
                            break;
                        case 'cloud':
                            const cloud = obj;
                            cloud.x_C += mouseX - startX;
                            cloud.y_C += mouseY - startY;
                            break;
                        default:
                            break;
                    }
                }
                // Обновляем стартовые координаты мыши
                //startX = mouseX;
                //startY = mouseY;
                drawObjects(); // Перерисовываем все объекты
                return;
            }
            //logDebug(`selectedObject - (${JSON.stringify(selectedObject)}, ${JSON.stringify(selectedObject_buf)})`);
            if (selectedObject.type === 'rectangle') {
                const rect = selectedObject;
                if (activeConnector) {
                    //console.log(activeConnector);
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
                    ////isLineEndpointNearConnector(rect, allConnectors);
                    for (const connector of rect.connectors) {
                        // Перемещаем линии, связанные с коннектором
                        for (const line of objects.filter(obj => obj.type === 'line')) {
                            if ((_a = rect.lineConnectionStart) === null || _a === void 0 ? void 0 : _a.some(entry => entry.id_con === connector.id)) {
                                line.startX = connector.x;
                                line.startY = connector.y;
                            }
                            if ((_b = rect.lineConnectionEnd) === null || _b === void 0 ? void 0 : _b.some(entry => entry.id_con === connector.id)) {
                                line.endX = connector.x;
                                line.endY = connector.y;
                            }
                        }
                    }
                }
            }
            else if (selectedObject.type === 'circle') {
                const circle = selectedObject;
                circle.x_C = mouseX - startX;
                circle.y_C = mouseY - startY;
            }
            else if (selectedObject.type === 'line') {
                //const line = selectedObject as Line;
                //const distStart = Math.sqrt((mouseX - line.startX) ** 2 + (mouseY - line.startY) ** 2);
                //const distEnd = Math.sqrt((mouseX - line.endX) ** 2 + (mouseY - line.endY) ** 2);
                //// Расчет расстояния от точки до линии
                //const distToLine = pointToSegmentDistance(mouseX, mouseY, line.startX, line.startY, line.endX, line.endY);
                //const distToLine = Math.abs((line.endY - line.startY) * mouseX - (line.endX - line.startX) * mouseY + line.endX * line.startY - line.endY * line.startX) /
                //    Math.sqrt((line.endY - line.startY) ** 2 + (line.endX - line.startX) ** 2);
                //const dx = mouseX - startX;
                //const dy = mouseY - startY;
                //startX = mouseX;
                //startY = mouseY;
                //if (distStart < 10 && !selectedLineStart) {
                //    selectedLineStart = true;
                //    line.startX += dx;
                //    line.startY += dy;
                //    isLineEndpointNearConnector(line, allConnectors);
                //    logDebug(`Line selected start`);
                //} else if (distEnd < 10 && !selectedLineEnd) {
                //    selectedLineEnd = true;
                //    line.endX += dx;
                //    line.endY += dy;
                //    isLineEndpointNearConnector(line, allConnectors);
                //    logDebug(`Line selected end`);
                //} else if (distToLine < 10) {
                //    line.startX += dx;
                //    line.startY += dy;
                //    line.endX += dx;
                //    line.endY += dy;
                //    logDebug(`Line selected body`);
                //}
                //line.x_C = (line.startX + line.endX) / 2,
                //line.y_C = (line.startY + line.endY) / 2,
                //drawObjects();
                //2 вариант
                const line = selectedObject;
                const dx = mouseX - startX;
                const dy = mouseY - startY;
                if (selectedLineStart) {
                    line.startX += dx;
                    line.startY += dy;
                    isLineEndpointNearConnector(line, allConnectors);
                }
                else if (selectedLineEnd) {
                    line.endX += dx;
                    line.endY += dy;
                    isLineEndpointNearConnector(line, allConnectors);
                }
                else if (selectedLineMid) {
                    line.startX += dx;
                    line.startY += dy;
                    line.endX += dx;
                    line.endY += dy;
                }
                startX = mouseX;
                startY = mouseY;
                // Обновление центра линии
                line.x_C = (line.startX + line.endX) / 2;
                line.y_C = (line.startY + line.endY) / 2;
                drawObjects();
            }
            else if (selectedObject.type === 'star') {
                const star = selectedObject;
                star.x_C = mouseX - startX;
                star.y_C = mouseY - startY;
            }
            else if (selectedObject.type === 'cloud') {
                const cloud = selectedObject;
                //logDebug(`(${mouseX})(${mouseY})`);
                //logDebug(`(${startX})(${startY})`);
                cloud.x_C = mouseX - startX;
                cloud.y_C = mouseY - startY;
                //logDebug(`(${mouseX - startX})(${mouseY - startY})`);
            }
            drawObjects();
        }
        function scrollingButtonMove(e) {
            //logDebug(`Button moved id - 1`);
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
            //const mouseX = e.clientX - canvas.offsetLeft - offsetX;
            //const mouseY = e.clientY - canvas.offsetTop - offsetY;
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left - offsetX;
            const mouseY = e.clientY - rect.top - offsetY;
            const mouse_meaning = e.button;
            //logDebug(`Mouse move at (${mouseX}, ${mouseY}, ${mouse_meaning})`);
            if (isSelecting) {
                selectionEndX = e.clientX - canvas.offsetLeft;
                selectionEndY = e.clientY - canvas.offsetTop;
                drawObjects();
                drawSelectionBox(); // Рисуем текущую рамку выделения
            }
            //logDebug(`${selectionStartX}, ${selectionStartY}, ${selectionEndX}, ${selectionEndY}`);
            if (selectedObject && (mouse_meaning === 0) && mouse_meaning_check != 1) {
                leftButtonMove(selectedObject, mouseX, mouseY);
            }
            else if (mouse_meaning_check === 1) {
                scrollingButtonMove(e);
            }
            else {
                //logDebug(`GGWP2`);
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
                //logDebug(`Mouse up, deselecting object: ${JSON.stringify(selectedObject)}`);
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
        (_z = document.getElementById('downloadBtn')) === null || _z === void 0 ? void 0 : _z.addEventListener('click', function () {
            const size = { width: canvas.width, height: canvas.height };
            const shapes = JSON.stringify(objects, null, 2);
            const content = `Size:${JSON.stringify(size)}\nObjects:(${shapes.slice(1, -1)})`;
            downloadFile('shapes.txt', content);
        });
        //пробуем сделать с загрузкой на сервер
        (_0 = document.getElementById('uploadCssBtn')) === null || _0 === void 0 ? void 0 : _0.addEventListener('click', function () {
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
        (_1 = document.getElementById('uploadCssBtn2')) === null || _1 === void 0 ? void 0 : _1.addEventListener('click', function () {
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
        (_2 = document.getElementById('cssFileInput2')) === null || _2 === void 0 ? void 0 : _2.addEventListener('change', function (event) {
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
                    width: parseInt(sizeElement.getAttribute('width') || '0'),
                    height: parseInt(sizeElement.getAttribute('height') || '0')
                };
                objects = Array.from(objectsElements).map((elem) => {
                    var _a, _b, _c;
                    const type = elem.getAttribute('type');
                    const baseProps = {
                        id: elem.getAttribute('id') || generateUniqueId(),
                        type,
                        color: elem.getAttribute('color') || '#000',
                        rotation: parseFloat(elem.getAttribute('rotation') || '0'),
                        info: elem.getAttribute('info') || '',
                        linkedObjects: ((_a = elem.getAttribute('linkedObjects')) === null || _a === void 0 ? void 0 : _a.split(',')) || [],
                        outgoingLinks: ((_b = elem.getAttribute('outgoingLinks')) === null || _b === void 0 ? void 0 : _b.split(',')) || [],
                        incomingLinks: ((_c = elem.getAttribute('incomingLinks')) === null || _c === void 0 ? void 0 : _c.split(',')) || []
                    };
                    if (type === 'rectangle') {
                        return Object.assign(Object.assign({}, baseProps), { x_C: parseFloat(elem.getAttribute('x') || '0'), y_C: parseFloat(elem.getAttribute('y') || '0'), width: parseFloat(elem.getAttribute('width') || '0'), height: parseFloat(elem.getAttribute('height') || '0') });
                    }
                    else if (type === 'circle') {
                        return Object.assign(Object.assign({}, baseProps), { x_C: parseFloat(elem.getAttribute('x') || '0'), y_C: parseFloat(elem.getAttribute('y') || '0'), radius: parseFloat(elem.getAttribute('radius') || '0') });
                    }
                    else if (type === 'line') {
                        return Object.assign(Object.assign({}, baseProps), { startX: parseFloat(elem.getAttribute('startX') || '0'), startY: parseFloat(elem.getAttribute('startY') || '0'), endX: parseFloat(elem.getAttribute('endX') || '0'), endY: parseFloat(elem.getAttribute('endY') || '0') });
                    }
                    else if (type === 'star') {
                        return Object.assign(Object.assign({}, baseProps), { x_C: parseFloat(elem.getAttribute('x_C') || '0'), y_C: parseFloat(elem.getAttribute('y_C') || '0'), rad: parseFloat(elem.getAttribute('rad') || '0'), amount_points: parseInt(elem.getAttribute('amount_points') || '0'), m: parseFloat(elem.getAttribute('m') || '0') });
                    }
                    else if (type === 'cloud') {
                        return Object.assign(Object.assign({}, baseProps), { x_C: parseFloat(elem.getAttribute('x_C') || '0'), y_C: parseFloat(elem.getAttribute('y_C') || '0'), width: parseFloat(elem.getAttribute('width') || '0'), height: parseFloat(elem.getAttribute('height') || '0') });
                    }
                    else {
                        throw new Error('Unknown shape type');
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
                var _a, _b, _c;
                const baseProps = `id="${obj.id}" type="${obj.type}" color="${obj.color}" rotation="${obj.rotation || 0}" info="${obj.info || ''}" linkedObjects="${((_a = obj.linkedObjects) === null || _a === void 0 ? void 0 : _a.join(',')) || ''}" outgoingLinks="${((_b = obj.outgoingLinks) === null || _b === void 0 ? void 0 : _b.join(',')) || ''}" incomingLinks="${((_c = obj.incomingLinks) === null || _c === void 0 ? void 0 : _c.join(',')) || ''}"`;
                switch (obj.type) {
                    case 'rectangle':
                        const rect = obj;
                        return `<object ${baseProps} x="${rect.x_C}" y="${rect.y_C}" width="${rect.width}" height="${rect.height}"/>`;
                    case 'circle':
                        const circle = obj;
                        return `<object ${baseProps} x="${circle.x_C}" y="${circle.y_C}" radius="${circle.radius}"/>`;
                    case 'line':
                        const line = obj;
                        return `<object ${baseProps} startX="${line.startX}" startY="${line.startY}" endX="${line.endX}" endY="${line.endY}"/>`;
                    case 'star':
                        const star = obj;
                        return `<object ${baseProps} x_C="${star.x_C}" y_C="${star.y_C}" rad="${star.rad}" amount_points="${star.amount_points}" m="${star.m}"/>`;
                    case 'cloud':
                        const cloud = obj;
                        return `<object ${baseProps} x_C="${cloud.x_C}" y_C="${cloud.y_C}" width="${cloud.width}" height="${cloud.height}"/>`;
                    default:
                        throw new Error('Unknown object type');
                }
            }).join('\n');
            return `<diagram>\n${sizeXML}\n${objectsXML}\n</diagram>`;
        }
        (_3 = document.getElementById('fileInput3')) === null || _3 === void 0 ? void 0 : _3.addEventListener('change', function (event) {
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
                                    processOWLFileContent(content);
                                }
                                else {
                                    objects = processFileContent(content, objects);
                                }
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
        (_4 = document.getElementById('downloadBtn3')) === null || _4 === void 0 ? void 0 : _4.addEventListener('click', function () {
            const owlContent = convertObjectsToOWL(objects);
            downloadFile('shapes.owl', owlContent);
        });
        //function createVerticalTable(object: Shape): HTMLTableElement {
        //    const table = document.createElement('table');
        //    table.style.border = '1px solid black';
        //    table.style.borderCollapse = 'collapse';
        //    table.style.width = '400px'; // Фиксированная ширина таблицы
        //    table.style.tableLayout = 'fixed';
        //    for (const key in object) {
        //        if (object.hasOwnProperty(key)) {
        //            // Пропускаем ненужные свойства
        //            if (key === "imageSrc" || (object as any)[key] === "" || key === "connectors" || key === "borderPoints_X1" || key === "borderPoints_Y1" || key === "borderPoints_X2" || key === "borderPoints_Y2" || key === "lineConnectionStart" || key === "lineConnectionEnd") {
        //                continue;
        //            }
        //            const row = table.insertRow();
        //            // Ячейка с названием свойства
        //            const cellKey = row.insertCell();
        //            cellKey.style.border = '1px solid black';
        //            cellKey.style.padding = '5px';
        //            cellKey.style.width = '30%';
        //            cellKey.innerText = key;
        //            // Ячейка со значением свойства
        //            const cellValue = row.insertCell();
        //            cellValue.style.border = '1px solid black';
        //            cellValue.style.padding = '5px';
        //            cellValue.style.width = '45%';
        //            const valueElement = document.createElement('span');
        //            valueElement.innerText = (object as any)[key];
        //            cellValue.appendChild(valueElement);
        //            // Если свойство число или цвет, добавляем кнопку "Изменить"
        //            if (typeof ((object as any)[key]) === "number" || key === "color" || key === "arrowDirection" || key === "punctuation") {
        //                const cellEdit = row.insertCell();
        //                cellEdit.style.border = '1px solid black';
        //                cellEdit.style.padding = '5px';
        //                cellEdit.style.width = '25%';
        //                const editButton = document.createElement('button');
        //                editButton.innerText = 'Изменить';
        //                editButton.style.margin = '0 auto';
        //                let inEditMode = false;
        //                let input: HTMLInputElement | HTMLSelectElement | null = null;
        //                editButton.addEventListener('click', () => {
        //                    if (!inEditMode) {
        //                        // Переход в режим редактирования
        //                        inEditMode = true;
        //                        editButton.innerText = 'Сохранить';
        //                        cellValue.innerHTML = '';
        //                        if (key === "color") {
        //                            input = document.createElement('input');
        //                            input.type = 'color';
        //                            input.value = (object as any)[key];
        //                        } else if (key === "arrowDirection") {
        //                            // Создаем выпадающий список для направления стрелки
        //                            input = document.createElement('select');
        //                            const options = ["start", "end", "both", "none"];
        //                            options.forEach(option => {
        //                                const opt = document.createElement('option');
        //                                opt.value = option;
        //                                opt.textContent = option;
        //                                if ((object as any)[key] === option) {
        //                                    opt.selected = true;
        //                                }
        //                                input.appendChild(opt);
        //                            });
        //                        } else if (key === "punctuation") {
        //                            // Создаем выпадающий список для направления стрелки
        //                            input = document.createElement('select');
        //                            const options = ["yes", "none"];
        //                            options.forEach(option => {
        //                                const opt = document.createElement('option');
        //                                opt.value = option;
        //                                opt.textContent = option;
        //                                if ((object as any)[key] === option) {
        //                                    opt.selected = true;
        //                                }
        //                                input.appendChild(opt);
        //                            });
        //                        } else {
        //                            input = document.createElement('input');
        //                            input.type = 'text';
        //                            input.value = valueElement.innerText;
        //                        }
        //                        cellValue.appendChild(input);
        //                    } else {
        //                        // Сохранение изменений
        //                        if (input) {
        //                            const newValue = input.value.trim();
        //                            if (typeof (object as any)[key] === 'number') {
        //                                const parsedValue = parseFloat(newValue);
        //                                if (isNaN(parsedValue)) {
        //                                    alert("Некорректное числовое значение.");
        //                                    return;
        //                                }
        //                                (object as any)[key] = parsedValue;
        //                                valueElement.innerText = parsedValue.toString();
        //                            } else {
        //                                (object as any)[key] = newValue;
        //                                valueElement.innerText = newValue;
        //                            }
        //                            cellValue.innerHTML = '';
        //                            cellValue.appendChild(valueElement);
        //                            editButton.innerText = 'Изменить';
        //                            inEditMode = false;
        //                            drawObjects(); // Перерисовываем объекты после изменения
        //                        }
        //                    }
        //                });
        //                cellEdit.appendChild(editButton);
        //            }
        //        }
        //    }
        //    drawObjects(); // Перерисовка объектов после создания таблицы
        //    return table;
        //}
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
                        key === "punctuation") {
                        cellValue.style.cursor = "pointer";
                        cellValue.addEventListener('click', () => {
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
                                const options = ["start", "end", "both", "none"];
                                options.forEach(option => {
                                    const opt = document.createElement('option');
                                    opt.value = option;
                                    opt.textContent = option;
                                    if (object[key] === option) {
                                        opt.selected = true;
                                    }
                                    input.appendChild(opt);
                                });
                            }
                            else if (key === "punctuation") {
                                input = document.createElement('select');
                                const options = ["yes", "none"];
                                options.forEach(option => {
                                    const opt = document.createElement('option');
                                    opt.value = option;
                                    opt.textContent = option;
                                    if (object[key] === option) {
                                        opt.selected = true;
                                    }
                                    input.appendChild(opt);
                                });
                            }
                            else {
                                input = document.createElement('input');
                                input.type = 'text';
                                input.value = valueElement.innerText;
                            }
                            input.focus();
                            input.addEventListener('keydown', (e) => {
                                if (e.key === 'Enter') {
                                    const newValue = input.value.trim();
                                    if (typeof object[key] === 'number') {
                                        const parsedValue = parseFloat(newValue);
                                        if (isNaN(parsedValue)) {
                                            alert("Некорректное числовое значение.");
                                            return;
                                        }
                                        object[key] = parsedValue;
                                        valueElement.innerText = parsedValue.toString();
                                    }
                                    else {
                                        object[key] = newValue;
                                        valueElement.innerText = newValue;
                                    }
                                    cellValue.innerHTML = '';
                                    cellValue.appendChild(valueElement);
                                    drawObjects();
                                }
                            });
                            input.addEventListener('blur', () => {
                                cellValue.innerHTML = '';
                                cellValue.appendChild(valueElement);
                            });
                            cellValue.appendChild(input);
                        });
                    }
                }
            }
            drawObjects(); // Перерисовка объектов после создания таблицы
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
                            drawDirectedLine(ctx, startX, startY, endX, endY, 'blue');
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
        function drawObjects() {
            if (ctx) {
                logDebug("NOW I AM DRAWING OBJECTS");
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
                            drawStar(ctx, star.x_C, star.y_C, star.rad, star.amount_points, star.m, star);
                            updateConnectors(star);
                            enteringText(obj);
                            break;
                        case 'cloud':
                            const cloud = obj;
                            drawCloud(ctx, cloud.x_C, cloud.y_C, cloud.width, cloud.height, cloud);
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
