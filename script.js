// simply global for demo purposes
let HELP;
let activeCell;


function getFunctionParamIndexUnderCursor(paramStr, cursorPosition) {
  //console.log('getFunctionParamIndexUnderCursor', paramStr, cursorPosition)

  if (cursorPosition < 0 || paramStr.length < cursorPosition) return null;

  const re = RegExp('[^,]*', 'g')
  let r;
  let index = 0;

  while ((r = re.exec(paramStr)) !== null) {
    const rangeStart = r.index
    const rangeFinish = r.index + r[0].length

    //console.log('in', cursorPosition, rangeStart, rangeFinish)

    if (rangeStart <= cursorPosition && cursorPosition <= rangeFinish) {
      return index;
    }

    // beyond last param
    if (cursorPosition > rangeFinish) {
      return index + 1;
    }

    index++
  }

  return null;
}

// on real projects need memoize it
function getFuncNames() {
 return Object.keys(HELP.funcs)
}

function getExactFuncUnderCursor(s, cursorPosition) {
  let result = null;
  const funcNamesRe = getFuncNames().join('|');
  const re = RegExp(`(${funcNamesRe})\\(([^\\)]*)`, 'g');
  let r;

  while ((r = re.exec(s)) !== null) {
    const [foundStr, name, paramStr] = r

    const rangeStart = r.index
    const rangeFinish = r.index + foundStr.length

    //console.log(r, cursorPosition, rangeStart, rangeFinish)

    if (cursorPosition <= rangeFinish) {
      if (rangeStart <= cursorPosition) {
        const paramIndex = getFunctionParamIndexUnderCursor(
          paramStr, cursorPosition - rangeStart - name.length - 1
        )
        //console.log('paramIndex:', paramIndex)

        result = { name, paramIndex }
      }
      break;
    }
  }
  return result;
}

function getFuncCandidatesUnderCursor(s, cursorPosition) {
  const re = RegExp(`([A-Z]+)`, 'g');  // for demo used naive simplified function name regexp
  let r;

  while ((r = re.exec(s)) !== null) {
    const [foundStr, ] = r

    const rangeStart = r.index
    const rangeFinish = r.index + foundStr.length

    if (cursorPosition <= rangeFinish) {
      if (rangeStart <= cursorPosition) {
        return getFuncNames().filter( name => name.includes(foundStr) )
      }
    }
  }
  return null;
}

function setHelpHTML(helpHTML) {
  const helpElement = document.getElementById('help');
  if (helpHTML) {
    helpElement.innerHTML = helpHTML
    helpElement.style.display = 'block'
  } else {
    helpElement.style.display = 'none'
  }
}


function handleChange(e) {
  const text = activeCell.textContent.toUpperCase()
  const offset = window.getSelection().anchorOffset

  // try to display exact function help
  const exactFunc = getExactFuncUnderCursor(text, offset)
  if (exactFunc) {
    setHelpHTML(generateFunctionHelpHTML(exactFunc.name, exactFunc.paramIndex))
    return;
  }

  // try to display function name candidates help
  const funcCandidates = getFuncCandidatesUnderCursor(text, offset)
  if (funcCandidates) {
    setHelpHTML(generateFunctionCandidatesListHTML(funcCandidates))
    return;
  }

  setHelpHTML(null)
}

// note: alternatively can implement via createElement etc (on real projects consider speed, simplicity, etc)
function generateFunctionHelpHTML(name, paramIndex) {
  const funcHelp = HELP.funcs[name]
  const paramsHelp = funcHelp.params

  const paramsHTML =
    paramsHelp.map(
      (p, i) => (paramIndex === i ? `<span class="highlight">${p.name}</span>` : p.name)
    ).join(', ')

  // no DRY
  const exampleParamsHTML =
    paramsHelp.map(
      (p, i) => (paramIndex === i ? `<span class="highlight">${p.example}</span>` : p.example)
    ).join(', ')

  const paramsListItemsHTML = paramsHelp.map(
    (p, i) => `
      <li class="${paramIndex === i ? 'active' : ''}">
        <div class="grayTitle">${p.name}</div>
        <div>
          ${p.info}
        </div>
      </li>
    `).join('')

  const r = `
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

function generateFunctionCandidatesListHTML(candidates) {

  const candidatesHTML = candidates.map( name => `
      <li>
        <span class="formula-font">${name} - ${HELP.funcs[name].info})</span>
      </li>
      `).join('')

  const r = `
    <ul>
      ${candidatesHTML}
    </ul>
  `

  return r;
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


window.onload = function () {
  setActiveCell(document.getElementById('cell'))

  // note: consider no need polyfill for fetch
  fetch('data.json')
    .then(function(response) {
      // NOTE: in real projects check errors here
      return response.json();
    })
    .then(function(data) {
      HELP = data
    })
    .catch( alert ); // on real project need mature error checking

}
