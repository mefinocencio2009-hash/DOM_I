// ============ 1. SELEÇÃO DE ELEMENTOS ============
const botaoTema     = document.querySelector('#btn-tema');
const formTarefa    = document.querySelector('#form-tarefa');
const inputTarefa   = document.querySelector('#input-tarefa');
const selectPrior   = document.querySelector('#select-prioridade');
const inputBusca    = document.querySelector('#input-busca');
const listaTarefas  = document.querySelector('#lista-tarefas');
const msgErro       = document.querySelector('#msg-erro');
const statTotal     = document.querySelector('#stat-total');
const statConcluidas= document.querySelector('#stat-concluidas');
const statPendentes = document.querySelector('#stat-pendentes');

// ============ 2. ESTADO DA APLICAÇÃO ============
let tarefas = JSON.parse(localStorage.getItem('tarefas')) || [];
let filtroBusca = '';

// ============ 3. FUNÇÕES AUXILIARES ============

function salvarNoStorage() {
  localStorage.setItem('tarefas', JSON.stringify(tarefas));
}

function atualizarStats() {
  const total = tarefas.length;
  const concluidas = tarefas.filter(t => t.concluida).length;
  statTotal.textContent = total;
  statConcluidas.textContent = concluidas;
  statPendentes.textContent = total - concluidas;
}

// ============ 4. RENDERIZAÇÃO (a parte principal) ============

function renderizar() {
  // Filtra pelo texto da busca
  const tarefasFiltradas = tarefas.filter(t =>
    t.texto.toLowerCase().includes(filtroBusca.toLowerCase())
  );

  // Limpa a lista
  listaTarefas.innerHTML = '';

  // Estado vazio
  if (tarefasFiltradas.length === 0) {
    listaTarefas.innerHTML = '<li class="vazio">Nenhuma tarefa encontrada 🌱</li>';
    atualizarStats();
    return;
  }

  // Cria cada item
  tarefasFiltradas.forEach(tarefa => {
    const li = document.createElement('li');
    li.className = `item ${tarefa.prioridade} ${tarefa.concluida ? 'concluida' : ''}`;
    li.dataset.id = tarefa.id;

    li.innerHTML = `
      <input type="checkbox" ${tarefa.concluida ? 'checked' : ''}>
      <span class="texto-tarefa"></span>
      <button class="btn-remover" title="Remover">✕</button>
    `;

    // Usando textContent por SEGURANÇA (evita XSS!)
    li.querySelector('.texto-tarefa').textContent = tarefa.texto;

    // Evento: marcar como concluída
    li.querySelector('input[type="checkbox"]').addEventListener('change', () => {
      tarefa.concluida = !tarefa.concluida;
      salvarNoStorage();
      renderizar();
    });

    // Evento: remover tarefa
    li.querySelector('.btn-remover').addEventListener('click', () => {
      tarefas = tarefas.filter(t => t.id !== tarefa.id);
      salvarNoStorage();
      renderizar();
    });

    listaTarefas.appendChild(li);
  });

  atualizarStats();
}

// ============ 5. EVENTO: ADICIONAR TAREFA (submit) ============

formTarefa.addEventListener('submit', (evento) => {
  evento.preventDefault(); // Impede recarregar a página

  const texto = inputTarefa.value.trim();

  if (texto.length < 3) {
    msgErro.textContent = '⚠️ A tarefa precisa ter pelo menos 3 caracteres.';
    return;
  }

  msgErro.textContent = '';

  tarefas.push({
    id: Date.now(),
    texto,
    prioridade: selectPrior.value,
    concluida: false
  });

  salvarNoStorage();
  inputTarefa.value = '';
  inputTarefa.focus();
  renderizar();
});

// ============ 6. EVENTO: BUSCA EM TEMPO REAL (input) ============

inputBusca.addEventListener('input', (evento) => {
  filtroBusca = evento.target.value;
  renderizar();
});

// ============ 7. EVENTO: ALTERNAR TEMA (click + localStorage) ============

function aplicarTema(escuro) {
  document.body.classList.toggle('escuro', escuro);
  botaoTema.textContent = escuro ? '☀️' : '🌙';
  localStorage.setItem('tema', escuro ? 'escuro' : 'claro');
}

botaoTema.addEventListener('click', () => {
  const estaEscuro = document.body.classList.contains('escuro');
  aplicarTema(!estaEscuro);
});

// ============ 8. INICIALIZAÇÃO ============

// Carrega o tema salvo ao abrir a página
const temaSalvo = localStorage.getItem('tema');
aplicarTema(temaSalvo === 'escuro');

// Primeira renderização
renderizar();