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
        bloquearAcoesEscrita();
        observarElementosDinamicos();
        return;
    }

    // 3. MÓDULO SALÃO (Contrato, Agenda, Salão)
    // Regra: Alterar = ADMIN / PRESIDENTE | Consultar = TESOUREIRO / SOCIO
    const éSalao = caminhoPagina.includes('salao') || 
                   caminhoPagina.includes('contrato') || 
                   caminhoPagina.includes('agenda');
                   
    if (éSalao) {
        if (perfilApolo === 'TESOUREIRO' || perfilApolo === 'SOCIO') {
            bloquearAcoesEscrita();
            observarElementosDinamicos();
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
            bloquearAcoesEscrita();
            observarElementosDinamicos();
        }
    }
}

// Função que bloqueia o elemento e neutraliza ações de exclusão/clique
function aplicarBloqueioEm(el) {
    // Proteção absoluta: nunca bloqueia o botão de Sair
    if (el.getAttribute('onclick')?.includes('fazerLogout') || el.innerText.includes('Sair') || el.querySelector?.('.fa-right-from-bracket')) {
        return;
    }

    el.disabled = true;
    el.style.opacity = '0.4';
    el.style.cursor = 'not-allowed';
    el.title = "Acesso restrito: O seu perfil é apenas de consulta nesta área.";

    // Se for um botão, ícone de lixeira ou célula de ações, bloqueia o clique para não disparar o confirm/exclusão
    el.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        alert("⚠️ Acesso restrito: O seu perfil não tem permissão para excluir registos nesta área.");
        return false;
    };

    // Se tiver elementos pai que capturam o clique (como a célula da tabela <td> ou botão envolvente)
    const pai = el.closest('td, button, a');
    if (pai && !pai.tagName.toLowerCase().includes('header')) {
        pai.style.opacity = '0.4';
        pai.style.cursor = 'not-allowed';
        pai.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            alert("⚠️ Acesso restrito: O seu perfil não tem permissão para excluir registos nesta área.");
            return false;
        };
    }
}

// Desativa os elementos estáticos já presentes
function bloquearAcoesEscrita() {
    const processar = () => {
        const elementosBloquear = document.querySelectorAll(
            'button, input[type="submit"], input[type="button"], input[type="file"], .btn-salvar, .btn-excluir, .btn-incluir, .btn-novo, .fa-trash, .fa-trash-can'
        );
        elementosBloquear.forEach(aplicarBloqueioEm);
    };

    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', processar);
    } else {
        processar();
    }
}

// Monitoriza a página em tempo real para apanhar lixeiras e botões gerados dinamicamente pelas tabelas do Firebase
function observarElementosDinamicos() {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) {
                    if (node.matches('button, .btn-excluir, .fa-trash, .fa-trash-can, td')) {
                        aplicarBloqueioEm(node);
                    }
                    node.querySelectorAll('button, input[type="submit"], input[type="button"], .btn-salvar, .btn-excluir, .btn-incluir, .btn-novo, .fa-trash, .fa-trash-can, td')
                        .forEach(aplicarBloqueioEm);
                }
            });
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

// Executa a verificação assim que o script é carregado
aplicarControleAcesso();
aplicarControleAcesso();
