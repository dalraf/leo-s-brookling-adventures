# 🦁 Leo's Brookling Adventures - Projeto Gemini

## 📝 Visão Geral
**Leo's Brookling Adventures** é um jogo de ação no estilo "Beat 'em up" 2D retro, ambientado no Brooklyn de 1989. O jogador assume o controle de Leo, encarregado de lutar contra gangues locais, desviar de perigos urbanos e recuperar o controle de seu bairro.

O projeto é construído com tecnologias modernas web (React 19 + Vite), mas mantém a estética nostálgica dos clássicos de fliperama através de uma renderização avançada em Canvas 2D.

---

## 🛠️ Stack Tecnológica
- **Framework Oculto:** React 19 + Vite (UI externa e menus)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS 4.0 + Lucide React (Ícones)
- **Engine Core:** Custom JavaScript Game Loop utilizando a API Canvas 2D.
- **Áudio:** Web Audio API com som procedural (SoundGenerator) e gerenciador de trilha/SFX.
- **IA:** Integração preparada para Google Gemini (`@google/genai`).

---

## 📂 Estrutura Modular do Código (`src/game/`)

A arquitetura do jogo segue rigorosamente a "Separation of Concerns" (Separação de Responsabilidades), permitindo expansão e fácil manutenção.

### Core Engine e Regras de Negócio
-   `GameEngine.ts`: O "cérebro" principal. Gerencia o estado (`GameState`), detecção de colisões, controle de temporizadores, IA de inimigos, comportamentos de entidades secundárias (táxis, cachorros), sistema de partículas e o ciclo principal do jogo (game loop).
-   `InputManager.ts`: Processa e mapeia as entradas do jogador nativamente via teclado e toques (joystick virtual e botões) para ações in-game.
-   `CombatSystem.ts`: Encapsula toda a lógica matemática do combate: cálculo de dano, contagem de combos, frames de invulnerabilidade e knockback direcional.

### Modularização Visual (Renderers)
A fim de otimizar cálculos de Profundidade (Z-Index) e Efeitos Isométricos, a renderização foi dividida sob a pasta `src/game/renderers/`:
-   `Renderer.ts`: Ponto de entrada que orquestra e delega responsabilidades para os renderizadores específicos. Gerencia truques de otimização, como *offscreen canvas*, para lidar com as sombras.
-   `renderers/EntityRenderer.ts`: Especializado em desenhar entidades dinâmicas (Jogador, Inimigos, Chefões, Cachorros, Táxis, Itens e Projéteis).
-   `renderers/WorldRenderer.ts` e `renderers/world/`: Lida com todo o ambiente estático e pseudo-estático (Background parallax, Prédios, Adereços de rua, Asfalto).
-   `renderers/UIRenderer.ts`: Transpõe o HUD do jogador, barra de vida, stamina, pop-ups de combo, menus de *Pause* e tela de *Game Over*.

### Sistemas Auxiliares
-   `AudioManager.ts` / `SoundGenerator.ts`: Gerencia e gera (proceduralmente) efeitos de impacto, passos ou ambiente urbano para maximizar a imersão retro, mantendo um baixo peso de banda.
-   `ParticleSystem.ts`: Controla vida e dispersão de micro-elementos visuais como fumaça, faíscas de armas, ou sangue.
-   `constants.ts` / `types.ts`: Define de maneira estrita a tipagem (por exemplo: `Entity`, `Vector3D`, `GameState`) e variáveis de calibragem globales (velocidade, cores).

---

## 🕹️ Mecânicas de Jogo

1.  **Movimentação & Stamina:** Controle pseudo-3D com movimento em 8 direções. O jogador conta com a habilidade de "Run" (Correr). Esta habilidade drena uma barra de **Stamina** progressivamente; ela a impede de correr quando vazia até carregar pelo menos 10% novamente.
2.  **Sistema de Combate Direcional:**
    - Ataques básicos, variações de dano e acúmulo de combos.
    - Suporte a arremesso de projéteis (pedras).
    - Uso de armas brancas encontradas no cenário (barra de ferro muda a potência e a cadência).
3.  **Inimigos e Ameaças Urbanas:**
    - **Membros de Gangue:** Perseguem ativamente o jogador, possuindo atributos visuais randomizados (cores de cabelo, roupas multitonais).
    - **Cachorros de Rua:** Ficam dormindo/repousando; acordam se alarmados, engajando em comportamento de perseguição (*chase*).
    - **Táxis de Nova York:** Veículos em alta velocidade que cruzam a rua servindo como barreiras dinâmicas e hazards neutros (causam dano a quem atropelarem).
4.  **Sistema de Itens e Coletáveis:** Garrafas de Cerveja para cura (Health) e armamentos limitados depositados no chão ou derrubados de inimigos.

---

## 🤖 Integração com Gemini (Preparada)
Com o SDK de IA já no repositório, os próximos objetivos de inovação comportamental são:
-   **Geração Procedural Narrativa:** Criar *taunts* ou diálogos de texto para chefões com base em como o jogador se comportou na sua run.
-   **Balanceamento de Dificuldade Métrica:** O Gemini pode analisar os metadados finais de pontuação (`score`, `maxCombo`, `kills`) e sugerir ajustes nas constantes de física do jogo no repositório.

---

## 🚀 Como Executar

```bash
# 1. Instalar dependências pelo npm
npm install

# 2. Configurar ambiente para recursos de IA (Opcional)
# Criar .env.local e adicionar a chave:
# VITE_GEMINI_API_KEY=sua_chave_aqui

# 3. Rodar aplicação localmente no Vite
npm run dev
```

---

## 🛡️ Regras e Guia de Contribuição
-   **A Regra da Fonte da Verdade (State):** Toda e qualquer lógica que afete o gameplay deve acontecer através da alteração do objeto estrito em `engine.state`. O Renderer deve ser puramente "Visual-only", apenas reagindo ao `GameState`.
-   **Manejo de Sombras e Z-Index:** O Canvas principal utiliza o campo `z` ou `yBase` para ordenar a pintura dos modelos no estilo isométrico, de trás para frente. Sombras devem ser geradas sob uma sub-camada otimizada para realismo.
-   **Mobile First e UI:** Os menus nativos feitos em React precisam interagir em sintonia com a DOM Virtual enquanto o *Canvas* atua por trás. Todo comportamento precisa suportar tanto eventos de teclado (PC) quanto toques em *Touchscreen* (Controles virtuais).

---
*Gerado para direcionamento de Desenvolvimento Web Agentic com IAs Baseadas em Agentes.*
