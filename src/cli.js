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

// Estilo de Tabela Customizado (Bordas Slim e Minimalistas)
const cyberpunkTableChars = {
  'top': '─', 'top-mid': '┬', 'top-left': '┌', 'top-right': '┐',
  'bottom': '─', 'bottom-mid': '┴', 'bottom-left': '└', 'bottom-right': '┘',
  'left': '│', 'left-mid': '├', 'mid': '─', 'mid-mid': '┼',
  'right': '│', 'right-mid': '┤', 'middle': '│'
};

async function mainCLI() {
  console.clear();

  const titleText = cyberpunkGradient.multiline(
    ` ⚡ AYURVEDA // SYSTEM CLI v2.0 ⚡ \n` +
    `   [ PROTOCOL: GROQ / PRISMA / PG ] `
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
      message: neonCyan('⚡ // SELECIONAR OPERAÇÃO:'),
      choices: [
        { name: `${neonPink('🤖 [LLM]')} Consulta Matriz Ayurveda (AI)`, value: 'ayurveda' },
        { name: `${neonCyan('📋 [DATA]')} Listar Alimentos do Banco`, value: 'list_foods' },
        { name: `${neonGreen('➕ [POST]')} Injetar Novo Alimento`, value: 'create_food' },
        { name: `${neonYellow('🔍 [FIND]')} Buscar por UUID`, value: 'get_food' },
        { name: `${chalk.red('❌ [DEL] ')} Deletar Alimento`, value: 'delete_food' },
        { name: `${darkSlate('🚪 [EXIT]')} Desconectar`, value: 'exit' }
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
      console.log(neonPink('\n⚡ // SYSTEM SHUTDOWN. Até logo.\n'));
      process.exit(0);
  }

  await pauseAndReturn();
}

// 1. LLM Query - Estilo HUD Cyberpunk
async function handleAyurvedaLLM() {
  const answers = await inquirer.prompt([
    {
      type: 'select',
      name: 'season',
      message: neonCyan('▸ Estação do Ano:'),
      choices: ['SUMMER', 'WINTER', 'SPRING', 'AUTUMN', 'MONSOON']
    },
    {
      type: 'select',
      name: 'dosha',
      message: neonPink('▸ Dosha Alvo:'),
      choices: ['VATA', 'PITTA', 'KAPHA']
    }
  ]);

  console.log(dimText('\n[SYS_LOG] Conectando ao cluster Groq AI...'));

  try {
    const response = await axios.get(`${API_URL}/ayurveda/recommendations`, {
      params: answers
    });

    const recommendations = response.data?.recommendations || [];

    if (recommendations.length === 0) {
      console.log(neonYellow('\n⚠️ [EMPTY] Nenhuma recomendação processada.'));
      return;
    }

    console.log(`\n${cyberpunkGradient(`  ▸ MATRIZ DE RECOMENDAÇÕES [${answers.season} // ${answers.dosha}]`)}\n`);

    const table = new Table({
      head: [
        neonCyan('NOME'),
        neonPink('TIPO'),
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
    console.log(chalk.red(`\n❌ [SYS_ERR] ${error.response?.data?.error || error.message}`));
  }
}

// 2. Tabela de Alimentos Clean Cyberpunk
async function handleListFoods() {
  try {
    const response = await axios.get(`${API_URL}/foods`);
    const foods = response.data;

    if (!foods || foods.length === 0) {
      console.log(neonYellow('\n⚠️ [EMPTY] Nenhum registro encontrado no banco.'));
      return;
    }

    console.log(`\n${cyberpunkGradient('  ▸ BANCO DE DADOS // ALIMENTOS REGISTRADOS')}\n`);

    const table = new Table({
      head: [
        neonCyan('UUID'),
        neonPink('NOME'),
        neonGreen('CATEGORIA'),
        neonYellow('ESTAÇÃO'),
        chalk.hex('#7928CA')('DOSHAS')
      ],
      chars: cyberpunkTableChars,
      colWidths: [38, 16, 14, 12, 16]
    });

    foods.forEach((food) => {
      table.push([
        dimText(food.id),
        chalk.bold.white(food.name),
        food.category === 'FRUIT' ? neonPink(food.category) : neonCyan(food.category),
        neonYellow(food.season),
        neonGreen(food.pacifies ? food.pacifies.join(' · ') : '—')
      ]);
    });

    console.log(table.toString());
  } catch (error) {
    console.log(chalk.red(`\n❌ [SYS_ERR] ${error.message}`));
  }
}

// 3. Form Injeção de Dados
async function handleCreateFood() {
  const foodData = await inquirer.prompt([
    { type: 'input', name: 'name', message: neonCyan('▸ Nome:') },
    { type: 'select', name: 'category', message: neonPink('▸ Categoria:'), choices: ['FRUIT', 'VEGETABLE'] },
    { type: 'select', name: 'season', message: neonYellow('▸ Estação:'), choices: ['SUMMER', 'WINTER', 'SPRING', 'AUTUMN', 'MONSOON'] },
    { type: 'checkbox', name: 'pacifies', message: neonGreen('▸ Doshas Pacificados:'), choices: ['VATA', 'PITTA', 'KAPHA'] },
    { type: 'input', name: 'description', message: dimText('▸ Descrição/Observações:') }
  ]);

  try {
    const response = await axios.post(`${API_URL}/foods`, foodData);

    const card = boxen(
      `${neonGreen('✔ INJEÇÃO DE DADOS CONCLUÍDA')}\n\n` +
      `${dimText('ID:')} ${response.data.id}\n` +
      `${neonCyan('NOME:')} ${response.data.name}\n` +
      `${neonPink('TIPO:')} ${response.data.category}`,
      { padding: 1, borderStyle: 'round', borderColor: 'green' }
    );

    console.log(`\n${card}`);
  } catch (error) {
    console.log(chalk.red(`\n❌ [SYS_ERR] ${error.response?.data?.error || error.message}`));
  }
}

// 4. Detalhe do Item em Painel HUD
async function handleGetFoodById() {
  const { id } = await inquirer.prompt([
    { type: 'input', name: 'id', message: neonCyan('▸ Informe o UUID:') }
  ]);

  try {
    const response = await axios.get(`${API_URL}/foods/${id}`);
    const food = response.data;

    const hudCard = boxen(
      `${cyberpunkGradient('❖ REGISTRO ENCONTRADO')}\n\n` +
      `${dimText('UUID:')}        ${food.id}\n` +
      `${neonPink('NOME:')}        ${food.name.toUpperCase()}\n` +
      `${neonCyan('CATEGORIA:')}   ${food.category}\n` +
      `${neonYellow('ESTAÇÃO:')}     ${food.season}\n` +
      `${neonGreen('DOSHAS:')}      ${food.pacifies.join(' · ')}\n\n` +
      `${chalk.gray('DESCRIÇÃO:')}  ${food.description || 'Nenhuma observação informada.'}`,
      { padding: 1, borderStyle: 'double', borderColor: 'cyan' }
    );

    console.log(`\n${hudCard}`);
  } catch (error) {
    console.log(chalk.red(`\n❌ [SYS_ERR] Registro não localizado.`));
  }
}

// 5. Deletar Alimento
async function handleDeleteFood() {
  const { id } = await inquirer.prompt([
    { type: 'input', name: 'id', message: chalk.red('▸ UUID para purga:') }
  ]);

  try {
    await axios.delete(`${API_URL}/foods/${id}`);
    console.log(neonPink('\n🗑️ [PURGE] Registro removido com sucesso.'));
  } catch (error) {
    console.log(chalk.red(`\n❌ [SYS_ERR] Falha ao remover registro.`));
  }
}

async function pauseAndReturn() {
  await inquirer.prompt([
    { type: 'input', name: 'continue', message: dimText('\n[PRESSIONE ENTER PARA RETORNAR AO MENU MAIN]') }
  ]);
  mainCLI();
}

mainCLI();