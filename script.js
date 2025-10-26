function comprar(cidade) {
  cidade = cidade.trim().toLowerCase();
  console.log('Cidade recebida:', cidade);

  let urls = {
    'rio-de-janeiro': 'https://www.ticketmaster.com.br/event/luluca-responde-ao-vivo-no-qualistage-rj?_gl=1*1mguzjm*_gcl_au*NDU3Mjc4NjgyLjE3NDM0NDI1ODg',
    'brasilia': 'https://www.bilheteriadigital.com/luluca-responde-ao-vivo-05-de-julho',
    'goiania': 'https://www.bilheteriadigital.com/luluca-responde-ao-vivo-06-de-julho',
    'fortaleza': 'https://uhuu.com/evento/ce/fortaleza/luluca-responde-ao-vivo-14575',
    'recife': 'https://uhuu.com/evento/pe/recife/luluca-responde-ao-vivo-14599',
    'curitiba': 'https://www.diskingressos.com.br/event/88',
    'porto-alegre': 'https://www.bilheteriadigital.com/luluca-2025-porto-alegre-07-de-setembro',
    'minas-gerais': 'https://lulucaresponde.byinti.com/#/event/belo-horizonte-28-09-sesi-minas-bh',
    'sao-paulo': 'https://lulucaresponde.byinti.com/#/event/sao-paulo-30-11-2025-sala-sp',
    'natal': 'https://uhuu.com/evento/rn/natal/luluca-responde-ao-vivo-15416'
  };

  if (urls[cidade]) {
    window.open(urls[cidade], '_blank');
  } else {
    const modal = new bootstrap.Modal(document.getElementById('emBreveModal'));
    modal.show();
  }
}


document.addEventListener('DOMContentLoaded', function () {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0); // 🔹 Zera horas/minutos/segundos para comparar só a data
  
  const meses = {
    'JAN': 0, 'FEV': 1, 'MAR': 2, 'ABR': 3,
    'MAI': 4, 'JUN': 5, 'JUL': 6, 'AGO': 7,
    'SET': 8, 'OUT': 9, 'NOV': 10, 'DEZ': 11
  };

  document.querySelectorAll('.card').forEach(card => {
    const dataSpan = card.querySelector('.card-date span');
    const anoSmall = card.querySelector('.card-date small');
    const cidade = card.querySelector('button')?.getAttribute('data-city');

    if (dataSpan && anoSmall) {
      const [diaStr, mesStr] = dataSpan.textContent.trim().split(' ');
      const dia = parseInt(diaStr);
      const mes = meses[mesStr.toUpperCase()];
      const ano = parseInt(anoSmall.textContent.trim());

      const dataEvento = new Date(ano, mes, dia);

      // >>> ALTERAÇÃO AQUI <<<
      const diaSeguinte = new Date(dataEvento);
      diaSeguinte.setDate(diaSeguinte.getDate() + 1);
      diaSeguinte.setHours(0, 0, 0, 0);

      // Verifica se o evento já passou ou se é São Paulo (esgotado manualmente)
      if (diaSeguinte <= hoje || cidade === 'sao-paulo') {
        const botao = card.querySelector('button');
        if (botao) {
          botao.disabled = true; // Desativa o botão
          botao.classList.remove('btn-primary');
          botao.classList.add('btn-secondary');
          botao.textContent = 'ESGOTADO'; // Altera o texto para "ESGOTADO"
          botao.removeAttribute('onclick'); // Remove a funcionalidade de clique
        }
      }
    }
  });
});


// Efeito de transparência no header ao rolar
window.addEventListener('scroll', () => {
  const header = document.querySelector('header');
  if (window.scrollY > 10) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});


// Função para registrar o clique (já existe)
function registrarClique(cidadeId) {
  firebase.database().ref("clicks/" + cidadeId).transaction(v => (v || 0) + 1);
}

// Função para atualizar o número de cliques nos cartões
function atualizarCard(cidadeId) {
  const card = document.querySelector(`[data-city="${cidadeId}"]`);
  if (card) {
    const ref = firebase.database().ref("clicks/" + cidadeId);
    ref.on('value', function(snapshot) {
      const cliques = snapshot.val() || 0;
      // Atualiza o número de cliques no card
      card.querySelector('.card-local').innerHTML = `Clques: ${cliques}`; // Exibe os cliques no local do evento
    });
  }
}

// Inicializa a escuta para todos os cards de cidade
document.addEventListener('DOMContentLoaded', function () {
  const cidades = ['rio-de-janeiro', 'brasilia', 'goiania', 'fortaleza', 'recife', 'curitiba', 'porto-alegre', 'minas-gerais', 'sao-paulo'];
  cidades.forEach(cidade => {
    // Atualiza o número de cliques nos cards ao carregar a página
    atualizarCard(cidade);

    // Adiciona o evento de clique para registrar o clique no banco de dados
    const button = document.querySelector(`[data-city="${cidade}"]`);
    if (button) {
      button.addEventListener('click', () => registrarClique(cidade));
    }
  });
});

document.addEventListener('DOMContentLoaded', function () {
  const firebaseConfig = {
    apiKey: "AIzaSyB_ZzyDGdWD4kC2SDDWwKv0Rc18fiTxM3o",
    authDomain: "lulucaresponde2025.firebaseapp.com",
    databaseURL: "https://lulucaresponde2025-default-rtdb.firebaseio.com",
    projectId: "lulucaresponde2025",
    storageBucket: "lulucaresponde2025.appspot.com",
    messagingSenderId: "755978325024",
    appId: "1:755978325024:web:556f7c087b53cb51ecc045",
    measurementId: "G-ZLTFGXQQK5"
  };

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  const db = firebase.database();

  const botoes = document.querySelectorAll('[data-city]');
  botoes.forEach(botao => {
    botao.addEventListener('click', function () {
      const cidadeId = botao.getAttribute('data-city');
      const ref = db.ref('clicks/' + cidadeId);
      ref.transaction(current => (current || 0) + 1);
    });
  });
});
