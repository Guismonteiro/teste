const cidades = {
  "rio-de-janeiro": "Rio de Janeiro",
  "brasilia": "Brasília",
  "goiania": "Goiânia",
  "fortaleza": "Fortaleza",
  "recife": "Recife",
  "curitiba": "Curitiba",
  "porto-alegre": "Porto Alegre",
  "minas-gerais": "Minas Gerais",
  "sao-paulo": "São Paulo"
};

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

  const cidades = {
    "rio-de-janeiro": "Rio de Janeiro",
    "brasilia": "Brasília",
    "goiania": "Goiânia",
    "fortaleza": "Fortaleza",
    "recife": "Recife",
    "curitiba": "Curitiba",
    "porto-alegre": "Porto Alegre",
    "minas-gerais": "Minas Gerais",
    "sao-paulo": "São Paulo"
  };
  

  // Função para criar o card
  function criarCard(id, nome) {
    const container = document.getElementById("card-" + id);
    if (container) {
      container.innerHTML = `
        <div class="card text-center p-4 h-100">
          <div class="card-body">
            <h5 class="card-title">${nome}</h5>
            <div class="card-count fs-3 fw-bold text-primary">
              <span id="span-${id}">0</span>
            </div>
            <p class="text-muted small">Cliques registrados</p>
          </div>
        </div>
      `;
    }
  }  

    // Primeiro, cria todos os cards
    for (const [id, nome] of Object.entries(cidades)) {
      criarCard(id, nome);
    }

      // Depois que os cards existem no DOM, conecta o Firebase em tempo real
  for (const [id, nome] of Object.entries(cidades)) {
    criarCard(id, nome);
  }

  for (const [id, nome] of Object.entries(cidades)) {
    const span = document.getElementById("span-" + id);
    if (span) {
      const ref = db.ref("clicks/" + nome); // <<< Agora usa o nome certo com acento
      ref.on("value", (snapshot) => {
        const count = snapshot.val() || 0;
        span.textContent = count;
      });
    }
  }  
});

document.getElementById('btn-voltar').addEventListener('click', function () {
  const graficoContainer = document.getElementById('grafico-container');
  const cardsContainer = document.getElementById('cards-container');
  const btnVoltar = document.getElementById('btn-voltar');

  graficoContainer.classList.add('fade-out');
  cardsContainer.classList.remove('fade-out');
  cardsContainer.classList.add('fade-in');

  setTimeout(() => {
    graficoContainer.style.display = 'none';
    cardsContainer.style.display = 'flex';
    btnVoltar.style.display = 'none';
  }, 400);
});

document.getElementById('btn-grafico').addEventListener('click', function () {
  const graficoContainer = document.getElementById('grafico-container');
  const cardsContainer = document.getElementById('cards-container');
  const btnVoltar = document.getElementById('btn-voltar');

  cardsContainer.classList.add('fade-out');
  graficoContainer.classList.remove('fade-out');
  graficoContainer.classList.add('fade-in');
  btnVoltar.style.display = 'inline-block';

  setTimeout(() => {
    cardsContainer.style.display = 'none';
    graficoContainer.style.display = 'block';
  }, 400);

  if (window.graficoCidades) return;

  const ctx = document.getElementById('grafico-cidades').getContext('2d');

  const labels = Object.values(cidades); 
  const keys = Object.keys(cidades);
  
  const promises = keys.map(cidadeId => {
    const cidadeNome = cidades[cidadeId]; 
    return firebase.database().ref("clicks/" + cidadeNome).once("value").then(snap => snap.val() || 0);
  });
  

  Promise.all(promises).then(values => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, '#f06292');
    gradient.addColorStop(1, '#ec407a');

    const data = {
      labels: labels,
      datasets: [{
        label: 'Cliques por Cidade',
        data: values,
        backgroundColor: gradient,
        borderRadius: 10,
        hoverBackgroundColor: '#d81b60',
        borderWidth: 1
      }]
    };

    const config = {
      type: 'bar',
      data: data,
      plugins: [ChartDataLabels],
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          datalabels: {
            color: '#fff',
            anchor: 'center',
            align: 'center',
            font: {
              weight: 'bold',
              size: 14
            },
            formatter: value => value
          },
          legend: { display: false },
          tooltip: { enabled: true }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { precision: 0 }
          }
        }
      }
    };

    window.graficoCidades = new Chart(ctx, config);
  });
});

document.getElementById('btn-pdf').addEventListener('click', function () {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const data = [['Cidade', 'Cliques']];

  document.querySelectorAll('[id^=span-]').forEach(span => {
    const cidadeId = span.id.replace('span-', '');
    const cidadeNome = cidadeId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    data.push([cidadeNome, span.textContent]);
  });

  doc.autoTable({
    head: [data[0]],
    body: data.slice(1),
  });

  doc.save('cliques_por_cidade.pdf');
});

document.getElementById('btn-excel').addEventListener('click', function () {
  const data = [['Cidade', 'Cliques']];

  document.querySelectorAll('[id^=span-]').forEach(span => {
    const cidadeId = span.id.replace('span-', '');
    const cidadeNome = cidades[cidadeId] || cidadeId;
    data.push([cidadeNome, parseInt(span.textContent)]);
  });

  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Cliques');
  XLSX.writeFile(wb, 'cliques_por_cidade.xlsx');
});

