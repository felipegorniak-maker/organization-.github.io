// Recupera o perfil guardado na sessão (se não houver, assume SOCIO por segurança)
const perfilApolo = sessionStorage.getItem('perfilApolo') || 'SOCIO';

// Função global que retorna true se o perfil atual tem permissão de escrita na página corrente
function devePermitirEscrita() {
    const caminho = window.location.pathname.toLowerCase();

    // ADMIN pode tudo
    if (perfilApolo === 'ADMIN') return true;

    // SÓCIO não pode nada
    if (perfilApolo === 'SOCIO') return false;

    // Módulo Salão (Contrato, Agenda, Salão): ADMIN e PRESIDENTE alteram
    if (caminho.includes('salao') || caminho.includes('contrato') || caminho.includes('agenda')) {
        return perfilApolo === 'PRESIDENTE';
    }

    // Módulo Finanças (Receita, Despesa, Extrato, Fluxo, Categorias): ADMIN e TESOUREIRO alteram
    if (caminho.includes('financa') || caminho.includes('receita') || caminho.includes('despesa') || 
        caminho.includes('extrato') || caminho.includes('fluxo') || caminho.includes('categoria')) {
        return perfilApolo === 'TESOUREIRO';
    }

    return false;
}

// Bloqueia inputs e botões estáticos no carregamento da página
window.addEventListener('DOMContentLoaded', () => {
    if (!devePermitirEscrita()) {
        const botoes = document.querySelectorAll('button:not([onclick*="fazerLogout"]), input[type="submit"], input[type="button"], input[type="file"], .btn-salvar, .btn-excluir, .btn-incluir, .btn-novo');
        botoes.forEach(el => {
            el.disabled = true;
            el.style.opacity = '0.5';
            el.style.cursor = 'not-allowed';
            el.title = "Acesso restrito: O seu perfil é apenas de consulta.";
        });
        console.log("🔒 Modo Consulta Ativo para:", perfilApolo);
    }
});
