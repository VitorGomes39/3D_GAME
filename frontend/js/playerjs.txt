// player.js - Lógica de movimento e visão em primeira pessoa

import * as THREE from 'three';

// Variáveis para controle de entrada
const keys = {}; // Guarda quais teclas estão pressionadas (ex: keys['w'] = true)
let isMouseLocked = false;
let raycaster = new THREE.Raycaster(); // Usaremos depois para interações
const interactDistance = 3; // Distância máxima para interagir com objetos

// Variáveis de movimento do jogador
const moveSpeed = 5; // Unidades por segundo
let playerVelocity = new THREE.Vector3(); // Velocidade atual no espaço 3D

/**
 * Função principal para inicializar os controles do jogador.
 * Ela é chamada uma única vez pelo main.js.
 * * @param {THREE.PerspectiveCamera} camera - A câmera criada no main.js.
 * @param {THREE.Scene} scene - A cena do jogo (precisaremos dela para interações).
 */
export function initPlayerControls(camera, scene) {
    const gameContainer = document.getElementById('game-container');

    // ==================================================
    // 1. POINTER LOCK API (Prender o mouse na tela)
    // ==================================================
    
    // Quando clicar na tela, tenta travar o mouse
    gameContainer.addEventListener('click', () => {
        if (!isMouseLocked) {
            gameContainer.requestPointerLock();
        }
    });

    // Detecta se o mouse foi travado ou destravado (pressionando ESC)
    document.addEventListener('pointerlockchange', () => {
        if (document.pointerLockElement === gameContainer) {
            isMouseLocked = true;
            console.log("Mouse travado no jogo.");
            // Mostra o HUD e esconde a mira se necessário (ajuste no CSS depois se quiser)
        } else {
            isMouseLocked = false;
            console.log("Mouse destravado. Jogo pausado.");
            // Pode abrir um menu de pausa aqui
        }
    }, false);

    // ==================================================
    // 2. CONTROLES DE OLHAR (Mouse)
    // ==================================================
    
    // Euler angles controlam a rotação da câmera nos eixos X (Cima/Baixo) e Y (Esquerda/Direita)
    const euler = new THREE.Euler(0, 0, 0, 'YXZ'); // 'YXZ' define a ordem da rotação (Y primeiro para o corpo, X depois para a cabeça)

    document.addEventListener('mousemove', (event) => {
        if (!isMouseLocked) return; // Só move a câmera se o mouse estiver travado no jogo

        const movementX = event.movementX || 0; // Quantidade que o mouse moveu pro lado
        const movementY = event.movementY || 0; // Quantidade que o mouse moveu pra cima/baixo

        const mouseSensitivity = 0.002; // Ajuste isso para a sensibilidade do mouse

        // Aplica a rotação do mouse nos Euler angles
        euler.y -= movementX * mouseSensitivity; // Gira o corpo (Y)
        euler.x -= movementY * mouseSensitivity; // Gira a cabeça (X)

        // LIMITADOR DE CABEÇA (Clamping): Impede o jogador de fazer um loop 360 com a cabeça
        // Limita a rotação X entre -90 e 90 graus (aproximadamente)
        const PI_2 = Math.PI / 2;
        euler.x = Math.max(-PI_2, Math.min(PI_2, euler.x));

        // Aplica os Euler angles atualizados diretamente na câmera
        camera.quaternion.setFromEuler(euler);
    });

    // ==================================================
    // 3. CONTROLES DE ANDAR (Teclado)
    // ==================================================
    
    // Quando uma tecla for pressionada, guardamos como 'true'
    document.addEventListener('keydown', (event) => {
        keys[event.key.toLowerCase()] = true;

        // Se pressionar 'E' ou clicar no botão do mouse, tentamos interagir
        if (event.key.toLowerCase() === 'e' && isMouseLocked) {
            // A lógica de interação ficará para a próxima, mas o gancho está aqui
            console.log("Tentando interagir...");
        }
    });

    // Quando a tecla for solta, guardamos como 'false'
    document.addEventListener('keyup', (event) => {
        keys[event.key.toLowerCase()] = false;
    });
}

/**
 * Função de atualização do jogador (chamada em cada frame pelo gameloop no main.js).
 * Ela calcula e aplica o movimento final à câmera.
 * * @param {number} deltaTime - O tempo que passou desde o último frame (em segundos).
 * @param {THREE.PerspectiveCamera} camera - A câmera que representa o jogador.
 */
export function updatePlayerMovement(deltaTime, camera) {
    if (!isMouseLocked) return; // Só calcula movimento se o mouse estiver travado (jogo rodando)

    // Resetamos a velocidade a cada frame para recalcular
    playerVelocity.set(0, 0, 0);

    // VETORES DE DIREÇÃO (Onde é "frente" e "lado" baseados na rotação da câmera)
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();

    // Pega a direção que a câmera está olhando no eixo Z negativo
    camera.getWorldDirection(forward);
    forward.y = 0; // Travamos o movimento no chão, impedindo o jogador de voar pro céu ou pro subsolo
    forward.normalize(); // Garante que a força do vetor seja sempre 1

    // O vetor "lado direito" (Right) é o produto vetorial entre o vetor "frente" e o vetor "pra cima" (UP)
    right.crossVectors(forward, camera.up);

    // APLICAÇÃO DO INPUT NA VELOCIDADE
    if (keys['w'] || keys['arrowup']) playerVelocity.add(forward);
    if (keys['s'] || keys['arrowdown']) playerVelocity.add(forward.clone().multiplyScalar(-1)); // Frente invertido
    if (keys['d'] || keys['arrowright']) playerVelocity.add(right);
    if (keys['a'] || keys['arrowleft']) playerVelocity.add(right.clone().multiplyScalar(-1)); // Direita invertido

    // Evita que o jogador ande mais rápido se pressionar duas teclas ao mesmo tempo (w e a)
    playerVelocity.normalize(); 
    playerVelocity.multiplyScalar(moveSpeed); // Aplica a velocidade definida

    // MOVIMENTO FINAL: Aplica a velocidade calculada à posição da câmera
    camera.position.add(playerVelocity.clone().multiplyScalar(deltaTime));
}
