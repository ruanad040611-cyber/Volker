import { DatabaseSync } from "node:sqlite";
import  readline from "node:readline/promises";
import {stdin as input, stdout as output} from "node:process";
import console from "node:console";
import { readFile } from "node:fs/promises";
import { writeFile } from "node:fs/promises";


const pergunta = readline.createInterface({ input, output});
const banco = new DatabaseSync("banco.db")
banco.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT,
        email TEXT,
        senha TEXT
    )
`);

console.log("-".repeat(20))
console.log("       Volker")
console.log("-".repeat(20))
console.log("Sistema de Reserva para compra de Carros da Volker")
async function padrao() {
    console.log("Faça login para Entrar no Sistema")
    while (true) {
    const acesso = await pergunta.question(`
        Aba de Acesso ao sistema
        1. Login
        2. Registro
        3. Sair
        `)
        if (acesso === "1") {
            await login();
        }
        else if (acesso === "2") {
            await registro();
        }
        else if (acesso === "3") {
            console.log("Obrigado por usar o Sistema");
            return;
        }
        else {
            console.log("Digite só números 1, 2 e 3")
        }
    }
};
await padrao();
async function login() {
    console.log("Aba de Login")
    while (true) {
        const email_login = (await pergunta.question(`Email: `)).trim()
        const senha_login = (await pergunta.question(`Senha: `)).trim()
        if (email_login === ""|| senha_login === "") {
            console.log("Existem campos vazios")
        }
        else {
            const ver_usuarios = banco.prepare("SELECT id, nome, email, senha FROM usuarios WHERE email = ? AND senha = ?").get(email_login, senha_login);
            if (ver_usuarios) {
                await Pagina2(ver_usuarios);
                return;
            }
            else {
                console.log("Usuário não encontrado")
            }
        }
    }
};
async function registro() {
    console.log("Aba de Registro")
    while (true) {
    const nome = (await pergunta.question(`Nome Completo: `)).trim()
    const email = (await pergunta.question(`Email: `)).trim()
    const senha = (await pergunta.question(`Senha: `)).trim()
    if (nome === "" || email === "" || senha === "") {
        console.log("Existem campos Vazios")
    }
    else {
        const envia = banco.prepare("INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)");
        envia.run(nome, email, senha);
        console.log("Usuário registrado com sucesso.");
        return;
    }
}
};
async function Pagina2(usuario) {
    console.log(`
    Bem vindo a Volker
    aqui temos uma grande variedade de carros
    você pode compralos agora mesmo! encontre
    o carro com a sua cara só aqui na Volker
    `)
    while (true) {
    console.log("Aba Inicial")
    const abas_pagina2 = await pergunta.question(`
    1. Dados
    2. Compras
    3. Ver Carros
    4. Sair
    `)
    if (abas_pagina2 === "1") {
        console.log(`Nome: ${usuario.nome}`);
        console.log(`Email: ${usuario.email}`);
        console.log(`Senha: ${usuario.senha}`);
    }
    else if (abas_pagina2 === "2") {
        const json_usuarios_modelos = await readFile(new URL ("./carros.json", import.meta.url), "utf8");
        const total_json = JSON.parse(json_usuarios_modelos);
        const compras_usuario = total_json.filter(
        modelo => modelo.nome_usuario === usuario.nome
        );
        if (compras_usuario.length === 0) {
        console.log("Você ainda não reservou nenhum carro.");
    } else {
        for (const compras of compras_usuario) {
            console.log(`
            Nome: ${compras.nome} 
            Preço: ${compras.preco}
            `);
        }
    }
}
    else if (abas_pagina2 === "3") {
       await Carros(usuario)
    }
    else if (abas_pagina2 === "4") {
        return;
    }
    else {
        console.log("Digite números só 1, 2, 3 e 4")
    }
}
};
async function Carros(usuario) {
    console.log("Aba de Carros")
    while (true) {
    const escolha_carros = await pergunta.question(`
    1. Todos os carros
    2. Carros Disponíveis
    3. Garantir carro
    4. Sair
    `)
    if (escolha_carros === "1") {
        const json_todos = await readFile(new URL("./carros.json", import.meta.url), "utf8")
        const mostra_todos_carros = JSON.parse(json_todos);
        for (const carro of mostra_todos_carros) {
            console.log(`
    Nome: ${carro.nome}
    Preço: ${carro.preco}
    Estado: ${carro.vendido}
    `);
        }
    }
    else if (escolha_carros === "2") {
        const json_disponiveis = await readFile(new URL("./carros.json", import.meta.url), "utf8")
        const base = JSON.parse(json_disponiveis);
        const disponiveis = base.filter(carro => carro.vendido === "não")
        for (const carro of disponiveis) {
            console.log(`
    Nome: ${carro.nome}
    Preço ${carro.preco}
    Estado: ${carro.vendido}
    `);
        }
    }
    else if (escolha_carros === "3") {
        const caminho = new URL("./carros.json", import.meta.url);
        const json_modelos = await readFile(caminho, "utf8")
        const total_json = JSON.parse(json_modelos)
        const nome_carro = await pergunta.question(`Nome do Carro: `)
        const carro_json_nome = total_json.find(
        modelo => modelo.nome === nome_carro
        );
        if (!carro_json_nome) {
            console.log("Carro invalido")
        }
        else if (carro_json_nome.vendido === "sim") {
        console.log("Esse carro já foi vendido");
        }
        else {
            carro_json_nome.vendido = "sim"
            carro_json_nome.nome_usuario = usuario.nome;
            carro_json_nome.email = usuario.email;
            carro_json_nome.senha = usuario.senha;
            await writeFile(caminho, JSON.stringify(total_json, null, 2), "utf8");
        }
    }
    else if (escolha_carros === "4") {
        break
    }
}
};
pergunta.close();
banco.close();