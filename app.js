/**
 * Consulta CEP & Endereços - Lógica da Aplicação (Vanilla JS)
 * Desenvolvido por Adriano Giassi com o auxílio de IA.
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- ELEMENTOS DO DOM ---
  
  // Controle de Abas
  const btnTabCep = document.getElementById('btn-tab-cep');
  const btnTabEndereco = document.getElementById('btn-tab-endereco');
  const tabCep = document.getElementById('tab-cep');
  const tabEndereco = document.getElementById('tab-endereco');

  // Elementos do Fluxo de CEP
  const cepInput = document.getElementById('cep-input');
  const cepWrapper = document.getElementById('cep-wrapper');
  const cepError = document.getElementById('cep-error');
  const cepErrorText = document.getElementById('cep-error-text');
  const cepResult = document.getElementById('cep-result');
  const resCepValue = document.getElementById('res-cep-value');
  const resLogradouro = document.getElementById('res-logradouro');
  const resBairro = document.getElementById('res-bairro');
  const resCidade = document.getElementById('res-cidade');
  const resUf = document.getElementById('res-uf');
  const btnCopyCep = document.getElementById('btn-copy-cep');
  const btnClearCep = document.getElementById('btn-clear-cep');

  // Elementos do Fluxo de Endereço
  const ufSelect = document.getElementById('uf-select');
  const cidadeInput = document.getElementById('cidade-input');
  const logradouroInput = document.getElementById('logradouro-input');
  const enderecoError = document.getElementById('endereco-error');
  const enderecoErrorText = document.getElementById('endereco-error-text');
  const enderecoLoading = document.getElementById('endereco-loading');
  const enderecoResult = document.getElementById('endereco-result');
  const enderecoResultsList = document.getElementById('endereco-results-list');

  // --- LÓGICA DE ABAS ---
  
  function alternarAba(abaAtiva) {
    if (abaAtiva === 'cep') {
      btnTabCep.classList.add('active');
      btnTabCep.setAttribute('aria-selected', 'true');
      btnTabEndereco.classList.remove('active');
      btnTabEndereco.setAttribute('aria-selected', 'false');
      
      tabCep.classList.add('active');
      tabEndereco.classList.remove('active');
      
      // Foco automático no input de CEP
      cepInput.focus();
    } else {
      btnTabEndereco.classList.add('active');
      btnTabEndereco.setAttribute('aria-selected', 'true');
      btnTabCep.classList.remove('active');
      btnTabCep.setAttribute('aria-selected', 'false');
      
      tabEndereco.classList.add('active');
      tabCep.classList.remove('active');
      
      // Foco automático no primeiro campo da busca de endereço
      ufSelect.focus();
    }
  }

  btnTabCep.addEventListener('click', () => alternarAba('cep'));
  btnTabEndereco.addEventListener('click', () => alternarAba('endereco'));

  // --- FUNÇÃO AUXILIAR: DEBOUNCE ---
  
  /**
   * Evita a execução excessiva de funções durante eventos contínuos (ex: digitação)
   * @param {Function} func Função a ser executada
   * @param {number} delay Tempo de espera em milissegundos
   */
  function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  }

  /**
   * Sanitiza a entrada de texto removendo caracteres especiais de controle de caminho
   * @param {string} texto Texto bruto inserido pelo usuário
   * @returns {string} Texto limpo
   */
  function limparTextoBusca(texto) {
    return texto.replace(/[\\\/.]/g, '').trim();
  }

  // --- BUSCA POR CEP ---

  // Aplica máscara automática de CEP (XXXXX-XXX) e gerencia buscas automáticas
  cepInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Mantém apenas números
    
    // Controla a visibilidade do botão de limpar
    if (value.length > 0) {
      cepWrapper.classList.add('has-value');
    } else {
      cepWrapper.classList.remove('has-value');
    }

    // Insere o hífen após o 5º dígito
    if (value.length > 5) {
      value = value.replace(/^(\d{5})(\d)/, '$1-$2');
    }
    
    e.target.value = value;
    
    const cepLimpo = value.replace('-', '');
    
    // Se o usuário apagar o CEP, oculta estados de erro ou resultado
    if (cepLimpo.length < 8) {
      ocultarResultadosCep();
      ocultarErroCep();
      return;
    }
    
    // Dispara a busca quando o CEP estiver completo (8 dígitos)
    if (cepLimpo.length === 8) {
      buscarCepDebounced(cepLimpo);
    }
  });

  // Limpa o campo de CEP e redefine o estado da aplicação
  btnClearCep.addEventListener('click', () => {
    cepInput.value = '';
    cepWrapper.classList.remove('has-value');
    ocultarResultadosCep();
    ocultarErroCep();
    cepInput.focus();
  });

  // Auto-seleciona o texto ao focar (facilita consultas subsequentes rápidas)
  cepInput.addEventListener('focus', () => {
    if (cepInput.value.length > 0) {
      cepInput.select();
    }
  });

  const buscarCepDebounced = debounce((cep) => {
    consultarCep(cep);
  }, 400);

  /**
   * Consulta a API ViaCEP com base no CEP fornecido
   * @param {string} cep CEP apenas com números (8 dígitos)
   */
  async function consultarCep(cep) {
    // Validação estrita contra injeção de parâmetros/formatos inválidos
    if (!/^\d{8}$/.test(cep)) {
      mostrarErroCep('CEP inválido. Digite 8 números.');
      return;
    }

    mostrarLoadingCep(true);
    ocultarErroCep();
    ocultarResultadosCep();

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      
      if (!response.ok) {
        throw new Error('Falha de rede');
      }

      const data = await response.json();

      // O ViaCEP retorna erro no JSON caso o CEP não seja encontrado
      if (data.erro) {
        mostrarErroCep('CEP não encontrado. Verifique os números informados.');
        return;
      }

      renderizarResultadoCep(data);

    } catch (error) {
      console.error('Erro na requisição de CEP:', error);
      mostrarErroCep('Não foi possível conectar ao serviço de busca. Verifique sua conexão.');
    } finally {
      mostrarLoadingCep(false);
    }
  }

  function mostrarLoadingCep(show) {
    if (show) {
      cepWrapper.classList.add('loading');
    } else {
      cepWrapper.classList.remove('loading');
    }
  }

  function mostrarErroCep(mensagem) {
    cepErrorText.textContent = mensagem;
    cepError.style.display = 'flex';
  }

  function ocultarErroCep() {
    cepError.style.display = 'none';
    cepErrorText.textContent = '';
  }

  function renderizarResultadoCep(data) {
    // Sanitização utilizando textContent direto para evitar XSS
    resCepValue.textContent = data.cep;
    resLogradouro.textContent = data.logradouro || '(Logradouro não informado)';
    resBairro.textContent = data.bairro || '(Bairro não informado)';
    resCidade.textContent = data.localidade;
    resUf.textContent = data.uf;

    cepResult.classList.add('active');
  }

  function ocultarResultadosCep() {
    cepResult.classList.remove('active');
  }

  // --- BUSCA POR ENDEREÇO ---

  function verificarEBuscarEndereco() {
    const uf = ufSelect.value;
    const cidade = cidadeInput.value.trim();
    const logradouro = logradouroInput.value.trim();

    // Se o usuário apagar campos essenciais, limpa a tela de resultados
    if (!uf || cidade.length < 3 || logradouro.length < 3) {
      ocultarResultadosEndereco();
      ocultarErroEndereco();
      mostrarLoadingEndereco(false);
      return;
    }

    // Dispara a consulta com debounce para evitar flood de requests enquanto digita
    buscarEnderecoDebounced(uf, cidade, logradouro);
  }

  // Event Listeners para acionar a verificação
  ufSelect.addEventListener('change', verificarEBuscarEndereco);
  cidadeInput.addEventListener('input', verificarEBuscarEndereco);
  logradouroInput.addEventListener('input', verificarEBuscarEndereco);

  const buscarEnderecoDebounced = debounce((uf, cidade, logradouro) => {
    consultarEndereco(uf, cidade, logradouro);
  }, 600);

  /**
   * Consulta a API ViaCEP utilizando parâmetros de endereço (UF, Cidade e Logradouro)
   */
  async function consultarEndereco(uf, cidade, logradouro) {
    // Limpeza de caracteres potencialmente perigosos para injeção de caminhos
    const ufLimpa = uf.trim();
    const cidadeLimpa = limparTextoBusca(cidade);
    const logradouroLimpo = limparTextoBusca(logradouro);

    // Validação defensiva de segurança
    if (!/^[A-Z]{2}$/.test(ufLimpa)) {
      mostrarErroEndereco('UF inválida.');
      return;
    }
    if (cidadeLimpa.length < 3 || logradouroLimpo.length < 3) {
      return;
    }

    mostrarLoadingEndereco(true);
    ocultarErroEndereco();
    ocultarResultadosEndereco();

    try {
      const ufSanitizada = encodeURIComponent(ufLimpa);
      const cidadeSanitizada = encodeURIComponent(cidadeLimpa);
      const logradouroSanitizado = encodeURIComponent(logradouroLimpo);

      const response = await fetch(`https://viacep.com.br/ws/${ufSanitizada}/${cidadeSanitizada}/${logradouroSanitizado}/json/`);
      
      if (!response.ok) {
        throw new Error('Falha de rede');
      }

      const data = await response.json();

      if (!Array.isArray(data) || data.length === 0) {
        mostrarErroEndereco('Nenhum endereço encontrado para os critérios digitados.');
        return;
      }

      renderizarListaEnderecos(data);

    } catch (error) {
      console.error('Erro na requisição de Endereço:', error);
      mostrarErroEndereco('Erro ao se conectar ao serviço de busca. Verifique os dados inseridos e sua conexão.');
    } finally {
      mostrarLoadingEndereco(false);
    }
  }

  function mostrarLoadingEndereco(show) {
    if (show) {
      enderecoLoading.classList.add('active');
    } else {
      enderecoLoading.classList.remove('active');
    }
  }

  function mostrarErroEndereco(mensagem) {
    enderecoErrorText.textContent = mensagem;
    enderecoError.style.display = 'flex';
  }

  function ocultarErroEndereco() {
    enderecoError.style.display = 'none';
    enderecoErrorText.textContent = '';
  }

  function renderizarListaEnderecos(lista) {
    // Limpa a lista anterior de resultados de forma segura (sem usar innerHTML)
    enderecoResultsList.replaceChildren();

    // Renderiza cada item da lista gerando elementos de forma segura (DOM APIs)
    lista.forEach(item => {
      const itemElement = criarCardEndereco(item);
      enderecoResultsList.appendChild(itemElement);
    });

    enderecoResult.classList.add('active');
  }

  function ocultarResultadosEndereco() {
    enderecoResult.classList.remove('active');
    enderecoResultsList.replaceChildren();
  }

  /**
   * Constrói dinamicamente o card de endereço usando APIs seguras de DOM (textContent) para prevenir XSS
   * @param {Object} item Objeto de endereço vindo da API ViaCEP
   * @returns {HTMLElement} Elemento DOM estruturado
   */
  function criarCardEndereco(item) {
    const card = document.createElement('div');
    card.className = 'address-item';

    const details = document.createElement('div');
    details.className = 'address-details';

    const title = document.createElement('span');
    title.className = 'address-title';
    title.textContent = item.logradouro || '(Sem logradouro principal)';

    const subtitle = document.createElement('span');
    subtitle.className = 'address-sub';
    subtitle.textContent = `${item.bairro || 'Sem bairro'} • ${item.localidade}/${item.uf}`;

    details.appendChild(title);
    details.appendChild(subtitle);

    const badge = document.createElement('span');
    badge.className = 'address-cep-badge';
    badge.textContent = item.cep;
    badge.setAttribute('title', 'Clique para copiar este CEP');
    badge.setAttribute('role', 'button');
    badge.setAttribute('tabindex', '0');

    // Funcionalidade de copiar o CEP direto ao clicar no badge do endereço da lista
    badge.addEventListener('click', () => {
      copiarParaClipboard(item.cep, badge);
    });

    badge.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        copiarParaClipboard(item.cep, badge);
      }
    });

    card.appendChild(details);
    card.appendChild(badge);

    return card;
  }

  // --- COPIAR PARA A ÁREA DE TRANSFERÊNCIA ---

  /**
   * Copia o texto fornecido e atualiza o estado visual do elemento gatilho como feedback
   * @param {string} texto Texto a ser copiado (CEP)
   * @param {HTMLElement} elemento Elemento HTML que recebeu o clique para feedback
   */
  async function copiarParaClipboard(texto, elemento) {
    try {
      await navigator.clipboard.writeText(texto);
      
      const textoOriginal = elemento.querySelector('span') 
        ? elemento.querySelector('span').textContent 
        : elemento.textContent;
      
      elemento.classList.add('copied');
      
      if (elemento.querySelector('span')) {
        elemento.querySelector('span').textContent = 'Copiado!';
      } else {
        elemento.textContent = 'Copiado!';
      }

      setTimeout(() => {
        elemento.classList.remove('copied');
        if (elemento.querySelector('span')) {
          elemento.querySelector('span').textContent = textoOriginal;
        } else {
          elemento.textContent = textoOriginal;
        }
      }, 1500);

    } catch (err) {
      console.error('Falha ao copiar para o clipboard:', err);
    }
  }

  // Event listener para copiar o CEP principal do resultado de CEP único
  btnCopyCep.addEventListener('click', () => {
    const cepText = resCepValue.textContent;
    copiarParaClipboard(cepText, btnCopyCep);
  });
  
});
