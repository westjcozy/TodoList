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

let timerDisplay = document.querySelector('#timer-display');
let startButton = document.querySelector('#start-timer');
let resetButton = document.querySelector('#reset-timer');
let minutesInput = document.querySelector('#minutes-input');
let secondsInput = document.querySelector('#seconds-input');
let clockDisplay = document.querySelector('#clock-display');

let timer;
let timeLeft;
let isRunning = false;

// 분 또는 초 입력 필드의 값이 변경될 때 즉시 타이머에 반영
minutesInput.oninput = secondsInput.oninput = function() {
    if (!isRunning) {
        let minutes = parseInt(minutesInput.value) || 0;
        let seconds = parseInt(secondsInput.value) || 0;
        timeLeft = (minutes * 60) + seconds;
        updateDisplay(timeLeft);
    }
};

// 타이머 시작 버튼 클릭 시
startButton.onclick = function() {
    if (!isRunning) {
        let minutes = parseInt(minutesInput.value) || 0;
        let seconds = parseInt(secondsInput.value) || 0;
        timeLeft = (minutes * 60) + seconds;

        timer = setInterval(function() {
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
resetButton.onclick = function() {
    clearInterval(timer);
    let minutes = parseInt(minutesInput.value) || 0;
    let seconds = parseInt(secondsInput.value) || 0;
    timeLeft = (minutes * 60) + seconds;
    updateDisplay(timeLeft);
    isRunning = false;
};

// 시간을 mm:ss 형식으로 업데이트하는 함수
function updateDisplay(seconds) {
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = seconds % 60;
    timerDisplay.textContent = `${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

// 현재 시간을 실시간으로 표시하는 함수
function updateClock() {
    let now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();

    // 시, 분, 초를 두 자리로 맞춤
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;

    // 현재 시간을 #clock-display에 표시
    clockDisplay.textContent = `${hours}:${minutes}:${seconds}`;
}

// 매 초마다 현재 시간 업데이트
setInterval(updateClock, 1000);

document.addEventListener("DOMContentLoaded", function() {
    // Quill.js 편집기 초기화
    var quill = new Quill('#editor', {
        theme: 'snow',
        modules: {
            toolbar: '#toolbar'
        },
        placeholder: 'Write your note here...'
    });

    // 노트 저장 버튼과 노트 리스트
    let saveNoteButton = document.querySelector('#save-note');
    let resetNoteButton = document.querySelector('#reset-note'); // 리셋 버튼
    let notesList = document.querySelector('#notes-list');
    let noteTitleInput = document.querySelector('#note-title'); // 제목 입력 필드

    // 로컬 스토리지에서 노트 불러오기
    loadNotes();

    // 노트 저장 기능
    saveNoteButton.onclick = function() {
        // Quill 에디터에서 텍스트와 제목 가져오기
        let noteText = quill.getText().trim();
        let noteTitle = noteTitleInput.value.trim(); // 제목 입력

        if (noteText !== "" && noteTitle !== "") {
            // 새로운 노트를 리스트에 추가
            let noteItem = createNoteItem(noteTitle, noteText);
            notesList.appendChild(noteItem);

            // 에디터와 제목 필드 비우기
            quill.setText('');
            noteTitleInput.value = "";

            // 노트를 로컬 스토리지에 저장
            saveNoteToLocalStorage({ title: noteTitle, text: noteText });
        } else {
            alert("Please provide both a title and note content.");
        }
    };

    // 노트 항목 생성 함수
    function createNoteItem(title, text) {
        let noteItem = document.createElement('div');
        noteItem.classList.add('note-item');
        noteItem.innerHTML = `<strong>${title}</strong><p>${text}</p>`;
        
        // 삭제 버튼 추가
        let deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('delete-note');
        noteItem.appendChild(deleteButton);

        // 삭제 버튼 클릭 시 해당 노트 삭제
        deleteButton.addEventListener('click', function() {
            noteItem.remove(); // 노트 항목을 UI에서 제거
            deleteNoteFromLocalStorage(title); // 로컬 스토리지에서 노트 삭제
        });

        return noteItem;
    }

    // 노트를 로컬 스토리지에 저장하는 함수
    function saveNoteToLocalStorage(note) {
        let savedNotes = JSON.parse(localStorage.getItem('notes')) || [];
        savedNotes.push(note);
        localStorage.setItem('notes', JSON.stringify(savedNotes));
    }

    // 로컬 스토리지에서 저장된 노트를 불러오는 함수
    function loadNotes() {
        let savedNotes = JSON.parse(localStorage.getItem('notes')) || [];
        savedNotes.forEach(function(note) {
            let noteItem = createNoteItem(note.title, note.text);
            notesList.appendChild(noteItem);
        });
    }

    // 로컬 스토리지에서 노트를 삭제하는 함수
    function deleteNoteFromLocalStorage(title) {
        let savedNotes = JSON.parse(localStorage.getItem('notes')) || [];
        let updatedNotes = savedNotes.filter(note => note.title !== title); // 제목이 일치하지 않는 노트만 유지
        localStorage.setItem('notes', JSON.stringify(updatedNotes));
    }
});

function updateClock() {
    let now = new Date();
    let year = now.getFullYear(); // 년도 추가
    let month = now.getMonth() + 1; // 월 추가 (0부터 시작하므로 +1)
    let day = now.getDate(); // 일 추가
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();

    // 시, 분, 초를 두 자리로 맞춤
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    month = month < 10 ? '0' + month : month; // 월을 두 자리로 맞춤
    day = day < 10 ? '0' + day : day; // 일도 두 자리로 맞춤

    // 현재 시간을 #clock-display에 표시
    clockDisplay.textContent = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// 매 초마다 현재 시간 업데이트
setInterval(updateClock, 1000);


