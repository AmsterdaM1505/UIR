(function () {
    let objects: Shape[] = [];
    let ctx: CanvasRenderingContext2D | null = null;
    // Переменные для хранения информации о текущем выбранном объекте и его начальной позиции
    let selectedObject: Shape | null = null;
    let selectedObject_canv: Shape | null = null;
    let selectedObject_buf: Shape | null = null;
    let selectedLineEnd: 'start' | 'end' | null = null; // Новая переменная для хранения конца линии
    let startX: number, startY: number;
    let isPanning = false;
    let panStartX = 0;
    let panStartY = 0;
    let offsetX = 0;
    let offsetY = 0;
    let mouse_meaning_check = 0;



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
                            processFileContent(content);
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
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;

    if (!canvas) {
        logDebug("Canvas element not found");
        return;
    } else {
        canvas.oncontextmenu = () => false;
        logDebug("Canvas element found");
    }

    function processFileContent(content: string) {
        try {
            const sizeMatch = content.match(/Size:({[^}]+})/);
            const objectsMatch = content.match(/Objects:\(([^)]+)\)/);
            if (sizeMatch && objectsMatch) {
                const size = JSON.parse(sizeMatch[1]);
                const shapes = JSON.parse(`[${objectsMatch[1]}]`);

                objects = shapes.map((obj: any) => {
                    if (obj.type === 'rectangle') {
                        return obj as Rectangle;
                    } else if (obj.type === 'circle') {
                        return obj as Circle;
                    } else if (obj.type === 'line') {
                        return obj as Line;
                    } else {
                        throw new Error('Unknown shape type');
                    }
                });
            } else if (sizeMatch && (objectsMatch == null)) {
                const size = JSON.parse(sizeMatch[1]);
                const shapes = objectsMatch ? JSON.parse(`[${objectsMatch[1]}]`) : [];

                objects = shapes.map((obj) => {
                    if (obj.type === 'rectangle') {
                        return obj;
                    } else if (obj.type === 'circle') {
                        return obj;
                    } else if (obj.type === 'line') {
                        return obj;
                    } else {
                        throw new Error('Unknown shape type');
                    }
                });
            } else {
                throw new Error('Invalid file format');
            }
        } catch (error) {
            console.error('Error processing file content:', error);
        }
    }
    
    if (canvas.getContext) {
        ctx = canvas.getContext('2d');
        if (!ctx) {
            logDebug("Failed to get canvas context");
        } else {
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
        canvas.addEventListener('mousedown', function (e: MouseEvent) {
            //logDebug("Mouse down");
            onMouseDown(e);
        });
        canvas.addEventListener('mousemove', function (e: MouseEvent) {
            //logDebug("Mouse move");
            onMouseMove(e);
        });
        canvas.addEventListener('mouseup', function (e: MouseEvent) {
            //logDebug("Mouse up");
            onMouseUp(e);
            //onRightClickUp();
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
        ////////////////////

        document.getElementById('deleteItem')?.addEventListener('click', function () {
            if (selectedObject_buf) {
                deleteShape();
            }
            selectedObject_buf = null;
            //hideContextMenu();
        });

        document.getElementById('rotateLeftItem')?.addEventListener('click', function () {
            if (selectedObject_buf) {
                rotateSelectedObject(-10);
            }
            selectedObject_buf = null;
            drawObjects();
            //hideContextMenu();
        });

        document.getElementById('rotateRightItem')?.addEventListener('click', function () {
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
        //drawObjects();

        function drawObjects() {
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.save();
                ctx.translate(offsetX, offsetY);
                for (const obj of objects) {
                    logDebug(`Drawing object: ${JSON.stringify(obj)}`);

                    ctx.save();
                    if (obj.rotation) {
                        const centerX = obj.type === 'rectangle' ? (obj as Rectangle).x + (obj as Rectangle).width / 2
                            : obj.type === 'circle' ? (obj as Circle).x
                                : obj.type === 'line' ? ((obj as Line).startX + (obj as Line).endX) / 2
                                    : 0;

                        const centerY = obj.type === 'rectangle' ? (obj as Rectangle).y + (obj as Rectangle).height / 2
                            : obj.type === 'circle' ? (obj as Circle).y
                                : obj.type === 'line' ? ((obj as Line).startY + (obj as Line).endY) / 2
                                    : 0;

                        ctx.translate(centerX, centerY);
                        ctx.rotate((obj.rotation * Math.PI) / 180);
                        ctx.translate(-centerX, -centerY);
                    }

                    switch (obj.type) {
                        case 'rectangle':
                            const rect = obj as Rectangle;
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
                            const circle = obj as Circle;
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
                            const line = obj as Line;
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
            } else {
                logDebug("Canvas context is not available");
            }
        }

        function addRect() {
            const newRect: Rectangle = {
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

        function getRandomColor() {
            const letters = '0123456789ABCDEF';
            let color = '#';
            for (let i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        }

        function onMouseDown(e: MouseEvent) {
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
                        const rect = obj as Rectangle;
                        if (mouseX >= rect.x && mouseX <= rect.x + rect.width && mouseY >= rect.y && mouseY <= rect.y + rect.height) {
                            selectedObject = rect;
                            selectedObject_buf = rect;
                            startX = mouseX - rect.x;
                            startY = mouseY - rect.y;
                            logDebug(`Selected rectangle: ${JSON.stringify(rect)}`);
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
                            logDebug(`Selected line: ${JSON.stringify(line)}`);
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
            logDebug(`Mouse move at (${mouseX}, ${mouseY}, ${mouse_meaning})`);
            if (selectedObject && (mouse_meaning === 0) && mouse_meaning_check != 1) {
                logDebug(`selectedObject - (${JSON.stringify(selectedObject)}, ${JSON.stringify(selectedObject_buf)})`);
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

        //document.addEventListener('DOMContentLoaded', () => {
        //    applyCssFromLocalStorage();
        //});

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

        function processOWLFileContent(content: string) {
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
                        } as Rectangle;
                    } else if (type === 'circle') {
                        return {
                            type,
                            x: parseFloat(elem.getAttribute('x') || '0'),
                            y: parseFloat(elem.getAttribute('y') || '0'),
                            radius: parseFloat(elem.getAttribute('radius') || '0'),
                            color: elem.getAttribute('color') || '#000',
                            rotation: parseFloat(elem.getAttribute('rotation') || '0'),
                        } as Circle;
                    } else if (type === 'line') {
                        return {
                            type,
                            startX: parseFloat(elem.getAttribute('startX') || '0'),
                            startY: parseFloat(elem.getAttribute('startY') || '0'),
                            endX: parseFloat(elem.getAttribute('endX') || '0'),
                            endY: parseFloat(elem.getAttribute('endY') || '0'),
                            color: elem.getAttribute('color') || '#000',
                            rotation: parseFloat(elem.getAttribute('rotation') || '0'),
                        } as Line;
                    } else {
                        throw new Error('Unknown shape type');
                    }
                });

                drawObjects();
            } catch (error) {
                console.error('Error processing OWL file content:', error);
            }
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
                                // Detect file extension or content type to process accordingly
                                if (file.name.endsWith('.owl')) {
                                    processOWLFileContent(content);
                                } else {
                                    processFileContent(content);
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

        function convertObjectsToOWL(objects: Shape[]): string {
            const size = { width: canvas.width, height: canvas.height };
            const sizeXML = `<size width="${size.width}" height="${size.height}"/>`;

            const objectsXML = objects.map(obj => {
                switch (obj.type) {
                    case 'rectangle':
                        const rect = obj as Rectangle;
                        return `<object type="rectangle" x="${rect.x}" y="${rect.y}" width="${rect.width}" height="${rect.height}" color="${rect.color}" rotation="${rect.rotation || 0}"/>`;
                    case 'circle':
                        const circle = obj as Circle;
                        return `<object type="circle" x="${circle.x}" y="${circle.y}" radius="${circle.radius}" color="${circle.color}" rotation="${circle.rotation || 0}"/>`;
                    case 'line':
                        const line = obj as Line;
                        return `<object type="line" startX="${line.startX}" startY="${line.startY}" endX="${line.endX}" endY="${line.endY}" color="${line.color}" rotation="${line.rotation || 0}"/>`;
                    default:
                        throw new Error('Unknown object type');
                }
            }).join('\n');

            return `<diagram>\n${sizeXML}\n${objectsXML}\n</diagram>`;
        }

        document.getElementById('downloadBtn3')?.addEventListener('click', function () {
            const owlContent = convertObjectsToOWL(objects);
            downloadFile('shapes.owl', owlContent);
        });



    } else {
        console.error("Canvas context is not supported");
        logDebug("Canvas context is not supported");
    }
})();
