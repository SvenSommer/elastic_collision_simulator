const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const scale = 2; // Scale to adjust position visualization
const objectSize = 10; // Size of the square objects
let objects = [];
let isDragging = false;
let draggedObject = null;
let objectIdCounter = 0;

canvas.addEventListener('mousedown', (e) => {
    const mousePos = getMousePos(canvas, e);
    objects.forEach(obj => {
        if (isInsideObject(mousePos, obj)) {
            isDragging = true;
            draggedObject = obj;
        }
    });
});

canvas.addEventListener('mousemove', (e) => {
    if (isDragging && draggedObject) {
        const mousePos = getMousePos(canvas, e);
        draggedObject.position = mousePos.x / scale;
        drawAllObjects(); // Redraw objects with updated position
    }
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
    draggedObject = null;
});

function attachInputListeners(objectId) {
    // Mass input change listener
    document.getElementById(`m_${objectId}`).addEventListener('change', (e) => {
        const obj = objects.find(obj => obj.id === `obj${objectId}`);
        obj.mass = parseFloat(e.target.value);
        drawAllObjects(); 
    });

    // Velocity input change listener
    document.getElementById(`v_${objectId}`).addEventListener('change', (e) => {
        const obj = objects.find(obj => obj.id === `obj${objectId}`);
        obj.velocity = parseFloat(e.target.value);
        drawAllObjects(); 
    });

    // Position input change listener
    document.getElementById(`x_initial_${objectId}`).addEventListener('change', (e) => {
        const obj = objects.find(obj => obj.id === `obj${objectId}`);
        obj.position = parseFloat(e.target.value);
        drawAllObjects(); // Redraw to reflect changes
    });
}


function getMousePos(canvas, evt) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

function isInsideObject(pos, obj) {
    const scaledPosition = obj.position * scale;
    return pos.x > scaledPosition && pos.x < scaledPosition + objectSize;
}

function drawObject(obj, color) {
    ctx.fillStyle = color;
    const x = obj.position * scale;
    const y = canvas.height / 2 + objectSize / 2;
    ctx.fillRect(x, y, objectSize, -obj.mass * 10); // Draw the object based on its mass
}

function drawVelocityArrow(obj) {
    if (obj.velocity === 0) {
        return;
    }   
    const arrowLength = Math.abs(obj.velocity) * 5; // Use absolute value for length
    const xStart = obj.position * scale;
    const yStart = canvas.height / 2;

    // Determine the direction of the arrow based on the sign of the velocity
    const arrowDirection = obj.velocity >= 0 ? 1 : -1;

    // Calculate end point of the arrow
    const xEnd = xStart + arrowLength * arrowDirection;
    const yEnd = yStart; // Keeping it horizontal

    // Draw the line
    ctx.beginPath();
    ctx.moveTo(xStart+ objectSize/2, yStart);
    ctx.lineTo(xEnd, yEnd);
    ctx.strokeStyle = 'black';
    ctx.stroke();

    // Draw the arrow head
    ctx.beginPath();
    ctx.moveTo(xEnd, yEnd);
    if (obj.velocity >= 0) {
        ctx.lineTo(xEnd - 5, yEnd - 5); // Arrowhead for positive velocity
        ctx.lineTo(xEnd - 5, yEnd + 5);
    } else {
        ctx.lineTo(xEnd + 5, yEnd - 5); // Arrowhead for negative velocity
        ctx.lineTo(xEnd + 5, yEnd + 5);
    }
    ctx.closePath();
    ctx.fillStyle = 'black';
    ctx.fill();
}



function getColorForObject(id) {
    const colors = ['blue', 'red', 'green', 'yellow', 'purple']; // Extend with more colors as needed
    const index = parseInt(id.replace('obj', '')) - 1;
    return colors[index % colors.length];
}

function drawSurface() {
    ctx.fillStyle = 'lightgrey';
    ctx.fillRect(0, canvas.height / 2 + objectSize / 2, canvas.width, 2); // Drawing the surface line
}

function drawWalls() {
    ctx.fillStyle = 'darkgrey';
    ctx.fillRect(0, canvas.height / 2 - objectSize, 2, objectSize * 2); // Left wall
    ctx.fillRect(canvas.width - 2, canvas.height / 2 - objectSize, 2, objectSize * 2); // Right wall
}

function drawAllObjects() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    drawSurface(); // Draw the surface if needed
    drawWalls(); // Draw the walls if needed

    objects.forEach(obj => {
        drawObject(obj, getColorForObject(obj.id)); // Draw each object
        drawVelocityArrow(obj); // Draw the velocity arrow
    });
}




function addObjectForm() {
    objectIdCounter++;
    const formContainer = document.querySelector('.form-container');
    const html = `
        <div class="form-group" id="object-form-${objectIdCounter}">
            <h3>Object ${objectIdCounter}</h3>
            <label for="x_initial_${objectIdCounter}">Initial Position:</label>
            <input type="number" id="x_initial_${objectIdCounter}" value="${objectIdCounter * 10}">
            <label for="m_${objectIdCounter}">Mass:</label>
            <input type="number" id="m_${objectIdCounter}" value="1">
            <label for="v_${objectIdCounter}">Initial Velocity:</label>
            <input type="number" id="v_${objectIdCounter}" value="10">
            <button onclick="removeObjectForm(${objectIdCounter})">Remove Object</button>
        </div>
    `;
    formContainer.insertAdjacentHTML('beforeend', html);
    objects.push({
        id: `obj${objectIdCounter}`,
        mass: 1, // Default mass
        velocity: 10, // Default velocity
        position: objectIdCounter * 10, // Default position
        objectSize: objectSize
    });

    attachInputListeners(objectIdCounter);
    drawAllObjects(); // Redraw all objects
}

function removeObjectForm(objectId) {
    const formGroup = document.getElementById(`object-form-${objectId}`);
    formGroup.remove();
    objects = objects.filter(obj => obj.id !== `obj${objectId}`);
    drawAllObjects(); // Redraw all objects
}

function startSimulation() {
    const simulationArea = canvas.width / scale; // Based on canvas size and scale

    const requestData = {
        objects: objects,
        dt: 0.01,
        total_time: 50,
        simulation_area: simulationArea
    };

    fetch('http://127.0.0.1:5000/simulate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
        .then(response => response.json())
        .then(data => animate(data))
        .catch(error => console.error('Error:', error));
}

function animate(simulationData) {
    let frame = 0;
    const colors = ['blue', 'red', 'green', 'yellow', 'purple']; // Add more colors as needed

    function draw() {
        // Find the shortest array of positions to determine the animation length
        const minLength = Math.min(...Object.values(simulationData).map(objData => objData.positions.length));

        if (frame < minLength) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawSurface();
            drawWalls();

            Object.keys(simulationData).forEach((key, index) => {
                let pos = simulationData[key].positions[frame] - objectSize / (2 * scale); // Adjust for object size
                let velocity = simulationData[key].velocities[frame]; // Get the velocity

                const obj = {
                    position: pos,
                    velocity: velocity,
                    mass: objects.find(o => o.id === key)?.mass ?? 1 // Use default mass if object not found
                };

                drawObject(obj, colors[index % colors.length]);
                drawVelocityArrow(obj);
            });

            frame++;
            requestAnimationFrame(draw);
        }
    }
    draw();
}


// Initial setup
window.onload = function () {
    addObjectForm(); // Add the first object form on load
};
