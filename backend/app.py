from flask import Flask, jsonify, request, send_from_directory
import os


app = Flask(__name__, static_folder='../frontend')


@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory(app.static_folder, path)


def calculate_collision(m1, m2, v1_initial, v2_initial, total_time, dt, object_size, simulation_area, x1_initial, x2_initial):
  
    # Elastic collision calculation
    def update_velocities(v1, v2, m1, m2):
        v1_final = (v1 * (m1 - m2) + 2 * m2 * v2) / (m1 + m2)
        v2_final = (v2 * (m2 - m1) + 2 * m1 * v1) / (m1 + m2)
        return v1_final, v2_final

    # Initialize positions and velocities
    x1, x2 = x1_initial, x2_initial
    v1, v2 = v1_initial, v2_initial

    positions = []
    for _ in range(int(total_time / dt)):
        # Check for collision with walls
        if x1 <= 0 or x1 + object_size >= simulation_area:
            v1 = -v1
        if x2 <= 0 or x2 + object_size >= simulation_area:
            v2 = -v2

        # Check for collision between blocks at every time step
        if x1 + object_size >= x2:
            v1, v2 = update_velocities(v1, v2, m1, m2)

        x1 += v1 * dt
        x2 += v2 * dt
        positions.append((x1, x2))

    return positions


@app.route('/simulate', methods=['GET'])
def simulate():
    m1 = float(request.args.get('m1', 1))  # Mass of object 1
    m2 = float(request.args.get('m2', 1))  # Mass of object 2
    v1_initial = float(request.args.get('v1', 5))  # Initial velocity of object 1
    v2_initial = float(request.args.get('v2', 0))  # Initial velocity of object 2
    x1_initial = float(request.args.get('x1_initial', 0))  # Initial position of object 1
    x2_initial = float(request.args.get('x2_initial', 10))  # Initial position of object 2
 
    total_time = float(request.args.get('time', 50))  # Total simulation time
    dt = float(request.args.get('dt', 0.01))  # Time step

    object_size = float(request.args.get('object_size', 1))  # Size of the objects
    simulation_area = float(request.args.get('area', 50))  # Total simulation area width
    positions = calculate_collision(m1, m2, v1_initial, v2_initial, total_time, dt, object_size, simulation_area, x1_initial, x2_initial)
    return jsonify(positions)

if __name__ == "__main__":
    app.run(debug=True)
