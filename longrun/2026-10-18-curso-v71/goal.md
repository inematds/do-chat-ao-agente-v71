# Goal — primeiro curso INEMA Learning v7.1: "Do chat ao agente"

Pedido do Nei (18/10/2026): primeiro curso no formato v7.1 (layout do mock "Agentes de IA na Prática" + didática do INEMA_Visual_Learning_v7.md), visão geral da formação https://eventos.inema.pro/do-chat-ao-agente/, repo próprio, vídeo explicativo no final.

Decisões: PT primeiro; vídeo = série já publicada (release video-v2.0.0 do jornada-agentes) — sem HeyGen novo; conteúdo só da área, dos 23 exercícios e dos guias linkados.

## Pronto quando (comando → saída esperada)
1. `python3 gerar.py` → "6 aulas + index geradas, 0 erros".
2. `python3 validar.py` → "OK" com: cada aula tem objetivo de 1 linha, diagrama `.dg` clicável, ≥1 botão copiar, quiz com resposta oculta, `data-competencias`, 0 `[colchetes]`/TODO, links externos 200.
3. Screenshots por HTTP local em 1366 e 390 → sem overflow horizontal (`scrollWidth <= innerWidth`).
4. `https://inematds.github.io/do-chat-ao-agente-v71/` → 200 após push.
5. Aula final toca o vídeo geral (release jornada-agentes) e cada aula de sequência tem o vídeo da sequência.
