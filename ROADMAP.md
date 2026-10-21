# Roadmap — Coagro Lojas Studio

Documento vivo. Lista tudo que precisa ser corrigido, adicionado ou validado antes da versão final.
Origem: revisão técnica do código em 21/10/2026 + decisões do marketing.

## Decisões de produto (já tomadas)

- Ferramenta **interna**, distribuída como **executável (Electron)** nos PDVs, abrindo com dois cliques.
- **Funciona offline.** Nenhuma funcionalidade essencial pode depender de internet, servidor ou chave de API.
- **Sem login.** A governança é feita por **auditoria** (quem gerou, onde, o quê), não por autenticação.
- **IA é opcional** e fica fora do caminho do operador. Se existir, serve ao marketing (templates de redes sociais) e como rascunho para produto não cadastrado.
- Futuro: integração com o sistema da empresa via TI (SKU por código, banco de imagens e diferenciais cadastrados).
- A versão web (Vercel) não é o alvo principal. Decidir se será corrigida ou descontinuada.

## P0 — Antes de distribuir nas lojas

### Conformidade na arte
- [ ] **Validade obrigatória da promoção.** Campo pedido *antes* do preço/desconto. Começa em hoje, não aceita data passada, não exporta vazio. Prazo máximo configurável pelo marketing.
- [ ] **Relógio do PC.** Usar a data de compilação do app como data mínima; avisar se o relógio estiver antes dela.
- [ ] **Rodapé legal fixo em toda arte.** Área reservada nos 16 templates (cartaz A4/A5/etiqueta, story, status), não editável, sem corte nem sobreposição. Conteúdo geral: validade, "imagem meramente ilustrativa", promoção do Grupo Coagro, texto do Código de Defesa do Consumidor.
- [ ] **Textos legais em um único arquivo versionado** (ex.: `src/config/legal.config.ts`), com data da última revisão e responsável. Nada de texto legal dentro de componente.
- [ ] **Aviso automático para defensivos agrícolas** (registro no MAPA, EPI, risco à vida, venda com receituário etc.). **Texto a ser definido pelo agrônomo responsável e pelo jurídico.** Não implementar texto sem aprovação.
- [ ] **Alerta de desconto.** Acima de 40%: confirmação explícita. POR maior ou igual a DE: bloqueia. POR muito baixo (ex.: abaixo de 10% do DE) ou zero: bloqueia. Limites em configuração.
- [ ] **Revisar legendas e presets prontos de defensivos** (`src/data/agroPresets.ts`, `JsonViewerModal.tsx`): frases como "máxima eficiência técnica" e "proteção preventiva e curativa" são alegações de eficácia e precisam de aprovação.
- [ ] **Produtos veterinários.** Confirmar com RT/jurídico se exigem aviso próprio.

### Correções técnicas bloqueantes
- [ ] **Encoding.** `server.ts` e `server/routes/generate.ts` estão com acentos corrompidos (mojibake). Regravar em UTF-8. Corrigir comparações e regex quebradas (`RELÂMPAGO`, `IMBATÍVEL`, `MÁXIMA`, `GARANTA JÁ O SEU`, `divisão agropecuária`). Padronizar UTF-8 no editor e em um `.editorconfig`.
- [ ] **Remover Gemini do build do executável.** Nenhuma chave dentro do instalador. Se a IA ficar, só na ferramenta do marketing, atrás de flag.
- [ ] **Electron seguro.** Trocar `nodeIntegration: true` / `contextIsolation: false` por `nodeIntegration: false`, `contextIsolation: true` e um `preload`. Atualizar o Electron (28 está sem suporte). Confirmar que nada no executável depende de `/api/*`.
- [ ] **Repositório privado.** Verificado público em 21/10/2026 (clone sem login funcionou). Fechar no GitHub.

## P1 — Logo após o piloto

### Auditoria (substitui o login)
- [ ] Loja gravada no PC na instalação.
- [ ] Nome ou matrícula do operador pedido uma vez por sessão.
- [ ] **ID curto da peça impresso pequeno em cada arte** (ex.: loja + data + hash), para ligar o cartaz físico ao registro.
- [ ] Log local de cada geração: ID, loja, operador, produto/SKU, preço, desconto, validade, template, versão do app, data/hora.
- [ ] Sincronização do log quando houver internet (Firestore ou planilha). Offline, o log fica no PC.
- [ ] Mostrar a versão do app na tela e no registro.

### Distribuição offline
- [ ] **Atualização do instalador.** Definir como as ~12 lojas recebem versões novas (auto-update ou processo manual com versão visível). Hoje não há mecanismo.
- [ ] Testar o instalador Windows em PC limpo, sem internet.

### Dependências e segurança
- [ ] Substituir `xlsx` 0.18.5 (abandonado no npm, 2 vulnerabilidades altas) por `exceljs` ou pela versão oficial do SheetJS.
- [ ] Mover `vite` para `devDependencies`; rodar `npm audit` e tratar as 6 vulnerabilidades altas.
- [ ] Se o Firebase/Drive continuar no app, restringir a `apiKey` aos domínios da empresa e deixar tudo opcional/offline-safe.

### Versão Vercel (se mantida)
- [ ] Levantar o que falhou (logs do deploy e do runtime). Suspeitas conhecidas: limite de corpo de ~4,5 MB do Vercel contra o `express.json` de 30 MB (upload de foto); rate limit em memória em ambiente serverless; falta de `trust proxy`; rewrite `/api/*` → `api/index`.
- [ ] Comprimir imagem no cliente antes de enviar.
- [ ] Decidir: corrigir ou descontinuar.

### Qualidade
- [ ] **CI no GitHub Actions** rodando `npm run lint` e `npm test` a cada push.
- [ ] Testes novos: validade, rodapé em todos os templates (visual), alerta de desconto, log de auditoria, ID da peça.

## P2 — Evolução

### Cadastro de produtos e integração com TI
- [ ] Modelo de dados do produto: SKU, categoria, regras da categoria, diferenciais aprovados, imagem, textos permitidos.
- [ ] Banco de imagens cadastradas (hoje não existe).
- [ ] Integração com o ERP/sistema via TI: SKU por código, preço por loja. Com preço vindo do sistema, o operador deixa de digitar preço.
- [ ] IA, se mantida, gera **rascunho** de produto não cadastrado, aprovado pelo marketing antes de entrar no cadastro. Nunca vai direto para impressão.
- [ ] Reavaliar perfis (operador, gerente, marketing) se a governança por auditoria não bastar.

### Manutenção
- [ ] Quebrar os arquivos grandes: `App.tsx` (~1.200 linhas), `BatchReviewGrid.tsx` (~1.100), `useArtworkForm.ts` (~800).
- [ ] Unificar o nome do produto (hoje: Coagro Studio, Agro Studio, Gerador de Cartaz, Lojas Studio) em README, `metadata.json`, Electron e logs.
- [ ] Atualizar o README (execução offline, build do instalador, variáveis, regras de conformidade).
- [ ] Nomes de modelos de IA em variável de ambiente; retry hoje chama o mesmo modelo.
- [ ] Planilha `Modelo_Troca_de_Precos.xlsx` duplicada (raiz e `public/`).
- [ ] Revisar peso das imagens de mascotes no instalador.

## Piloto
- [ ] 2 lojas por algumas semanas. Medir tempo para gerar um cartaz e quantidade de erros, comparando com o fluxo atual no Canva.
- [ ] Coletar feedback dos operadores e gerentes e transformar em itens deste roadmap.

## Pendências de decisão (dependem de terceiros)

| Item | Quem decide |
|---|---|
| Texto legal dos defensivos e alegações permitidas | Agrônomo responsável + jurídico |
| Aviso para produtos veterinários | RT/jurídico |
| Prazo máximo de validade da promoção | Marketing / diretoria |
| Limite de desconto que exige confirmação (40%?) e se varia por categoria | Marketing / comercial |
| Formato do ID da peça e destino do log | Marketing + TI |
| Quem na TI cuida da integração e da distribuição do instalador | TI |
