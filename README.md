# Coagro Studio v1.0.0
**Sistema Interno de Governança Visual e Produção Gráfica**  
*Grupo Coagro — Departamento de Marketing*

---

## 1. Visão Geral
Aplicação desenvolvida para padronizar e agilizar a criação de materiais promocionais nas lojas do Grupo Coagro, garantindo conformidade com o guia visual da marca:
* **Cartazes de Loja (A4)**: Impressão de alta fidelidade (300 DPI), com suporte a 1 por folha, 2 por folha (A5) e etiquetas de gôndola (4 por folha).
* **Status WhatsApp & Stories (9:16)**: Geração de peças verticais otimizadas para canais de atendimento e redes sociais das lojas.
* **Operação em Lote**: Importação de itens via planilha Excel/CSV para geração massiva de encartes com higienização inteligente de abreviações fiscais.
* **Isolamento de Marcas**: Aplicação estrita das paletas e identidades visuais Coagro Agro e Coagro Pet sem vazamento de cores ou tipografia.

---

## 2. Instalação e Execução

### Pré-requisitos
* Node.js 18+ (recomendado LTS)
* NPM 9+

### Comandos de Inicialização
```bash
# 1. Instalar dependências
npm install

# 2. Executar em modo desenvolvimento
npm run dev

# 3. Executar esteira de validação e testes
npm test

# 4. Compilação para produção (Web)
npm run build

# 5. Gerar instalador desktop para Windows (Offline)
npm run build:electron
```

O instalador desktop será gerado em `dist_electron/Coagro Studio Setup 1.0.0.exe`.

---

## 3. Integração com ERP / TI

O conector de busca automática de dados de produtos e preços por código/SKU está centralizado em:
`src/services/erpIntegration.ts`

### Instruções para a Equipe de TI
1. Abra o arquivo `src/services/erpIntegration.ts`.
2. Implemente a função `fetchProductFromErp(sku: string)` conectando ao endpoint REST interno, View SQL ou microserviço do ERP Coagro.
3. O formato esperado pelo motor de cartazes é:
```typescript
{
  codigo: string;      // SKU ou código interno da loja
  nome: string;        // Descrição comercial do produto
  precoDe?: number;    // Preço anterior (opcional)
  precoPor: number;    // Preço promocional vigente
}
```

---
*Grupo Coagro — Uso interno e restrito às filiais e departamentos autorizados.*
