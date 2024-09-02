from pymongo import MongoClient

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/')

# Select your database
db = client['work_tracker']

# Select your collection
collection = db['works']

# Test connection by inserting a document
collection.insert_one({
    'name': 'Initial Test Work',
    'description': 'This is a test work item.',
    'department': 'Testing',
    'type': 'Internal'
})

print("Connected to MongoDB and inserted test document!")


