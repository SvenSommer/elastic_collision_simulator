from flask import Flask, jsonify, request, send_from_directory
import logging


app = Flask(__name__, static_folder='../frontend')
logging.basicConfig(level=logging.INFO)


@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory(app.static_folder, path)


def update_velocities(obj1, obj2):
    # Elastic collision formula
    m1, m2, v1, v2 = obj1['mass'], obj2['mass'], obj1['velocity'], obj2['velocity']
    v1_final = (v1 * (m1 - m2) + 2 * m2 * v2) / (m1 + m2)
    v2_final = (v2 * (m2 - m1) + 2 * m1 * v1) / (m1 + m2)
    return v1_final, v2_final

def simulate(objects, dt, total_time, simulation_area):
    logging.info(f"Starting simulation with objects: {objects}")
  
    simulation_data = {obj['id']: {'positions': [obj['position']], 'velocities': [obj['velocity']]} for obj in objects}

    for _ in range(int(total_time / dt)):
        # Update positions and velocities, and check wall collisions
        for obj in objects:
            # Wall collision considering object size
            if obj['position'] <= obj['objectSize']/2 or obj['position'] >= simulation_area - obj['objectSize']/2:
                obj['velocity'] = -obj['velocity']
            obj['position'] += obj['velocity'] * dt

        # Object collision
        for i in range(len(objects)):
            for j in range(i + 1, len(objects)):
                distance = abs(objects[i]['position'] - objects[j]['position'])
                if distance <= (objects[i]['objectSize'] + objects[j]['objectSize']) / 2:
                    logging.info(f"Collision detected between {objects[i]['id']} and {objects[j]['id']}")
                    objects[i]['velocity'], objects[j]['velocity'] = update_velocities(objects[i], objects[j])

        # Store position and velocity
        for obj in objects:
            simulation_data[obj['id']]['positions'].append(obj['position'])
            simulation_data[obj['id']]['velocities'].append(obj['velocity'])

    return simulation_data



@app.route('/simulate', methods=['POST'])
def handle_simulation():
    data = request.json
    objects = data['objects']
    dt = data['dt']
    total_time = data['total_time']
    simulation_area = data['simulation_area']
    result = simulate(objects, dt, total_time, simulation_area)
    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True)