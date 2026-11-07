/* KENT — валідація форми контактів на стороні клієнта (перенесено з ЛР9).
   Без сторонніх бібліотек. Серверної перевірки немає — це демонстрація. */
(function () {
'use strict';

// ---------- Регулярні вирази ----------
// Ім'я: будь-які літери Unicode (кирилиця, латиниця, діакритика), апостроф, дефіс, пробіл; 2–50 символів, мінімум одна літера
const REGEX_NAME = /^(?=.*\p{L})[\p{L}'’\- ]{2,50}$/u;
// Email: локальна частина @ домен . TLD (мінімум 2 літери)
const REGEX_EMAIL = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
// Телефон України: +380 і рівно 9 цифр
const REGEX_PHONE = /^\+380\d{9}$/;

const MESSAGE_MIN = 10;
const MESSAGE_MAX = 500;

// ---------- DOM ----------
const form = document.getElementById('contact-form');
const modal = document.getElementById('successModal');
const modalClose = document.getElementById('modalClose');
const fields = {
  name: document.getElementById('name'),
  email: document.getElementById('email'),
  phone: document.getElementById('phone'),
  message: document.getElementById('message'),
  agreement: document.getElementById('agreement'),
};
const errors = {
  name: document.getElementById('nameError'),
  email: document.getElementById('emailError'),
  phone: document.getElementById('phoneError'),
  message: document.getElementById('messageError'),
  agreement: document.getElementById('agreementError'),
};

// ---------- Допоміжні функції інтерфейсу ----------
const STATE_CLASSES = ['border-red-500', 'border-green-500', 'border-kent-border'];

function setBorder(input, cls) {
  if (input.type === 'checkbox') return; // у чекбокса немає рамки
  input.classList.remove(...STATE_CLASSES);
  input.classList.add(cls);
}

function showError(key, message) {
  const input = fields[key];
  setBorder(input, 'border-red-500');
  input.setAttribute('aria-invalid', 'true');
  errors[key].textContent = message;
  errors[key].classList.remove('invisible');
}

function showSuccess(key) {
  const input = fields[key];
  setBorder(input, 'border-green-500');
  input.setAttribute('aria-invalid', 'false');
  errors[key].textContent = '';
  errors[key].classList.add('invisible');
}

function clearError(key) {
  const input = fields[key];
  setBorder(input, 'border-kent-border');
  input.setAttribute('aria-invalid', 'false');
  errors[key].textContent = '';
  errors[key].classList.add('invisible');
}

// ---------- Правила валідації (повертають true/false) ----------
function validateName() {
  const value = fields.name.value.trim();
  if (value.length === 0) return showError('name', "Вкажіть ім'я."), false;
  if (value.length < 2) return showError('name', "Ім'я має містити щонайменше 2 символи."), false;
  if (!REGEX_NAME.test(value)) return showError('name', "Ім'я може містити лише літери, пробіл, дефіс і апостроф (до 50 символів)."), false;
  showSuccess('name');
  return true;
}

function validateEmail() {
  const value = fields.email.value.trim();
  if (value.length === 0) return showError('email', 'Вкажіть електронну пошту.'), false;
  if (!REGEX_EMAIL.test(value)) return showError('email', 'Невірний формат пошти. Приклад: name@example.com'), false;
  showSuccess('email');
  return true;
}

function validatePhone() {
  const value = fields.phone.value; // пробіли не обрізаємо: «+380 50…» має бути помилкою
  if (value.length === 0) return showError('phone', 'Вкажіть номер телефону.'), false;
  if (!REGEX_PHONE.test(value)) {
    // Підказка, але значення поля НЕ змінюємо автоматично
    const hint = /^0\d{9}$/.test(value) ? ' Можливо, ви мали на увазі +38' + value + '.' : '';
    return showError('phone', 'Введіть номер у форматі +380XXXXXXXXX (без пробілів).' + hint), false;
  }
  showSuccess('phone');
  return true;
}

function validateMessage() {
  const value = fields.message.value.trim();
  if (value.length === 0) return showError('message', 'Напишіть повідомлення.'), false;
  if (value.length < MESSAGE_MIN) return showError('message', `Повідомлення закоротке: ${value.length} з мінімум ${MESSAGE_MIN} символів.`), false;
  if (value.length > MESSAGE_MAX) return showError('message', `Повідомлення задовге: максимум ${MESSAGE_MAX} символів.`), false;
  showSuccess('message');
  return true;
}

function validateAgreement() {
  if (!fields.agreement.checked) return showError('agreement', 'Потрібна згода на обробку персональних даних.'), false;
  showSuccess('agreement');
  return true;
}

const validators = {
  name: validateName,
  email: validateEmail,
  phone: validatePhone,
  message: validateMessage,
  agreement: validateAgreement,
};

// ---------- Динамічна валідація ----------
// Помилки не показуються при завантаженні: поле перевіряється після першої взаємодії
const touched = {};

Object.keys(fields).forEach((key) => {
  const input = fields[key];
  const check = () => { touched[key] = true; validators[key](); };

  input.addEventListener('blur', check);
  input.addEventListener(input.type === 'checkbox' ? 'change' : 'input', () => {
    if (touched[key] || input.type === 'checkbox') { touched[key] = true; validators[key](); }
  });
});

// ---------- Модальне вікно ----------
let lastFocused = null;

function openModal() {
  lastFocused = document.activeElement;
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  modal.setAttribute('aria-hidden', 'false');
  modalClose.focus();
}

function closeModal() {
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  modal.setAttribute('aria-hidden', 'true');
  if (lastFocused) lastFocused.focus();
}

modalClose.addEventListener('click', closeModal);
// Клік по затемненому фону закриває вікно, клік по білій картці — ні
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', (e) => {
  if (modal.classList.contains('hidden')) return;
  if (e.key === 'Escape') closeModal();
  // Проста пастка фокуса: у вікні одна кнопка, Tab залишається на ній
  if (e.key === 'Tab') { e.preventDefault(); modalClose.focus(); }
});

// ---------- Надсилання ----------
let submitting = false;

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (submitting) return; // захист від повторних швидких кліків

  // Перевіряємо ВСІ поля (без раннього виходу), щоб показати всі помилки одразу
  const results = Object.keys(validators).map((key) => { touched[key] = true; return [key, validators[key]()]; });
  const firstInvalid = results.find(([, ok]) => !ok);
  if (firstInvalid) { fields[firstInvalid[0]].focus(); return; }

  submitting = true;
  form.reset();
  Object.keys(fields).forEach((key) => { touched[key] = false; clearError(key); });
  openModal();
  submitting = false;
});

})();
