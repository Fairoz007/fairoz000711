document.addEventListener('DOMContentLoaded', () => {
    const workForm = document.getElementById('workForm');

    workForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Get form values
        const workName = document.getElementById('workName').value.trim();
        const workDescription = document.getElementById('workDescription').value.trim();
        const department = document.getElementById('department').value.trim();
        const type = document.getElementById('type').value;

        // Log the values for debugging purposes
        console.log('Work Name:', workName);
        console.log('Work Description:', workDescription);
        console.log('Department:', department);
        console.log('Type:', type);

        // Check if all fields are filled
        if (workName && workDescription && department && type) {
            const newProject = {
                work: workName,
                description: workDescription,
                department: department,
                type: type,
                startTime: 0,
                elapsedTime: 0
            };

            // Log the new project object to verify its contents
            console.log('New Project Object:', newProject);

            // Make a POST request to the server to add the new project
            fetch('http://127.0.0.1:5000/works', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newProject)
            })
            .then(response => {
                console.log('Response Status:', response.status);
                console.log('Response Headers:', response.headers);

                if (!response.ok) {
                    throw new Error(`Server error: ${response.status}`);
                }

                return response.json();
            })
            .then(data => {
                console.log('Success:', data);

                if (data.message === 'Work added successfully') {
                    alert('Work has been added successfully!');
                    workForm.reset();  // Clear the form
                } else {
                    console.error('Failed to add work:', data);
                    alert('Failed to add work. Please try again.');
                }
            })
            .catch(error => {
                console.error('Fetch Error:', error);
                alert('An error occurred while adding the work. Please try again.');
            });
        } else {
            alert('Please fill in all fields');
        }
    });
});
