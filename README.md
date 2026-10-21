# Coagro Studio v1.0.0
**Sistema Interno de Padronização Visual e Produção Gráfica**  
*Departamento de Marketing — Grupo Coagro*

---

## 1. Objetivo da Aplicação
Ferramenta interna desenvolvida para unificar e automatizar a comunicação visual de ofertas nas filiais do Grupo Coagro (Agro e Pet). 

A aplicação resolve a descentralização na criação de peças promocionais, garantindo conformidade estrita com o manual de identidade visual corporativo através de regras fixas de diagramação:
* **Cartazes de Loja (A4)**: Impressão direta calibrada em 300 DPI, com suporte a folha cheia (A4), meia folha (A5 com marcas de corte) e etiquetas de gôndola (4 por folha).
* **Peças Digitais (9:16)**: Formato padronizado para Stories do Instagram e Status de WhatsApp das lojas.
* **Agilidade Operacional**: Importação de itens via planilha para geração massiva de ofertas sem necessidade de edição manual de arte.

---

## 2. Instruções Técnicas

### 2.1 Requisitos de Ambiente
* **Node.js**: v22.12.0 ou superior (exigência do Vite 8 e do Vitest 5 — o Node 18 **não** roda este projeto)
* **Gerenciador de Pacotes**: npm v10.0.0 ou superior

### 2.2 Instalação de Dependências
```bash
npm install

# Copie o exemplo e preencha a chave (obrigatória para /api/generate-content)
cp .env.example .env
```
Sem `GEMINI_API_KEY`, o servidor sobe normalmente, mas a geração por IA cai
automaticamente no fallback heurístico local.

### 2.3 Execução em Desenvolvimento
```bash
npm run dev
```
A aplicação iniciará o servidor local Vite em `http://localhost:3000`.

### 2.4 Validação e Testes Automatizados
Antes de disponibilizar novas versões para produção ou distribuição às lojas:
```bash
# Execução da suíte completa de testes unitários (Vitest)
npm test

# Verificação estrita de tipagem TypeScript
npm run lint
```

### 2.5 Preços e vigência das ofertas
Os editores manual, de cartazes e de geração assistida permitem informar o início e
o encerramento da oferta. O início é preenchido inicialmente com a data de Brasília
e pode ser alterado ou apagado. As datas são exibidas na arte, comparadas como datas de
Brasília e validadas antes de baixar PNG/PDF, imprimir ou iniciar uma exportação em
lote. Uma oferta sem data final continua permitida, mas recebe um lembrete; uma
oferta vencida ou com intervalo inválido não pode ser exportada.

Antes da exportação, cartazes exigem título e preço válido. O preço promocional não
pode superar o original, e valores iguais não são anunciados como desconto.
Percentuais e economias são calculados em centavos inteiros. Esses controles tratam
consistência comercial e não substituem a validação técnica ou jurídica de
conteúdos regulatórios.

### 2.6 Compilação de Produção (Web / Vercel)
Para gerar o pacote estático otimizado para deploy em nuvem ou servidor institucional:
```bash
npm run build
```
Os artefatos minificados serão gerados no diretório `dist/`. O build também:
* gera `server.js` (bundle do Express usado pela função da Vercel em `api/index.ts`);
* carimba a versão do cache do Service Worker em `dist/sw.js`.

Para subir o servidor local em modo produção (serve `dist/`):
```bash
npm run build && npm start   # http://localhost:3000
```

### 2.7 Empacotamento Desktop (Instalador Windows Offline)
Para gerar o instalador executável offline para computadores das lojas:
```bash
npm run build:electron
```
O instalador final será gerado no diretório `dist_electron/`.

---

## 3. Ponto de Integração ERP & Catálogo
A camada responsável pelo saneamento e ingestão de dados brutos provenientes do ERP, notas fiscais e planilhas de estoque está centralizada em:
* [`src/lib/erpSanitizer.ts`](src/lib/erpSanitizer.ts) — saneamento de nome/título de produto (é o módulo testado e usado em runtime)
* [`src/lib/dataSanitizer.ts`](src/lib/dataSanitizer.ts) e [`src/lib/contentNormalizer.ts`](src/lib/contentNormalizer.ts) — normalização de conteúdo
* [`src/services/erpIntegration.ts`](src/services/erpIntegration.ts) — **legado, sem referências no código** (mantido apenas como referência histórica)

Estes módulos traduzem termos fiscais e abreviações brutas (ex.: medidas, siglas de defensivos e nutrição animal) para a nomenclatura comercial oficial, calculam percentuais de desconto (`DE / POR`) e formatam os valores monetários em conformidade com o padrão visual corporativo.

---
*Uso interno e restrito às filiais e setores autorizados do Grupo Coagro.*
