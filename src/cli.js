import axios from 'axios';
import inquirer from 'inquirer';
import chalk from 'chalk';
import Table from 'cli-table3';
import boxen from 'boxen';

const API_URL = 'http://localhost:3000/api';

async function mainCLI() {
  console.clear();

  const titleBox = boxen(
    `${chalk.bold.green('🌿 AYURVEDA FRUITS & VEGGIES API')}\n${chalk.dim('Interface Interativa de Terminal')}`,
    {
      padding: 1,
      margin: { top: 1, bottom: 1 },
      borderStyle: 'round',
      borderColor: 'green',
      textAlignment: 'center'
    }
  );

  console.log(titleBox);

  const { action } = await inquirer.prompt([
    {
      type: 'select',
      name: 'action',
      message: 'O que deseja consultar ou testar?',
      choices: [
        { name: '🤖 Consultar LLM (Recomendações Ayurveda)', value: 'ayurveda' },
        { name: '📋 Listar Alimentos Cadastrados', value: 'list_foods' },
        { name: '➕ Cadastrar Novo Alimento', value: 'create_food' },
        { name: '🔍 Buscar Alimento por ID', value: 'get_food' },
        { name: '❌ Deletar Alimento', value: 'delete_food' },
        { name: '🚪 Sair', value: 'exit' }
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
      console.log(chalk.yellow('\n👋 Encerrando CLI... Até mais!\n'));
      process.exit(0);
  }

  await pauseAndReturn();
}

// 1. Visualização Clean da LLM
async function handleAyurvedaLLM() {
  const answers = await inquirer.prompt([
    {
      type: 'select',
      name: 'season',
      message: 'Selecione a Estação:',
      choices: ['SUMMER', 'WINTER', 'SPRING', 'AUTUMN', 'MONSOON']
    },
    {
      type: 'select',
      name: 'dosha',
      message: 'Selecione o Dosha:',
      choices: ['VATA', 'PITTA', 'KAPHA']
    }
  ]);

  console.log(chalk.cyan('\n⏳ Solicitando recomendações à LLM Groq...'));

  try {
    const response = await axios.get(`${API_URL}/ayurveda/recommendations`, {
      params: answers
    });

    const recommendations = response.data?.recommendations || [];

    if (recommendations.length === 0) {
      console.log(chalk.yellow('\n⚠️ Nenhuma recomendação retornada.'));
      return;
    }

    console.log(`\n${chalk.bold.magenta(`✨ RECOMENDAÇÕES AYURVEDA — [${answers.season} / ${answers.dosha}]`)}\n`);

    const table = new Table({
      head: [
        chalk.bold.cyan('Nome'),
        chalk.bold.cyan('Categoria'),
        chalk.bold.cyan('Justificativa Ayurveda')
      ],
      colWidths: [20, 15, 55],
      wordWrap: true
    });

    recommendations.forEach((item) => {
      const categoryTag =
        item.category === 'FRUIT'
          ? chalk.bgMagenta.white(' 🍎 FRUTA ')
          : chalk.bgGreen.black(' 🥦 LEGUME ');

      table.push([
        chalk.bold.white(item.name),
        categoryTag,
        chalk.gray(item.reason)
      ]);
    });

    console.log(table.toString());
  } catch (error) {
    console.log(chalk.red(`\n❌ Erro: ${error.response?.data?.error || error.message}`));
  }
}

// 2. Visualização Clean da Tabela de Alimentos
async function handleListFoods() {
  try {
    const response = await axios.get(`${API_URL}/foods`);
    const foods = response.data;

    if (!foods || foods.length === 0) {
      console.log(chalk.yellow('\n⚠️ Nenhum alimento cadastrado no banco de dados.'));
      return;
    }

    console.log(`\n${chalk.bold.green('📋 ALIMENTOS CADASTRADOS NO BANCO')}\n`);

    const table = new Table({
      head: [
        chalk.bold.cyan('ID'),
        chalk.bold.cyan('Nome'),
        chalk.bold.cyan('Categoria'),
        chalk.bold.cyan('Estação'),
        chalk.bold.cyan('Doshas')
      ],
      colWidths: [38, 18, 14, 12, 18]
    });

    foods.forEach((food) => {
      table.push([
        chalk.dim(food.id),
        chalk.bold.white(food.name),
        food.category,
        chalk.yellow(food.season),
        chalk.blue(food.pacifies ? food.pacifies.join(', ') : '—')
      ]);
    });

    console.log(table.toString());
  } catch (error) {
    console.log(chalk.red(`\n❌ Erro ao listar: ${error.message}`));
  }
}

// 3. Cadastrar Alimento
async function handleCreateFood() {
  const foodData = await inquirer.prompt([
    { type: 'input', name: 'name', message: 'Nome do Alimento:' },
    { type: 'select', name: 'category', message: 'Categoria:', choices: ['FRUIT', 'VEGETABLE'] },
    { type: 'select', name: 'season', message: 'Estação:', choices: ['SUMMER', 'WINTER', 'SPRING', 'AUTUMN', 'MONSOON'] },
    { type: 'checkbox', name: 'pacifies', message: 'Pacificadores (Doshas):', choices: ['VATA', 'PITTA', 'KAPHA'] },
    { type: 'input', name: 'description', message: 'Descrição breve:' }
  ]);

  try {
    const response = await axios.post(`${API_URL}/foods`, foodData);

    const successCard = boxen(
      `${chalk.bold.green('✅ Alimento Cadastrado com Sucesso!')}\n\n` +
      `${chalk.bold('ID:')} ${response.data.id}\n` +
      `${chalk.bold('Nome:')} ${response.data.name}\n` +
      `${chalk.bold('Categoria:')} ${response.data.category}`,
      { padding: 1, borderStyle: 'single', borderColor: 'green' }
    );

    console.log(`\n${successCard}`);
  } catch (error) {
    console.log(chalk.red(`\n❌ Erro ao cadastrar: ${error.response?.data?.error || error.message}`));
  }
}

// 4. Buscar Alimento por ID em Painel
async function handleGetFoodById() {
  const { id } = await inquirer.prompt([
    { type: 'input', name: 'id', message: 'Informe o ID (UUID) do alimento:' }
  ]);

  try {
    const response = await axios.get(`${API_URL}/foods/${id}`);
    const food = response.data;

    const detailCard = boxen(
      `${chalk.bold.cyan('🔍 DETALHES DO ALIMENTO')}\n\n` +
      `${chalk.bold('ID:')} ${chalk.dim(food.id)}\n` +
      `${chalk.bold('Nome:')} ${chalk.bold.white(food.name)}\n` +
      `${chalk.bold('Categoria:')} ${food.category}\n` +
      `${chalk.bold('Estação:')} ${chalk.yellow(food.season)}\n` +
      `${chalk.bold('Pacificadores:')} ${chalk.blue(food.pacifies.join(', '))}\n` +
      `${chalk.bold('Descrição:')} ${food.description || 'Sem descrição.'}`,
      { padding: 1, borderStyle: 'round', borderColor: 'cyan' }
    );

    console.log(`\n${detailCard}`);
  } catch (error) {
    console.log(chalk.red(`\n❌ Erro: ${error.response?.data?.error || 'Alimento não encontrado'}`));
  }
}

// 5. Deletar Alimento
async function handleDeleteFood() {
  const { id } = await inquirer.prompt([
    { type: 'input', name: 'id', message: 'Informe o ID (UUID) do alimento para deletar:' }
  ]);

  try {
    await axios.delete(`${API_URL}/foods/${id}`);
    console.log(chalk.bold.green('\n🗑️ Alimento removido do banco com sucesso!'));
  } catch (error) {
    console.log(chalk.red(`\n❌ Erro ao remover: ${error.response?.data?.error || error.message}`));
  }
}

async function pauseAndReturn() {
  await inquirer.prompt([
    { type: 'input', name: 'continue', message: `\n${chalk.dim('Pressione ENTER para retornar ao menu...')}` }
  ]);
  mainCLI();
}

mainCLI();