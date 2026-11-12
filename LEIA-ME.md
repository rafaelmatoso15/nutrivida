# NutriVida — nutrição e treinos

Aplicativo pessoal em HTML, CSS e JavaScript puro, sem conta e sem dependências externas. Os dados são mantidos localmente no navegador usando IndexedDB.

## Abrir no computador
Extraia o ZIP e abra `index.html` em um navegador atualizado. Para uso básico, o app funciona por arquivo local; permissões de instalação PWA e service worker exigem hospedagem HTTPS ou um servidor local (`localhost`).

## Instalar no celular
Para instalar e aproveitar o modo offline, publique a pasta em um host estático HTTPS gratuito, como GitHub Pages ou Netlify. Abra a URL no navegador do celular e use a opção “Adicionar à tela inicial”/“Instalar app”. Faça uma primeira visita conectado para baixar os recursos offline. Para uso entre computador e celular, exporte o JSON em um dispositivo e importe no outro.

## Backup e restauração
Na tela **Config.**, use **Exportar todos os dados** para baixar um JSON. Guarde-o fora do aparelho e exporte semanalmente. Para restaurar/migrar, use **Importar backup JSON** no outro navegador. O backup substitui os dados locais atuais.

## Base de alimentos
O app começa com 18 alimentos brasileiros de referência e uma biblioteca de 94 exercícios. A base disponibilizada é reduzida e **não é a TACO completa oficial**; a tela Alimentos permite importar CSV/JSON e baixar um modelo CSV. Os valores de referência devem ser conferidos e podem ser editados.

## Privacidade e limites
Sem login ou sincronização em nuvem: os dados ficam no armazenamento do navegador/aparelho. Limpar os dados do navegador pode apagá-los; mantenha backups. Não há vitaminas no catálogo, por escolha do escopo solicitado.


## Diário alimentar
A aba **Diário** reúne o registro de alimentos da base, receitas e cadastro rápido de novos alimentos. O app calcula calorias e macros consumidos e restantes a partir das metas do perfil, organiza refeições configuráveis, permite copiar itens escolhidos de qualquer refeição/dia e oferece sugestões acionadas individualmente em cada refeição, com base nos alimentos e receitas salvos. Os registros antigos continuam preservados e entram no mesmo saldo e no histórico; novos lançamentos são editáveis e aparecem nos relatórios e backups.

## Treinos e histórico
Na aba **Treinos**, as fichas ficam no topo, com atalhos para criar uma ficha ou iniciar um treino. As bibliotecas de exercícios e cardio ficam recolhidas até serem abertas; a biblioteca de exercícios permite filtrar por grupo muscular. A progressão por exercício permanece em **Treinos**, com sessão anterior, recordes e gráficos de carga e volume. Para cada exercício, registre carga e repetições série a série, marque as séries concluídas e use o descanso configurável. A aba **Histórico** reúne apenas os treinos e cardios realizados, com filtros por dia, semana, mês, últimos dias ou intervalo personalizado, além de um resumo do período. O backup JSON inclui os registros detalhados; ao importar um backup antigo, os treinos antigos continuam legíveis.
