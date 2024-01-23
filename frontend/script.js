const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const scale = 2; // Scale to adjust position visualization
const objectSize = 10; // Size of the square objects

function drawObject(x, y, color, height) {
    ctx.fillStyle = color;
    ctx.fillRect(x * scale, canvas.height / 2 + objectSize / 2, objectSize, -height);
}


function drawSurface() {
    ctx.fillStyle = 'lightgrey';
    ctx.fillRect(0, canvas.height / 2 + objectSize / 2, canvas.width, 2); // Drawing the surface line
}

let objectIdCounter = 0;

function addObjectForm() {
    objectIdCounter++;
    const formContainer = document.querySelector('.form-container');
    const html = `
        <div class="form-group" id="object-form-${objectIdCounter}">
            <h3>Object ${objectIdCounter}</h3>
            <label for="x_initial_${objectIdCounter}">Initial Position:</label>
            <input type="number" id="x_initial_${objectIdCounter}" value="${objectIdCounter* 10}">
            <label for="m_${objectIdCounter}">Mass:</label>
            <input type="number" id="m_${objectIdCounter}" value="1">
            <label for="v_${objectIdCounter}">Initial Velocity:</label>
            <input type="number" id="v_${objectIdCounter}" value="10">
            <button onclick="removeObjectForm(${objectIdCounter})">Remove Object</button>
        </div>
    `;
    formContainer.insertAdjacentHTML('beforeend', html);
}

function removeObjectForm(objectId) {
    const formGroup = document.getElementById(`object-form-${objectId}`);
    formGroup.remove();
}

function startSimulation() {
    const simulationArea = canvas.width / scale; // Based on canvas size and scale
    const objects = [];

    for (let i = 1; i <= objectIdCounter; i++) {
        if (document.getElementById(`object-form-${i}`)) {
            objects.push({
                id: `obj${i}`,
                mass: parseFloat(document.getElementById(`m_${i}`).value),
                velocity: parseFloat(document.getElementById(`v_${i}`).value),
                position: parseFloat(document.getElementById(`x_initial_${i}`).value),
                objectSize: objectSize
            });
        }
    }

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


function drawWalls() {
    ctx.fillStyle = 'darkgrey';
    ctx.fillRect(0, canvas.height / 2 - objectSize, 2, objectSize * 2); // Left wall
    ctx.fillRect(canvas.width - 2, canvas.height / 2 - objectSize, 2, objectSize * 2); // Right wall
}

function animate(positions) {
    let frame = 0;
    const colors = ['blue', 'red', 'green', 'yellow', 'purple']; // Add more colors as needed

    function draw() {
        if (frame < positions['obj1'].length) { // Assuming at least 'obj1' is always there
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawSurface();
            drawWalls();

            Object.keys(positions).forEach((key, index) => {
                let pos = positions[key][frame] - objectSize / (2 * scale); // Adjust for object size

                // Check for edge collision
                pos = Math.max(0, Math.min(pos, (canvas.width / scale) - (objectSize / scale)));
                const height =  parseFloat(document.getElementById(`m_${index+1}`).value) * 10; // Example to vary size
                drawObject(pos, 0, colors[index % colors.length], height);
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
