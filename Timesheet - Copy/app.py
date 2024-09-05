from flask import Flask, render_template, jsonify, request
from pymongo import MongoClient
from bson.objectid import ObjectId
from pymongo.errors import PyMongoError
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Connect to MongoDB
try:
    client = MongoClient('mongodb://localhost:27017/')
    db = client['work_tracker']
    collection = db['works']
except PyMongoError as e:
    print(f"Error connecting to MongoDB: {e}")

# Route for the root URL
@app.route('/')
def index():
    return render_template('index.html')

# Route for the work page
@app.route('/work')
def work():
    return render_template('work.html')

# Route to get all work items
@app.route('/works', methods=['GET'])
def get_works():
    try:
        works = list(collection.find())
        for work in works:
            work['_id'] = str(work['_id'])  # Convert ObjectId to string for JSON serialization
        return jsonify(works)
    except PyMongoError as e:
        return jsonify({'error': f'Failed to fetch works: {e}'}), 500

# Route to add a new work item
@app.route('/works', methods=['POST'])
def add_work():
    data = request.json
    try:
        collection.insert_one(data)
        return jsonify({'message': 'Work added successfully'}), 201
    except PyMongoError as e:
        return jsonify({'error': f'Failed to add work: {e}'}), 500

# Route to update a work item
@app.route('/works/<id>', methods=['PUT'])
def update_work(id):
    data = request.json
    try:
        result = collection.update_one({'_id': ObjectId(id)}, {"$set": data})
        if result.matched_count == 1:
            return jsonify({'message': 'Work updated successfully'}), 200
        else:
            return jsonify({'error': 'Work not found'}), 404
    except PyMongoError as e:
        return jsonify({'error': f'Failed to update work: {e}'}), 500

# Route to delete a work item
@app.route('/works/<id>', methods=['DELETE'])
def delete_work(id):
    try:
        result = collection.delete_one({'_id': ObjectId(id)})
        if result.deleted_count == 1:
            return jsonify({'message': 'Work deleted successfully'}), 200
        else:
            return jsonify({'error': 'Work not found'}), 404
    except PyMongoError as e:
        return jsonify({'error': f'Failed to delete work: {e}'}), 500

if __name__ == '__main__':
    app.run(debug=True)

@app.route('/works', methods=['POST'])
def add_work():
    data = request.json
    print(f"Data received: {data}")  # Debugging: log the incoming data
    
    if not data or 'work' not in data or 'description' not in data or 'type' not in data:
        return jsonify({'error': 'Invalid data format'}), 400
    
    try:
        result = collection.insert_one(data)
        print(f"Insert result: {result.inserted_id}")  # Debugging: log the result of the insert operation
        return jsonify({'message': 'Work added successfully'}), 201
    except Exception as e:
        print(f"Error inserting data: {e}")  # Debugging: log the error
        return jsonify({'error': f'Failed to add work: {e}'}), 500
