document.querySelector('#push').onclick = function() {
    let taskInput = document.querySelector('#newtask input');
    let timeInput = document.querySelector('#newtask input[type="time"]');
    let categoryInput = document.querySelector('#newtask select');

    if (taskInput.value.length == 0 || timeInput.value.length == 0) {
        alert("Please enter both a task and time");
    } else {
        document.querySelector('#tasks').innerHTML += `
            <div class="task" data-time="${timeInput.value}">
                <span id="taskname">
                    ${timeInput.value} - ${taskInput.value} [${categoryInput.value}]
                </span>
                <button class="delete">
                    <i class="far fa-trash-alt"></i>
                </button>
            </div>
        `;

        var current_tasks = document.querySelectorAll(".delete");
        for (var i = 0; i < current_tasks.length; i++) {
            current_tasks[i].onclick = function() {
                this.parentNode.remove();
            };
        }

        var tasks = document.querySelectorAll(".task");
        for (var i = 0; i < tasks.length; i++) {
            tasks[i].onclick = function() {
                this.classList.toggle('completed'); 
            };
        }

        taskInput.value = "";
        timeInput.value = "";
    }

    sortTasksByTime();
};

function sortTasksByTime() {
    let taskContainer = document.querySelector("#tasks");
    let tasks = Array.from(taskContainer.children);

    tasks.sort(function(a, b) {
        return a.getAttribute('data-time').localeCompare(b.getAttribute('data-time'));
    });

    tasks.forEach(function(task) {
        taskContainer.appendChild(task); 
    });
}
