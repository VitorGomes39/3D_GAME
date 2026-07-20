// ==========================================
// 1. IMPORTAÇÕES DE MÓDULOS
// ==========================================
import * as THREE from 'three';
import { initPlayerControls, updatePlayerMovement } from './player.js';

// Variáveis globais do motor do jogo
let scene, camera, renderer, clock;

function init() {
    // ==========================================
    // 2. CONFIGURAÇÃO DA CENA E DO RELÓGIO
    // ==========================================
    scene = new THREE.Scene();
    clock = new THREE.Clock();

    // ==========================================
    // 3. CONFIGURAÇÃO DA CÂMERA (Primeira Pessoa)
    // ==========================================
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.6, 0); // Altura de 1.6m simulando os olhos do jogador

    // ==========================================
    // 4. CONFIGURAÇÃO DO RENDERIZADOR (Motor Gráfico)
    // ==========================================
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Adiciona o canvas do jogo na div correta do HTML
    const container = document.getElementById('game-container');
    if (container) {
        container.appendChild(renderer.domElement);
    }

    // ==========================================
    // 5. ILUMINAÇÃO BÁSICA
    // ==========================================
    // Luz ambiente muito fraca para dar um clima sombrio
    const luzAmbiente = new THREE.AmbientLight(0xffffff, 0.1);
    scene.add(luzAmbiente);

    // Lanterna na mão do jogador
    const luzLanterna = new THREE.PointLight(0xffffff, 1, 10);
    luzLanterna.position.set(0, 1.6, 0);
    scene.add(luzLanterna);

    // ==========================================
    // 6. CENÁRIO TEMPORÁRIO (Grade no Chão)
    // ==========================================
    const grade = new THREE.GridHelper(50, 50, 0x880000, 0x444444);
    grade.position.y = 0; // Alinhada nos pés do jogador
    scene.add(grade);

    // ==========================================
    // 7. INICIALIZAÇÃO DOS CONTROLES
    // ==========================================
    initPlayerControls(camera, scene);

    // ==========================================
    // 8. ESCONDER A TELA DE CARREGAMENTO
    // ==========================================
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = 'none';
    }

    // Ouvinte para ajustar a tela se redimensionar a janela
    window.addEventListener('resize', onWindowResize, false);
}

// Função para manter a proporção do jogo correta em qualquer tela
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// ==========================================
// 9. GAME LOOP (Atualiza a cada frame)
// ==========================================
function animate() {
    requestAnimationFrame(animate);

    // deltaTime calcula o tempo gasto entre um frame e outro (evita lags de velocidade)
    const deltaTime = clock.getDelta();

    // Move e rotaciona o jogador baseado no teclado/mouse
    updatePlayerMovement(deltaTime, camera);

    // Renderiza a cena atualizada na tela
    renderer.render(scene, camera);
}

// Dispara o início do jogo
init();
animate();
