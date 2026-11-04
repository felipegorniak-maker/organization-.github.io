// Recupera o perfil guardado no login (se não houver, assume SOCIO por segurança)
const perfilApolo = sessionStorage.getItem('perfilApolo') || 'SOCIO';

// Função principal para aplicar as regras dos 4 perfis
function aplicarControleAcesso() {
    const caminhoPagina = window.location.pathname.toLowerCase();

    // 1. SÓCIO: Não pode fazer nada, apenas consultar
    if (perfilApolo === 'SOCIO') {
        bloquearAcoesEscrita();
        return;
    }

    // 2. TESOUREIRO: Apenas mexe na parte financeira. Nas outras, bloqueia.
    if (perfilApolo === 'TESOUREIRO') {
        const éFinanceiro = caminhoPagina.includes('financa') || 
                           caminhoPagina.includes('receita') || 
                           caminhoPagina.includes('despesa') || 
                           caminhoPagina.includes('extrato');
        if (!éFinanceiro) {
            bloquearAcoesEscrita();
        }
    }

    // 3. PRESIDENTE: Mexe no Salão, Quadras e Atas. Nas finanças, bloqueia.
    if (perfilApolo === 'PRESIDENTE') {
        const éFinanceiro = caminhoPagina.includes('financa') || 
                           caminhoPagina.includes('receita') || 
                           caminhoPagina.includes('despesa') || 
                           caminhoPagina.includes('extrato');
        if (éFinanceiro) {
            bloquearAcoesEscrita();
        }
    }

    // 4. ADMIN: Tem acesso total a tudo (não faz nada, deixa passar).
}

// Função auxiliar que desativa botões de salvamento, exclusão e inputs de ficheiros
function bloquearAcoesEscrita() {
    window.addEventListener('DOMContentLoaded', () => {
        // Desativa botões de submissão/salvar
        const botoes = document.querySelectorAll('button[type="submit"], .btn-salvar, .btn-excluir, #btnSalvarReceita, #btnSalvarDespesa');
        botoes.forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
            btn.title = "Acesso restrito: O seu perfil é apenas de consulta nesta área.";
        });

        // Desativa campos de seleção de ficheiros (Uploads)
        const inputsFile = document.querySelectorAll('input[type="file"]');
        inputsFile.forEach(input => {
            input.disabled = true;
        });

        console.log("🔒 Modo de restrição ativo para o perfil:", perfilApolo);
    });
}

// Executa a verificação assim que o script é carregado
aplicarControleAcesso();
