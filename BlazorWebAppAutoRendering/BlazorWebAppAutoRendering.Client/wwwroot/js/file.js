// Оборачиваем весь код в функцию, чтобы избежать повторного объявления переменных в глобальной области видимости
(function () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    function logDebug(message) {
        const debugOutput = document.getElementById('debugOutput');
        if (debugOutput) {
            debugOutput.value += message + '\n';
            debugOutput.scrollTop = debugOutput.scrollHeight; // Scroll to bottom
        }
    }
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
    let objects = [];
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
            else {
                throw new Error('Invalid file format');
            }
        }
        catch (error) {
            console.error('Error processing file content:', error);
        }
    }
    let ctx = null;
    if (canvas.getContext) {
        ctx = canvas.getContext('2d');
        if (!ctx) {
            //logDebug("Failed to get canvas context");
        }
        else {
            //logDebug("Canvas context obtained");
        }
        const img = new Image();
        img.onload = function () {
            //logDebug("Image loaded");
            drawObjects();
        };
        img.onerror = function () {
            //logDebug("Failed to load image");
        };
        img.src = 'img/yyy.jpg';
        // Переменные для хранения информации о текущем выбранном объекте и его начальной позиции
        let selectedObject = null;
        let selectedObject_buf = null;
        let selectedLineEnd = null; // Новая переменная для хранения конца линии
        let startX, startY;
        // Обработчики событий
        canvas.addEventListener('mousedown', function (e) {
            //logDebug("Mouse down");
            onMouseDown(e);
        });
        canvas.addEventListener('mousemove', function (e) {
            //logDebug("Mouse move");
            onMouseMove(e);
        });
        canvas.addEventListener('mouseup', function (e) {
            //logDebug("Mouse up");
            onMouseUp(e);
            //onRightClickUp();
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
        (_e = document.getElementById('delShapeBtn')) === null || _e === void 0 ? void 0 : _e.addEventListener('click', function () {
            logDebug("Delete shape button clicked");
            deleteShape();
        });
        // Добавляем кнопки для вращения фигур
        (_f = document.getElementById('rotateLeftBtn')) === null || _f === void 0 ? void 0 : _f.addEventListener('click', function () {
            logDebug("Rotate left button clicked");
            rotateSelectedObject(-10);
        });
        (_g = document.getElementById('rotateRightBtn')) === null || _g === void 0 ? void 0 : _g.addEventListener('click', function () {
            logDebug("Rotate right button clicked");
            rotateSelectedObject(10);
        });
        ////////////////////
        (_h = document.getElementById('deleteItem')) === null || _h === void 0 ? void 0 : _h.addEventListener('click', function () {
            if (selectedObject_buf) {
                deleteShape();
            }
            selectedObject_buf = null;
            //hideContextMenu();
        });
        (_j = document.getElementById('rotateLeftItem')) === null || _j === void 0 ? void 0 : _j.addEventListener('click', function () {
            if (selectedObject_buf) {
                rotateSelectedObject(-10);
            }
            selectedObject_buf = null;
            drawObjects();
            //hideContextMenu();
        });
        (_k = document.getElementById('rotateRightItem')) === null || _k === void 0 ? void 0 : _k.addEventListener('click', function () {
            if (selectedObject_buf) {
                rotateSelectedObject(10);
            }
            selectedObject_buf = null;
            drawObjects();
            //hideContextMenu();
        });
        document.addEventListener('contextmenu', function (e) {
            e.preventDefault();
            //showContextMenu(e.clientX, e.clientY);
            onMouseDown(e);
        });
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
                for (const obj of objects) {
                    logDebug(`Drawing object: ${JSON.stringify(obj)}`);
                    ctx.save();
                    if (obj.rotation) {
                        const centerX = obj.type === 'rectangle' ? obj.x + obj.width / 2
                            : obj.type === 'circle' ? obj.x
                                : obj.type === 'line' ? (obj.startX + obj.endX) / 2
                                    : 0;
                        const centerY = obj.type === 'rectangle' ? obj.y + obj.height / 2
                            : obj.type === 'circle' ? obj.y
                                : obj.type === 'line' ? (obj.startY + obj.endY) / 2
                                    : 0;
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
                                ctx.fillStyle = 'black';
                                ctx.fillRect(rect.x + 45, rect.y - 5, 10, 10);
                                ctx.fillStyle = 'black';
                                ctx.fillRect(rect.x - 5, rect.y + 45, 10, 10);
                                ctx.fillStyle = 'black';
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
        function addRect() {
            const newRect = {
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
                    logDebug(`Deleting shape: ${JSON.stringify(objects[indexToRemove])}`);
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
        function getRandomColor() {
            const letters = '0123456789ABCDEF';
            let color = '#';
            for (let i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        }
        function onMouseDown(e) {
            const mouseX = e.clientX - canvas.offsetLeft;
            const mouseY = e.clientY - canvas.offsetTop;
            const mouse_meaning = e.button;
            logDebug(`Mouse down at (${mouseX}, ${mouseY}, ${mouse_meaning})`);
            if (mouse_meaning == 0) {
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
                            break;
                        }
                    }
                    else if (obj.type === 'line') {
                        const line = obj;
                        // Simplified line hit detection for example purposes
                        const distStart = Math.sqrt(Math.pow((mouseX - line.startX), 2) + Math.pow((mouseY - line.startY), 2));
                        const distEnd = Math.sqrt(Math.pow((mouseX - line.endX), 2) + Math.pow((mouseY - line.endY), 2));
                        if (distStart < 5 || distEnd < 5) {
                            selectedObject = line;
                            selectedObject_buf = line;
                            startX = mouseX;
                            startY = mouseY;
                            logDebug(`Selected line: ${JSON.stringify(line)}`);
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
            else if (mouse_meaning == 2 && selectedObject_buf != null) { // тут селект объект равен нулю
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
                        if (distStart < 5 || distEnd < 5) {
                            selectedObject = line;
                            selectedObject_buf = line;
                            startX = mouseX;
                            startY = mouseY;
                            showContextMenu(e.clientX, e.clientY);
                            logDebug(`Selected line: ${JSON.stringify(line)}`);
                            break;
                        }
                    }
                }
            }
        }
        function onMouseMove(e) {
            const mouseX = e.clientX - canvas.offsetLeft;
            const mouseY = e.clientY - canvas.offsetTop;
            const mouse_meaning = e.button;
            logDebug(`Mouse move at (${mouseX}, ${mouseY}, ${mouse_meaning})`);
            if (selectedObject && (mouse_meaning == 0)) {
                logDebug(`selectedObject - (${JSON.stringify(selectedObject)}, ${JSON.stringify(selectedObject_buf)})`);
                //displayCursorCoordinates(e);
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
                    else {
                        logDebug(`GGWP1`);
                    }
                }
                drawObjects();
            }
            else {
                logDebug(`GGWP2`);
            }
        }
        function onMouseUp(e) {
            let mouse_meaning = e.button;
            if (selectedObject && (mouse_meaning == 0)) {
                logDebug(`Mouse up, deselecting object: ${JSON.stringify(selectedObject)}`);
            }
            else if (mouse_meaning == 0) {
                logDebug("Mouse up, no object selected");
                selectedObject_buf = null;
                drawObjects();
            }
            selectedObject = null;
            selectedLineEnd = null;
        }
        function downloadFile(filename, content) {
            const blob = new Blob([content], { type: 'text/plain' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        (_l = document.getElementById('downloadBtn')) === null || _l === void 0 ? void 0 : _l.addEventListener('click', function () {
            const size = { width: canvas.width, height: canvas.height };
            const shapes = JSON.stringify(objects, null, 2);
            const content = `Size:${JSON.stringify(size)}\nObjects:(${shapes.slice(1, -1)})`;
            downloadFile('shapes.txt', content);
        });
        //пробуем сделать с загрузкой на сервер
        (_m = document.getElementById('uploadCssBtn')) === null || _m === void 0 ? void 0 : _m.addEventListener('click', function () {
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
            const cssContent = localStorage.getItem('uploadedCss2');
            if (cssContent) {
                const style = document.createElement('style');
                style.textContent = cssContent;
                document.head.appendChild(style);
            }
            else {
                console.error('No CSS found in local storage');
            }
        }
        (_o = document.getElementById('uploadCssBtn2')) === null || _o === void 0 ? void 0 : _o.addEventListener('click', function () {
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
        (_p = document.getElementById('cssFileInput2')) === null || _p === void 0 ? void 0 : _p.addEventListener('change', function (event) {
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
    }
    else {
        console.error("Canvas context is not supported");
        logDebug("Canvas context is not supported");
    }
})();
