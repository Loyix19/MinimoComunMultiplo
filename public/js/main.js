// Variables globales para la lógica de gamificación
let currentCorrectMCM = 0;
let challengeCounter = 1;
let score = 0;
let isExerciseSectionActive = false; // Bandera para controlar la inicialización

// Constantes de color (Usando los colores NEÓN INTENSOS del CSS)
const NEON_BLUE = '#00FFFF'; // Cian eléctrico (Para resultados)
const NEON_PINK = '#FF00FF'; // Magenta eléctrico (Para errores/alerta)
const TEXT_LIGHT = '#E0FFFF'; // Texto base

// === FUNCIONES DE CÁLCULO ===

// Función para generar un número aleatorio en un rango (inclusivo)
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Función para calcular el Máximo Común Divisor (MCD) usando Euclides
function calculateGCD(a, b) {
    while (b) {
        [a, b] = [b, a % b];
    }
    return a;
}

// Función para calcular el Mínimo Común Múltiplo (MCM)
function calculateLCM(a, b) {
    if (a === 0 || b === 0) return 0;
    return (a * b) / calculateGCD(a, b);
}

// === LÓGICA DE EJERCICIOS ===

// Genera un nuevo desafío de MCM
function generateNewChallenge() {
    // Generamos dos números entre 4 y 15 (o 20)
    const numA = getRandomInt(4, 15);
    const numB = getRandomInt(4, 15);

    currentCorrectMCM = calculateLCM(numA, numB);

    document.getElementById('challenge-number').textContent = challengeCounter;
    document.getElementById('num-a').textContent = numA;
    document.getElementById('num-b').textContent = numB;
    document.getElementById('user-answer').value = '';
    document.getElementById('feedback-message').textContent = '¡A calcular!';
    document.getElementById('feedback-message').style.color = TEXT_LIGHT;
    document.getElementById('feedback-message').style.textShadow = 'none'; // Limpiar brillo anterior
}

// Comprueba la respuesta del usuario (Mejorado con feedback neón)
function checkAnswer() {
    const userAnswerInput = document.getElementById('user-answer');
    const userAnswer = parseInt(userAnswerInput.value);
    const feedbackMsg = document.getElementById('feedback-message');
    
    // 1. Validación
    if (isNaN(userAnswer)) {
        feedbackMsg.textContent = 'ERROR: Ingresa un valor numérico.';
        feedbackMsg.style.color = NEON_PINK;
        feedbackMsg.style.textShadow = `0 0 10px ${NEON_PINK}`;
        return;
    }

    // 2. Comprobación
    if (userAnswer === currentCorrectMCM) {
        // Correcto
        feedbackMsg.textContent = '¡ACCESO CONCEDIDO! +10 Puntos.';
        feedbackMsg.style.color = NEON_BLUE;
        feedbackMsg.style.textShadow = `0 0 10px ${NEON_BLUE}`; // Efecto de brillo neón
        score += 10;
        document.getElementById('score').textContent = score;
    } else {
        // Incorrecto
        feedbackMsg.textContent = `FALLO: El valor correcto era ${currentCorrectMCM}. ¡Reiniciando!`;
        feedbackMsg.style.color = NEON_PINK;
        feedbackMsg.style.textShadow = `0 0 10px ${NEON_PINK}`; // Efecto de brillo neón
    }

    // Desactivar el input mientras se muestra el feedback
    userAnswerInput.disabled = true;

    // 3. Prepara el siguiente desafío
    setTimeout(() => {
        challengeCounter++;
        generateNewChallenge();
        feedbackMsg.style.textShadow = 'none'; // Quitar brillo
        userAnswerInput.disabled = false; // Reactivar input
        userAnswerInput.focus(); // Enfocar para empezar a escribir de nuevo
    }, 2500);
}


// === LÓGICA DE NAVEGACIÓN Y EVENTOS ===

function setupNavigation() {
    const menuButtons = document.querySelectorAll('.menu-btn');
    const sections = document.querySelectorAll('.lesson-section');

    menuButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');

            // 1. Ocultar todas las secciones y desactivar botones
            sections.forEach(section => {
                section.classList.remove('active');
                section.classList.add('hidden');
            });
            menuButtons.forEach(btn => btn.classList.remove('active'));

            // 2. Mostrar la sección objetivo y activar el botón
            const targetSection = document.getElementById(targetId);
            if (targetSection) { // Seguridad
                targetSection.classList.remove('hidden');
                targetSection.classList.add('active');
            }
            button.classList.add('active');

            // 3. Inicialización específica de la sección de Ejercicios
            if (targetId === 'ejercicios' && !isExerciseSectionActive) {
                initializeExerciseSection();
            } else if (targetId === 'ejercicios' && isExerciseSectionActive) {
                // Si ya estaba activa, solo genera un nuevo desafío
                generateNewChallenge();
            }
        });
    });
}

// Inicialización de la sección de Ejercicios (se ejecuta solo la primera vez)
function initializeExerciseSection() {
    isExerciseSectionActive = true;
    
    // Configurar Listeners y primer desafío
    generateNewChallenge(); 

    const checkButton = document.getElementById('check-button');
    if (checkButton) {
        checkButton.addEventListener('click', checkAnswer);
    }
    
    const userAnswerInput = document.getElementById('user-answer');
    if (userAnswerInput) {
        userAnswerInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                checkAnswer();
            }
        });
    }
}

// Inicialización de la sección de Múltiplos
function initializeMultiplesExample() {
    const numMultInput = document.getElementById('num-mult-1');
    const multiplesList = document.getElementById('multiples-list');

    if (numMultInput && multiplesList) {
        function updateMultiples() {
            const num = parseInt(numMultInput.value);
            if (isNaN(num) || num < 2) {
                multiplesList.textContent = 'ERROR: Ingresa un número (ej. 4)';
                multiplesList.style.color = NEON_PINK;
                multiplesList.style.textShadow = `0 0 5px ${NEON_PINK}`;
                return;
            }
            multiplesList.style.color = TEXT_LIGHT;
            multiplesList.style.textShadow = 'none';
            let multiples = [];
            for (let i = 1; i <= 6; i++) {
                multiples.push(num * i);
            }
            multiplesList.textContent = `M(${num}): ${multiples.join(', ')}, ...`;
        }

        numMultInput.addEventListener('input', updateMultiples);
        updateMultiples(); // Inicializar el ejemplo al cargar
    }
}


// === INICIO DE LA APLICACIÓN ===
document.addEventListener('DOMContentLoaded', () => {
    // 1. Configurar la lógica de navegación del menú
    setupNavigation();

    // 2. Inicializar la interactividad de la sección Introducción
    initializeMultiplesExample();

    // 3. Establecer el estado inicial de la sección 'intro'
    // Esto es NECESARIO porque el menú en main.js no se ejecuta hasta que hay un click.
    const introSection = document.getElementById('intro');
    const introButton = document.querySelector('[data-target="intro"]');

    if (introSection) {
        // Aseguramos que la sección de introducción esté visible
        introSection.classList.remove('hidden');
        introSection.classList.add('active');
    }

    if (introButton) {
        // Aseguramos que el botón de introducción esté visualmente activo
        introButton.classList.add('active');
    }
});