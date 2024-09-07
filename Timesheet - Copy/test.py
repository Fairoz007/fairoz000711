from flask import Flask, request, render_template, jsonify, session, redirect, url_for
from pymongo import MongoClient
from bson.objectid import ObjectId
from pymongo.errors import PyMongoError
from flask_cors import CORS
from flask_session import Session
import logging

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'  # Use a strong secret key
app.config['SESSION_TYPE'] = 'filesystem'
Session(app)
CORS(app)  # Enable CORS for all routes

# Configure logging
logging.basicConfig(level=logging.INFO)

# Connect to MongoDB
try:
    client = MongoClient('mongodb://localhost:27017/')
    db_user = client['user_data']
    user_collection = db_user['users']

    db_work = client['work_tracker']
    work_collection = db_work['works']
    logging.info("Connected to MongoDB successfully")
except PyMongoError as e:
    logging.error(f"Error connecting to MongoDB: {e}")

# Routes for user login and sign-up
@app.route('/', methods=['GET', 'POST'])
def login():
    try:
        if request.method == 'POST':
            if 'txt' in request.form:  # Sign-up logic
                username = request.form['txt']
                email = request.form['email']
                password = request.form['pswd']
                
                # Validate input fields
                if not username or not email or not password:
                    return jsonify({'status': 'fail', 'message': 'All fields are required.'}), 400

                # Insert the new user data into MongoDB
                user_data = {'username': username, 'email': email, 'password': password}
                result = user_collection.insert_one(user_data)
                session['user_id'] = str(result.inserted_id)  # Store user ID in session
                logging.info(f"User {username} signed up successfully")
                return redirect(url_for('index'))  # Redirect to index page upon successful sign-up

            elif 'email' in request.form and 'pswd' in request.form:  # Login logic
                email = request.form['email']
                password = request.form['pswd']

                # Validate input fields
                if not email or not password:
                    return jsonify({'status': 'fail', 'message': 'Email and password are required.'}), 400

                # Check if the user exists in MongoDB
                user = user_collection.find_one({'email': email, 'password': password})
                if user:
                    session['user_id'] = str(user['_id'])  # Store user ID in session
                    logging.info(f"User {email} logged in successfully")
                    return redirect(url_for('index'))  # Redirect to index page upon successful login
                else:
                    logging.warning(f"Login failed for {email}")
                    return jsonify({'status': 'fail', 'message': 'Login failed. Please try again.'}), 401

        return render_template('login.html')
    except Exception as e:
        logging.error(f"Error in login route: {e}")
        return jsonify({'status': 'error', 'message': 'An error occurred. Please try again.'}), 500
    
@app.route('/current_user', methods=['GET'])
def get_current_user():
    if 'user_id' in session:
        # Fetch the user data from MongoDB based on user_id stored in the session
        user = user_collection.find_one({'_id': ObjectId(session['user_id'])})
        if user:
            return jsonify({'username': user['username']})
        else:
            return jsonify({'error': 'User not found'}), 404
    else:
        return jsonify({'error': 'User not logged in'}), 401    

# Route for the index page
@app.route('/index')
def index():
    if 'user_id' not in session:
        return redirect('/')  # Redirect to login if not authenticated
    return render_template('index.html')

# Route for the work page
@app.route('/work')
def work():
    if 'user_id' not in session:
        return redirect('/')  # Redirect to login if not authenticated
    return render_template('work.html')

# Route to get all work items for the logged-in user
@app.route('/works', methods=['GET'])
def get_works():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401

    try:
        works = list(work_collection.find({'user_id': session['user_id']}))
        for work in works:
            work['_id'] = str(work['_id'])  # Convert ObjectId to string for JSON serialization
        return jsonify(works), 200
    except PyMongoError as e:
        logging.error(f"Failed to fetch works: {e}")
        return jsonify({'error': f'Failed to fetch works: {e}'}), 500

# Route to add a new work item for the logged-in user
@app.route('/works', methods=['POST'])
def add_work():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401

    try:
        data = request.json
        logging.debug(f"Data received: {data}")

        if not data or 'work' not in data or 'description' not in data or 'type' not in data:
            return jsonify({'error': 'Invalid data format'}), 400
        
        data['user_id'] = session['user_id']  # Associate work item with the user
        result = work_collection.insert_one(data)
        logging.info(f"Work item added with ID: {result.inserted_id}")
        return jsonify({'message': 'Work added successfully'}), 201
    except PyMongoError as e:
        logging.error(f"Failed to add work: {e}")
        return jsonify({'error': f'Failed to add work: {e}'}), 500

# Route to update a work item
@app.route('/works/<id>', methods=['PUT'])
def update_work(id):
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401

    try:
        data = request.json
        if not data:
            return jsonify({'error': 'Invalid data'}), 400
        
        result = work_collection.update_one(
            {'_id': ObjectId(id), 'user_id': session['user_id']},
            {"$set": data}
        )
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
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401

    try:
        result = work_collection.delete_one({'_id': ObjectId(id), 'user_id': session['user_id']})
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
