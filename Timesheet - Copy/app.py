from flask import Flask, request, render_template, jsonify
from pymongo import MongoClient
from bson.objectid import ObjectId
from pymongo.errors import PyMongoError
import logging

app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.INFO)

# Connect to MongoDB
try:
    client = MongoClient('mongodb://localhost:27017/')
    db_work = client['work_tracker']
    collection = db_work['works']
    logging.info("Connected to MongoDB successfully")
except PyMongoError as e:
    logging.error(f"Error connecting to MongoDB: {e}")

# Route to render the work page
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
        return jsonify(works), 200
    except PyMongoError as e:
        logging.error(f"Failed to fetch works: {e}")
        return jsonify({'error': f'Failed to fetch works: {e}'}), 500

# Route to add a new work item
@app.route('/works', methods=['POST'])
def add_work():
    data = request.json
    logging.debug(f"Data received: {data}")

    # Validate required fields
    if not data or 'work' not in data or 'description' not in data or 'type' not in data:
        logging.warning("Invalid data format")
        return jsonify({'error': 'Invalid data format'}), 400

    try:
        result = collection.insert_one(data)
        logging.info(f"Work item added with ID: {result.inserted_id}")
        return jsonify({'message': 'Work added successfully'}), 201
    except PyMongoError as e:
        logging.error(f"Failed to add work: {e}")
        return jsonify({'error': f'Failed to add work: {e}'}), 500

# Route to update a work item
@app.route('/works/<id>', methods=['PUT'])
def update_work(id):
    data = request.json
    logging.debug(f"Data received for update: {data}")

    if not data:
        logging.warning("No data provided for update")
        return jsonify({'error': 'Invalid data'}), 400

    try:
        result = collection.update_one({'_id': ObjectId(id)}, {"$set": data})
        if result.matched_count == 1:
            logging.info(f"Work item with ID {id} updated successfully")
            return jsonify({'message': 'Work updated successfully'}), 200
        else:
            logging.warning(f"Work item with ID {id} not found")
            return jsonify({'error': 'Work not found'}), 404
    except PyMongoError as e:
        logging.error(f"Failed to update work: {e}")
        return jsonify({'error': f'Failed to update work: {e}'}), 500

# Route to delete a work item
@app.route('/works/<id>', methods=['DELETE'])
def delete_work(id):
    try:
        result = collection.delete_one({'_id': ObjectId(id)})
        if result.deleted_count == 1:
            logging.info(f"Work item with ID {id} deleted successfully")
            return jsonify({'message': 'Work deleted successfully'}), 200
        else:
            logging.warning(f"Work item with ID {id} not found")
            return jsonify({'error': 'Work not found'}), 404
    except PyMongoError as e:
        logging.error(f"Failed to delete work: {e}")
        return jsonify({'error': f'Failed to delete work: {e}'}), 500

if __name__ == '__main__':
    app.run(debug=True)
