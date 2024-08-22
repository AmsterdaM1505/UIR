(function () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z;
    //import { v4 as uuidv4 } from 'uuid';
    let objects = [];
    let ctx = null;
    // Переменные для хранения информации о текущем выбранном объекте и его начальной позиции
    let selectedObject = null;
    let selectedObject_canv = null;
    let selectedObject_buf = null;
    let selectedObject_buf_connect = null;
    let selectedLineEnd = null; // Новая переменная для хранения конца линии
    let startX, startY;
    let isPanning = false;
    let panStartX = 0;
    let panStartY = 0;
    let offsetX = 0;
    let offsetY = 0;
    let mouse_meaning_check = 0;
    let connectionServ = 2;
    const container = document.getElementById('table-container');
    function generateRandomId(length) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
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
                            processFileContent(content);
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
    const canvas = document.getElementById('canvas');
    if (!canvas) {
        logDebug("Canvas element not found");
        return;
    }
    else {
        canvas.oncontextmenu = () => false;
        logDebug("Canvas element found");
    }
    function processFileContent(content) {
        try {
            const sizeMatch = content.match(/Size:({[^}]+})/);
            const objectsMatch = content.match(/Objects:\(([^)]+)\)/);
            if (sizeMatch && objectsMatch) {
                const size = JSON.parse(sizeMatch[1]);
                const shapes = JSON.parse(`[${objectsMatch[1]}]`);
                objects = shapes.map((obj) => {
                    if (obj.type === 'rectangle') {
                        return obj;
                    }
                    else if (obj.type === 'circle') {
                        return obj;
                    }
                    else if (obj.type === 'line') {
                        return obj;
                    }
                    else {
                        throw new Error('Unknown shape type');
                    }
                });
            }
            else if (sizeMatch && (objectsMatch == null)) {
                const size = JSON.parse(sizeMatch[1]);
                const shapes = objectsMatch ? JSON.parse(`[${objectsMatch[1]}]`) : [];
                objects = shapes.map((obj) => {
                    if (obj.type === 'rectangle') {
                        return obj;
                    }
                    else if (obj.type === 'circle') {
                        return obj;
                    }
                    else if (obj.type === 'line') {
                        return obj;
                    }
                    else {
                        throw new Error('Unknown shape type');
                    }
                });
            }
            else {
                throw new Error('Invalid file format');
            }
        }
        catch (error) {
            console.error('Error processing file content:', error);
        }
    }
    if (canvas.getContext) {
        ctx = canvas.getContext('2d');
        if (!ctx) {
            logDebug("Failed to get canvas context");
        }
        else {
            logDebug("Canvas context obtained");
        }
        window.addEventListener('DOMContentLoaded', () => {
            document.addEventListener('DOMContentLoaded', loadFromLocalStorage);
        });
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
        canvas.addEventListener('mousedown', function (e) {
            onMouseDown(e);
        });
        canvas.addEventListener('mousemove', function (e) {
            onMouseMove(e);
        });
        canvas.addEventListener('mouseup', function (e) {
            onMouseUp(e);
        });
        (_b = document.getElementById('addRectBtn')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', function () {
            logDebug("Add rectangle button clicked");
            addRect();
        });
        (_c = document.getElementById('addCircleBtn')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', function () {
            logDebug("Add circle button clicked");
            addCircle();
        });
        (_d = document.getElementById('addLineBtn')) === null || _d === void 0 ? void 0 : _d.addEventListener('click', function () {
            logDebug("Add line button clicked");
            addLine();
        });
        (_e = document.getElementById('addCloudBtn')) === null || _e === void 0 ? void 0 : _e.addEventListener('click', function () {
            logDebug("Add cloud button clicked");
            addCloud();
        });
        (_f = document.getElementById('addStarBtn')) === null || _f === void 0 ? void 0 : _f.addEventListener('click', function () {
            logDebug("Add star button clicked");
            addStar();
        });
        (_g = document.getElementById('delShapeBtn')) === null || _g === void 0 ? void 0 : _g.addEventListener('click', function () {
            logDebug("Delete shape button clicked");
            deleteShape();
        });
        (_h = document.getElementById('rotateLeftBtn')) === null || _h === void 0 ? void 0 : _h.addEventListener('click', function () {
            logDebug("Rotate left button clicked");
            rotateSelectedObject(-10);
        });
        (_j = document.getElementById('rotateRightBtn')) === null || _j === void 0 ? void 0 : _j.addEventListener('click', function () {
            logDebug("Rotate right button clicked");
            rotateSelectedObject(10);
        });
        (_k = document.getElementById('deleteItem')) === null || _k === void 0 ? void 0 : _k.addEventListener('click', function () {
            if (selectedObject_buf) {
                deleteShape();
            }
            selectedObject_buf = null;
        });
        (_l = document.getElementById('rotateLeftItem')) === null || _l === void 0 ? void 0 : _l.addEventListener('click', function () {
            if (selectedObject_buf) {
                rotateSelectedObject(-10);
            }
            selectedObject_buf = null;
            drawObjects();
        });
        (_m = document.getElementById('rotateRightItem')) === null || _m === void 0 ? void 0 : _m.addEventListener('click', function () {
            if (selectedObject_buf) {
                rotateSelectedObject(10);
            }
            selectedObject_buf = null;
            drawObjects();
            //hideContextMenu();
        });
        (_o = document.getElementById('cycleCheck')) === null || _o === void 0 ? void 0 : _o.addEventListener('click', function () {
            /*const hasCycle = detectCycles(objects);*/
            const cyclePath = detectCycles(objects);
            if (cyclePath) {
                console.log("Цикл найден:", cyclePath);
                highlightCycle(cyclePath, objects);
            }
            else {
                console.log("Цикл не найден");
            }
            //logDebug(`connectionObjects button clicked ${JSON.stringify(hasCycle)}`);
        });
        (_p = document.getElementById('connect_objects')) === null || _p === void 0 ? void 0 : _p.addEventListener('click', function () {
            logDebug(`connectionObjects button clicked`);
            connectionServ = 1;
            connectionObjects();
        });
        (_q = document.getElementById('remove_connection')) === null || _q === void 0 ? void 0 : _q.addEventListener('click', function () {
            logDebug(`remove_connection button clicked`);
            connectionServ = 0;
            removeObjects();
        });
        (_r = document.getElementById('outgoing_connect')) === null || _r === void 0 ? void 0 : _r.addEventListener('click', function () {
            logDebug(`outgoingConnectionObjects button clicked`);
            connectionServ = 3;
            connectionObjects();
        });
        (_s = document.getElementById('remove_outgoing_connection')) === null || _s === void 0 ? void 0 : _s.addEventListener('click', function () {
            logDebug(`remove_connection button clicked`);
            connectionServ = 4;
            removeObjects();
        });
        (_t = document.getElementById('additionInfo')) === null || _t === void 0 ? void 0 : _t.addEventListener('click', function () {
            addInfoclick();
        });
        document.addEventListener('contextmenu', function (e) {
            e.preventDefault();
            //showContextMenu(e.clientX, e.clientY);
            onMouseDown(e);
        });
        //function drawDirectedLine(ctx, startX, startY, endX, endY, color) {
        //    ctx.beginPath();
        //    ctx.moveTo(startX, startY);
        //    ctx.lineTo(endX, endY);
        //    ctx.strokeStyle = color;
        //    ctx.stroke();
        //    // Рисуем стрелку
        //    const headlen = 10; // длина головы стрелки
        //    const angle = Math.atan2(endY - startY, endX - startX);
        //    ctx.beginPath();
        //    ctx.moveTo(endX, endY);
        //    ctx.lineTo(endX - headlen * Math.cos(angle - Math.PI / 6), endY - headlen * Math.sin(angle - Math.PI / 6));
        //    ctx.lineTo(endX - headlen * Math.cos(angle + Math.PI / 6), endY - headlen * Math.sin(angle + Math.PI / 6));
        //    ctx.lineTo(endX, endY);
        //    ctx.lineTo(endX - headlen * Math.cos(angle - Math.PI / 6), endY - headlen * Math.sin(angle - Math.PI / 6));
        //    ctx.strokeStyle = color;
        //    ctx.stroke();
        //    ctx.fillStyle = color;
        //    ctx.fill();
        //}
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
        // Инициализация отрисовки объектов на холсте
        drawObjects();
        function drawObjects() {
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.save();
                ctx.translate(offsetX, offsetY);
                // Сначала отрисовываем связи между объектами
                for (const obj of objects) {
                    if (obj.linkedObjects) {
                        obj.linkedObjects.forEach(linkedId => {
                            const linkedObj = objects.find(o => o.id === linkedId);
                            if (linkedObj) {
                                ctx.beginPath();
                                // Получаем центральные координаты текущего объекта
                                const [startX, startY] = getObjectCenter(obj);
                                // Получаем центральные координаты связанного объекта
                                const [endX, endY] = getObjectCenter(linkedObj);
                                // Рисуем линию от текущего объекта к связанному объекту
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
                            centerX = obj.x + obj.width / 2;
                            centerY = obj.y + obj.height / 2;
                        }
                        else if (obj.type === 'circle') {
                            centerX = obj.x;
                            centerY = obj.y;
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
                    switch (obj.type) {
                        case 'rectangle':
                            const rect = obj;
                            ctx.fillStyle = rect.color;
                            ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
                            if (selectedObject_buf == rect) {
                                ctx.fillStyle = 'black';
                                ctx.fillRect(rect.x - 5, rect.y - 5, 10, 10);
                                ctx.fillRect(rect.x + 45, rect.y - 5, 10, 10);
                                ctx.fillRect(rect.x - 5, rect.y + 45, 10, 10);
                                ctx.fillRect(rect.x + 45, rect.y + 45, 10, 10);
                            }
                            break;
                        case 'circle':
                            const circle = obj;
                            ctx.beginPath();
                            ctx.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI);
                            ctx.fillStyle = circle.color;
                            ctx.fill();
                            if (selectedObject_buf == circle) {
                                ctx.beginPath();
                                ctx.arc(circle.x, circle.y - 25, 5, 0, 2 * Math.PI);
                                ctx.fillStyle = 'black';
                                ctx.fill();
                                ctx.beginPath();
                                ctx.arc(circle.x - 25, circle.y, 5, 0, 2 * Math.PI);
                                ctx.fillStyle = 'black';
                                ctx.fill();
                                ctx.beginPath();
                                ctx.arc(circle.x, circle.y + 25, 5, 0, 2 * Math.PI);
                                ctx.fillStyle = 'black';
                                ctx.fill();
                                ctx.beginPath();
                                ctx.arc(circle.x + 25, circle.y, 5, 0, 2 * Math.PI);
                                ctx.fillStyle = 'black';
                                ctx.fill();
                            }
                            break;
                        case 'line':
                            const line = obj;
                            ctx.beginPath();
                            ctx.moveTo(line.startX, line.startY);
                            ctx.lineTo(line.endX, line.endY);
                            ctx.strokeStyle = line.color;
                            ctx.lineWidth = 10;
                            ctx.stroke();
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
                            const star = obj;
                            drawStar(ctx, star.x_C, star.y_C, star.rad, star.amount_points, star.m, star);
                            break;
                        case 'cloud':
                            const cloud = obj;
                            drawCloud(ctx, cloud.x_C, cloud.y_C, cloud.width, cloud.height, cloud);
                            break;
                        default:
                            logDebug(`Unknown object type: ${JSON.stringify(obj)}`);
                    }
                    ctx.restore();
                }
            }
            else {
                logDebug("Canvas context is not available");
            }
        }
        function getObjectCenter(obj) {
            switch (obj.type) {
                case 'rectangle':
                    const rect = obj;
                    return [rect.x + rect.width / 2, rect.y + rect.height / 2];
                case 'circle':
                    const circle = obj;
                    return [circle.x, circle.y];
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
        function removeObjects() {
            if (selectedObject_buf) {
                selectedObject_buf_connect = selectedObject_buf;
                logDebug(`removeObjects inside`);
                logDebug(`removeObjects_buf_connect - (${JSON.stringify(selectedObject_buf_connect)})`);
                logDebug(`removeObjects_buf - (${JSON.stringify(selectedObject_buf)})`);
            }
        }
        function directedConnectionObjects() {
            if (selectedObject_buf) {
                selectedObject_buf_connect = selectedObject_buf;
                logDebug(`directedConnectionObjects inside`);
                logDebug(`directedConnectionObjects_buf_connect - (${JSON.stringify(selectedObject_buf_connect)})`);
                logDebug(`directedConnectionObjects_buf - (${JSON.stringify(selectedObject_buf)})`);
            }
        }
        function directedRemoveObjects() {
            if (selectedObject_buf) {
                selectedObject_buf_connect = selectedObject_buf;
                logDebug(`directedRemoveObjects inside`);
                logDebug(`directedRemoveObjects_buf_connect - (${JSON.stringify(selectedObject_buf_connect)})`);
                logDebug(`directedRemoveObjects_buf - (${JSON.stringify(selectedObject_buf)})`);
            }
        }
        function addStar() {
            const newStar = {
                id: generateRandomId(16),
                type: 'star',
                x_C: Math.random() * (canvas.width - 200),
                y_C: Math.random() * (canvas.width - 200),
                rad: 100,
                amount_points: 6,
                m: 0.5,
                color: getRandomColor(),
                rotation: 0
            };
            objects.push(newStar);
            logDebug(`Star added: ${JSON.stringify(newStar)}`);
            drawObjects();
        }
        function addCloud() {
            const newStar = {
                id: generateRandomId(16),
                type: 'cloud',
                x_C: Math.random() * (canvas.width - 200),
                y_C: Math.random() * (canvas.width - 200),
                width: 200,
                height: 120,
                color: getRandomColor(),
                rotation: 0
            };
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
            ctx.bezierCurveTo(points[0].x, startY_Cloud, points[1].x, startY_Cloud, points[1].x, points[1].y);
            ctx.bezierCurveTo(startX_Cloud + width, points[1].y, startX_Cloud + width, points[2].y, points[2].x, points[2].y);
            ctx.bezierCurveTo(points[2].x, startY_Cloud + height, points[3].x, startY_Cloud + height, points[3].x, points[3].y);
            ctx.bezierCurveTo(startX_Cloud, points[3].y, startX_Cloud, points[0].y, points[0].x, points[0].y);
            ctx.closePath();
            ctx.fillStyle = obj.color;
            ctx.fill();
            if (selectedObject_buf == obj) {
                points.forEach(point => drawSquare(ctx, point.x, point.y, 10));
            }
        }
        function addRect() {
            const newRect = {
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
            const newCircle = {
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
            const newLine = {
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
        //function deleteShape() {
        //    if (selectedObject_buf) {
        //        const indexToRemove = objects.indexOf(selectedObject_buf);
        //        if (indexToRemove !== -1) {
        //            logDebug(`Deleting shape: ${JSON.stringify(objects[indexToRemove])}`);
        //            objects.splice(indexToRemove, 1);
        //            drawObjects();
        //            selectedObject_buf = null;
        //        }
        //    } else {
        //        logDebug("No shape selected to delete");
        //    }
        //}
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
                }
            }
            else {
                logDebug("No shape selected to delete");
            }
        }
        function rotateSelectedObject(angle) {
            if (selectedObject_buf) {
                selectedObject_buf.rotation = (selectedObject_buf.rotation || 0) + angle;
                logDebug(`Rotated object: ${JSON.stringify(selectedObject_buf)}`);
                drawObjects();
            }
        }
        function addInfoclick() {
            addInfo(selectedObject_buf);
        }
        function addInfo(selectedObject_buf_) {
            showPrompt("Введите текст:");
            selectedObject_buf_.info = userInput;
            //logDebug(`additionInfo pressed - ${JSON.stringify(userInput)}`);
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
            return selectedObject_buf_connect_;
        }
        function tableObjectCheck(selectedObject_buf_) {
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
                container === null || container === void 0 ? void 0 : container.appendChild(table);
            }
        }
        function onMouseDown(e) {
            const mouseX = e.clientX - canvas.offsetLeft;
            const mouseY = e.clientY - canvas.offsetTop;
            const mouse_meaning = e.button;
            if (mouse_meaning === 1) {
                mouse_meaning_check = 1;
            }
            logDebug(`Mouse down at (${mouseX}, ${mouseY}, ${mouse_meaning})`);
            if (mouse_meaning === 0 && mouse_meaning_check != 1) {
                for (let i = objects.length - 1; i >= 0; i--) {
                    const obj = objects[i];
                    if (obj.type === 'rectangle') {
                        const rect = obj;
                        if (mouseX >= rect.x && mouseX <= rect.x + rect.width && mouseY >= rect.y && mouseY <= rect.y + rect.height) {
                            selectedObject = rect;
                            selectedObject_buf = rect;
                            startX = mouseX - rect.x;
                            startY = mouseY - rect.y;
                            logDebug(`Selected rectangle: ${JSON.stringify(rect)}`);
                            //if (selectedObject_buf_connect) {
                            //    logDebug(`Selected object to connect_mouse_down - (${JSON.stringify(selectedObject_buf_connect)})`);
                            //    addLink(selectedObject_buf_connect, selectedObject_buf);
                            //    selectedObject_buf_connect = null;
                            //}
                            selectedObject_buf_connect = selectionCheck(selectedObject_buf_connect, selectedObject_buf, connectionServ);
                            connectionServ == 2;
                            tableObjectCheck(selectedObject_buf);
                            break;
                        }
                    }
                    else if (obj.type === 'circle') {
                        const circle = obj;
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
                    }
                    else if (obj.type === 'line') {
                        const line = obj;
                        const distStart = Math.sqrt(Math.pow((mouseX - line.startX), 2) + Math.pow((mouseY - line.startY), 2));
                        const distEnd = Math.sqrt(Math.pow((mouseX - line.endX), 2) + Math.pow((mouseY - line.endY), 2));
                        const distToLine = Math.abs((line.endY - line.startY) * mouseX - (line.endX - line.startX) * mouseY + line.endX * line.startY - line.endY * line.startX) /
                            Math.sqrt(Math.pow((line.endY - line.startY), 2) + Math.pow((line.endX - line.startX), 2));
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
                            selectedObject = cloud;
                            selectedObject_buf = cloud;
                            startX_Cloud = mouseX - cloud.x_C;
                            startY_Cloud = mouseY - cloud.y_C;
                            logDebug(`Selected cloud: ${JSON.stringify(cloud)}`);
                            selectedObject_buf_connect = selectionCheck(selectedObject_buf_connect, selectedObject_buf, connectionServ);
                            connectionServ == 2;
                            tableObjectCheck(selectedObject_buf);
                            break;
                        }
                    }
                    else {
                        selectedObject = null;
                        selectedObject_buf = null;
                    }
                }
                drawObjects();
            }
            else if (mouse_meaning == 2 && selectedObject_buf != null && mouse_meaning_check != 1) { // тут селект объект равен нулю
                for (let i = objects.length - 1; i >= 0; i--) {
                    const obj = objects[i];
                    if (obj.type === 'rectangle') {
                        const rect = obj;
                        if (mouseX >= rect.x && mouseX <= rect.x + rect.width && mouseY >= rect.y && mouseY <= rect.y + rect.height) {
                            selectedObject_buf = rect;
                            startX = mouseX - rect.x;
                            startY = mouseY - rect.y;
                            showContextMenu(e.clientX, e.clientY);
                            logDebug(`Selected rectangle: ${JSON.stringify(rect)}`);
                            break;
                        }
                    }
                    else if (obj.type === 'circle') {
                        const circle = obj;
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
                            showContextMenu(e.clientX, e.clientY);
                            logDebug(`Selected cloud: ${JSON.stringify(cloud)}`);
                            break;
                        }
                    }
                }
            }
            else if (mouse_meaning_check === 1) {
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
                            const rect = obj;
                            return startX >= rect.x && startX <= rect.x + rect.width && startY >= rect.y && startY <= rect.y + rect.height;
                        case 'circle':
                            const circle = obj;
                            const dx = startX - circle.x;
                            const dy = startY - circle.y;
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
        }
        function onMouseMove(e) {
            const mouseX = e.clientX - canvas.offsetLeft;
            const mouseY = e.clientY - canvas.offsetTop;
            const mouse_meaning = e.button;
            logDebug(`Mouse move at (${mouseX}, ${mouseY}, ${mouse_meaning})`);
            if (selectedObject && (mouse_meaning === 0) && mouse_meaning_check != 1) {
                logDebug(`selectedObject - (${JSON.stringify(selectedObject)}, ${JSON.stringify(selectedObject_buf)})`);
                if (selectedObject.type === 'rectangle') {
                    const rect = selectedObject;
                    rect.x = mouseX - startX;
                    rect.y = mouseY - startY;
                }
                else if (selectedObject.type === 'circle') {
                    const circle = selectedObject;
                    circle.x = mouseX - startX;
                    circle.y = mouseY - startY;
                }
                else if (selectedObject.type === 'line') {
                    const line = selectedObject;
                    const distStart = Math.sqrt(Math.pow((mouseX - line.startX), 2) + Math.pow((mouseY - line.startY), 2));
                    const distEnd = Math.sqrt(Math.pow((mouseX - line.endX), 2) + Math.pow((mouseY - line.endY), 2));
                    // Расчет расстояния от точки до линии
                    const distToLine = Math.abs((line.endY - line.startY) * mouseX - (line.endX - line.startX) * mouseY + line.endX * line.startY - line.endY * line.startX) /
                        Math.sqrt(Math.pow((line.endY - line.startY), 2) + Math.pow((line.endX - line.startX), 2));
                    if (distStart < 20) {
                        const dx = mouseX - startX;
                        const dy = mouseY - startY;
                        line.startX += dx;
                        line.startY += dy;
                        startX = mouseX;
                        startY = mouseY;
                        drawObjects();
                        logDebug(`Line selected start`);
                    }
                    else if (distEnd < 20) {
                        const dx = mouseX - startX;
                        const dy = mouseY - startY;
                        line.endX += dx;
                        line.endY += dy;
                        startX = mouseX;
                        startY = mouseY;
                        drawObjects();
                        logDebug(`Line selected end`);
                    }
                    else if (distToLine < 10) { // Проверка на близость к линии
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
                    }
                    else {
                        //logDebug(`GGWP1`);
                    }
                }
                else if (selectedObject.type === 'star') {
                    const star = selectedObject;
                    star.x_C = mouseX - startX;
                    star.y_C = mouseY - startY;
                }
                else if (selectedObject.type === 'cloud') {
                    const cloud = selectedObject;
                    cloud.x_C = mouseX - startX;
                    cloud.y_C = mouseY - startY;
                }
                drawObjects();
            }
            else if (mouse_meaning_check === 1) {
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
                            const rect = selectedObject_canv;
                            rect.x += dx;
                            rect.y += dy;
                            break;
                        case 'circle':
                            const circle = selectedObject_canv;
                            circle.x += dx;
                            circle.y += dy;
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
            else {
                //logDebug(`GGWP2`);
            }
        }
        function onMouseUp(e) {
            let mouse_meaning = e.button;
            if (selectedObject && (mouse_meaning == 0) && mouse_meaning_check != 1) {
                logDebug(`Mouse up, deselecting object: ${JSON.stringify(selectedObject)}`);
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
        (_u = document.getElementById('downloadBtn')) === null || _u === void 0 ? void 0 : _u.addEventListener('click', function () {
            const size = { width: canvas.width, height: canvas.height };
            const shapes = JSON.stringify(objects, null, 2);
            const content = `Size:${JSON.stringify(size)}\nObjects:(${shapes.slice(1, -1)})`;
            downloadFile('shapes.txt', content);
        });
        //пробуем сделать с загрузкой на сервер
        (_v = document.getElementById('uploadCssBtn')) === null || _v === void 0 ? void 0 : _v.addEventListener('click', function () {
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
                // Optionally, you can apply the CSS dynamically if needed
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
        (_w = document.getElementById('uploadCssBtn2')) === null || _w === void 0 ? void 0 : _w.addEventListener('click', function () {
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
        //document.addEventListener('DOMContentLoaded', () => {
        //    applyCssFromLocalStorage();
        //});
        (_x = document.getElementById('cssFileInput2')) === null || _x === void 0 ? void 0 : _x.addEventListener('change', function (event) {
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
        // Сохранение схемы между перезагрузками
        // Функция для сохранения схемы в локальное хранилище
        function saveToLocalStorage() {
            const size = { width: canvas.width, height: canvas.height };
            const shapes = JSON.stringify(objects, null, 2);
            const content = `Size:${JSON.stringify(size)}\nObjects:(${shapes.slice(1, -1)})`;
            localStorage.setItem('savedSchema', content);
        }
        // Функция для восстановления схемы из локального хранилища
        function loadFromLocalStorage() {
            logDebug(`enteringInto_loadFromLocalStorage`);
            const savedSchema = localStorage.getItem('savedSchema');
            logDebug(`Mouse down at (${savedSchema}`);
            if (savedSchema) {
                logDebug("something_wrong");
                processFileContent(savedSchema);
                drawObjects();
            }
        }
        // Запуск периодического сохранения и восстановления
        setInterval(saveToLocalStorage, 6000);
        function processOWLFileContent(content) {
            try {
                // Пример простой обработки OWL файла
                // В реальной жизни вам, вероятно, понадобится парсер OWL для этого
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
                    if (type === 'rectangle') {
                        return {
                            type,
                            x: parseFloat(elem.getAttribute('x') || '0'),
                            y: parseFloat(elem.getAttribute('y') || '0'),
                            width: parseFloat(elem.getAttribute('width') || '0'),
                            height: parseFloat(elem.getAttribute('height') || '0'),
                            color: elem.getAttribute('color') || '#000',
                            rotation: parseFloat(elem.getAttribute('rotation') || '0'),
                        };
                    }
                    else if (type === 'circle') {
                        return {
                            type,
                            x: parseFloat(elem.getAttribute('x') || '0'),
                            y: parseFloat(elem.getAttribute('y') || '0'),
                            radius: parseFloat(elem.getAttribute('radius') || '0'),
                            color: elem.getAttribute('color') || '#000',
                            rotation: parseFloat(elem.getAttribute('rotation') || '0'),
                        };
                    }
                    else if (type === 'line') {
                        return {
                            type,
                            startX: parseFloat(elem.getAttribute('startX') || '0'),
                            startY: parseFloat(elem.getAttribute('startY') || '0'),
                            endX: parseFloat(elem.getAttribute('endX') || '0'),
                            endY: parseFloat(elem.getAttribute('endY') || '0'),
                            color: elem.getAttribute('color') || '#000',
                            rotation: parseFloat(elem.getAttribute('rotation') || '0'),
                        };
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
        (_y = document.getElementById('fileInput3')) === null || _y === void 0 ? void 0 : _y.addEventListener('change', function (event) {
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
                                // Detect file extension or content type to process accordingly
                                if (file.name.endsWith('.owl')) {
                                    processOWLFileContent(content);
                                }
                                else {
                                    processFileContent(content);
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
        function convertObjectsToOWL(objects) {
            const size = { width: canvas.width, height: canvas.height };
            const sizeXML = `<size width="${size.width}" height="${size.height}"/>`;
            const objectsXML = objects.map(obj => {
                switch (obj.type) {
                    case 'rectangle':
                        const rect = obj;
                        return `<object type="rectangle" x="${rect.x}" y="${rect.y}" width="${rect.width}" height="${rect.height}" color="${rect.color}" rotation="${rect.rotation || 0}"/>`;
                    case 'circle':
                        const circle = obj;
                        return `<object type="circle" x="${circle.x}" y="${circle.y}" radius="${circle.radius}" color="${circle.color}" rotation="${circle.rotation || 0}"/>`;
                    case 'line':
                        const line = obj;
                        return `<object type="line" startX="${line.startX}" startY="${line.startY}" endX="${line.endX}" endY="${line.endY}" color="${line.color}" rotation="${line.rotation || 0}"/>`;
                    default:
                        throw new Error('Unknown object type');
                }
            }).join('\n');
            return `<diagram>\n${sizeXML}\n${objectsXML}\n</diagram>`;
        }
        (_z = document.getElementById('downloadBtn3')) === null || _z === void 0 ? void 0 : _z.addEventListener('click', function () {
            const owlContent = convertObjectsToOWL(objects);
            downloadFile('shapes.owl', owlContent);
        });
        function createVerticalTable(object) {
            const table = document.createElement('table');
            table.style.border = '1px solid black';
            table.style.borderCollapse = 'collapse';
            // Перебираем свойства объекта
            for (const key in object) {
                if (object.hasOwnProperty(key)) {
                    const row = table.insertRow();
                    const cellKey = row.insertCell();
                    cellKey.style.border = '1px solid black';
                    cellKey.style.padding = '5px';
                    cellKey.innerText = key;
                    const cellValue = row.insertCell();
                    cellValue.style.border = '1px solid black';
                    cellValue.style.padding = '5px';
                    cellValue.innerText = object[key]; // Получаем значение свойства
                }
            }
            return table;
        }
        //// Функция для проверки циклов с использованием DFS
        //function detectCycles(graph: Shape[]): boolean {
        //    const visited: Set<string> = new Set();  // Множество посещенных вершин
        //    const recStack: Set<string> = new Set(); // Множество вершин на текущем стеке вызовов
        //    for (const node of graph) {
        //        if (dfsCycleDetection(node, graph, visited, recStack)) {
        //            return true; // Цикл найден
        //        }
        //    }
        //    return false; // Циклы не найдены
        //}
        //// Рекурсивная функция для выполнения DFS и обнаружения циклов
        //function dfsCycleDetection(
        //    node: Shape,
        //    graph: Shape[],
        //    visited: Set<string>,
        //    recStack: Set<string>
        //): boolean {
        //    if (recStack.has(node.id)) {
        //        return true; // Цикл найден
        //    }
        //    if (visited.has(node.id)) {
        //        return false; // Вершина уже обработана, циклов не найдено
        //    }
        //    visited.add(node.id);
        //    recStack.add(node.id);
        //    const neighbors = node.outgoingLinks || []; // Соседние вершины (выходящие ребра)
        //    for (const neighborId of neighbors) {
        //        const neighbor = graph.find(n => n.id === neighborId);
        //        if (neighbor && dfsCycleDetection(neighbor, graph, visited, recStack)) {
        //            return true;
        //        }
        //    }
        //    recStack.delete(node.id); // Удаляем вершину из стека вызовов, так как она завершена
        //    return false;
        //}
        function detectCycles(graph) {
            const visited = new Set();
            const recStack = new Set();
            const path = []; // Для хранения пути
            for (const node of graph) {
                if (dfsCycleDetection(node, graph, visited, recStack, path)) {
                    return path; // Возвращаем путь при нахождении цикла
                }
            }
            return null; // Цикл не найден
        }
        function dfsCycleDetection(node, graph, visited, recStack, path) {
            if (recStack.has(node.id)) {
                path.push(node.id); // Добавляем текущий узел в путь
                return true; // Цикл найден
            }
            if (visited.has(node.id)) {
                return false; // Узел уже обработан
            }
            visited.add(node.id);
            recStack.add(node.id);
            path.push(node.id); // Добавляем текущий узел в путь
            const neighbors = node.outgoingLinks || [];
            for (const neighborId of neighbors) {
                const neighbor = graph.find(n => n.id === neighborId);
                if (neighbor && dfsCycleDetection(neighbor, graph, visited, recStack, path)) {
                    return true;
                }
            }
            recStack.delete(node.id); // Удаляем узел из стека
            path.pop(); // Убираем текущий узел из пути
            return false;
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
    }
    else {
        console.error("Canvas context is not supported");
        logDebug("Canvas context is not supported");
    }
})();
