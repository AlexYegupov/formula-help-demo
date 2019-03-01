// simply global for demo purposes
let HELP;
let activeCell;


function getFunctionParamIndexUnderCursor(paramStr, cursorPosition) {
  console.log('getFunctionParamIndexUnderCursor', paramStr, cursorPosition)

  if (cursorPosition < 0 || paramStr.length < cursorPosition) return null;

  const re = RegExp(`[^,]+`,'g');
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

  return null;
}


function getFunctUnderCursor(s, cursorPosition) {
  console.log(`getFunctUnderCursor for "${s}" at ${cursorPosition}`)
  let result = null;
  const funcNames = Object.keys(HELP.funcs).join('|');
  const re = RegExp(`(${funcNames})\\((.*?)\\)`, 'g');
  let r;

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
