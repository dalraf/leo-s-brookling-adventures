# 📋 TODO & Sugestões de Melhoria - Leo's Brookling Adventures

Este documento contém ideias, propostas de expansão e melhorias de código/arquitetura para as próximas iterações do jogo. Está dividido por categorias.

---

## 🥊 Mecânicas de Jogo e Combate

- [ ] **Sistema de Agarrão (Grapple/Throw):** Permitir que Leo segure os inimigos ao chegar muito perto, possibilitando uma sequência de golpes de perto ou arremessá-los contra outros inimigos.
- [ ] **Esquiva (Dodge) ou Bloqueio/Parry:** Implementar uma ação defensiva para lidar com ataques inimigos. Um *parry* no tempo perfeito poderia cancelar o ataque do inimigo e deixá-lo atordoado.
- [ ] **Ataques Especiais (Super Move):** Uma barra especial que enche ao bater/apanhar. Quando cheia, o jogador pode gastá-la para um ataque em área (Aoe) que gasta vida ou apenas a barra, para limpar multidões e dar invulnerabilidade temporária.
- [ ] **Armas de Fogo e Inimigos à Distância:** Introduzir inimigos que atiram facas ou usam revólveres de longe, forçando o jogador a usar movimentação vertical (Z-index).
- [ ] **Interação Avançada com Cenário:** Quebrar latas de lixo, caixas eletrônicos, hidrantes ou usar o ambiente (jogar inimigos na rua para serem atropelados pelos táxis intencionalmente).

---

## 🎨 Gráficos e Renderização

- [ ] **Clima e Efeitos Atmosféricos:** Reutilizar o `ParticleSystem.ts` para criar chuva angular, neve ou névoa em certas fases, alterando levemente a cor base da cena (tint).
- [ ] **Iluminação Dinâmica (Lightmaps):** Já que os *Renderers* gerenciam as sombras com Canvas Offscreen, criar um Layer de luz. Adicionar cones de luz em postes de rua, faróis dinâmicos em Táxis e reflexos neon no asfalto molhado.
- [ ] **Transições de HUD mais Fluidas:** Melhorar a responsividade do `UIRenderer.ts` com mais *tweens* ou feedback claro ao tomar dano na barra de vida (ex: mostrar a barra vermelha caindo lentamente/flickering).
- [ ] **Variedade Visual de Inimigos:** Adicionar *sprites/shapes* diferentes para tamanhos físicos de inimigos (Brutos lentos, Magrelos rápidos) além das cores já randomizadas de roupas.

---

## 🤖 Integração com IA (Google Gemini)

- [ ] **Dialogos e Provocações Dinâmicas (Taunts):** Inimigos e Chefões que usam a GenAI para falar falas geradas em tempo real com base no seu estilo de luta (ex: *"Você só sabe correr, Leo!"* se a *stamina* estiver sendo muito gasta).
- [ ] **Adaptative Difficulty (Balanceamento IA):** Enviar os *stats* de fim de nível (número de combos, itens usados, dano recebido) para o modelo da Gemini para que ele sugira o spawn rate de inimigos e táxis da próxima fase.

---

## 🔉 Áudio e Imersão

- [ ] **Vozes e Grunhidos (Voice Acting):** Inserir pequenos *SFX* de voz (grunts, gritos ao cair no chão) processados em 8-bit para dar mais vida aos embates.
- [ ] **Trilha Sonora Dinâmica:** O `AudioManager.ts` pode fazer crossfade de camadas da música. A percussão ou o ritmo ficam mais intensos dependendo do número de inimigos na tela ou se um chefe aparecer.

---

## 🛠️ Arquitetura e Código

- [ ] **Refatoração do GameEngine.ts:** Conforme o jogo crescer, o `GameEngine.ts` pode ficar gigante. Seria interessante separar "Gerenciamento de Entidades", "Sistema de Colisão" e "Detector de Eventos (Level/Spawners)" em seus próprios *Managers* (ex: `CollisionManager`, `EntityManager`).
- [ ] **Multiplayer Local (Co-op):** Estruturar o `InputManager.ts` e o estado (GameState) para aceitar `player2`, suportando controle via gamepad usando a API Web Gamepad do navegador.
- [ ] **Persistence System:** Salvar os High-Scores, nível alcançado e estatísticas totais localmente via `localStorage` e exibi-los no menu com React.
- [ ] **Mapas e Fases (Level Design JSON):** Em vez de instanciar o mundo de forma fixa ou procedural contínua, criar um sistema onde o Layout da rua (paredes, posições iniciais de lixo, pontos de spawn) possa ser lido de um arquivo de configuração/JSON.
