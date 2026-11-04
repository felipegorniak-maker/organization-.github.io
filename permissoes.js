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
        }
    }
}

// Função auxiliar que desativa de forma abrangente TODOS os botões e elementos de escrita
function bloquearAcoesEscrita() {
    window.addEventListener('DOMContentLoaded', () => {
        // Seleciona todos os botões, inputs de submissão e campos de ficheiro/upload da página
        const elementosBloquear = document.querySelectorAll(
            'button, input[type="submit"], input[type="button"], input[type="file"], .btn-salvar, .btn-excluir, .btn-incluir, .btn-novo'
        );

        elementosBloquear.forEach(el => {
            // Desativa o elemento para impedir qualquer clique ou ação de inclusão/alteração
            el.disabled = true;
            el.style.opacity = '0.5';
            el.style.cursor = 'not-allowed';
            el.title = "Acesso restrito: O seu perfil é apenas de consulta nesta área.";
        });

        console.log("🔒 Modo restrito (Apenas Consulta) ativado para o perfil:", perfilApolo);
    });
}

// Executa a verificação assim que o script é carregado na página
aplicarControleAcesso();
