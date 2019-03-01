// TODO: get via ajax
let HELP = {
  funcs: {
    SUM: {
      info: 'Returns the sum of a series of numbers and/or cells.',
      params: [
        {name: 'value1',
         example: 'A2:A100',
         info: 'The first number or range to add together.'
        },
        {name: '[value2, ...]',
         example: '101',
         info: "Additional numbers or ranges to add to 'value1'.",
         repeatable: true,
         optional: true,
        },

      ]
    },
    MINUS: {
      info: "Returns the difference of two numbers. Equivalent to the '-' operator.",
      params: [
        {name: 'value1',
         example: '8',
         info: 'The minuend, or number to be subtracted from.'
        },
        {name: 'value2',
         example: '3',
         info: "The subtrahend, or number to subtract from 'value1'.",
        },

      ]
    },
    MULTIPLY: {
      info: "Returns the product of two numbers. Equivalent to the '*' operator.",
      params: [
        {name: 'factor1',
         example: '6',
         info: "The first multiplicand.",
        },
        {name: 'factor2',
         example: '7',
         info: "The second multiplicand.",
        },
      ]
    },
    DIVIDE: {
      info: "Returns one number divided by another. Equivalent to the '/' operator.",
      params: [
        {name: 'dividend',
         example: '4',
         info: 'The number to be divided.',
        },
        {name: 'divisor',
         example: '2',
         info: "The number to divide by.",
        },
      ]
    },
  }
}

let funcNames = Object.keys(HELP.funcs).join('|');


function getFunctionParamIndexUnderCursor(paramStr, cursorPosition) {
  console.log('getFunctionParamIndexUnderCursor', paramStr, cursorPosition)

  if (cursorPosition < 0 || paramStr.length < cursorPosition) return null;

  let re = RegExp(`[^,]+`,'g');
  let r;
  let index = 0;

  while ((r = re.exec(paramStr)) !== null) {
    const rangeStart = r.index
    const rangeFinish = r.index + r[0].length

    //console.log('>>',r, rangeStart, '..' ,rangeFinish)
    if (rangeStart <= cursorPosition && cursorPosition <= rangeFinish) {
      return index;
    }
    index++
  }

  return null; //
}


function getFunctUnderCursor(s, cursorPosition) {
  console.log(`getFunctUnderCursor for "${s}" at ${cursorPosition}`)
  let result = null;
  var re = RegExp(`(${funcNames})\\((.+?)\\)`,'g');
  var r;

  while ((r = re.exec(s)) !== null) {
    const [foundStr, name, paramStr] = r

     // naively extract params (in real project mature grammar parser will be used anyway)
    //const params = paramStr.split(',').map(str => str.trim()).filter(Boolean)

    const rangeStart = r.index
    const rangeFinish = r.index + foundStr.length

    console.log(`Found "${foundStr}" at ${rangeStart}..${rangeFinish}. Next starts at ${re.lastIndex}.`);
    console.log(r)
    //console.log(name, paramStr)
    //console.log(`${cursorPosition} -> ${rangeStart}..${rangeFinish}`)

    if (cursorPosition < rangeFinish) {
      if (rangeStart < cursorPosition) {
        const paramIndex = getFunctionParamIndexUnderCursor(
          paramStr, cursorPosition - rangeStart - name.length - 1
        )
        result = { name, paramIndex }
      }
      break;
    }
  }
  return result;
}


// global
let activeCell;

function handleChange(e) {
  //console.log('handleChange', e)

  const func = getFunctUnderCursor(activeCell.textContent, window.getSelection().anchorOffset)

  const helpElement = document.getElementById('help');
  if (func) {
    helpElement.innerHTML = generateFunctionHelpHTML(func.name, func.paramIndex)
    helpElement.style.display = 'block'
  } else {
    helpElement.style.display = 'none'
  }
}

// note: alternatively can implement via createElement etc (on real projects consider speed, simplicity, etc)
function generateFunctionHelpHTML(name, paramIndex) {
  //return `${name}  <b>${paramIndex}</b>`

  const funcHelp = HELP.funcs[name]
  const paramsHelp = funcHelp.params

  let paramsHTML =
    paramsHelp.map(
      (p, i) => (paramIndex === i ? `<span class="highlight">${p.name}</span>` : p.name)
    ).join(', ')

  // no DRY
  let exampleParamsHTML =
    paramsHelp.map(
      (p, i) => (paramIndex === i ? `<span class="highlight">${p.example}</span>` : p.example)
    ).join(', ')

  let paramsListItemsHTML = paramsHelp.map(
    (p, i) => `
      <li class="${paramIndex === i ? 'active' : ''}">
        <div class="grayTitle">${p.name}</div>
        <div>
          ${p.info}
        </div>
      </li>
    `).join('')

  let r = `
  <div class="title formula-font">${name}(${paramsHTML})</div>
    <ul>
      <li>
        <div class="grayTitle">Example</div>
        <span class="formula-font">${name}(${exampleParamsHTML})</span>
      </li>
      <li>
        <div class="grayTitle">Summary</div>
        <div>
          ${funcHelp.info}
        </div>
      </li>

      ${paramsListItemsHTML}

      <li>
        <a href="#">Learn more about ${name}</a>
      </li>
    </ul>
  `

  return r
}

function setActiveCell(el) {
  activeCell = el

  // process all events of text or cursor position change
  activeCell.addEventListener('focus', handleChange, false);
  activeCell.addEventListener('mouseup', handleChange, false);
  activeCell.addEventListener('keyup', handleChange, false);
  //activeCell.addEventListener('input', handleChange, false);  // not handles cursor change position
  activeCell.addEventListener('paste', handleChange, false);
}

setActiveCell(document.getElementById("cell"))
