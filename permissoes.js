// Recupera o perfil guardado na sessão (se não houver, assume SOCIO por segurança)
const perfilApolo = sessionStorage.getItem('perfilApolo') || 'SOCIO';

// Função principal para aplicar as regras de controlo de acesso por módulo
function aplicarControleAcesso() {
    const caminhoPagina = window.location.pathname.toLowerCase();

    // 1. ADMIN: Tem acesso total a tudo (não bloqueia nada)
    if (perfilApolo === 'ADMIN') {
        return;
    }

    // 2. SÓCIO: Nunca pode alterar nada em nenhuma página
    if (perfilApolo === 'SOCIO') {
        ocultarOuRemoverAcoes();
        observarTabelasDinamicas();
        return;
    }

    // 3. MÓDULO SALÃO (Contrato, Agenda, Salão)
    // Regra: Alterar = ADMIN / PRESIDENTE | Consultar = TESOUREIRO / SOCIO
    const éSalao = caminhoPagina.includes('salao') || 
                   caminhoPagina.includes('contrato') || 
                   caminhoPagina.includes('agenda');
                   
    if (éSalao) {
        if (perfilApolo === 'TESOUREIRO' || perfilApolo === 'SOCIO') {
            ocultarOuRemoverAcoes();
            observarTabelasDinamicas();
        }
    }

    // 4. MÓDULO FINANÇAS (Receita, Despesa, Extrato, Fluxo de Caixa, Categorias)
    // Regra: Alterar = ADMIN / TESOUREIRO | Consultar = PRESIDENTE / SOCIO
    const éFinanceiro = caminhoPagina.includes('financa') || 
                       caminhoPagina.includes('receita') || 
                       caminhoPagina.includes('despesa') || 
                       caminhoPagina.includes('extrato') ||
                       caminhoPagina.includes('fluxo') ||
                       caminhoPagina.includes('categoria');
                       
    if (éFinanceiro) {
        if (perfilApolo === 'PRESIDENTE' || perfilApolo === 'SOCIO') {
            ocultarOuRemoverAcoes();
            observarTabelasDinamicas();
        }
    }
}

// Função agressiva que remove ou oculta qualquer botão de ação, lixeira ou formulário de escrita
function ocultarOuRemoverAcoes() {
    const limparElementos = () => {
        // Seleciona botões de salvamento, inputs de envio e ícones de lixeira
        const alvos = document.querySelectorAll(
            'button, input[type="submit"], input[type="button"], input[type="file"], .btn-salvar, .btn-excluir, .btn-incluir, .btn-novo, .fa-trash, .fa-trash-can'
        );

        alvos.forEach(el => {
            // Proteção absoluta: nunca mexe no botão de Sair
            if (el.getAttribute('onclick')?.includes('fazerLogout') || el.innerText.includes('Sair') || el.closest('header')?.querySelector('.fa-right-from-bracket')) {
                return;
            }

            // Em vez de apenas desativar, removemos ou ocultamos o elemento para o utilizador não ver
            const celulaOuBotao = el.closest('td, th, button, form, .card-formulario') || el;
            celulaOuBotao.style.display = 'none';
        });
    };

    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', limparElementos);
    } else {
        limparElementos();
    }
}

// Observa se o Firebase injeta linhas na tabela dinamicamente e esconde a lixeira na hora
function observarTabelasDinamicas() {
    const observer = new MutationObserver(() => {
        const lixeiras = document.querySelectorAll('.fa-trash, .fa-trash-can, button');
        lixeiras.forEach(el => {
            if (el.getAttribute('onclick')?.includes('fazerLogout') || el.innerText.includes('Sair')) return;
            
            const paiTd = el.closest('td');
            if (paiTd) {
                paiTd.style.display = 'none'; // Oculta a célula inteira da lixeira na tabela
            } else {
                el.style.display = 'none';
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

// Executa o controlo de acessos
aplicarControleAcesso();
