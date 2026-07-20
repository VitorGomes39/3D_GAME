// player.js - Lógica de movimento e visão em primeira pessoa
import * as THREE from 'three';

// Variáveis para controle de entrada
const keys = {}; // Guarda quais teclas estão pressionadas
let isMouseLocked = false;

// Variáveis de movimento do jogador
const moveSpeed = 5; // Unidades por segundo
let playerVelocity = new THREE.Vector3(); // Velocidade atual no espaço 3D

/**
 * Função principal para inicializar os controles do jogador.
 * EXPORTADA para o main.js poder usar.
 */
export function initPlayerControls(camera, scene) {
    const gameContainer = document.getElementById('game-container');

    // ==================================================
    // 1. POINTER LOCK API (Prender o mouse na tela)
    // ==================================================
    gameContainer.addEventListener('click', () => {
        if (!isMouseLocked) {
            gameContainer.requestPointerLock();
        }
    });

    document.addEventListener('pointerlockchange', () => {
        if (document.pointerLockElement === gameContainer) {
            isMouseLocked = true;
            console.log("Mouse travado no jogo.");
        } else {
            isMouseLocked = false;
            console.log("Mouse destravado. Jogo pausado.");
        }
    });

    // ==================================================
    // 2. CONTROLES DE OLHAR (Mouse)
    // ==================================================
    const euler = new THREE.Euler(0, 0, 0, 'YXZ'); 

    document.addEventListener('mousemove', (event) => {
        if (!isMouseLocked) return; 

        const movementX = event.movementX || 0; 
        const movementY = event.movementY || 0; 
        const mouseSensitivity = 0.002; 

        euler.y -= movementX * mouseSensitivity; // Gira para os lados
        euler.x -= movementY * mouseSensitivity; // Gira para cima/baixo

        // LIMITADOR: Impede o jogador de dar uma cambalhota de 360 graus com a cabeça
        const PI_2 = Math.PI / 2;
        euler.x = Math.max(-PI_2, Math.min(PI_2, euler.x));

        camera.quaternion.setFromEuler(euler);
    });

    // ==================================================
    // 3. CONTROLES DE ANDAR (Teclado)
    // ==================================================
    document.addEventListener('keydown', (event) => {
        keys[event.key.toLowerCase()] = true;
    });

    document.addEventListener('keyup', (event) => {
        keys[event.key.toLowerCase()] = false;
    });
}

/**
 * Função de atualização do movimento (chamada no gameloop do main.js).
 * EXPORTADA para o main.js poder usar a cada frame.
 */
export function updatePlayerMovement(deltaTime, camera) {
    if (!isMouseLocked) return; 

    // Resetamos a velocidade a cada frame para recalcular
    playerVelocity.set(0, 0, 0);

    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();

    // Pega a direção que a câmera está olhando
    camera.getWorldDirection(forward);
    forward.y = 0; // Trava o jogador no chão (impede de voar)
    forward.normalize(); 

    // Calcula o vetor para andar de lado (cross product)
    right.crossVectors(forward, camera.up);

    // Aplica o teclado na velocidade
    if (keys['w'] || keys['arrowup']) playerVelocity.add(forward);
    if (keys['s'] || keys['arrowdown']) playerVelocity.add(forward.clone().multiplyScalar(-1)); 
    if (keys['d'] || keys['arrowright']) playerVelocity.add(right);
    if (keys['a'] || keys['arrowleft']) playerVelocity.add(right.clone().multiplyScalar(-1)); 

    // Normaliza para não andar mais rápido na diagonal
    playerVelocity.normalize(); 
    playerVelocity.multiplyScalar(moveSpeed); 

    // Aplica a posição final na câmera
    camera.position.add(playerVelocity.clone().multiplyScalar(deltaTime));
}
