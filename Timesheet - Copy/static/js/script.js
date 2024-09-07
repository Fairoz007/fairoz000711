const startNewButton = document.getElementById('startNewButton');
const modal = document.getElementById('modal');
const closeModal = document.getElementById('closeModal');
const taskForm = document.getElementById('taskForm');
const timesheetSection = document.getElementById('timesheetSection');
const totalHoursElement = document.getElementById('totalHours');

let projects = [];
let timerIntervals = {};

// Utility function to get data from the API
function fetchFromAPI(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };
    if (body) options.body = JSON.stringify(body);

    return fetch(`http://127.0.0.1:5000/${endpoint}`, options)
        .then((response) => response.json())
        .catch((error) => {
            console.error('API Error:', error);
            throw error; // Rethrow the error to handle it in the calling function
        });
}

// Load existing projects from the API when the page loads
document.addEventListener('DOMContentLoaded', () => {
    fetchFromAPI('works')
        .then((data) => {
            projects = data;
            renderProjects();
            updateTotalHours();
        })
        .catch((error) => {
            console.error('Error loading projects:', error);
            alert('Failed to load projects. Please try again later.');
        });
});

// Show the modal when "Start new" button is clicked
startNewButton.addEventListener('click', () => {
    loadWorkItems(); // Load work items into the dropdown
    modal.classList.remove('hidden'); // Show the modal
    modal.setAttribute('aria-hidden', 'false');
});

// Hide the modal when the close button is clicked
closeModal.addEventListener('click', () => {
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
});

// Handle form submission to add a new project
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const work = document.getElementById('work').value.trim();
    const description = document.getElementById('description').value.trim();
    const type = document.getElementById('type').value.trim();

    if (work && description && type) {
        const newProject = {
            work,
            description,
            type,
            startTime: 0,
            elapsedTime: 0, // Ensure this is always set to 0 for new projects
        };

        fetchFromAPI('works', 'POST', newProject)
            .then((response) => {
                if (response && response.message === 'Work added successfully') {
                    projects.push(newProject);
                    renderProjects();
                    updateTotalHours();
                } else {
                    throw new Error('Failed to add project');
                }
            })
            .catch((error) => {
                console.error('Error adding project:', error);
                alert('Failed to add project. Please try again.');
            })
            .finally(() => {
                modal.classList.add('hidden');
                modal.setAttribute('aria-hidden', 'true');
            });
    } else {
        alert('Please fill in all fields');
    }
});

// Function to render the list of projects
function renderProjects() {
    timesheetSection.innerHTML = ''; // Clear previous entries

    projects.forEach((project, index) => {
        if (project.work && project.description) { // Only render valid projects
            const projectCard = document.createElement('div');
            projectCard.classList.add('timesheet-card');
            projectCard.innerHTML = `
                <h3>Project: ${project.work}</h3>
                <p>Description: ${project.description}</p>
                <p>Type: ${project.type}</p>
                <div class="time" id="time${index}">${timeToString(project.elapsedTime)}</div>
                <div class="controls">
                    <button id="playPauseButton${index}" onclick="toggleTimer(${index})" class="play">Pause</button>
                    <button onclick="editProject('${project._id}', ${index})" class="edit">Edit</button>
                    <button onclick="deleteProject('${project._id}', ${index})" class="delete">Delete</button>
                </div>
            `;
            timesheetSection.appendChild(projectCard);

            updateProjectTime(index);
        }
    });
    updateTotalHours();
}

// Function to update the project time display
function updateProjectTime(index) {
    const timeElement = document.getElementById(`time${index}`);
    timeElement.textContent = timeToString(projects[index].elapsedTime);
}

// Timer Functions
function startTimer(index) {
    if (projects[index].startTime === 0) { // Timer was never started
        projects[index].startTime = Date.now();
    } else {
        projects[index].startTime = Date.now() - projects[index].elapsedTime;
    }

    timerIntervals[index] = setInterval(() => {
        const currentTime = Date.now();
        projects[index].elapsedTime = currentTime - projects[index].startTime;

        updateProjectTime(index);
        updateTotalHours();
    }, 1000);
}

function stopTimer(index) {
    clearInterval(timerIntervals[index]);
    delete timerIntervals[index];
    projects[index].elapsedTime = Date.now() - projects[index].startTime;
}

function toggleTimer(index) {
    const button = document.getElementById(`playPauseButton${index}`);
    if (timerIntervals[index]) { // Timer is running
        stopTimer(index);
        button.textContent = 'Play';
        button.classList.remove('play');
        button.classList.add('pause');
    } else {
        startTimer(index);
        button.textContent = 'Pause';
        button.classList.remove('pause');
        button.classList.add('play');
    }
    updateTotalHours();
}

// Function to update the total work hours across all projects
function updateTotalHours() {
    const totalElapsedTime = projects.reduce((total, project) => total + (project.elapsedTime || 0), 0);
    totalHoursElement.textContent = `Total hours: ${timeToString(totalElapsedTime)}`;
}

// Function to convert elapsed time to a string (HH:MM:SS)
function timeToString(time) {
    if (isNaN(time) || time === null || time === undefined) {
        return '00:00:00';
    }

    let hours = Math.floor(time / (1000 * 60 * 60));
    let minutes = Math.floor((time / (1000 * 60)) % 60);
    let seconds = Math.floor((time / 1000) % 60);

    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;

    return `${hours}:${minutes}:${seconds}`;
}

// Load work items into the dropdown when the modal is opened
function loadWorkItems() {
    const workDropdown = document.getElementById('work');
    workDropdown.innerHTML = '<option value="">Search and choose</option>'; // Reset options

    fetchFromAPI('works')
        .then((works) => {
            works.forEach((work) => {
                const option = document.createElement('option');
                option.value = work.work;
                option.textContent = work.work;
                workDropdown.appendChild(option);
            });
        })
        .catch((error) => {
            console.error('Error loading work items:', error);
            alert('Failed to load work items. Please try again later.');
        });
}

// Function to edit a project
function editProject(id, index) {
    const work = prompt('Enter new work name:', projects[index].work);
    const description = prompt('Enter new description:', projects[index].description);
    const type = prompt('Enter new type:', projects[index].type);

    if (work && description && type) {
        const updatedProject = { work, description, type };

        fetchFromAPI(`works/${id}`, 'PUT', updatedProject)
            .then(() => {
                projects[index] = { ...projects[index], ...updatedProject };
                renderProjects();
            })
            .catch((error) => console.error('Error editing project:', error));
    }
}

// Function to delete a project
function deleteProject(id, index) {
    if (confirm('Are you sure you want to delete this project?')) {
        fetchFromAPI(`works/${id}`, 'DELETE')
            .then(() => {
                projects.splice(index, 1);
                renderProjects();
                updateTotalHours();
            })
            .catch((error) => console.error('Error deleting project:', error));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Fetch the logged-in user's username and display it
    fetchFromAPI('current_user')
        .then((data) => {
            if (data.username) {
                document.querySelector('.sidebar h2').textContent = data.username;
            } else {
                alert('Failed to retrieve user information.');
            }
        })
        .catch((error) => {
            console.error('Error fetching user data:', error);
            alert('Error fetching user data.');
        });

    // Existing code to load projects
    fetchFromAPI('works')
        .then((data) => {
            projects = data;
            renderProjects();
            updateTotalHours();
        })
        .catch((error) => {
            console.error('Error loading projects:', error);
            alert('Failed to load projects. Please try again later.');
        });
});
