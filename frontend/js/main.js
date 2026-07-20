// main.js - O coração do jogo 3D

// Importa o Three.js usando o mapa de importação que configuramos no index.html
import * as THREE from 'three';

// Variáveis globais essenciais
let scene, camera, renderer;

function init() {
    // ==========================================
    // 1. A CENA (O Universo do Jogo)
    // ==========================================
    scene = new THREE.Scene();
    // Colocamos uma cor de fundo bem escura, quase preta, para a vibe de terror
    scene.background = new THREE.Color(0x050505); 
    // Adiciona uma "neblina" preta ao fundo para esconder os limites do mapa e dar aquele ar de PS1
    scene.fog = new THREE.Fog(0x050505, 2, 15);

    // ==========================================
    // 2. A CÂMERA (Os olhos do jogador)
    // ==========================================
    // Parâmetros: Campo de visão (FOV), Proporção da tela, Distância mínima de visão, Distância máxima
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    // Colocamos a câmera na altura dos olhos de uma pessoa (1.6 unidades no eixo Y)
    camera.position.set(0, 1.6, 5);

    // ==========================================
    // 3. O RENDERIZADOR (O Pintor da Tela)
    // ==========================================
    renderer = new THREE.WebGLRenderer({ antialias: false }); // antialias: false ajuda no visual retrô/pixelado
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio); // Garante que fique nítido em telas modernas
    
    // Injeta o canvas (a tela de pintura do Three.js) dentro da nossa div do HTML
    document.getElementById('game-container').appendChild(renderer.domElement);

    // ==========================================
    // 4. ILUMINAÇÃO BÁSICA
    // ==========================================
    // Luz ambiente muito fraca, apenas para nada ficar 100% invisível
    const luzAmbiente = new THREE.AmbientLight(0xffffff, 0.1);
    scene.add(luzAmbiente);

    // Uma luz pontual simulando uma lanterna na mão do jogador (vai seguir a câmera depois)
    const luzLanterna = new THREE.PointLight(0xffffff, 1, 10);
    luzLanterna.position.set(0, 1.6, 5);
    scene.add(luzLanterna);

    // ... (código anterior do main.js)
    const luzLanterna = new THREE.PointLight(0xffffff, 1, 10);
    luzLanterna.position.set(0, 1.6, 5);
    scene.add(luzLanterna);

    // ==========================================
    // CHÃO TEMPORÁRIO (Para testar o movimento)
    // ==========================================
    // Cria uma grade gigante no chão (estilo Matrix/Tron)
     const grade = new THREE.GridHelper(50, 50, 0x880000, 0x444444); 
     grade.position.y = 0; // Fica exatamente nos pés do jogador
     scene.add(grade);

    // Inicializa os controles do jogador
     initPlayerControls(camera, scene);
    // ... (resto do código)
    
    // ==========================================
    // 5. EVENTOS DA JANELA
    // ==========================================
    // Se o jogador redimensionar a janela do navegador, o jogo se ajusta automaticamente
    window.addEventListener('resize', onWindowResize);

    // Tudo carregado! Esconde a tela de carregamento do HTML
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => loadingScreen.remove(), 500); // Remove o elemento após a transição de meio segundo
    }

    // Inicia o loop infinito do jogo
    animate();
}

// Função para ajustar a tela se o navegador mudar de tamanho
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// ==========================================
// LOOP PRINCIPAL (O Motor do Jogo)
// ==========================================
function animate() {
    // Pede ao navegador para chamar essa função no próximo frame (geralmente 60 vezes por segundo)
    requestAnimationFrame(animate);

    // Aqui entrará a lógica de movimentação, animação das molas e das entidades...

    // Pinta a cena na tela vista pela câmera
    renderer.render(scene, camera);
}

// Dá a partida no jogo assim que o arquivo é carregado
init();
