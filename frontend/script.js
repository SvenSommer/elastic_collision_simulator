const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const scale = 2; // Scale to adjust position visualization
const objectSize = 10; // Size of the square objects

function drawObject(x, y, color, height) {
    ctx.fillStyle = color;
    ctx.fillRect(x * scale, canvas.height / 2  + objectSize/2, objectSize, -height);
}


function drawSurface() {
    ctx.fillStyle = 'lightgrey';
    ctx.fillRect(0, canvas.height / 2 + objectSize / 2, canvas.width, 2); // Drawing the surface line
}

function startSimulation() {
    const m1 = document.getElementById('m1').value;
    const m2 = document.getElementById('m2').value;
    const v1 = document.getElementById('v1').value;
    const v2 = document.getElementById('v2').value;
    const simulationArea = canvas.width/scale; // Based on canvas size and scale

    const x1_initial = document.getElementById('x1_initial').value;
    const x2_initial = document.getElementById('x2_initial').value;

    fetch(`http://127.0.0.1:5000/simulate?m1=${m1}&m2=${m2}&v1=${v1}&v2=${v2}&object_size=${objectSize/scale}&area=${simulationArea}&x1_initial=${x1_initial}&x2_initial=${x2_initial}`)
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
    function draw() {
        if (frame < positions.length) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawSurface();
            drawWalls();
            let pos1 = positions[frame][0] - objectSize / (2 * scale); // Adjust for object size
            let pos2 = positions[frame][1] - objectSize / (2 * scale); // Adjust for object size

            // Check for edge collision
            pos1 = Math.max(0, Math.min(pos1, (canvas.width / scale) - (objectSize / scale)));
            pos2 = Math.max(0, Math.min(pos2, (canvas.width / scale) - (objectSize / scale)));

            const height1 = document.getElementById('m1').value * 10; // You can adjust the scaling factor as needed
            const height2 = document.getElementById('m2').value * 10; // You can adjust the scaling factor as needed

            
            drawObject(pos1, 0, 'blue', height1);
            drawObject(pos2, 0, 'red', height2);
            frame++;
            requestAnimationFrame(draw);
        }
    }
    draw();
}