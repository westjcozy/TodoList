document.querySelector("#push").onclick = function () {
  let taskInput = document.querySelector("#newtask input");
  let timeInput = document.querySelector('#newtask input[type="time"]');
  let categoryInput = document.querySelector("#newtask select");

  if (taskInput.value.length == 0 || timeInput.value.length === 0) {
    alert("Please enter both a task and time");
  } else {
    let taskTime = timeInput.value;
    let taskCategory = categoryInput.value;
    let taskId = Date.now();
    let taskTextContent = `${timeInput.value} - ${taskInput.value} [${categoryInput.value}]`;

    const taskHTML = `
          <div class="task" data-id="${taskId}" data-time="${taskTime}" data-category="${taskCategory}">
              <span id="taskname">${taskTextContent}</span>
              <button class="delete"><i class="far fa-trash-alt"></i></button>
          </div>`;

    document.querySelector("#tasks").innerHTML += taskHTML;

    addTaskToCalendar(taskId, taskTime, taskCategory, taskInput.value);

    addDeleteFunctionality();

    taskInput.value = "";
    timeInput.value = "";
    sortTasksByTime();
  }
};

function getCategoryColor(category) {
  switch (category) {
    case "work":
      return "rgba(255, 182, 193, 0.8)";
    case "personal":
      return "rgba(135, 206, 250, 0.8)";
    case "other":
      return "rgba(144, 238, 144, 0.8)";
    default:
      return "rgba(255, 255, 255, 0.8)";
  }
}

function addDeleteFunctionality() {
  var current_tasks = document.querySelectorAll(".delete");
  for (var i = 0; i < current_tasks.length; i++) {
    current_tasks[i].onclick = function () {
      let taskId = this.parentNode.getAttribute("data-id");

      let taskInLeft = document.querySelector(`.task[data-id="${taskId}"]`);
      if (taskInLeft) {
        taskInLeft.remove();
      }

      let taskInCalendar = document.querySelector(
        `.calendar-task[data-id="${taskId}"]`
      );
      if (taskInCalendar) {
        taskInCalendar.remove();
      }
      this.parentNode.remove();
    };
  }

  addCompleteFunctionality();
}

function addCompleteFunctionality() {
  var tasks = document.querySelectorAll(".task");
  for (var i = 0; i < tasks.length; i++) {
    tasks[i].onclick = function () {
      this.classList.toggle("completed");
      let taskName = this.querySelector("#taskname");

      taskName.setAttribute("spellcheck", "false");

      let clapEmoji = taskName.querySelector(".clap-emoji");
      if (clapEmoji) {
        clapEmoji.remove();
      }

      if (this.classList.contains("completed")) {
        let emojiSpan = document.createElement("span");
        emojiSpan.classList.add("clap-emoji");
        emojiSpan.textContent = "👏";
        emojiSpan.setAttribute("spellcheck", "false");
        emojiSpan.setAttribute("lang", "zxx");
        taskName.appendChild(emojiSpan);
      }

      let taskId = this.getAttribute("data-id");
      let calendarTask = document.querySelector(
        `.calendar-task[data-id="${taskId}"]`
      );
      if (calendarTask) {
        calendarTask.classList.toggle("completed");
      }
    };
  }
}

function addTaskToCalendar(taskId, taskTime, taskCategory, taskTextContent) {
  let calendarTimeSlot = document.querySelector(
    `.time-slot[data-time="${taskTime.substring(0, 2)}:00"]`
  );

  if (calendarTimeSlot) {
    let calendarTask = document.createElement("div");
    calendarTask.classList.add("calendar-task");
    calendarTask.setAttribute("data-id", taskId);
    calendarTask.setAttribute("draggable", "true");
    calendarTask.style.backgroundColor = getCategoryColor(taskCategory);

    let taskContent = document.createElement("div");
    taskContent.classList.add("task-content");

    let taskText = document.createElement("span");
    taskText.textContent = taskTextContent;

    let deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-task");
    deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';

    deleteButton.addEventListener("click", function (e) {
      e.stopPropagation();
      calendarTask.remove();
      let taskInLeft = document.querySelector(`.task[data-id="${taskId}"]`);
      if (taskInLeft) {
        taskInLeft.remove();
      }
    });

    taskContent.appendChild(taskText);
    taskContent.appendChild(deleteButton);

    calendarTask.appendChild(taskContent);

    calendarTask.addEventListener("dragstart", handleDragStart);
    calendarTask.addEventListener("dragend", handleDragEnd);

    calendarTimeSlot.appendChild(calendarTask);
  }
}

function handleDragStart(event) {
  event.dataTransfer.setData(
    "text/plain",
    event.target.getAttribute("data-id")
  );
  event.dataTransfer.effectAllowed = "move";
  event.target.classList.add("dragging");
}

function handleDragOver(event) {
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
}

function handleDropOnTimeSlot(event) {
  event.preventDefault();
  const taskId = event.dataTransfer.getData("text/plain");
  const taskElement = document.querySelector(
    `.calendar-task[data-id='${taskId}']`
  );
  if (taskElement) {
    taskElement.parentNode.removeChild(taskElement);
    event.currentTarget.appendChild(taskElement);

    const newTime = event.currentTarget.getAttribute("data-time");
    updateTaskTime(taskId, newTime);
  }
  event.currentTarget.classList.remove("drag-over");
}

function handleDragEnter(event) {
  event.preventDefault();
  event.currentTarget.classList.add("drag-over");
}

function handleDragLeave(event) {
  event.currentTarget.classList.remove("drag-over");
}

function handleDragEnd(event) {
  event.target.classList.remove("dragging");
}

function updateTaskTime(taskId, newTime) {
  const taskInLeft = document.querySelector(`.task[data-id='${taskId}']`);
  if (taskInLeft) {
    taskInLeft.setAttribute("data-time", newTime);
    const taskNameElement = taskInLeft.querySelector("#taskname");
    const taskInfo = taskNameElement.textContent.split(" - ")[1];
    taskNameElement.textContent = `${newTime} - ${taskInfo}`;
  }

  const taskElement = document.querySelector(
    `.calendar-task[data-id='${taskId}']`
  );
  if (taskElement) {
    taskElement.setAttribute("data-time", newTime);
  }
}

function sortTasksByTime() {
  let taskContainer = document.querySelector("#tasks");
  let tasks = Array.from(taskContainer.children);

  tasks.sort(function (a, b) {
    return a
      .getAttribute("data-time")
      .localeCompare(b.getAttribute("data-time"));
  });

  tasks.forEach(function (task) {
    taskContainer.appendChild(task);
  });
}

let timerDisplay = document.querySelector("#timer-display");
let startButton = document.querySelector("#start-timer");
let resetButton = document.querySelector("#reset-timer");
let minutesInput = document.querySelector("#minutes-input");
let secondsInput = document.querySelector("#seconds-input");
let clockDisplay = document.querySelector("#clock-display");

let timer;
let timeLeft;
let isRunning = false;

minutesInput.oninput = secondsInput.oninput = function () {
  if (!isRunning) {
    let minutes = parseInt(minutesInput.value) || 0;
    let seconds = parseInt(secondsInput.value) || 0;
    timeLeft = minutes * 60 + seconds;
    updateDisplay(timeLeft);
  }
};

startButton.onclick = function () {
  if (!isRunning) {
    let minutes = parseInt(minutesInput.value) || 0;
    let seconds = parseInt(secondsInput.value) || 0;
    timeLeft = minutes * 60 + seconds;

    timer = setInterval(function () {
      if (timeLeft > 0) {
        timeLeft--;
        updateDisplay(timeLeft);
      } else {
        clearInterval(timer);
        alert("Time's up!");
        isRunning = false;
      }
    }, 1000);

    isRunning = true;
  }
};

resetButton.onclick = function () {
  clearInterval(timer);
  let minutes = parseInt(minutesInput.value) || 0;
  let seconds = parseInt(secondsInput.value) || 0;
  timeLeft = minutes * 60 + seconds;
  updateDisplay(timeLeft);
  isRunning = false;
};

function updateDisplay(seconds) {
  let minutes = Math.floor(seconds / 60);
  let remainingSeconds = seconds % 60;
  timerDisplay.textContent = `${minutes < 10 ? "0" : ""}${minutes}:${
    remainingSeconds < 10 ? "0" : ""
  }${remainingSeconds}`;
}

function updateClock() {
  let now = new Date();
  let hours = now.getHours();
  let minutes = now.getMinutes();
  let seconds = now.getSeconds();

  hours = hours < 10 ? "0" + hours : hours;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  seconds = seconds < 10 ? "0" + seconds : seconds;

  document.getElementById(
    "clock-display"
  ).textContent = `${hours}:${minutes}:${seconds}`;
}

setInterval(updateClock, 1000);

document.addEventListener("DOMContentLoaded", function () {
  var quill = new Quill("#editor", {
    theme: "snow",
    modules: {
      toolbar: "#toolbar",
    },
    placeholder: "Write your note here...",
  });

  let saveNoteButton = document.querySelector("#save-note");
  let resetNoteButton = document.querySelector("#reset-note");
  let notesList = document.querySelector("#notes-list");
  let noteTitleInput = document.querySelector("#note-title");

  loadNotes();

  saveNoteButton.onclick = function () {
    let noteText = quill.getText().trim();
    let noteTitle = noteTitleInput.value.trim();

    if (noteText !== "" && noteTitle !== "") {
      let noteItem = createNoteItem(noteTitle, noteText);
      notesList.appendChild(noteItem);

      quill.setText("");
      noteTitleInput.value = "";

      saveNoteToLocalStorage({ title: noteTitle, text: noteText });
    } else {
      alert("Please provide both a title and note content.");
    }
  };

  function createNoteItem(title, text) {
    let noteItem = document.createElement("div");
    noteItem.classList.add("note-item");
    noteItem.innerHTML = `<strong>${title}</strong><p>${text}</p>`;

    let deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.classList.add("delete-note");
    noteItem.appendChild(deleteButton);

    deleteButton.addEventListener("click", function () {
      noteItem.remove();
      deleteNoteFromLocalStorage(title);
    });

    return noteItem;
  }

  function saveNoteToLocalStorage(note) {
    let savedNotes = JSON.parse(localStorage.getItem("notes")) || [];
    savedNotes.push(note);
    localStorage.setItem("notes", JSON.stringify(savedNotes));
  }

  function loadNotes() {
    let savedNotes = JSON.parse(localStorage.getItem("notes")) || [];
    savedNotes.forEach(function (note) {
      let noteItem = createNoteItem(note.title, note.text);
      notesList.appendChild(noteItem);
    });
  }

  function deleteNoteFromLocalStorage(title) {
    let savedNotes = JSON.parse(localStorage.getItem("notes")) || [];
    let updatedNotes = savedNotes.filter((note) => note.title !== title);
    localStorage.setItem("notes", JSON.stringify(updatedNotes));
  }

  const timeSlots = document.querySelectorAll(".time-slot");
  timeSlots.forEach((slot) => {
    slot.addEventListener("dragover", handleDragOver);
    slot.addEventListener("drop", handleDropOnTimeSlot);
    slot.addEventListener("dragenter", handleDragEnter);
    slot.addEventListener("dragleave", handleDragLeave);
  });
});
