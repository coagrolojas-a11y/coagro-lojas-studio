# 🌿 Coagro Studio
**Motor Algorítmico de Governança Visual & Produção Gráfica**  
*Grupo Coagro — Departamento de Marketing*

---

## 🎯 1. A Tese do Projeto: Engenharia de Layout vs "Inteligência Artificial"

O **Coagro Studio** não é um gerador baseado em "Inteligência Artificial" genérica ou probabilística. 

No varejo agropecuário e pet, a comunicação visual de loja **não tolera alucinação**: preços errados, tipografias distorcidas, logomarcas desfiguradas ou misturas indevidas de cores corporativas causam prejuízo financeiro e quebram a autoridade da marca.

A aplicação é um **motor algorítmico determinístico**, fundamentado em:
1. **Templates Predefinidos e Parametrizados:** Grades matemáticas desenhadas especificamente para a realidade de impressão física (A4, A5, gôndola) e canais digitais (Stories 9:16).
2. **Regras Rígidas de Diagramação:** Hierarquia visual de varejo que calcula proporção de títulos em caixa alta, DE/POR monumental, contraste de fundo e selos promocionais em tempo real.
3. **Governança Estrita de Marca:** Isolamento absoluto entre as marcas **Coagro Agro** e **Coagro Pet**, garantindo conformidade matemática com o manual de identidade visual do grupo.

O resultado é previsibilidade em 0ms, alta performance e 100% de segurança institucional para operadores e gerentes de loja.

---

## 🎨 2. Paleta Oficial & Regra de Redes Sociais

Seguindo as diretrizes de imposição de marca e contraste publicitário, **o fundo branco foi desabilitado** nos templates de redes sociais:

* **Azul Coagro Titular (`#001C71`) — PADRÃO OFICIAL:** Configurado como a cor padrão para todas as peças verticais de redes sociais e WhatsApp, garantindo uniformidade e imponência visual no feed e nos status de atendimento (Helena CRM).
* **Verde Safra (`#004d40`):** Cor secundária institucional disponível para campanhas da linha Agro e lavoura.
* **Isolamento Pet:** A linha Coagro Pet opera estritamente com sua paleta dedicada (Azul Pet `#004b87`, Azul Claro `#4897D0` e Dourado `#ffab00`), proibindo terminantemente o verde Agro.

---

## 🏷️ 3. Módulos Operacionais

### 📄 Módulo A: Cartazes de Loja (A4 Físico)
* **Alta Densidade Gráfica:** Renderização vetorial e exportação em **300 DPI lossless**, eliminando borrões em impressões a laser ou jato de tinta.
* **Grade Dinâmica da Folha (`PosterSheetContainer`):**
  * **1 por Folha:** A4 Retrato Cheio (210×297mm) para vitrines e entrada de loja.
  * **2 por Folha:** A5 Paisagem (297×210mm) com linha tracejada central de corte (`✂️ CORTE AQUI`), gerando 50% de economia de papel e toner.
  * **4 por Folha:** Grade 2×2 (105×148mm) para mini-cartazes e etiquetas de prateleira/gôndola.
* **Processamento em Lote (Excel/CSV):** Leitura instantânea de planilhas de troca de preços com o sanitizador inteligente (`erpSanitizer.ts`), que traduz abreviações brutas de ERP/NFe para linguagem comercial limpa.
* **Motor Dinâmico de Desconto:** Cálculo automático de percentual (`% OFF`) e economia em reais.

### 📱 Módulo B: WhatsApp Status & Redes Sociais (9:16)
* **Formato Travado em 9:16:** Otimizado para Stories de Instagram e Status do WhatsApp corporativo.
* **Ícone Oficial do WhatsApp:** Balão canônico vetorial integrado diretamente ao layout.
* **Preço Monumental:** Diagramação focada em conversão rápida e legibilidade em telas de smartphones.

---

## ⚡ 4. Operação 100% Offline (Resiliência em Loja)

O sistema foi arquitetado para funcionar com máxima robustez nas filiais do Nordeste, mesmo com link de internet instável ou fora do ar:
* **Fontes Locais WOFF2:** Tipografias oficiais **Exo 2** e **Inter** auto-hospedadas no pacote, sem dependência do Google Fonts.
* **Cache IndexedDB por SKU (`CoagroStudioDB`):** Busca instantânea em 0ms por código de produto com armazenamento local de fotos recortadas.
* **Recorte em Canvas Nativo:** Tratamento e transparência de imagens executados diretamente no navegador da máquina local.

---

## 🚀 5. Instalação e Execução

### Modo de Desenvolvimento
```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor local
npm run dev
```

### Validação de Qualidade & Testes
Antes de gerar qualquer release, execute a esteira de integridade:
```bash
# Testes Unitários Automatizados (174 testes no Vitest)
npm test

# Validação Estrita de Tipagem TypeScript (3 tsconfigs)
npm run lint

# Compilação de Produção
npm run build
```

### Empacotamento Desktop (Windows)
Para gerar o executável final para as lojas:
```bash
npm run build:electron
```
O executável (`Coagro Studio Setup.exe`) será gerado na pasta `dist_electron/`.

---
*Uso interno e restrito às filiais e setores autorizados do Grupo Coagro.*
