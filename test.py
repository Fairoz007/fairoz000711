from flask import Flask, request, jsonify
from pymongo import MongoClient
from bson.objectid import ObjectId
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app)

client = MongoClient('mongodb://localhost:27017/')
db = client['work_tracker']
users_collection = db['users']

# Sign up route
@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({'error': 'Invalid data format'}), 400

    hashed_password = generate_password_hash(data['password'])
    user = {
        'email': data['email'],
        'password': hashed_password
    }

    try:
        users_collection.insert_one(user)
        return jsonify({'message': 'User signed up successfully'}), 201
    except Exception as e:
        return jsonify({'error': f'Failed to sign up: {e}'}), 500

# Login route
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({'error': 'Invalid data format'}), 400

    try:
        user = users_collection.find_one({'email': data['email']})
        if user and check_password_hash(user['password'], data['password']):
            return jsonify({'message': 'Login successful'}), 200
        else:
            return jsonify({'error': 'Invalid email or password'}), 401
    except Exception as e:
        return jsonify({'error': f'Failed to login: {e}'}), 500

if __name__ == '__main__':
    app.run(debug=True)
