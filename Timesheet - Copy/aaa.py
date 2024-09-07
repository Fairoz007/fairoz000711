from flask import Flask, render_template, request, redirect, url_for, session, flash
from pymongo import MongoClient
from bson.objectid import ObjectId
import os

app = Flask(__name__)
app.secret_key = os.urandom(24)

# MongoDB setup
client = MongoClient('mongodb://localhost:27017/')
db = client['mydatabase']
users_collection = db['users']

# Routes
@app.route('/')
def index():
    if 'username' in session:
        return render_template('test.html')
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        user = users_collection.find_one({'username': username, 'password': password})
        
        if user:
            session['username'] = username
            return redirect(url_for('index'))
        else:
            flash("Invalid credentials! Please try again.")
            return redirect(url_for('login'))
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        confirm_password = request.form['confirm_password']

        # Basic input validation
        if not username or not password:
            flash("Username and password are required!")
            return redirect(url_for('register'))
        
        if password != confirm_password:
            flash("Passwords do not match!")
            return redirect(url_for('register'))
        
        if users_collection.find_one({'username': username}):
            flash("Username already exists!")
            return redirect(url_for('register'))

        # Insert new user into MongoDB
        users_collection.insert_one({'username': username, 'password': password})
        flash("Registration successful! Please log in.")
        return redirect(url_for('login'))

    return render_template('register.html')

@app.route('/logout')
def logout():
    session.pop('username', None)
    return redirect(url_for('login'))

@app.route('/test')
def test():
    return render_template('test.html')

if __name__ == '__main__':
    app.run(debug=True)
