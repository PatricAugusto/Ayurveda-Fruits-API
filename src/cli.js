import axios from 'axios';
import inquirer from 'inquirer';
import chalk from 'chalk';
import Table from 'cli-table3';
import boxen from 'boxen';
import gradient from 'gradient-string';

const API_URL = 'http://localhost:3000/api';

// Paleta Cyberpunk
const neonPink = chalk.hex('#FF007F');
const neonCyan = chalk.hex('#00F0FF');
const neonGreen = chalk.hex('#39FF14');
const neonYellow = chalk.hex('#FFE600');
const darkSlate = chalk.hex('#4A5568');
const dimText = chalk.hex('#718096');

// Gerador de Gradiente Cyberpunk
const cyberpunkGradient = gradient(['#FF007F', '#7928CA', '#00F0FF']);

// Mapeamento para exibição amigável em PT-BR
const SEASONS_PT = {
  SUMMER: 'Verão',
  WINTER: 'Inverno',
  SPRING: 'Primavera',
  AUTUMN: 'Outono',
  MONSOON: 'Monção'
};

const CATEGORIES_PT = {
  FRUIT: 'Fruta',
  VEGETABLE: 'Legume/Verdura'
};

// Estilo de Tabela Customizado (Bordas Slim Cyberpunk)
const cyberpunkTableChars = {
  'top': '─', 'top-mid': '┬', 'top-left': '┌', 'top-right': '┐',
  'bottom': '─', 'bottom-mid': '┴', 'bottom-left': '└', 'bottom-right': '┘',
  'left': '│', 'left-mid': '├', 'mid': '─', 'mid-mid': '┼',
  'right': '│', 'right-mid': '┤', 'middle': '│'
};

async function mainCLI() {
  console.clear();

  const titleText = cyberpunkGradient.multiline(
    ` ⚡ AYURVEDA // SISTEMA CLI v2.0 ⚡ \n` +
    `   [ PROTOCOLO: GROQ / PRISMA / PG ] `
  );

  const banner = boxen(titleText, {
    padding: { top: 1, bottom: 1, left: 3, right: 3 },
    margin: { top: 1, bottom: 1 },
    borderStyle: 'double',
    borderColor: 'magenta',
    textAlignment: 'center'
  });

  console.log(banner);

  const { action } = await inquirer.prompt([
    {
      type: 'select',
      name: 'action',
      message: neonCyan('⚡ // SELECIONE A OPERAÇÃO:'),
      choices: [
        { name: `${neonPink('🤖 [IA]')} Consultar Recomendações Ayurveda`, value: 'ayurveda' },
        { name: `${neonCyan('📋 [DADOS]')} Listar Alimentos Cadastrados`, value: 'list_foods' },
        { name: `${neonGreen('➕ [CADASTRAR]')} Inserir Novo Alimento`, value: 'create_food' },
        { name: `${neonYellow('🔍 [BUSCAR]')} Buscar Alimento por ID`, value: 'get_food' },
        { name: `${chalk.red('❌ [REMOVER] ')} Deletar Alimento`, value: 'delete_food' },
        { name: `${darkSlate('🚪 [SAIR]')} Encerrar Sessão`, value: 'exit' }
      ]
    }
  ]);

  switch (action) {
    case 'ayurveda':
      await handleAyurvedaLLM();
      break;
    case 'list_foods':
      await handleListFoods();
      break;
    case 'create_food':
      await handleCreateFood();
      break;
    case 'get_food':
      await handleGetFoodById();
      break;
    case 'delete_food':
      await handleDeleteFood();
      break;
    case 'exit':
      console.log(neonPink('\n⚡ // SESSÃO ENCERRADA. Até logo!\n'));
      process.exit(0);
  }

  await pauseAndReturn();
}

// 1. Consulta IA Ayurveda
async function handleAyurvedaLLM() {
  const answers = await inquirer.prompt([
    {
      type: 'select',
      name: 'season',
      message: neonCyan('▸ Escolha a Estação do Ano:'),
      choices: [
        { name: 'Verão (SUMMER)', value: 'SUMMER' },
        { name: 'Inverno (WINTER)', value: 'WINTER' },
        { name: 'Primavera (SPRING)', value: 'SPRING' },
        { name: 'Outono (AUTUMN)', value: 'AUTUMN' },
        { name: 'Monção (MONSOON)', value: 'MONSOON' }
      ]
    },
    {
      type: 'select',
      name: 'dosha',
      message: neonPink('▸ Escolha o Dosha Alvo:'),
      choices: ['VATA', 'PITTA', 'KAPHA']
    }
  ]);

  console.log(dimText('\n[LOG_SISTEMA] Processando consulta via modelo Groq AI...'));

  try {
    const response = await axios.get(`${API_URL}/ayurveda/recommendations`, {
      params: answers
    });

    const recommendations = response.data?.recommendations || [];

    if (recommendations.length === 0) {
      console.log(neonYellow('\n⚠️ [SEM DADOS] Nenhuma recomendação retornada pela IA.'));
      return;
    }

    const seasonDisplay = SEASONS_PT[answers.season] || answers.season;
    console.log(`\n${cyberpunkGradient(`  ▸ PAINEL DE RECOMENDAÇÕES [${seasonDisplay.toUpperCase()} // ${answers.dosha}]`)}\n`);

    const table = new Table({
      head: [
        neonCyan('NOME'),
        neonPink('CATEGORIA'),
        neonGreen('ANÁLISE AYURVEDA')
      ],
      chars: cyberpunkTableChars,
      colWidths: [20, 16, 58],
      wordWrap: true
    });

    recommendations.forEach((item) => {
      const typeBadge = item.category === 'FRUIT'
        ? chalk.bgHex('#FF007F').black(' FRUTA ')
        : chalk.bgHex('#00F0FF').black(' LEGUME ');

      table.push([
        chalk.bold.white(item.name.toUpperCase()),
        typeBadge,
        chalk.hex('#CBD5E0')(item.reason)
      ]);
    });

    console.log(table.toString());
  } catch (error) {
    console.log(chalk.red(`\n❌ [ERRO_SISTEMA] ${error.response?.data?.error || error.message}`));
  }
}

// 2. Listagem de Alimentos em Tabela
async function handleListFoods() {
  try {
    const response = await axios.get(`${API_URL}/foods`);
    const foods = response.data;

    if (!foods || foods.length === 0) {
      console.log(neonYellow('\n⚠️ [BANCO_VAZIO] Nenhum alimento registrado no banco de dados.'));
      return;
    }

    console.log(`\n${cyberpunkGradient('  ▸ ALIMENTOS CADASTRADOS NO BANCO DE DADOS')}\n`);

    const table = new Table({
      head: [
        neonCyan('ID (UUID)'),
        neonPink('NOME'),
        neonGreen('CATEGORIA'),
        neonYellow('ESTAÇÃO'),
        chalk.hex('#7928CA')('DOSHAS')
      ],
      chars: cyberpunkTableChars,
      colWidths: [38, 16, 16, 14, 16]
    });

    foods.forEach((food) => {
      const catDisplay = CATEGORIES_PT[food.category] || food.category;
      const seasonDisplay = SEASONS_PT[food.season] || food.season;

      table.push([
        dimText(food.id),
        chalk.bold.white(food.name),
        food.category === 'FRUIT' ? neonPink(catDisplay) : neonCyan(catDisplay),
        neonYellow(seasonDisplay),
        neonGreen(food.pacifies ? food.pacifies.join(' · ') : '—')
      ]);
    });

    console.log(table.toString());
  } catch (error) {
    console.log(chalk.red(`\n❌ [ERRO_SISTEMA] ${error.message}`));
  }
}

// 3. Formulário para Cadastro de Alimento
async function handleCreateFood() {
  const foodData = await inquirer.prompt([
    { type: 'input', name: 'name', message: neonCyan('▸ Nome do alimento:') },
    {
      type: 'select',
      name: 'category',
      message: neonPink('▸ Categoria:'),
      choices: [
        { name: 'Fruta (FRUIT)', value: 'FRUIT' },
        { name: 'Legume / Verdura (VEGETABLE)', value: 'VEGETABLE' }
      ]
    },
    {
      type: 'select',
      name: 'season',
      message: neonYellow('▸ Estação correspondente:'),
      choices: [
        { name: 'Verão (SUMMER)', value: 'SUMMER' },
        { name: 'Inverno (WINTER)', value: 'WINTER' },
        { name: 'Primavera (SPRING)', value: 'SPRING' },
        { name: 'Outono (AUTUMN)', value: 'AUTUMN' },
        { name: 'Monção (MONSOON)', value: 'MONSOON' }
      ]
    },
    {
      type: 'checkbox',
      name: 'pacifies',
      message: neonGreen('▸ Doshas Pacificados:'),
      choices: ['VATA', 'PITTA', 'KAPHA']
    },
    { type: 'input', name: 'description', message: dimText('▸ Descrição ou observações:') }
  ]);

  try {
    const response = await axios.post(`${API_URL}/foods`, foodData);

    const card = boxen(
      `${neonGreen('✔ ALIMENTO CADASTRADO COM SUCESSO!')}\n\n` +
      `${dimText('ID:')} ${response.data.id}\n` +
      `${neonCyan('NOME:')} ${response.data.name}\n` +
      `${neonPink('CATEGORIA:')} ${CATEGORIES_PT[response.data.category] || response.data.category}`,
      { padding: 1, borderStyle: 'round', borderColor: 'green' }
    );

    console.log(`\n${card}`);
  } catch (error) {
    console.log(chalk.red(`\n❌ [ERRO_SISTEMA] ${error.response?.data?.error || error.message}`));
  }
}

// 4. Detalhe do Alimento em Painel
async function handleGetFoodById() {
  const { id } = await inquirer.prompt([
    { type: 'input', name: 'id', message: neonCyan('▸ Informe o ID (UUID) do alimento:') }
  ]);

  try {
    const response = await axios.get(`${API_URL}/foods/${id}`);
    const food = response.data;

    const catDisplay = CATEGORIES_PT[food.category] || food.category;
    const seasonDisplay = SEASONS_PT[food.season] || food.season;

    const hudCard = boxen(
      `${cyberpunkGradient('❖ DETALHES DO REGISTRO')}\n\n` +
      `${dimText('UUID:')}        ${food.id}\n` +
      `${neonPink('NOME:')}        ${food.name.toUpperCase()}\n` +
      `${neonCyan('CATEGORIA:')}   ${catDisplay}\n` +
      `${neonYellow('ESTAÇÃO:')}     ${seasonDisplay}\n` +
      `${neonGreen('DOSHAS:')}      ${food.pacifies.join(' · ')}\n\n` +
      `${chalk.gray('DESCRIÇÃO:')}  ${food.description || 'Nenhuma observação informada.'}`,
      { padding: 1, borderStyle: 'double', borderColor: 'cyan' }
    );

    console.log(`\n${hudCard}`);
  } catch (error) {
    console.log(chalk.red(`\n❌ [ERRO_SISTEMA] Alimento não encontrado.`));
  }
}

// 5. Deletar Alimento
async function handleDeleteFood() {
  const { id } = await inquirer.prompt([
    { type: 'input', name: 'id', message: chalk.red('▸ Informe o ID (UUID) para remoção:') }
  ]);

  try {
    await axios.delete(`${API_URL}/foods/${id}`);
    console.log(neonPink('\n🗑️ [REMOÇÃO] Alimento deletado do banco com sucesso.'));
  } catch (error) {
    console.log(chalk.red(`\n❌ [ERRO_SISTEMA] Falha ao remover o alimento.`));
  }
}

async function pauseAndReturn() {
  await inquirer.prompt([
    { type: 'input', name: 'continue', message: dimText('\n[PRESSIONE ENTER PARA VOLTAR AO MENU PRINCIPAL]') }
  ]);
  mainCLI();
}

mainCLI();