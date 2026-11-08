# Viva com Cuidado

App de rotina de saúde para a pessoa idosa, com **dois aparelhos ligados**:
quem cuida cadastra, quem é cuidado confirma.

Feito a partir do trabalho *Aplicativos para Saúde do Idoso* (Faculdade ENAU,
Enfermagem 7º/8º semestre) e dos desenhos de tela do projeto.

---

## Os arquivos

```
index.html              o app (é este que se instala no celular)
demonstracao.html       os dois aparelhos lado a lado — para apresentar
config.js               ▸ O ÚNICO ARQUIVO QUE VOCÊ EDITA (chaves do Firebase)
manifest.json           identidade do app instalado (nome, ícone, cor)
sw.js                   faz o app abrir mesmo sem internet
css/estilo.css          toda a aparência: cores, tamanhos, o jeito dos botões
js/figuras.js           os desenhos coloridos (cápsulas, ambulância, relógio…)
js/dados.js             onde os dados moram (localStorage + Firebase ou servidor da casa)
js/telas.js             as telas e o que cada botão faz
servidor.js             liga os dois aparelhos pelo Wi-Fi, sem Firebase (node servidor.js)
dados-servidor/         criada pelo servidor.js: os dados das casas ficam aqui
icones/                 ícone do app
ferramentas/            geradores (ícone e vitrine) — rode só se precisar
```

Só existe **uma** versão das telas. A demonstração não é uma cópia: ela monta o
mesmo app duas vezes. Corrigiu num lugar, corrigiu nos dois.

---

## 0. Ligar os dois aparelhos pelo Wi-Fi, agora — ~1 minuto

O jeito mais rápido, bom para apresentar: este computador vira o servidor e os
dois celulares, no **mesmo Wi-Fi**, abrem o app por ele. Não precisa de conta.

1. Nesta pasta, rode `node servidor.js`.
2. Ele mostra um endereço como `http://192.168.0.100:8080`. Abra esse endereço
   no navegador dos **dois** celulares.
3. Se o Windows perguntar sobre o firewall, permita para **redes privadas**.
4. Siga o item 4 (*Usar*): um celular é *Sou quem cuida*, o outro *Sou a pessoa
   cuidada* com o código.

Limites: só funciona enquanto o computador estiver ligado com o `servidor.js`
rodando e com os celulares no mesmo Wi-Fi. Por ser `http://` e não `https://`,
o celular não oferece *Instalar aplicativo* e não manda notificação do sistema:
o app abre no navegador. Para usar de qualquer lugar, instalado, é o Firebase
(item 1) com o GitHub Pages (item 2).

Se o `config.js` tiver o Firebase preenchido, o app usa o Firebase e ignora o
servidor da casa.

---

## 1. Ligar os dois aparelhos (Firebase) — ~10 minutos

Sem isso o app funciona, mas cada celular guarda os dados por conta própria.

1. Abra <https://console.firebase.google.com> e clique em **Adicionar projeto**.
   Nome: `viva-com-cuidado`. Pode desativar o Google Analytics.
2. No menu da esquerda: **Criar** → **Realtime Database** → **Criar banco de dados**.
   - Local: `us-central1` (ou o mais perto).
   - Comece em **modo bloqueado**.
3. Aba **Regras**, cole isto e publique:

   ```json
   {
     "rules": {
       "casas": {
         "$codigo": {
           ".read": true,
           ".write": true
         }
       }
     }
   }
   ```

   Isso deixa cada casa acessível para quem souber o código de 6 caracteres, e
   impede que alguém liste todas as casas de uma vez.

4. Na engrenagem ⚙ → **Configurações do projeto** → role até **Seus apps** →
   ícone `</>` (Web) → registre com o nome `viva`. Vai aparecer um trecho de
   código com `apiKey`, `databaseURL` etc.
5. Copie os três valores para o `config.js`:

   ```js
   window.CONFIG_FIREBASE = {
     apiKey: "AIza...",
     databaseURL: "https://viva-com-cuidado-default-rtdb.firebaseio.com",
     projectId: "viva-com-cuidado"
   };
   ```

> **Aviso honesto:** com essas regras, quem descobrir o código de uma casa
> consegue ver e mudar os dados dela. Para um trabalho acadêmico e para uso na
> família está de bom tamanho. Para virar produto de verdade, o passo seguinte é
> pôr login (Firebase Authentication) e amarrar as regras ao usuário.

---

## 2. Pôr no ar (GitHub Pages) — ~5 minutos

O app **precisa** de um endereço `https://` para instalar no celular. Não dá
para instalar abrindo o arquivo direto do computador.

1. Crie um repositório no GitHub chamado `viva-com-cuidado`.
2. Nesta pasta:

   ```bash
   git init
   git add .
   git commit -m "Viva com Cuidado"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/viva-com-cuidado.git
   git push -u origin main
   ```

3. No GitHub: **Settings** → **Pages** → em *Source* escolha `main` / `/ (root)`
   → **Save**.
4. Em 1–2 minutos o app está em
   `https://SEU-USUARIO.github.io/viva-com-cuidado/`

---

## 3. Instalar no celular

**Android (Chrome)** — abra o endereço, toque nos três pontinhos ⋮ e escolha
**Instalar aplicativo** (ou *Adicionar à tela inicial*). O ícone aparece junto
com os outros apps e abre em tela cheia, sem barra de navegador.

**iPhone (Safari)** — abra o endereço, toque no botão de compartilhar e escolha
**Adicionar à Tela de Início**.

Depois de instalado, funciona sem internet: o que for marcado fica guardado e
sobe sozinho quando a rede voltar.

---

## 4. Usar

Ao abrir, o app mostra **Quem vai usar agora?** com os perfis cadastrados neste
aparelho. Na primeira vez, toque em **Fazer meu cadastro**.

- **Quem cuida**: seu nome, *Quem cuida*, e o nome de quem você cuida. Deixe o
  código em branco: o app cria a casa e mostra um código de 6 caracteres.
  Anote esse código. Outro familiar que também cuida faz o mesmo cadastro,
  mas preenche o código.
- **Pessoa cuidada**: seu nome, *A pessoa cuidada*, e o código da casa. O app
  confere se a casa existe antes de entrar.

Pronto: os dois estão na mesma casa. Quem cuida cadastra remédios, exercícios,
consultas e telefones; a pessoa cuidada vê o dia dela e responde ✓ / ✕; e o
relatório dos últimos 7 dias aparece do lado de quem cuida.

Toda casa nova começa vazia. Os dados de exemplo aparecem só na demonstração.

Um mesmo aparelho pode ter vários perfis. *Trocar de perfil* volta para a lista;
*Remover um perfil* tira o perfil deste aparelho, sem apagar os dados da casa.

---

## Sobre os avisos de horário

Com o app **aberto ou recém-fechado**, na hora do remédio ele mostra o aviso em
tela cheia, vibra e — se você tocar em *Ativar os avisos de horário* — manda uma
notificação do sistema.

Com o celular **parado e o app fechado há horas**, um app instalado pelo
navegador não consegue acordar sozinho: isso é limite do Android/iOS para PWA,
não do código. Duas saídas, se isso for essencial:

- empacotar num APK com [Capacitor](https://capacitorjs.com) — o mesmo código,
  mais um passo de build, e aí a notificação é nativa de verdade;
- ou um servidor de push (Firebase Cloud Messaging).

---

## A agenda de papel

O trabalho previa uma versão impressa para quem não usa celular. Está pronta:
no aparelho de quem cuida, **Imprimir agenda de papel** gera uma folha com os
horários, os exercícios, as consultas e os telefones, com quadradinhos para
marcar à mão.

---

## Mexer no app

| O que você quer mudar | Onde |
|---|---|
| Cores, tamanho de letra, o jeito dos botões | `css/estilo.css`, bloco `:root` |
| Textos e telas | `js/telas.js`, constante `HTML_TELAS` |
| Os desenhos coloridos | `js/figuras.js` |
| Dados de exemplo (só na demonstração) | `js/dados.js`, constante `SEMENTE` |
| Nome e ícone do app instalado | `manifest.json` |
| Desenho do ícone | `ferramentas/gerar-icones.js`, depois rode `node ferramentas/gerar-icones.js` |

**Depois de qualquer mudança**, suba o número da `VERSAO` no topo do `sw.js`
(`viva-1` → `viva-2`). É isso que faz o celular trocar os arquivos velhos pelos
novos em vez de continuar mostrando a versão guardada.

Para atualizar o link de visualização (a página dos dois aparelhos lado a lado):
`node ferramentas/gerar-vitrine.js`.
