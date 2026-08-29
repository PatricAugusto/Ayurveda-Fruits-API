import axios from 'axios';
import inquirer from 'inquirer';
import chalk from 'chalk';

const API_URL = 'http://localhost:3000/api';

async function mainCLI() {
  console.clear();
  console.log(chalk.bold.cyan('==========================================='));
  console.log(chalk.bold.cyan('   🌿 AYURVEDA FRUITS & VEGGIES API CLI   '));
  console.log(chalk.bold.cyan('===========================================\n'));

  const { action } = await inquirer.prompt([
    {
      type: 'select',
      name: 'action',
      message: 'Escolha uma ação para testar a API:',
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
      console.log(chalk.yellow('\nEncerrando CLI... Até mais!\n'));
      process.exit(0);
  }

  await pauseAndReturn();
}

// 1. Consulta à LLM
async function handleAyurvedaLLM() {
  const answers = await inquirer.prompt([
    {
      type: 'select',
      name: 'season',
      message: 'Selecione a estação:',
      choices: ['SUMMER', 'WINTER', 'SPRING', 'AUTUMN', 'MONSOON']
    },
    {
      type: 'select',
      name: 'dosha',
      message: 'Selecione o Dosha:',
      choices: ['VATA', 'PITTA', 'KAPHA']
    }
  ]);

  console.log(chalk.blue('\n⏳ Solicitando recomendações à LLM Groq...'));

  try {
    const response = await axios.get(`${API_URL}/ayurveda/recommendations`, {
      params: answers
    });

    console.log(chalk.bold.green('\n✅ Resposta da LLM (Ayurveda):'));
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log(chalk.red(`\n❌ Erro: ${error.response?.data?.error || error.message}`));
  }
}

// 2. Listar Alimentos
async function handleListFoods() {
  try {
    const response = await axios.get(`${API_URL}/foods`);
    console.log(chalk.bold.green('\n✅ Alimentos Cadastrados no Banco:'));
    console.table(response.data);
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
    console.log(chalk.bold.green('\n✅ Alimento cadastrado com sucesso!'));
    console.log(response.data);
  } catch (error) {
    console.log(chalk.red(`\n❌ Erro ao cadastrar: ${error.response?.data?.error || error.message}`));
  }
}

// 4. Buscar Alimento por ID
async function handleGetFoodById() {
  const { id } = await inquirer.prompt([
    { type: 'input', name: 'id', message: 'Informe o ID (UUID) do alimento:' }
  ]);

  try {
    const response = await axios.get(`${API_URL}/foods/${id}`);
    console.log(chalk.bold.green('\n✅ Dados do Alimento:'));
    console.log(response.data);
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
    console.log(chalk.bold.green('\n✅ Alimento removido com sucesso!'));
  } catch (error) {
    console.log(chalk.red(`\n❌ Erro ao remover: ${error.response?.data?.error || error.message}`));
  }
}

async function pauseAndReturn() {
  await inquirer.prompt([
    { type: 'input', name: 'continue', message: '\nPressione ENTER para voltar ao menu principal...' }
  ]);
  mainCLI();
}

mainCLI();