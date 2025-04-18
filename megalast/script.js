let questions = [];
let answerId = 0;

// Добавить вариант ответа
function addAnswer() {
  const container = document.getElementById("answersContainer");
  const div = document.createElement("div");
  div.className = "answer-item";
  div.id = `answer-${answerId}`;

  div.innerHTML = `
    <input type="radio" name="correct" value="${answerId}" style="margin-right: 8px;">
    <input type="text" placeholder="Введите вариант ответа">
    <button onclick="removeAnswer(${answerId})"style="background-color:#00BFFF">&minus;</button>
  `;

  container.appendChild(div);
  answerId++;
}

// Удалить вариант
function removeAnswer(id) {
  const el = document.getElementById(`answer-${id}`);
  if (el) el.remove();
}

// Добавить вопрос
function addQuestion() {
  const question = document.getElementById('questionInput').value.trim();
  const answerEls = document.querySelectorAll("#answersContainer .answer-item");

  if (!question || answerEls.length < 2) {
    alert("Пожалуйста, введите вопрос и минимум два варианта ответа.");
    return;
  }

  const parsedAnswers = [];
  let correctIndex = null;

  answerEls.forEach((el, index) => {
    const text = el.querySelector("input[type='text']").value.trim();
    const isCorrect = el.querySelector("input[type='radio']").checked;

    if (!text) {
      alert(`Введите текст для варианта ответа ${index + 1}`);
      return;
    }

    parsedAnswers.push(text);
    if (isCorrect) correctIndex = index; // Save the index of the correct answer
  });

  if (correctIndex === null) {
    alert("Выберите правильный вариант ответа!");
    return;
  }

  questions.push({
    question: question,
    answers: parsedAnswers,
    correct: correctIndex // Save the correct answer index
  });

  document.getElementById('questionInput').value = '';
  document.getElementById('answersContainer').innerHTML = '';
  answerId = 0;
  addAnswer(); addAnswer();
  showQuestions();
}

function showQuestions() {
  const list = document.getElementById("questionList");
  list.innerHTML = ""; // Очистить список перед добавлением новых вопросов

  questions.forEach((q, index) => {
    const questionDiv = document.createElement("div");
    questionDiv.style.marginBottom = "20px";
    questionDiv.style.padding = "10px";
    questionDiv.style.border = "1px solid #ccc";
    questionDiv.style.borderRadius = "5px";
    questionDiv.style.backgroundColor = "#f9f9f9";

    const questionText = document.createElement("p");
    questionText.textContent = `${index + 1}. ${q.question}`;
    questionText.style.fontWeight = "bold"; // Сделать текст вопроса жирным
    questionDiv.appendChild(questionText);

    // Отображение вариантов ответа
    const answersList = document.createElement("ul");
    answersList.style.marginLeft = "20px"; // Отступ для списка вариантов ответа
    q.answers.forEach((answer, i) => {
      const answerItem = document.createElement("li");
      answerItem.textContent = answer;

      // Выделение правильного ответа
      if (i === q.correct) {
        answerItem.style.fontWeight = "bold";
        answerItem.style.color = "green";
        answerItem.textContent += " (Правильный)";
      }

      answersList.appendChild(answerItem);
    });
    questionDiv.appendChild(answersList);

    // Кнопка редактирования
    const editButton = document.createElement("button");
    editButton.textContent = "Редактировать";
    editButton.style.marginRight = "10px";
    editButton.onclick = () => editQuestion(index);
    questionDiv.appendChild(editButton);

    // Кнопка удаления
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Удалить";
    deleteButton.onclick = () => deleteQuestion(index);
    questionDiv.appendChild(deleteButton);

    list.appendChild(questionDiv);
  });
}

// Удалить вопрос
function deleteQuestion(index) {
  if (confirm("Удалить этот вопрос?")) {
    questions.splice(index, 1);
    showQuestions();
  }
}

// Редактировать вопрос
function editQuestion(index) {
  const question = questions[index];
  document.getElementById("questionInput").value = question.question;

  // Очистить контейнер для ответов
  const answersContainer = document.getElementById("answersContainer");
  answersContainer.innerHTML = "";
  answerId = 0;

  // Добавить ответы в контейнер
  question.answers.forEach((answer, i) => {
    const div = document.createElement("div");
    div.className = "answer-item";
    div.id = `answer-${answerId}`;

    div.innerHTML = `
      <input type="radio" name="correct" value="${answerId}" ${i === question.correct ? "checked" : ""} style="margin-right: 8px;">
      <input type="text" value="${answer}" placeholder="Введите вариант ответа">
      <button onclick="removeAnswer(${answerId})" style="background-color:#00BFFF;">➖</button>
    `;

    answersContainer.appendChild(div);
    answerId++;
  });

  // Удалить текущий вопрос из массива
  questions.splice(index, 1);
  showQuestions();
}

// ========== ПРОХОЖДЕНИЕ ТЕСТА ==========

let shuffledQuestions = [];
let currentQuestionIndex = 0;
let correctCount = 0;
let wrongQuestions = [];

if (window.location.pathname.includes('test.html')) {
  const allTests = JSON.parse(localStorage.getItem('allTests')) || [];
  const testId = localStorage.getItem('currentTestId');
  const test = allTests.find(t => t.id === testId);

  if (!test) {
    document.getElementById('testContainer').innerHTML = '<p>Нет сохранённого теста!</p>';
  } else {
    document.getElementById('testTitle').innerText = test.title;
    shuffledQuestions = shuffle([...test.questions]);
    showQuestion();
  }
}

function showQuestion() {
  if (currentQuestionIndex >= shuffledQuestions.length) {
    showResult();
    return;
  }

  const q = shuffledQuestions[currentQuestionIndex];
  const container = document.getElementById('testContainer');
  const shuffledAnswers = shuffle([...q.answers]);

  container.innerHTML = `
    <h3>Вопрос ${currentQuestionIndex + 1} из ${shuffledQuestions.length}</h3>
    <p><b>${q.question}</b></p>
    ${shuffledAnswers.map(a => `
      <label>
        <input type="radio" name="answer" value="${a}"> ${a}
      </label><br>`).join('')}
    <br>
    <button onclick="submitAnswer()">Ответить</button>
    <p id="feedback"></p>
  `;

  setTimeout(() => {
    document.querySelectorAll('#testContainer label').forEach(label => {
      label.classList.remove('correct-answer', 'wrong-answer');
    });
  }, 50);
}

function submitAnswer() {
  const selected = document.querySelector('input[name="answer"]:checked');
  if (!selected) {
    alert("Выберите ответ!");
    return;
  }

  const q = shuffledQuestions[currentQuestionIndex];
  const answer = selected.value;
  const radios = document.querySelectorAll('input[name="answer"]');

  radios.forEach(r => {
    const label = r.parentElement;
    if (r.value === q.answers[q.correct]) {
      label.classList.add('correct-answer');
    }
    if (r.checked && r.value !== q.answers[q.correct]) {
      label.classList.add('wrong-answer');
    }
  });

  if (answer === q.answers[q.correct]) {
    correctCount++;
  } else {
    wrongQuestions.push(q);
  }

  const answerBtn = document.querySelector('button[onclick="submitAnswer()"]');
  if (answerBtn) answerBtn.remove();

  const feedback = document.getElementById('feedback');
  feedback.innerHTML = '';
  const nextBtn = document.createElement('button');
  nextBtn.textContent = 'Следующий вопрос';
  nextBtn.style.marginTop = '15px';
  nextBtn.onclick = () => {
    currentQuestionIndex++;
    showQuestion();
  };
  feedback.appendChild(nextBtn);
}

function showResult() {
  const total = shuffledQuestions.length;
  const result = document.getElementById('resultContainer');
  result.style.display = 'block';

  result.innerHTML = `
    <h2>Результат</h2>
    <p>Правильных ответов: ${correctCount} из ${total}</p>
    ${wrongQuestions.length > 0
      ? `<button onclick="retryMistakes()">Повторить ошибки (${wrongQuestions.length})</button>`
      : '<p>Отлично! Все ответы верны.</p>'}
  `;

  document.getElementById('testContainer').innerHTML = '';
}

function retryMistakes() {
  shuffledQuestions = shuffle([...wrongQuestions]);
  currentQuestionIndex = 0;
  correctCount = 0;
  wrongQuestions = [];
  document.getElementById('resultContainer').style.display = 'none';
  showQuestion();
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

// ========== СОХРАНЕНИЕ ТЕСТА ==========

function generateId() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

let editTestId = localStorage.getItem('editTestId');

if (window.location.pathname.includes('create.html') && editTestId) {
  const allTests = JSON.parse(localStorage.getItem('allTests')) || [];
  const test = allTests.find(t => t.id === editTestId);
  if (test) {
    document.getElementById('testTitle').value = test.title;
    questions = [...test.questions];
    showQuestions();
  }
}

async function saveTest() {
  const testTitle = document.getElementById('testTitle').value.trim();

  if (!testTitle) {
    alert("Введите название теста!");
    return;
  }

  if (questions.length === 0) {
    alert("Добавьте хотя бы один вопрос!");
    return;
  }

  const newTest = {
    title: testTitle,
    questions: questions.map(q => ({
      question: q.question,
      answers: q.answers,
      correct: q.correct
    }))
  };

  try {
    const response = await fetch('https://your-api-endpoint.com/tests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTest)
    });

    if (!response.ok) {
      throw new Error('Ошибка при сохранении теста.');
    }

    const savedTest = await response.json();
    const link = `${window.location.origin}/test.html?id=${savedTest.id}`;
    alert(`Тест успешно сохранён! Ссылка: ${link}`);
    navigator.clipboard.writeText(link);
  } catch (error) {
    alert(error.message);
  }
}

// При загрузке страницы добавить два ответа по умолчанию
window.onload = () => {
  if (document.getElementById('answersContainer')) {
    addAnswer();
    addAnswer();
  }
};

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) {
    alert("Файл не выбран!");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const content = e.target.result;
    parseTest(content); // Обработка содержимого файла
  };

  reader.readAsText(file);
}

function parseTest(content) {
  const lines = content.split("\n").map(line => line.trim()).filter(Boolean);
  questions = [];
  let currentQuestion = null;

  lines.forEach(line => {
    if (line.startsWith("<question>")) {
      if (currentQuestion) {
        questions.push(currentQuestion);
      }
      currentQuestion = {
        question: line.replace("<question>", "").trim(),
        answers: [],
        correct: null
      };
    } else if (line.startsWith("<variant>")) {
      currentQuestion?.answers.push(line.replace("<variant>", "").trim());
    } else if (line.startsWith("<variantright>")) {
      const correctAnswer = line.replace("<variantright>", "").trim();
      currentQuestion?.answers.push(correctAnswer);
      currentQuestion.correct = currentQuestion.answers.length - 1; // Save the correct answer index
    }
  });

  if (currentQuestion) {
    questions.push(currentQuestion);
  }

  showQuestions();
}

function showQuestions() {
  const list = document.getElementById("questionList");
  list.innerHTML = ""; // Очистить список перед добавлением новых вопросов

  questions.forEach((q, index) => {
    const questionDiv = document.createElement("div");
    questionDiv.style.marginBottom = "20px";
    questionDiv.style.padding = "10px";
    questionDiv.style.border = "1px солид #ccc";
    questionDiv.style.borderRadius = "5px";
    questionDiv.style.backgroundColor = "#f9f9f9";

    const questionText = document.createElement("p");
    questionText.textContent = `${index + 1}. ${q.question}`;
    questionText.style.fontWeight = "bold"; // Сделать текст вопроса жирным
    questionDiv.appendChild(questionText);

    // Отображение вариантов ответа
    const answersList = document.createElement("ul");
    answersList.style.marginLeft = "20px"; // Отступ для списка вариантов ответа
    q.answers.forEach((answer, i) => {
      const answerItem = document.createElement("ли");
      answerItem.textContent = answer;

      // Выделение правильного ответа
      if (i === q.correct) {
        answerItem.style.fontWeight = "bold";
        answerItem.style.color = "green";
        answerItem.textContent += " (Правильный)";
      }

      answersList.appendChild(answerItem);
    });
    questionDiv.appendChild(answersList);

    // Кнопка редактирования
    const editButton = document.createElement("button");
    editButton.textContent = "Редактировать";
    editButton.style.marginRight = "10px";
    editButton.onclick = () => editQuestion(index);
    questionDiv.appendChild(editButton);

    // Кнопка удаления
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Удалить";
    deleteButton.onclick = () => deleteQuestion(index);
    questionDiv.appendChild(deleteButton);

    list.appendChild(questionDiv);
  });
}

// Функция для редактирования вопроса
function editQuestion(index) {
  const question = questions[index];
  document.getElementById("questionInput").value = question.question;

  // Очистить контейнер для ответов
  const answersContainer = document.getElementById("answersContainer");
  answersContainer.innerHTML = "";
  answerId = 0;

  // Добавить ответы в контейнер
  question.answers.forEach((answer, i) => {
    const div = document.createElement("div");
    div.className = "answer-item";
    div.id = `answer-${answerId}`;

    div.innerHTML = `
      <input type="radio" name="correct" value="${answerId}" ${i === question.correct ? "checked" : ""} style="margin-right: 8px;">
      <input type="text" value="${answer}" placeholder="Введите вариант ответа">
      <button onclick="removeAnswer(${answerId})" style="background-color:#00BFFF;">➖</button>
    `;

    answersContainer.appendChild(div);
    answerId++;
  });

  // Удалить текущий вопрос из массива
  questions.splice(index, 1);
  showQuestions();
}

// Функция для удаления вопроса
function deleteQuestion(index) {
  if (confirm("Вы уверены, что хотите удалить этот вопрос?")) {
    questions.splice(index, 1); // Удаляем вопрос из массива
    showQuestions(); // Обновляем список вопросов
  }
}

