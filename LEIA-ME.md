# NutriVida — nutrição e treinos

Aplicativo pessoal em HTML, CSS e JavaScript puro, com Firebase Authentication e Cloud Firestore. O acesso exige entrar com e-mail/senha ou Google e estar conectado à internet. Os registros são mantidos na nuvem, vinculados ao UID autenticado; o Firestore usa cache em memória, sem guardar os dados do app no IndexedDB do navegador.

## Configuração necessária no Firebase

No projeto Firebase usado pelo app, confirme:

1. **Authentication → Método de login:** E-mail/senha e Google ativados. Para o Google, configure também o e-mail de suporte.
2. **Authentication → Configurações → Domínios autorizados:** adicione o domínio onde o app será publicado (por exemplo, `seuusuario.github.io`).
3. **Firestore Database:** banco criado e regras publicadas. As regras precisam permitir acesso somente ao UID autenticado. A estrutura usada pelo app é `usuarios/<UID>/<coleção>/<documento>`.

Regras compatíveis com essa estrutura:

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /usuarios/{uid}/{documento=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

Não use regras abertas para todos. A configuração web do Firebase está no app; a segurança depende da autenticação e das regras do Firestore.

## Publicação e primeiro acesso

Publique o conteúdo desta pasta em um host estático HTTPS, como GitHub Pages. Abra o endereço publicado com internet e crie uma conta com e-mail/senha ou entre com Google. A sessão pode permanecer ativa neste navegador; em cada aparelho é preciso entrar na conta pelo menos uma vez.

Após entrar, os dados da conta são carregados e ficam sincronizados automaticamente. Alterações feitas em outro aparelho conectado aparecem no NutriVida sem exportar/importar arquivos. Para usar o app, manter conexão com a internet; o conteúdo estático pode ficar em cache para instalação, mas os dados pessoais não ficam disponíveis offline.

## Migração automática dos dados existentes

Na primeira entrada desta versão, o app verifica o IndexedDB da versão anterior no mesmo navegador e endereço publicado. Se encontrar registros, envia-os para a conta autenticada antes de remover o banco local antigo. Se já houver dados ativos na conta, acrescenta registros locais com IDs ausentes e preserva o registro ativo da nuvem quando há conflito. Se houver apenas um backup antigo do app no Firestore, ele é migrado e o registro local prevalece quando o mesmo ID também existe.

O banco antigo só é apagado depois que a migração para o Firestore termina com sucesso. Se a migração falhar, os dados locais antigos não são apagados; confira a mensagem e tente novamente com internet. Feche outras abas antigas do NutriVida se o navegador informar que o armazenamento está aberto em outro lugar. Recomenda-se exportar um backup JSON na versão anterior antes de publicar esta atualização.

## Alimentos e bibliotecas de referência

Uma conta sem dados recebe **18 alimentos brasileiros de referência**, além das bibliotecas iniciais de exercícios e cardio. Esse conjunto é reduzido e não representa a tabela TACO oficial completa; valores são aproximações editáveis e devem ser conferidos em rótulos ou fontes confiáveis.

## Cópia de segurança

Em **Config.**, é possível exportar um backup JSON. A importação substitui os dados atuais da conta e sincroniza a substituição nos aparelhos conectados. Guarde os arquivos exportados fora do dispositivo. O Firestore também está sujeito às cotas do plano Firebase escolhido.

## Observações técnicas

- O app permanece em HTML/CSS/JavaScript puro, sem frameworks ou servidor próprio.
- Os dados são sincronizados por listeners do Firestore e atualizações por registro.
- O Firebase Auth guarda a sessão de login neste navegador; isso não inclui os registros pessoais do NutriVida.
- A remoção de todos os dados pela tela de Configurações apaga os registros ativos e cópias antigas da nuvem.
- Não publique regras de banco permissivas e não compartilhe senhas.

## Ajustes desta versão

- Corrigida a chamada de cálculo que impedia a tela Perfil de aparecer.
- Removido o texto duplicado da meta diária na tela Início; o valor aparece uma única vez, em negrito e com “Kcal”.
- No computador, foram preservados o tamanho, a disposição e o menu lateral originais. As funcionalidades e os textos permanecem compartilhados com a versão de celular; o painel completo de nutrição continua disponível no desktop.
- No celular, o layout compacto e a navegação inferior permanecem inalterados.
- A opção “Alimentos” saiu da navegação principal e fica no menu da engrenagem, logo abaixo de “Perfil”, como “Alimentos e Receitas”; o atalho foi removido da tela Configurações.
- No Diário, “＋ Adicionar” abre um formulário identificado pelo nome da refeição, sem campo para escolher a refeição novamente.
- A busca do Diário reúne alimentos e receitas, indica o tipo e sugere correspondências pelo início do nome digitado.
- O resumo nutricional das receitas segue o padrão de alimentos, exibindo valores por 100 g.
- No cadastro de receitas, os ingredientes são sugeridos ao digitar o início do nome do alimento.
- Ao adicionar um consumo no Diário, a janela é maior e inclui as abas “Recentes” (até 20 alimentos e receitas usados recentemente) e “Favoritos”, além da busca no topo.
- A Meta de hoje mostra a meta calórica uma única vez, em negrito.

## Funcionalidades preservadas

O app mantém as abas Início, Diário, Alimentos, Treinos, Histórico, Relatórios, Perfil e Config. Inclui registro alimentar e de água, receitas, perfil e metas, fichas e séries de treino, cardio, histórico e exportação de backup/CSV.
