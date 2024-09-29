(function () {
    //import { v4 as uuidv4 } from 'uuid';
    let objects: Shape[] = [];
    let highlight: Shape[] = [];
    let ctx: CanvasRenderingContext2D | null = null;
    // Переменные для хранения информации о текущем выбранном объекте и его начальной позиции
    let selectedObject: Shape | null = null;
    let selectedObject_canv: Shape | null = null;
    let selectedObject_buf: Shape | null = null;
    let selectedObject_buf_connect: Shape | null = null;
    let selectedLineEnd: 'start' | 'end' | null = null; // Новая переменная для хранения конца линии
    let startX: number, startY: number;
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

    function generateRandomId(length: number): string {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;

        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }

        return result;
    }
    function processFileContent(content: string, objects: Shape[]) {
        try {
            const sizeMatch = content.match(/Size:({[^}]+})/);
            const objectsMatch = content.match(/Objects:\(([^)]+)\)/);

            if (sizeMatch && objectsMatch) {
                const size = JSON.parse(sizeMatch[1]);
                const shapes = JSON.parse(`[${objectsMatch[1]}]`);

                objects = shapes.map((obj: any) => {
                    //if (obj.imageSrc) {
                    //    insertionImageFromFile(obj);
                    //}
                    const baseProps = {
                        id: obj.id || generateUniqueId(),
                        type: obj.type,
                        color: obj.color || '#000',
                        rotation: obj.rotation || 0,
                        info: obj.info || '',
                        linkedObjects: obj.linkedObjects || [],
                        outgoingLinks: obj.outgoingLinks || [],
                        incomingLinks: obj.incomingLinks || [],
                        //imageSrc: obj.imageScr || []
                    };

                    if (obj.type === 'rectangle') {
                        return {
                            ...baseProps,
                            x: obj.x,
                            y: obj.y,
                            width: obj.width,
                            height: obj.height
                        } as Rectangle;
                    } else if (obj.type === 'circle') {
                        return {
                            ...baseProps,
                            x: obj.x,
                            y: obj.y,
                            radius: obj.radius
                        } as Circle;
                    } else if (obj.type === 'line') {
                        return {
                            ...baseProps,
                            startX: obj.startX,
                            startY: obj.startY,
                            endX: obj.endX,
                            endY: obj.endY
                        } as Line;
                    } else if (obj.type === 'star') {
                        return {
                            ...baseProps,
                            x_C: obj.x_C,
                            y_C: obj.y_C,
                            rad: obj.rad,
                            amount_points: obj.amount_points,
                            m: obj.m
                        } as Star;
                    } else if (obj.type === 'cloud') {
                        return {
                            ...baseProps,
                            x_C: obj.x_C,
                            y_C: obj.y_C,
                            width: obj.width,
                            height: obj.height
                        } as Cloud;
                    } else {
                        throw new Error('Unknown shape type');
                    }
                });
                return objects;
            } else if (sizeMatch && !objectsMatch) {
                const size = JSON.parse(sizeMatch[1]);
                objects = [];
                return objects;
            } else {
                throw new Error('Invalid file format');
            }
        } catch (error) {
            console.error('Error processing file content:', error);
        }
    }

    document.getElementById('fileInput')?.addEventListener('change', function (event) {
        try {
            const input = event.target as HTMLInputElement;
            const file = input.files?.[0];

            if (file) {
                const reader = new FileReader();

                reader.onload = function (e) {
                    try {
                        const content = e.target?.result;
                        if (typeof content === 'string') {
                            processFileContent(content, objects);
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

    document.getElementById('contextMenu').style.display = 'none';


    // Сохранение схемы между перезагрузками
    // Функция для сохранения схемы в локальное хранилище
    function saveToLocalStorage() {
        if ((objects && objects.length) === 0) {
            console.warn("Cannot save: no objects present");
            return;
        }
        localStorage.removeItem('savedSchema');
        const size = { width: canvas.width, height: canvas.height };
        const shapes = JSON.stringify(objects, null, 2);
        const content = `Size:${JSON.stringify(size)}\nObjects:(${shapes.slice(1, -1)})`;
        localStorage.setItem('savedSchema', content);
        console.log("Schema saved");
    }
    
    // Запуск периодического сохранения и восстановления
    setInterval(saveToLocalStorage, 9000);

    const canvas = document.getElementById('canvas') as HTMLCanvasElement;

    if (!canvas) {
        logDebug("Canvas element not found");
        return;
    } else {
        canvas.oncontextmenu = () => false;
        logDebug("Canvas element found");
        
    }
    
    const gridCanvas = document.createElement('canvas');
    const gridCtx = gridCanvas.getContext('2d')!;
    gridCanvas.width = canvas.width;
    gridCanvas.height = canvas.height;

    // Функция для рисования сетки
    function drawGrid(ctx: CanvasRenderingContext2D, width: number, height: number, gridSize: number) {
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
        } else {
            logDebug("Canvas context obtained");
        }
        //console.log(objects);
        drawObjects();
        const img = new Image();
        img.onload = function () {
            //logDebug("Image loaded");
            drawObjects();
        };
        img.onerror = function () {
            //logDebug("Failed to load image");
        };
        img.src = 'img/yyy.jpg';

        // Обработчики событий
        canvas.addEventListener('mousedown', function (e: MouseEvent) {
            onMouseDown(e);
        });
        canvas.addEventListener('mousemove', function (e: MouseEvent) {
            onMouseMove(e);
        });
        canvas.addEventListener('mouseup', function (e: MouseEvent) {
            onMouseUp(e);
        });

        document.getElementById('addRectBtn')?.addEventListener('click', function () {
            logDebug("Add rectangle button clicked");
            addRect();
        });

        document.getElementById('addCircleBtn')?.addEventListener('click', function () {
            logDebug("Add circle button clicked");
            addCircle();
        });

        document.getElementById('addLineBtn')?.addEventListener('click', function () {
            logDebug("Add line button clicked");
            addLine();
        });

        document.getElementById('addCloudBtn')?.addEventListener('click', function () {
            logDebug("Add cloud button clicked");
            addCloud();
        });

        document.getElementById('addStarBtn')?.addEventListener('click', function () {
            logDebug("Add star button clicked");
            addStar();
        });

        document.getElementById('delShapeBtn')?.addEventListener('click', function () {
            logDebug("Delete shape button clicked");
            deleteShape();
        });

        document.getElementById('rotateLeftBtn')?.addEventListener('click', function () {
            logDebug("Rotate left button clicked");
            rotateSelectedObject(-10);
        });

        document.getElementById('rotateRightBtn')?.addEventListener('click', function () {
            logDebug("Rotate right button clicked");
            rotateSelectedObject(10);
        });
        document.getElementById('deleteItem')?.addEventListener('click', function () {
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

        document.getElementById('rotateLeftItem')?.addEventListener('click', function () {
            if (selectedObject_buf) {
                rotateSelectedObject(-10);
            }
            selectedObject_buf = null;
            drawObjects();
        });

        document.getElementById('rotateRightItem')?.addEventListener('click', function () {
            if (selectedObject_buf) {
                rotateSelectedObject(10);
            }
            selectedObject_buf = null;
            drawObjects();
            //hideContextMenu();
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

        document.getElementById('longWayCheck')?.addEventListener('click', function () {
            logDebug(`longWayCheck button clicked`);
            connectionServ = 5;
            waySelection();
        });

        document.getElementById('connect_objects')?.addEventListener('click', function () {
            logDebug(`connectionObjects button clicked`);
            connectionServ = 1;
            connectionObjects();
        });

        document.getElementById('remove_connection')?.addEventListener('click', function () {
            logDebug(`remove_connection button clicked`);
            connectionServ = 0;
            removeObjects();
        });

        document.getElementById('outgoing_connect')?.addEventListener('click', function () {
            logDebug(`outgoingConnectionObjects button clicked`);
            connectionServ = 3;
            connectionObjects();
        });

        document.getElementById('remove_outgoing_connection')?.addEventListener('click', function () {
            logDebug(`remove_connection button clicked`);
            connectionServ = 4;
            removeObjects();
        });

        document.getElementById('additionInfo')?.addEventListener('click', function () {
            addInfoclick();
        });

        document.addEventListener('contextmenu', function (e) {
            e.preventDefault();
            //showContextMenu(e.clientX, e.clientY);
            onMouseDown(e);
        });

        document.getElementById('insert_img')?.addEventListener('click', function () {
            logDebug("Insert img button clicked");
            document.getElementById('imageInput')?.click(); // Открываем диалог выбора файлов
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
            const menu = document.getElementById('contextMenu');
            const menuWidth = menu.offsetWidth;
            const menuHeight = menu.offsetHeight;
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;

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
            menu.style.display = 'none';
            menu.hidden = true;
        }
        function highlighting(obj_: Shape, ctx_: CanvasRenderingContext2D) {
            if (highlight.includes(obj_)) {
                ctx_.save();
                ctx_.strokeStyle = 'red'; // Цвет контура для выделенных объектов
                ctx_.lineWidth = 4; // Толщина контура

                if (obj_.type === 'rectangle') {
                    const rect = obj_ as Rectangle;
                    ctx_.strokeRect(rect.x, rect.y, rect.width, rect.height);
                } else if (obj_.type === 'circle') {
                    const circle = obj_ as Circle;
                    ctx_.beginPath();
                    ctx_.arc(circle.x, circle.y, circle.radius + 2, 0, 2 * Math.PI); // Добавляем 2 пикселя к радиусу для контурного выделения
                    ctx_.stroke();
                } else if (obj_.type === 'line') {
                    const line = obj_ as Line;
                    ctx_.beginPath();
                    ctx_.moveTo(line.startX, line.startY);
                    ctx_.lineTo(line.endX, line.endY);
                    ctx_.stroke();
                } else if (obj_.type === 'star') {
                    const star = obj_ as Star;
                    // Код для отрисовки контура звезды
                    ctx_.beginPath();
                    drawStar(ctx_, star.x_C, star.y_C, star.rad + 2, star.amount_points, star.m, star); // Увеличиваем радиус для контурного выделения
                    ctx_.stroke();
                } else if (obj_.type === 'cloud') {
                    const cloud = obj_ as Cloud;
                    ctx_.beginPath();
                    drawCloud(ctx_, cloud.x_C, cloud.y_C, cloud.width + 4, cloud.height + 4, cloud); // Увеличиваем размеры для контурного выделения
                    ctx_.stroke();
                }

                ctx_.restore();
            }
        }


        // Инициализация отрисовки объектов на холсте
        drawObjects();


        function getObjectCenter(obj: Shape): [number, number] {
            switch (obj.type) {
                case 'rectangle':
                    const rect = obj as Rectangle;
                    return [rect.x + rect.width / 2, rect.y + rect.height / 2];
                case 'circle':
                    const circle = obj as Circle;
                    return [circle.x, circle.y];
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

        function addStar() {
            const newStar: Star = {
                id: generateRandomId(16),
                type: 'star',
                x_C: Math.random() * (canvas.width - 200),
                y_C: Math.random() * (canvas.width - 200),
                rad: 100,
                amount_points: 6,
                m: 0.5,
                color: getRandomColor(),
                rotation: 0
            }
            objects.push(newStar);
            logDebug(`Star added: ${JSON.stringify(newStar)}`);
            drawObjects();
        }
        function addCloud() {
            const newStar: Cloud = {
                id: generateRandomId(16),
                type: 'cloud',
                x_C: Math.random() * (canvas.width - 200),
                y_C: Math.random() * (canvas.width - 200),
                width: 200,
                height: 120,
                color: getRandomColor(),
                rotation: 0
            }
            objects.push(newStar);
            logDebug(`Cloud added: ${JSON.stringify(newStar)}`);
            drawObjects();
        }
        function drawSquare(ctx, x, y, size) {
            ctx.fillStyle = 'black';
            ctx.fillRect(x - size / 2, y - size / 2, size, size);
        }
        function drawStar(ctx, x_C, y_C, rad, amount_points, m, obj) {
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
            ctx.fillStyle = obj.color;
            ctx.fill();
            if (selectedObject_buf == obj) {
                points.forEach(point => drawSquare(ctx, point.x, point.y, 10));
            }
        }
        function drawCloud(ctx, x_C, y_C, width, height, obj) {
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
            ctx.fillStyle = obj.color;
            ctx.fill();

            if (selectedObject_buf == obj) {
                points.forEach(point => drawSquare(ctx, point.x, point.y, 10));
            }
        }
        function addRect() {
            const newRect: Rectangle = {
                id: generateRandomId(16),
                type: 'rectangle',
                x: Math.random() * (canvas.width - 50),
                y: Math.random() * (canvas.height - 50),
                width: 50,
                height: 50,
                color: getRandomColor(),
                rotation: 0
            };
            objects.push(newRect);
            logDebug(`Rectangle added: ${JSON.stringify(newRect)}`);
            drawObjects();
        }
        function addCircle() {
            const newCircle: Circle = {
                id: generateRandomId(16),
                type: 'circle',
                x: Math.random() * (canvas.width - 50) + 25,
                y: Math.random() * (canvas.height - 50) + 25,
                radius: 25,
                color: getRandomColor(),
                rotation: 0
            };
            objects.push(newCircle);
            logDebug(`Circle added: ${JSON.stringify(newCircle)}`);
            drawObjects();
        }
        function addLine() {
            const newLine: Line = {
                id: generateRandomId(16),
                type: 'line',
                startX: Math.random() * canvas.width,
                startY: Math.random() * canvas.height,
                endX: Math.random() * canvas.width,
                endY: Math.random() * canvas.height,
                color: getRandomColor(),
                rotation: 0
            };
            objects.push(newLine);
            logDebug(`Line added: ${JSON.stringify(newLine)}`);
            drawObjects();
        }
        function deleteShape() {
            if (selectedObject_buf) {
                const indexToRemove = objects.indexOf(selectedObject_buf);
                if (indexToRemove !== -1) {
                    const shapeToRemove = objects[indexToRemove];

                    logDebug(`Deleting shape: ${JSON.stringify(shapeToRemove)}`);

                    // Удаляем ссылки на удаляемую фигуру из других объектов
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
                    }

                    // Удаляем сам объект из массива objects
                    objects.splice(indexToRemove, 1);

                    drawObjects();
                    selectedObject_buf = null;
                    while (container.firstChild) {
                        container.removeChild(container.firstChild);
                    }
                }
            } else {
                logDebug("No shape selected to delete");
            }
        }
        function rotateSelectedObject(angle: number) {
            if (selectedObject_buf) {
                selectedObject_buf.rotation = (selectedObject_buf.rotation || 0) + angle;
                logDebug(`Rotated object: ${JSON.stringify(selectedObject_buf)}`);
                drawObjects();
            }
        }
        function addInfoclick() {
            addInfo(selectedObject_buf);
        }
        function addInfo(selectedObject_buf_: Shape) {
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
                //if (table && table.parentElement) {
                //    table.parentElement.removeChild(table);
                //}
                if (container) {
                    while (container.firstChild) {
                        container.removeChild(container.firstChild);
                    }
                }
                container?.appendChild(table);
            }
        }
        function onMouseDown(e: MouseEvent) {
            if (objects.length === 0) {
                savedSchema = localStorage.getItem('savedSchema');
                objects = processFileContent(savedSchema, objects);
            }
            logDebug(`(${objects})`);
            const mouseX = e.clientX - canvas.offsetLeft;
            const mouseY = e.clientY - canvas.offsetTop;
            const mouse_meaning = e.button;
            if (mouse_meaning === 1) {
                mouse_meaning_check = 1;
            }
            logDebug(`Mouse down at (${mouseX}, ${mouseY}, ${mouse_meaning})`);
            if (mouse_meaning === 0 && mouse_meaning_check != 1) {
                if (highlight.length != 0) {
                    //console.log("i am here");
                    logDebug(`highlight - (${highlight})`);
                    highlight = [];
                }
                for (let i = objects.length - 1; i >= 0; i--) {
                    const obj = objects[i];
                    if (obj.type === 'rectangle') {
                        const rect = obj as Rectangle;
                        if (mouseX >= rect.x && mouseX <= rect.x + rect.width && mouseY >= rect.y && mouseY <= rect.y + rect.height) {
                            selectedObject = rect;
                            selectedObject_buf = rect;
                            startX = mouseX - rect.x;
                            startY = mouseY - rect.y;
                            logDebug(`Selected rectangle: ${JSON.stringify(rect)}`);
                            selectedObject_buf_connect = selectionCheck(selectedObject_buf_connect, selectedObject_buf, connectionServ);
                            connectionServ == 2;
                            tableObjectCheck(selectedObject_buf);
                            break;
                        }
                    } else if (obj.type === 'circle') {
                        const circle = obj as Circle;
                        const dx = mouseX - circle.x;
                        const dy = mouseY - circle.y;
                        if (dx * dx + dy * dy <= circle.radius * circle.radius) {
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
                    } else if (obj.type === 'line') {
                        const line = obj as Line;
                        const distStart = Math.sqrt((mouseX - line.startX) ** 2 + (mouseY - line.startY) ** 2);
                        const distEnd = Math.sqrt((mouseX - line.endX) ** 2 + (mouseY - line.endY) ** 2);

                        const distToLine = Math.abs((line.endY - line.startY) * mouseX - (line.endX - line.startX) * mouseY + line.endX * line.startY - line.endY * line.startX) /
                            Math.sqrt((line.endY - line.startY) ** 2 + (line.endX - line.startX) ** 2);

                        if (distStart < 5 || distEnd < 5 || distToLine < 10) {
                            selectedObject = line;
                            selectedObject_buf = line;
                            startX = mouseX;
                            startY = mouseY;
                            logDebug(`Selected line: ${JSON.stringify(line)}`);
                            selectedObject_buf_connect = selectionCheck(selectedObject_buf_connect, selectedObject_buf, connectionServ);
                            connectionServ == 2;
                            tableObjectCheck(selectedObject_buf);
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

                    } else if (obj.type === 'cloud') {
                        const cloud = obj as Cloud;
                        let startX_Cloud = cloud.x_C - cloud.width / 2;
                        let startY_Cloud = cloud.y_C - cloud.height / 2;
                        if (mouseX >= startX_Cloud && mouseX <= startX_Cloud + cloud.width && mouseY >= startY_Cloud && mouseY <= startY_Cloud + cloud.height) {
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

                    } else {
                        selectedObject = null;
                        selectedObject_buf = null;
                    }
                }
                drawObjects();
            } else if (mouse_meaning == 2 && selectedObject_buf != null && mouse_meaning_check != 1) { // тут селект объект равен нулю
                for (let i = objects.length - 1; i >= 0; i--) {
                    const obj = objects[i];
                    if (obj.type === 'rectangle') {
                        const rect = obj as Rectangle;
                        if (mouseX >= rect.x && mouseX <= rect.x + rect.width && mouseY >= rect.y && mouseY <= rect.y + rect.height) {
                            selectedObject_buf = rect;
                            startX = mouseX - rect.x;
                            startY = mouseY - rect.y;
                            showContextMenu(e.clientX, e.clientY);
                            logDebug(`Selected rectangle: ${JSON.stringify(rect)}`);
                            break;
                        }
                    } else if (obj.type === 'circle') {
                        const circle = obj as Circle;
                        const dx = mouseX - circle.x;
                        const dy = mouseY - circle.y;
                        if (dx * dx + dy * dy <= circle.radius * circle.radius) {
                            selectedObject_buf = circle;
                            startX = dx;
                            startY = dy;
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
                            showContextMenu(e.clientX, e.clientY);
                            logDebug(`Selected cloud: ${JSON.stringify(cloud)}`);
                            break;
                        }

                    }
                }
            } else if (mouse_meaning_check === 1) {
                logDebug(`Button pressed id - 1 - (${mouse_meaning})`);
                e.preventDefault();
                startX = e.offsetX;
                startY = e.offsetY;
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
                            return startX >= rect.x && startX <= rect.x + rect.width && startY >= rect.y && startY <= rect.y + rect.height;
                        case 'circle':
                            const circle = obj as Circle;
                            const dx = startX - circle.x;
                            const dy = startY - circle.y;
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
        }
        function onMouseMove(e: MouseEvent) {
            const mouseX = e.clientX - canvas.offsetLeft;
            const mouseY = e.clientY - canvas.offsetTop;
            const mouse_meaning = e.button;
            //logDebug(`Mouse move at (${mouseX}, ${mouseY}, ${mouse_meaning})`);
            if (selectedObject && (mouse_meaning === 0) && mouse_meaning_check != 1) {
                //logDebug(`selectedObject - (${JSON.stringify(selectedObject)}, ${JSON.stringify(selectedObject_buf)})`);
                if (selectedObject.type === 'rectangle') {
                    const rect = selectedObject as Rectangle;
                    rect.x = mouseX - startX;
                    rect.y = mouseY - startY;
                } else if (selectedObject.type === 'circle') {
                    const circle = selectedObject as Circle;
                    circle.x = mouseX - startX;
                    circle.y = mouseY - startY;
                } else if (selectedObject.type === 'line') {
                    const line = selectedObject as Line;
                    const distStart = Math.sqrt((mouseX - line.startX) ** 2 + (mouseY - line.startY) ** 2);
                    const distEnd = Math.sqrt((mouseX - line.endX) ** 2 + (mouseY - line.endY) ** 2);

                    // Расчет расстояния от точки до линии
                    const distToLine = Math.abs((line.endY - line.startY) * mouseX - (line.endX - line.startX) * mouseY + line.endX * line.startY - line.endY * line.startX) /
                        Math.sqrt((line.endY - line.startY) ** 2 + (line.endX - line.startX) ** 2);

                    if (distStart < 20) {
                        const dx = mouseX - startX;
                        const dy = mouseY - startY;
                        line.startX += dx;
                        line.startY += dy;
                        startX = mouseX;
                        startY = mouseY;
                        drawObjects();
                        logDebug(`Line selected start`);
                    } else if (distEnd < 20) {
                        const dx = mouseX - startX;
                        const dy = mouseY - startY;
                        line.endX += dx;
                        line.endY += dy;
                        startX = mouseX;
                        startY = mouseY;
                        drawObjects();
                        logDebug(`Line selected end`);
                    } else if (distToLine < 10) {  // Проверка на близость к линии
                        const dx = mouseX - startX;
                        const dy = mouseY - startY;
                        line.startX += dx;
                        line.startY += dy;
                        line.endX += dx;
                        line.endY += dy;
                        startX = mouseX;
                        startY = mouseY;
                        drawObjects();
                        logDebug(`Line selected body`);
                    } else {
                        //logDebug(`GGWP1`);
                    }
                } else if (selectedObject.type === 'star') {
                    const star = selectedObject as Star;
                    
                    star.x_C = mouseX - startX;
                    star.y_C = mouseY - startY;
                    
                } else if (selectedObject.type === 'cloud') {
                    const cloud = selectedObject as Cloud;
                    logDebug(`(${mouseX})(${mouseY})`);
                    logDebug(`(${startX})(${startY})`);
                    cloud.x_C = mouseX - startX;
                    cloud.y_C = mouseY - startY;
                    logDebug(`(${mouseX - startX})(${mouseY - startY})`);
                }
                drawObjects();
            } else if (mouse_meaning_check === 1) {
                logDebug(`Button moved id - 1`);
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
                            rect.x += dx;
                            rect.y += dy;
                            break;
                        case 'circle':
                            const circle = selectedObject_canv as Circle;
                            circle.x += dx;
                            circle.y += dy;
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
            } else {
                //logDebug(`GGWP2`);
            }
        }
        function onMouseUp(e) {
            let mouse_meaning = e.button
            if (selectedObject && (mouse_meaning == 0) && mouse_meaning_check != 1) {
                logDebug(`Mouse up, deselecting object: ${JSON.stringify(selectedObject)}`);
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
            selectedObject = null;
            selectedLineEnd = null;
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
        
        document.getElementById('downloadBtn')?.addEventListener('click', function () {
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
                    // Optionally, you can apply the CSS dynamically if needed
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
                    width: parseInt(sizeElement.getAttribute('width') || '0'),
                    height: parseInt(sizeElement.getAttribute('height') || '0')
                };

                objects = Array.from(objectsElements).map((elem) => {
                    const type = elem.getAttribute('type');
                    const baseProps = {
                        id: elem.getAttribute('id') || generateUniqueId(),
                        type,
                        color: elem.getAttribute('color') || '#000',
                        rotation: parseFloat(elem.getAttribute('rotation') || '0'),
                        info: elem.getAttribute('info') || '',
                        linkedObjects: elem.getAttribute('linkedObjects')?.split(',') || [],
                        outgoingLinks: elem.getAttribute('outgoingLinks')?.split(',') || [],
                        incomingLinks: elem.getAttribute('incomingLinks')?.split(',') || []
                    };

                    if (type === 'rectangle') {
                        return {
                            ...baseProps,
                            x: parseFloat(elem.getAttribute('x') || '0'),
                            y: parseFloat(elem.getAttribute('y') || '0'),
                            width: parseFloat(elem.getAttribute('width') || '0'),
                            height: parseFloat(elem.getAttribute('height') || '0'),
                        } as Rectangle;
                    } else if (type === 'circle') {
                        return {
                            ...baseProps,
                            x: parseFloat(elem.getAttribute('x') || '0'),
                            y: parseFloat(elem.getAttribute('y') || '0'),
                            radius: parseFloat(elem.getAttribute('radius') || '0'),
                        } as Circle;
                    } else if (type === 'line') {
                        return {
                            ...baseProps,
                            startX: parseFloat(elem.getAttribute('startX') || '0'),
                            startY: parseFloat(elem.getAttribute('startY') || '0'),
                            endX: parseFloat(elem.getAttribute('endX') || '0'),
                            endY: parseFloat(elem.getAttribute('endY') || '0'),
                        } as Line;
                    } else if (type === 'star') {
                        return {
                            ...baseProps,
                            x_C: parseFloat(elem.getAttribute('x_C') || '0'),
                            y_C: parseFloat(elem.getAttribute('y_C') || '0'),
                            rad: parseFloat(elem.getAttribute('rad') || '0'),
                            amount_points: parseInt(elem.getAttribute('amount_points') || '0'),
                            m: parseFloat(elem.getAttribute('m') || '0')
                        } as Star;
                    } else if (type === 'cloud') {
                        return {
                            ...baseProps,
                            x_C: parseFloat(elem.getAttribute('x_C') || '0'),
                            y_C: parseFloat(elem.getAttribute('y_C') || '0'),
                            width: parseFloat(elem.getAttribute('width') || '0'),
                            height: parseFloat(elem.getAttribute('height') || '0'),
                        } as Cloud;
                    } else {
                        throw new Error('Unknown shape type');
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
                const baseProps = `id="${obj.id}" type="${obj.type}" color="${obj.color}" rotation="${obj.rotation || 0}" info="${obj.info || ''}" linkedObjects="${obj.linkedObjects?.join(',') || ''}" outgoingLinks="${obj.outgoingLinks?.join(',') || ''}" incomingLinks="${obj.incomingLinks?.join(',') || ''}"`;

                switch (obj.type) {
                    case 'rectangle':
                        const rect = obj as Rectangle;
                        return `<object ${baseProps} x="${rect.x}" y="${rect.y}" width="${rect.width}" height="${rect.height}"/>`;
                    case 'circle':
                        const circle = obj as Circle;
                        return `<object ${baseProps} x="${circle.x}" y="${circle.y}" radius="${circle.radius}"/>`;
                    case 'line':
                        const line = obj as Line;
                        return `<object ${baseProps} startX="${line.startX}" startY="${line.startY}" endX="${line.endX}" endY="${line.endY}"/>`;
                    case 'star':
                        const star = obj as Star;
                        return `<object ${baseProps} x_C="${star.x_C}" y_C="${star.y_C}" rad="${star.rad}" amount_points="${star.amount_points}" m="${star.m}"/>`;
                    case 'cloud':
                        const cloud = obj as Cloud;
                        return `<object ${baseProps} x_C="${cloud.x_C}" y_C="${cloud.y_C}" width="${cloud.width}" height="${cloud.height}"/>`;
                    default:
                        throw new Error('Unknown object type');
                }
            }).join('\n');

            return `<diagram>\n${sizeXML}\n${objectsXML}\n</diagram>`;
        }

        document.getElementById('fileInput3')?.addEventListener('change', function (event) {
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
                                    processOWLFileContent(content);
                                } else {
                                    objects = processFileContent(content, objects);
                                }
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
        

        document.getElementById('downloadBtn3')?.addEventListener('click', function () {
            const owlContent = convertObjectsToOWL(objects);
            downloadFile('shapes.owl', owlContent);
        });

        function createVerticalTable(object: Shape): HTMLTableElement {
            const table = document.createElement('table');
            table.style.border = '1px solid black';
            table.style.borderCollapse = 'collapse';
            table.style.width = '400px'; // Устанавливаем фиксированную ширину таблицы
            table.style.tableLayout = 'fixed'; // Фиксируем ширину колонок

            // Перебираем свойства объекта
            for (const key in object) {
                if (object.hasOwnProperty(key)) {
                    const row = table.insertRow();

                    const cellKey = row.insertCell();
                    cellKey.style.border = '1px solid black';
                    cellKey.style.padding = '5px';
                    cellKey.style.width = '35%';
                    cellKey.innerText = key;

                    const cellValue = row.insertCell();
                    cellValue.style.border = '1px solid black';
                    cellValue.style.padding = '5px';
                    cellValue.style.width = '65%';
                    cellValue.innerText = (object as any)[key];
                }
            }

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

        //function drawObjects() {
        //    if (ctx) {
        //        ctx.clearRect(0, 0, canvas.width, canvas.height);
        //        ctx.save();
        //        ctx.translate(offsetX, offsetY);
        //        ctx.drawImage(gridCanvas, 0, 0);
        //        // Сначала отрисовываем связи между объектами
        //        for (const obj of objects) {
        //            if (obj.linkedObjects) {
        //                obj.linkedObjects.forEach(linkedId => {
        //                    const linkedObj = objects.find(o => o.id === linkedId);
        //                    if (linkedObj) {
        //                        ctx.beginPath();

        //                        // Получаем центральные координаты текущего объекта
        //                        const [startX, startY] = getObjectCenter(obj);

        //                        // Получаем центральные координаты связанного объекта
        //                        const [endX, endY] = getObjectCenter(linkedObj);

        //                        // Рисуем линию от текущего объекта к связанному объекту
        //                        ctx.moveTo(startX, startY);
        //                        ctx.lineTo(endX, endY);
        //                        ctx.strokeStyle = 'black';
        //                        ctx.lineWidth = 2;
        //                        ctx.stroke();
        //                    }
        //                });
        //            }
        //            if (obj.outgoingLinks) {
        //                obj.outgoingLinks.forEach(linkedId => {
        //                    const linkedObj = objects.find(o => o.id === linkedId);
        //                    if (linkedObj) {
        //                        const [startX, startY] = getObjectCenter(obj);
        //                        const [endX, endY] = getObjectCenter(linkedObj);

        //                        drawDirectedLine(ctx, startX, startY, endX, endY, 'blue');
        //                    }
        //                });
        //            }
        //        }

        //        // Затем отрисовываем сами объекты
        //        for (const obj of objects) {
        //            logDebug(`Drawing object: ${JSON.stringify(obj)}`);

        //            ctx.save();
        //            let centerX = 0;
        //            let centerY = 0;
        //            if (obj.rotation) {
        //                if (obj.type === 'rectangle') {
        //                    centerX = (obj as Rectangle).x + (obj as Rectangle).width / 2;
        //                    centerY = (obj as Rectangle).y + (obj as Rectangle).height / 2;
        //                } else if (obj.type === 'circle') {
        //                    centerX = (obj as Circle).x;
        //                    centerY = (obj as Circle).y;
        //                } else if (obj.type === 'line') {
        //                    centerX = ((obj as Line).startX + (obj as Line).endX) / 2;
        //                    centerY = ((obj as Line).startY + (obj as Line).endY) / 2;
        //                } else if (obj.type === 'star') {
        //                    centerX = (obj as Star).x_C;
        //                    centerY = (obj as Star).y_C;
        //                } else if (obj.type === 'cloud') {
        //                    centerX = (obj as Cloud).x_C;
        //                    centerY = (obj as Cloud).y_C;
        //                }
        //                ctx.translate(centerX, centerY);
        //                ctx.rotate((obj.rotation * Math.PI) / 180);
        //                ctx.translate(-centerX, -centerY);
        //            }

        //            switch (obj.type) {
        //                case 'rectangle':
        //                    const rect = obj as Rectangle;
        //                    ctx.fillStyle = rect.color;
        //                    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
        //                    if (rect.image) {
        //                        ctx.drawImage(rect.image, rect.x, rect.y, rect.width!, rect.height!);//
        //                    }
        //                    if (selectedObject_buf == rect) {
        //                        ctx.fillStyle = 'black';
        //                        ctx.fillRect(rect.x - 5, rect.y - 5, 10, 10);
        //                        ctx.fillRect(rect.x + rect.width - 5, rect.y - 5, 10, 10);
        //                        ctx.fillRect(rect.x - 5, rect.y + rect.height - 5, 10, 10);
        //                        ctx.fillRect(rect.x + rect.width - 5, rect.y + rect.height - 5, 10, 10);
        //                    }
        //                    break;
        //                case 'circle':
        //                    const circle = obj as Circle;
        //                    ctx.beginPath();
        //                    ctx.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI);
        //                    ctx.fillStyle = circle.color;
        //                    ctx.fill();
        //                    if (selectedObject_buf == circle) {
        //                        ctx.beginPath();
        //                        ctx.arc(circle.x, circle.y - circle.radius - 5, 5, 0, 2 * Math.PI);
        //                        ctx.fillStyle = 'black';
        //                        ctx.fill();
        //                        ctx.beginPath();
        //                        ctx.arc(circle.x - circle.radius - 5, circle.y, 5, 0, 2 * Math.PI);
        //                        ctx.fillStyle = 'black';
        //                        ctx.fill();
        //                        ctx.beginPath();
        //                        ctx.arc(circle.x, circle.y + circle.radius + 5, 5, 0, 2 * Math.PI);
        //                        ctx.fillStyle = 'black';
        //                        ctx.fill();
        //                        ctx.beginPath();
        //                        ctx.arc(circle.x + circle.radius + 5, circle.y, 5, 0, 2 * Math.PI);
        //                        ctx.fillStyle = 'black';
        //                        ctx.fill();
        //                    }
        //                    break;
        //                case 'line':
        //                    const line = obj as Line;
        //                    ctx.beginPath();
        //                    ctx.moveTo(line.startX, line.startY);
        //                    ctx.lineTo(line.endX, line.endY);
        //                    ctx.strokeStyle = line.color;
        //                    ctx.lineWidth = 5;
        //                    ctx.stroke();
        //                    if (selectedObject_buf == line) {
        //                        ctx.beginPath();
        //                        ctx.arc(line.startX, line.startY, 5, 0, 2 * Math.PI);
        //                        ctx.fillStyle = 'black';
        //                        ctx.fill();
        //                        ctx.beginPath();
        //                        ctx.arc(line.endX, line.endY, 5, 0, 2 * Math.PI);
        //                        ctx.fillStyle = 'black';
        //                        ctx.fill();
        //                    }
        //                    break;
        //                case 'star':
        //                    const star = obj as Star;
        //                    drawStar(ctx, star.x_C, star.y_C, star.rad, star.amount_points, star.m, star);
        //                    break;
        //                case 'cloud':
        //                    const cloud = obj as Cloud;
        //                    drawCloud(ctx, cloud.x_C, cloud.y_C, cloud.width, cloud.height, cloud);
        //                    break;
        //                default:
        //                    logDebug(`Unknown object type: ${JSON.stringify(obj)}`);
        //            }

        //            // Выделяем объект, если он входит в цикл
        //            highlighting(obj, ctx);

        //            ctx.restore();
        //        }

        //        ctx.restore();
        //    } else {
        //        logDebug("Canvas context is not available");
        //    }
        //}

        function drawObjects() {
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.save();
                ctx.translate(offsetX, offsetY);
                ctx.drawImage(gridCanvas, 0, 0);

                // Сначала отрисовываем связи между объектами
                for (const obj of objects) {
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

                // Затем отрисовываем сами объекты
                for (const obj of objects) {
                    logDebug(`Drawing object: ${JSON.stringify(obj)}`);

                    ctx.save();
                    let centerX = 0;
                    let centerY = 0;
                    if (obj.rotation) {
                        if (obj.type === 'rectangle') {
                            centerX = (obj as Rectangle).x + (obj as Rectangle).width / 2;
                            centerY = (obj as Rectangle).y + (obj as Rectangle).height / 2;
                        } else if (obj.type === 'circle') {
                            centerX = (obj as Circle).x;
                            centerY = (obj as Circle).y;
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

                    switch (obj.type) {
                        case 'rectangle':
                            const rect = obj as Rectangle;
                            ctx.fillStyle = rect.color;
                            ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
                            if (rect.image) {
                                ctx.drawImage(rect.image, rect.x, rect.y, rect.width!, rect.height!);
                            }
                            if (selectedObject_buf == rect) {
                                ctx.fillStyle = 'black';
                                ctx.fillRect(rect.x - 5, rect.y - 5, 10, 10);
                                ctx.fillRect(rect.x + rect.width - 5, rect.y - 5, 10, 10);
                                ctx.fillRect(rect.x - 5, rect.y + rect.height - 5, 10, 10);
                                ctx.fillRect(rect.x + rect.width - 5, rect.y + rect.height - 5, 10, 10);
                            }
                            break;
                        case 'circle':
                            const circle = obj as Circle;
                            ctx.beginPath();
                            ctx.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI);
                            ctx.fillStyle = circle.color;
                            ctx.fill();
                            if (circle.image) {
                                // Клипируем область круга, чтобы ограничить изображение
                                ctx.save();
                                ctx.beginPath();
                                ctx.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI);
                                ctx.clip();
                                ctx.drawImage(circle.image, circle.x - circle.radius, circle.y - circle.radius, circle.radius * 2, circle.radius * 2);
                                ctx.restore();
                            }
                            if (selectedObject_buf == circle) {
                                ctx.beginPath();
                                ctx.arc(circle.x, circle.y - circle.radius - 5, 5, 0, 2 * Math.PI);
                                ctx.fillStyle = 'black';
                                ctx.fill();
                                ctx.beginPath();
                                ctx.arc(circle.x - circle.radius - 5, circle.y, 5, 0, 2 * Math.PI);
                                ctx.fillStyle = 'black';
                                ctx.fill();
                                ctx.beginPath();
                                ctx.arc(circle.x, circle.y + circle.radius + 5, 5, 0, 2 * Math.PI);
                                ctx.fillStyle = 'black';
                                ctx.fill();
                                ctx.beginPath();
                                ctx.arc(circle.x + circle.radius + 5, circle.y, 5, 0, 2 * Math.PI);
                                ctx.fillStyle = 'black';
                                ctx.fill();
                            }
                            break;
                        case 'line':
                            const line = obj as Line;
                            ctx.beginPath();
                            ctx.moveTo(line.startX, line.startY);
                            ctx.lineTo(line.endX, line.endY);
                            ctx.strokeStyle = line.color;
                            ctx.lineWidth = 5;
                            ctx.stroke();
                            // Линии не поддерживают изображение, но можно добавить, если требуется
                            if (selectedObject_buf == line) {
                                ctx.beginPath();
                                ctx.arc(line.startX, line.startY, 5, 0, 2 * Math.PI);
                                ctx.fillStyle = 'black';
                                ctx.fill();
                                ctx.beginPath();
                                ctx.arc(line.endX, line.endY, 5, 0, 2 * Math.PI);
                                ctx.fillStyle = 'black';
                                ctx.fill();
                            }
                            break;
                        case 'star':
                            const star = obj as Star;
                            drawStar(ctx, star.x_C, star.y_C, star.rad, star.amount_points, star.m, star);
                            // Звезды тоже могут поддерживать изображение при необходимости
                            break;
                        case 'cloud':
                            const cloud = obj as Cloud;
                            drawCloud(ctx, cloud.x_C, cloud.y_C, cloud.width, cloud.height, cloud);
                            // Обработка изображения для облаков
                            //if (cloud.image) {
                            //    ctx.drawImage(cloud.image, cloud.x_C - cloud.width / 2, cloud.y_C - cloud.height / 2, cloud.width, cloud.height);
                            //}
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
