from flask import Flask, request, render_template, jsonify
from pymongo import MongoClient

app = Flask(__name__)

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/')  # Adjust the connection string as needed
db = client['user_data']
collection = db['users']

@app.route('/', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        if 'txt' in request.form:  # Sign-up logic
            username = request.form['txt']
            email = request.form['email']
            password = request.form['pswd']
            
            # Insert the new user data into MongoDB
            user_data = {'username': username, 'email': email, 'password': password}
            collection.insert_one(user_data)
            return jsonify({'status': 'success', 'message': 'Sign up successful!'})

        elif 'email' in request.form and 'pswd' in request.form:  # Login logic
            email = request.form['email']
            password = request.form['pswd']
            
            # Check if the user exists in MongoDB
            user = collection.find_one({'email': email, 'password': password})
            if user:
                return jsonify({'status': 'success', 'message': 'Welcome back!'})
            else:
                return jsonify({'status': 'fail', 'message': 'Login failed. Please try again.'})

    return render_template('login.html')

if __name__ == '__main__':
    app.run(debug=True)
