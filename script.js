console.log('script.js says hello world')

const checkingAccountSelector = document.getElementById('checkingAccountSelector')
const savingsAccountSelector = document.getElementById('savingsAccountSelector')
const checkingTransactionArea = document.getElementById('checkingTransactions')
const savingsTransactionArea = document.getElementById('savingsTransactions')

checkingAccountSelector.addEventListener('click', () => {
  console.log('clicked checking account button')
  savingsTransactionArea.style.display = 'none'
  checkingTransactionArea.style.display = 'block'
})

savingsAccountSelector.addEventListener('click', () => {
  console.log('clicked savings account button')
  checkingTransactionArea.style.display = 'none'
  savingsTransactionArea.style.display = 'block'
})
