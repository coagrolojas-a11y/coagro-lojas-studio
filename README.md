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
* **Node.js**: v18.0.0 ou superior
* **Gerenciador de Pacotes**: npm v9.0.0 ou superior

### 2.2 Instalação de Dependências
```bash
npm install
```

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

### 2.5 Compilação de Produção (Web / Vercel)
Para gerar o pacote estático otimizado para deploy em nuvem ou servidor institucional:
```bash
npm run build
```
Os artefatos minificados serão gerados no diretório `dist/`.

### 2.6 Empacotamento Desktop (Instalador Windows Offline)
Para gerar o instalador executável offline para computadores das lojas:
```bash
npm run build:electron
```
O instalador final será gerado no diretório `dist_electron/`.

---

## 3. Ponto de Integração ERP & Catálogo
A camada responsável pelo saneamento e ingestão de dados brutos provenientes do ERP, notas fiscais e planilhas de estoque está centralizada em:
* [`src/services/erpIntegration.ts`](src/services/erpIntegration.ts)

Este serviço traduz termos fiscais e abreviações brutas (ex.: medidas, siglas de defensivos e nutrição animal) para a nomenclatura comercial oficial, calcula percentuais de desconto (`DE / POR`) e formata os valores monetários em conformidade com o padrão visual corporativo.

---
*Uso interno e restrito às filiais e setores autorizados do Grupo Coagro.*
