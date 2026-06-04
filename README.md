# Consulta CEP & Endereços

Ferramenta utilitária criada para acelerar fluxos de trabalho através da automação de cadastros. Realiza a consulta instantânea de CEP e validação de endereços direto no sistema via API aberta (ViaCEP), eliminando a necessidade de consultas manuais externas. Um projeto leve, focado em produtividade operacional, performance e segurança de dados.

## 🚀 Tecnologias Utilizadas

- **HTML5**: Estruturação semântica e acessível.
- **CSS3 (Vanilla)**: Design system customizado, responsividade mobile-first, variáveis CSS (custom properties) e animações/transições fluidas.
- **JavaScript (Vanilla JS)**: Lógica pura estruturada com manipulação segura do DOM.
- **API ViaCEP**: Integração contínua e sem necessidade de chaves/autenticação para consulta de dados postais.

## ✨ Recursos e Funcionalidades

- **Busca por CEP (Máscara Automática)**: Input com máscara dinâmica (`XXXXX-XXX`) que dispara a consulta automaticamente assim que o oitavo dígito é preenchido.
- **Busca por Endereço**: Permite filtrar por Estado (UF), Cidade e Logradouro, listando todos os endereços compatíveis e seus respectivos CEPs.
- **Debounce de Digitação**: Mecanismo inteligente que atrasa as requisições à API durante a digitação ativa do usuário, economizando largura de banda e evitando limites de taxa (rate limits).
- **Segurança Avançada (Anti-XSS)**: Sanitização estrita de todos os dados recebidos da API antes de serem renderizados no DOM, utilizando exclusivamente `textContent` e APIs nativas de criação de elementos.
- **Feedback Visual (Loading & Erros)**: Spinners animados dinâmicos que indicam o progresso da busca e tratamentos amigáveis para falhas comuns (como "CEP não encontrado" ou "Sem conexão").
- **Cópia Rápida**: Botões e distintivos que copiam o CEP diretamente para a área de transferência com um único clique (ou teclado), exibindo confirmação visual temporária ("Copiado!").

## 💻 Como Executar o Projeto

Como o projeto é construído totalmente em tecnologias front-end puras (Vanilla), sua execução é extremamente simples:

### Método 1: Direto no Navegador
1. Clone ou faça o download dos arquivos em sua máquina local.
2. Dobre o clique no arquivo `index.html` para abri-lo diretamente em qualquer navegador moderno.

### Método 2: Usando um Servidor de Desenvolvimento Local (Recomendado)
Se preferir rodar com suporte a hot reload ou simular um servidor real de produção:
```bash
# Executar utilizando o python
python -m http.server 8000

# Ou utilizando o node.js (npx)
npx serve
```
Abra o navegador em `http://localhost:8000` (ou a porta correspondente).

> ⚠️ **IMPORTANTE (Divergência ou Dúvidas sobre Dados de Endereço):**  
> Como a API pública do ViaCEP depende de atualizações periódicas da base de dados postal, é possível que haja um pequeno atraso (delay) em relação ao sistema oficial dos Correios. Em caso de dúvidas sobre a atualização ou exatidão de um logradouro/CEP recente, recomendamos consultar diretamente a ferramenta oficial no [Busca CEP Correios](https://buscacepinter.correios.com.br/app/endereco/index.php?t), que sempre conterá as informações mais recentes e em tempo real.

---

> ℹ️ **NOTA:**  
> **Ferramenta desenvolvida por Adriano Giassi com o auxílio de Inteligência Artificial para otimização de rotinas operacionais.**

