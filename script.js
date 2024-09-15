document.querySelector("#push").onclick = function () {
  let taskInput = document.querySelector("#newtask input");
  let timeInput = document.querySelector('#newtask input[type="time"]');
  let categoryInput = document.querySelector("#newtask select");

  if (taskInput.value.length == 0 || timeInput.value.length === 0) {
    alert("Please enter both a task and time");
  }  else {
    let taskTime = timeInput.value;  // 시간과 분을 포함한 값
    let taskCategory = categoryInput.value;
    let taskId = Date.now();
    // 새로운 일정 추가
    const taskHTML = `
        <div class="task" data-time="${taskTime}" data-category="${taskCategory}">
            <span id="taskname">${timeInput.value} - ${taskInput.value} [${categoryInput.value}]</span>
            <button class="delete"><i class="far fa-trash-alt"></i></button>
        </div>`;
    
    document.querySelector("#tasks").innerHTML += taskHTML;

    // 시간대에서 시간만 추출하여 타임슬롯 찾기
    let calendarTimeSlot = document.querySelector(`.time-slot[data-time="${taskTime.substring(0, 2)}:00"]`);

    if (calendarTimeSlot) {
      let calendarTask = document.createElement("div");
      calendarTask.classList.add("calendar-task");
      calendarTask.setAttribute("data-id", taskId); // 고유 ID 추가
      calendarTask.textContent = `${taskInput.value} [${taskCategory}]`;
      calendarTask.style.backgroundColor = getCategoryColor(taskCategory);
      calendarTimeSlot.appendChild(calendarTask);
    }
    
    addDeleteFunctionality();
    
    // 입력값 초기화
    taskInput.value = "";
    timeInput.value = "";
    sortTasksByTime();
  }
};

function getCategoryColor(category) {
  switch (category) {
    case 'work': return 'rgba(255, 182, 193, 0.8)';
    case 'personal': return 'rgba(135, 206, 250, 0.8)';
    case 'other': return 'rgba(144, 238, 144, 0.8)';
    default: return 'rgba(255, 255, 255, 0.8)';
  }
}

function addDeleteFunctionality() {
  var current_tasks = document.querySelectorAll(".delete");
  for (var i = 0; i < current_tasks.length; i++) {
    current_tasks[i].onclick = function () {
      let taskId = this.parentNode.getAttribute("data-id");

      // 왼쪽 목록에서 해당 ID를 가진 할 일 삭제
      let taskInLeft = document.querySelector(`.task[data-id="${taskId}"]`);
      if (taskInLeft) {
        taskInLeft.remove();
      }

      // 오른쪽 시간 슬롯에서 해당 ID를 가진 할 일 삭제
      let taskInCalendar = document.querySelector(`.calendar-task[data-id="${taskId}"]`);
      if (taskInCalendar) {
        taskInCalendar.remove();
      }
      this.parentNode.remove();
    };
  }

  var tasks = document.querySelectorAll(".task");
  for (var i = 0; i < tasks.length; i++) {
    tasks[i].onclick = function () {
      this.classList.toggle("completed");
      let taskName = this.querySelector("#taskname");

      // 철자 검사를 비활성화
      taskName.setAttribute("spellcheck", "false");

      let clapEmoji = taskName.querySelector(".clap-emoji");
      if (clapEmoji) {
        clapEmoji.remove(); // 기존 이모티콘 삭제
      }

      if (this.classList.contains("completed")) {
        // 박수 이모티콘을 추가
        let emojiSpan = document.createElement("span");
        emojiSpan.classList.add("clap-emoji");
        emojiSpan.textContent = "👏";
        emojiSpan.setAttribute("spellcheck", "false"); // 철자 검사 비활성화
        emojiSpan.setAttribute("lang", "zxx"); // 언어 없음으로 설정
        taskName.appendChild(emojiSpan); // 이모티콘 추가
      }
    };
  }
}

function handleDragStart(event) {
  event.dataTransfer.setData('text/plain', event.target.outerHTML);
  event.dataTransfer.dropEffect = 'move';
  event.target.style.opacity = '0.4';
}

function handleDragOver(event) {
  event.preventDefault();
}

function handleDrop(event) {
  event.preventDefault();
  let draggedTaskHTML = event.dataTransfer.getData('text/plain');
  event.target.innerHTML += draggedTaskHTML; // 드롭한 영역에 추가
  event.dataTransfer.clearData();
  event.target.style.opacity = '1';
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

// 분 또는 초 입력 필드의 값이 변경될 때 즉시 타이머에 반영
minutesInput.oninput = secondsInput.oninput = function () {
  if (!isRunning) {
    let minutes = parseInt(minutesInput.value) || 0;
    let seconds = parseInt(secondsInput.value) || 0;
    timeLeft = minutes * 60 + seconds;
    updateDisplay(timeLeft);
  }
};

// 타이머 시작 버튼 클릭 시
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

// 타이머 재설정 버튼 클릭 시
resetButton.onclick = function () {
  clearInterval(timer);
  let minutes = parseInt(minutesInput.value) || 0;
  let seconds = parseInt(secondsInput.value) || 0;
  timeLeft = minutes * 60 + seconds;
  updateDisplay(timeLeft);
  isRunning = false;
};

// 시간을 mm:ss 형식으로 업데이트하는 함수
function updateDisplay(seconds) {
  let minutes = Math.floor(seconds / 60);
  let remainingSeconds = seconds % 60;
  timerDisplay.textContent = `${minutes < 10 ? "0" : ""}${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
}

// 현재 시간을 실시간으로 표시하는 함수
function updateClock() {
  let now = new Date();
  let hours = now.getHours();
  let minutes = now.getMinutes();
  let seconds = now.getSeconds();

  hours = hours < 10 ? "0" + hours : hours;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  seconds = seconds < 10 ? "0" + seconds : seconds;

  document.getElementById("clock-display").textContent = `${hours}:${minutes}:${seconds}`;
}

// 매 초마다 현재 시간 업데이트
setInterval(updateClock, 1000);

document.addEventListener("DOMContentLoaded", function () {
  
  // Quill.js 편집기 초기화
  var quill = new Quill("#editor", {
    theme: "snow",
    modules: {
      toolbar: "#toolbar",
    },
    placeholder: "Write your note here...",
  });

  // 노트 저장 버튼과 노트 리스트
  let saveNoteButton = document.querySelector("#save-note");
  let resetNoteButton = document.querySelector("#reset-note"); // 리셋 버튼
  let notesList = document.querySelector("#notes-list");
  let noteTitleInput = document.querySelector("#note-title"); // 제목 입력 필드

  // 로컬 스토리지에서 노트 불러오기
  loadNotes();

  // 노트 저장 기능
  saveNoteButton.onclick = function () {
    // Quill 에디터에서 텍스트와 제목 가져오기
    let noteText = quill.getText().trim();
    let noteTitle = noteTitleInput.value.trim(); // 제목 입력

    if (noteText !== "" && noteTitle !== "") {
      // 새로운 노트를 리스트에 추가
      let noteItem = createNoteItem(noteTitle, noteText);
      notesList.appendChild(noteItem);

      // 에디터와 제목 필드 비우기
      quill.setText("");
      noteTitleInput.value = "";

      // 노트를 로컬 스토리지에 저장
      saveNoteToLocalStorage({ title: noteTitle, text: noteText });
    } else {
      alert("Please provide both a title and note content.");
    }
  };

  // 노트 항목 생성 함수
  function createNoteItem(title, text) {
    let noteItem = document.createElement("div");
    noteItem.classList.add("note-item");
    noteItem.innerHTML = `<strong>${title}</strong><p>${text}</p>`;

    // 삭제 버튼 추가
    let deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.classList.add("delete-note");
    noteItem.appendChild(deleteButton);

    // 삭제 버튼 클릭 시 해당 노트 삭제
    deleteButton.addEventListener("click", function () {
      noteItem.remove(); // 노트 항목을 UI에서 제거
      deleteNoteFromLocalStorage(title); // 로컬 스토리지에서 노트 삭제
    });

    return noteItem;
  }

  // 노트를 로컬 스토리지에 저장하는 함수
  function saveNoteToLocalStorage(note) {
    let savedNotes = JSON.parse(localStorage.getItem("notes")) || [];
    savedNotes.push(note);
    localStorage.setItem("notes", JSON.stringify(savedNotes));
  }

  // 로컬 스토리지에서 저장된 노트를 불러오는 함수
  function loadNotes() {
    let savedNotes = JSON.parse(localStorage.getItem("notes")) || [];
    savedNotes.forEach(function (note) {
      let noteItem = createNoteItem(note.title, note.text);
      notesList.appendChild(noteItem);
    });
  }

  // 로컬 스토리지에서 노트를 삭제하는 함수
  function deleteNoteFromLocalStorage(title) {
    let savedNotes = JSON.parse(localStorage.getItem("notes")) || [];
    let updatedNotes = savedNotes.filter((note) => note.title !== title); // 제목이 일치하지 않는 노트만 유지
    localStorage.setItem("notes", JSON.stringify(updatedNotes));
  }
});



