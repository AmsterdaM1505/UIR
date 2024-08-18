function convertToOWL(objects) {
    const header = `
    @prefix ex: <http://example.org/> .
    @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
    @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
    @prefix owl: <http://www.w3.org/2002/07/owl#> .

    ex:Diagram a owl:Ontology .
    `;
    const body = objects.map(obj => {
        switch (obj.type) {
            case 'rectangle':
                return `
                ex:Rectangle_${obj.id} a ex:Rectangle ;
                    ex:x "${obj.x}" ;
                    ex:y "${obj.y}" ;
                    ex:width "${obj.width}" ;
                    ex:height "${obj.height}" ;
                    ex:color "${obj.color}" .
                `;
            case 'circle':
                return `
                ex:Circle_${obj.id} a ex:Circle ;
                    ex:x "${obj.x}" ;
                    ex:y "${obj.y}" ;
                    ex:radius "${obj.radius}" ;
                    ex:color "${obj.color}" .
                `;
            case 'line':
                return `
                ex:Line_${obj.id} a ex:Line ;
                    ex:startX "${obj.startX}" ;
                    ex:startY "${obj.startY}" ;
                    ex:endX "${obj.endX}" ;
                    ex:endY "${obj.endY}" ;
                    ex:color "${obj.color}" .
                `;
            default:
                return '';
        }
    }).join('\n');
    return header + body;
}
function processOWLContent(content) {
    // Простой пример разбора OWL-формата
    const rectPattern = /ex:Rectangle_(\d+) a ex:Rectangle ;\s*ex:x "(\d+)" ;\s*ex:y "(\d+)" ;\s*ex:width "(\d+)" ;\s*ex:height "(\d+)" ;\s*ex:color "([^"]+)" .\s*/g;
    const circlePattern = /ex:Circle_(\d+) a ex:Circle ;\s*ex:x "(\d+)" ;\s*ex:y "(\d+)" ;\s*ex:radius "(\d+)" ;\s*ex:color "([^"]+)" .\s*/g;
    const linePattern = /ex:Line_(\d+) a ex:Line ;\s*ex:startX "(\d+)" ;\s*ex:startY "(\d+)" ;\s*ex:endX "(\d+)" ;\s*ex:endY "(\d+)" ;\s*ex:color "([^"]+)" .\s*/g;
    let match;
    while ((match = rectPattern.exec(content)) !== null) {
        objects.push({
            type: 'rectangle',
            id: match[1],
            x: parseFloat(match[2]),
            y: parseFloat(match[3]),
            width: parseFloat(match[4]),
            height: parseFloat(match[5]),
            color: match[6],
            rotation: 0
        });
    }
    while ((match = circlePattern.exec(content)) !== null) {
        objects.push({
            type: 'circle',
            id: match[1],
            x: parseFloat(match[2]),
            y: parseFloat(match[3]),
            radius: parseFloat(match[4]),
            color: match[5],
            rotation: 0
        });
    }
    while ((match = linePattern.exec(content)) !== null) {
        objects.push({
            type: 'line',
            id: match[1],
            startX: parseFloat(match[2]),
            startY: parseFloat(match[3]),
            endX: parseFloat(match[4]),
            endY: parseFloat(match[5]),
            color: match[6],
            rotation: 0
        });
    }
    drawObjects();
}
