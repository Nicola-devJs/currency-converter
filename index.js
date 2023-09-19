const KEY_API = 'ff4252d85b56ba7adc8c4312'
const currencies = ['MDL', 'USD', 'RUB', 'EUR']
const $currency = document.getElementById('currency')
const $input = $currency.querySelector('[data-type="input"]')
const $button = $currency.querySelector('[data-type="submit"]')
const $rate = $currency.querySelector('#rate')

// Model data response API
const data_currency = {
   base: 'USD',
   target: 'RUB',
   conversion_rate: 0,
}

async function gettingResponse(base, target) {
   try {
      const response = await fetch(
         `https://v6.exchangerate-api.com/v6/${KEY_API}/pair/${base || 'USD'}/${
            target || 'RUB'
         }`
      )

      const data = await response.json()
      return data
   } catch (e) {
      throw new Error(`Запрос не произведен ${e.message}`)
   }
}

function createNode(node, ...classes) {
   const $el = document.createElement(node)
   $el.classList.add(...classes)
   return $el
}

function getHtmlFlag(selected = '') {
   selected = selected ? true : false

   return function (name) {
      const nameFlag = name.substring(0, name.length - 1)

      return `<img src="https://countryflagicons.com/FLAT/64/${nameFlag}.png" data-value="${name}" data-selected="${selected}" alt="${name}" />`
   }
}

function unselectedCurrencies(base_currency) {
   return function (item) {
      return base_currency !== item
   }
}

function getExchangeRate() {
   const amount = $input.value || 1
   const resultConversion = (amount * data_currency.conversion_rate).toFixed(2)

   $rate.textContent = `${amount} ${data_currency.base} = ${resultConversion} ${data_currency.target}`
}

async function render() {
   const data = await gettingResponse(data_currency.base, data_currency.target)
   data_currency.conversion_rate = data.conversion_rate

   getExchangeRate()
   templateSelect('.from')
   templateSelect('.to')
}

function templateSelect(selector) {
   const select = $currency.querySelector(selector)
   const nameCurrency =
      select.dataset.select === 'from'
         ? data_currency.base
         : data_currency.target
   select.innerHTML = ''

   const selectCurrency = createNode('div', 'select-currency')
   const nameCurrencyHTML = `<span class="name-currency">${nameCurrency}</span>`
   selectCurrency.append(templateSelectFlagCurrency(select.dataset.select))
   selectCurrency.insertAdjacentHTML('beforeend', nameCurrencyHTML)

   select.insertAdjacentElement('beforeend', selectCurrency)
}

function templateSelectFlagCurrency(select) {
   const selectFlagCurrency = createNode('span', 'flag-currency')
   const flagsCurrency = templateFlagsCurrency(select)
   selectFlagCurrency.append(flagsCurrency)

   if (select === 'from') {
      const html = getHtmlFlag(true)(data_currency.base)

      selectFlagCurrency.insertAdjacentHTML('beforeend', html)
   }
   if (select === 'to') {
      const html = getHtmlFlag(true)(data_currency.target)
      selectFlagCurrency.insertAdjacentHTML('afterbegin', html)
   }

   return selectFlagCurrency
}

function templateFlagsCurrency(select) {
   const classes = select === 'from' ? 'left' : 'right'
   const currency =
      select === 'from' ? data_currency.base : data_currency.target

   const flagsCurrency = createNode('span', 'container__flags', classes)

   const html = currencies
      .filter(unselectedCurrencies(currency))
      .map(getHtmlFlag(false))
      .join('')
   flagsCurrency.innerHTML = html

   return flagsCurrency
}

function getExchangeRateHandle(event) {
   const data = event.target.dataset
   const select = event.target.closest('.select')

   let baseCurrency = data_currency.base
   let targetCurrency = data_currency.target

   if (data.selected === 'false' && select.dataset.select === 'from') {
      data_currency.base = data.value
      if (data_currency.base === data_currency.target) {
         data_currency.base = baseCurrency
         return
      }
      render()
   } else if (data.selected === 'false' && select.dataset.select === 'to') {
      data_currency.target = data.value
      if (data_currency.target === data_currency.base) {
         data_currency.target = targetCurrency
         return
      }
      render()
   } else if (data.type === 'redefine') {
      data_currency.base = targetCurrency
      data_currency.target = baseCurrency
      render()
   } else if (data.type === 'submit') {
      getExchangeRate()
   }
}

function init() {
   render()
   $currency.addEventListener('click', getExchangeRateHandle)
   $input.addEventListener('input', getExchangeRate)
}

init()
