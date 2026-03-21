# 🦁 Leo's Brookling Adventures - Projeto Gemini

## 📝 Visão Geral
**Leo's Brookling Adventures** é um jogo de luta de rua (Beat 'em up) 2D retro, ambientado no Brooklyn de 1989. O jogador assume o papel de Leo, que deve lutar contra gangues locais para recuperar o controle de seu bairro.

O projeto é construído com tecnologias modernas de web (React 19 + Vite), mas mantém uma estética de jogo de fliperama clássico com renderização em Canvas 2D.

---

## 🛠️ Stack Tecnológica
- **Framework:** React 19 + Vite
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS 4.0 + Lucide React (Ícones)
- **Animações UI:** Framer Motion (Motion)
- **Engine:** Custom JavaScript Game Loop (Canvas 2D API)
- **Áudio:** Web Audio API (Gerenciamento customizado)
- **IA:** Integração preparada para Google Gemini (`@google/genai`)

---

## 📂 Estrutura do Projeto
A lógica do jogo está centralizada na pasta `src/game`, seguindo um padrão de "Separation of Concerns":

-   `src/game/GameEngine.ts`: O "cérebro" do jogo. Gerencia o estado, detecção de colisões, respawn de inimigos e temporizadores.
-   `src/game/Renderer.ts`: Responsável por desenhar o estado do jogo no Canvas. Gerencia camadas de profundidade (Z-indexing) para o efeito isométrico.
-   `src/game/CombatSystem.ts`: Encapsula a lógica de ataques, combos, dano e knockback.
-   `src/game/AudioManager.ts`: Gerencia trilha sonora e efeitos sonoros (SFX) com suporte a mute e pausa.
-   `src/game/InputManager.ts`: Mapeia entradas de teclado e toques (joystick virtual) para ações do jogo.
-   `src/game/ParticleSystem.ts`: Sistema leve para efeitos Visuais (sangue, fumaça, faíscas).
-   `src/game/SoundGenerator.ts`: Gera sons procedurais ou via Buffer para uma experiência retro.

---

## 🕹️ Mecânicas de Jogo
1.  **Movimentação:** 8 direções (estilo Pseudo-3D/Isométrico) com Dash (Shift).
2.  **Combate:** Sistema de combos, ataques aéreos e arremesso de projéteis (pedras).
3.  **Inimigos:** I.A. que persegue o jogador, ataca em grupos e escala em dificuldade por níveis. Chefões aparecem a cada 5 níveis.
4.  **Itens:** Coletáveis como Cerveja (Cura), Barra de Ferro (Arma) e Pedras (Munição).

---

## 🤖 Integração com Gemini (Próximos Passos)
O projeto já possui o SDK `@google/genai` instalado. Sugestões de uso para IA no jogo:
-   **Diálogos Dinâmicos:** Gerar falas para os inimigos/chefões durante a luta baseadas na performance do jogador.
-   **Níveis Gerados:** Usar a IA para descrever ou gerar configurações de ondas de inimigos.
-   **Balanceamento:** Analisar o `score` e `maxCombo` para ajustar a dificuldade via Gemini.

---

## 🚀 Como Rodar
```bash
# 1. Instalar dependências
npm install

# 2. Configurar chave da API (opcional para o jogo base)
# Criar .env.local e adicionar:
# GEMINI_API_KEY=sua_chave_aqui

# 3. Iniciar servidor de desenvolvimento
npm run dev
```

---

## 🛡️ Guia de Desenvolvimento
Ao modificar a lógica do jogo:
-   **Estado:** Sempre prefira atualizar o `engine.state` e deixar o `Renderer` refletir as mudanças no próximo frame.
-   **Performance:** Mantenha as partículas e textos flutuantes limitados para não impactar o FPS no mobile.
-   **Mobile First:** O jogo foi projetado com um joystick virtual robusto; teste sempre a responsividade dos controles de toque.

---
*Gerado para auxílio em desenvolvimento com IAs generativas.*
