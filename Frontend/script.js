const startBtn = document.getElementById('start-btn');
const categorySelect = document.getElementById('category');
const difficultySelect = document.getElementById('difficulty');
const quizContainer = document.getElementById('quiz-container');
const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const nextBtn = document.getElementById('next-btn');
const resultContainer = document.getElementById('result-container');
const scoreEl = document.getElementById('score');
const totalEl = document.getElementById('total');
const restartBtn = document.getElementById('restart-btn');
const startPage = document.getElementById('start-page');

let questions = [];
let currentQuestionIndex = 0;
let score = 0;

startBtn.addEventListener('click', startQuiz);

nextBtn.addEventListener('click', () => {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    showResult();
  }
});

restartBtn.addEventListener('click', () => {
  resetQuiz();
  quizContainer.classList.add('hide');
  resultContainer.classList.add('hide');
  startPage.classList.remove('hide');  // Show start page again
  startBtn.disabled = false;
});

async function startQuiz() {
  startBtn.disabled = true;
  const category = categorySelect.value;
  const difficulty = difficultySelect.value;

  try {
    questions = await fetchQuestions(category, difficulty);

    if (questions.length === 0) {
      alert('No questions found for selected options. Try different category or difficulty.');
      startBtn.disabled = false;
      return;
    }

    currentQuestionIndex = 0;
    score = 0;

    startPage.classList.add('hide');     // Hide start page
    quizContainer.classList.remove('hide');  // Show quiz container
    resultContainer.classList.add('hide');
    showQuestion();
  } catch (error) {
    alert('Failed to load questions. Please try again.');
    startBtn.disabled = false;
  }
}

async function fetchQuestions(category, difficulty) {
  const url = `https://opentdb.com/api.php?amount=10&category=${category}&difficulty=${difficulty}&type=multiple`;
  const res = await fetch(url);
  const data = await res.json();

  // Map API format to quiz format
  return data.results.map(q => {
    const options = [...q.incorrect_answers];
    const randomIndex = Math.floor(Math.random() * (options.length + 1));
    options.splice(randomIndex, 0, q.correct_answer);

    return {
      question: decodeHtml(q.question),
      options: options.map(decodeHtml),
      answer: decodeHtml(q.correct_answer)
    };
  });
}

function showQuestion() {
  resetState();
  const q = questions[currentQuestionIndex];
  questionEl.textContent = `Q${currentQuestionIndex + 1}. ${q.question}`;
  q.options.forEach(option => {
    const li = document.createElement('li');
    li.textContent = option;
    li.addEventListener('click', selectAnswer);
    optionsEl.appendChild(li);
  });
}

function resetState() {
  nextBtn.classList.add('hide');
  while (optionsEl.firstChild) {
    optionsEl.removeChild(optionsEl.firstChild);
  }
}

function selectAnswer(e) {
  const selectedLi = e.target;
  const selectedAnswer = selectedLi.textContent;
  const correctAnswer = questions[currentQuestionIndex].answer;

  if (selectedAnswer === correctAnswer) {
    selectedLi.classList.add('correct');
    score++;
  } else {
    selectedLi.classList.add('wrong');
    // Highlight correct answer
    [...optionsEl.children].forEach(li => {
      if (li.textContent === correctAnswer) {
        li.classList.add('correct');
      }
    });
  }

  // Disable all options after answering
  [...optionsEl.children].forEach(li => li.removeEventListener('click', selectAnswer));

  nextBtn.classList.remove('hide');
}

function showResult() {
  quizContainer.classList.add('hide');
  resultContainer.classList.remove('hide');
  
  scoreEl.textContent = `You scored ${score} out of ${questions.length}`;

  let message = '';
  let emoji = '';

  if (score === questions.length) {
    message = "You are a true QuizCrack!";
    emoji = '🎉🔥🥳';
  } else if (score >= questions.length / 2) {
    message = "Well done! Keep it up!";
    emoji = '😊👍';
  } else {
    message = "Better luck next time!";
    emoji = '😢🙏';
  }

  // Display message + emoji below the score
  const resultMessage = document.createElement('p');
  resultMessage.classList.add('result-message');
  resultMessage.textContent = `${message} ${emoji}`;

  // Clear any previous message
  const oldMsg = resultContainer.querySelector('.result-message');
  if (oldMsg) oldMsg.remove();

  resultContainer.appendChild(resultMessage);
}


function resetQuiz() {
  questions = [];
  currentQuestionIndex = 0;
  score = 0;
}

function decodeHtml(html) {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}
