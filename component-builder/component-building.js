// create an index.js file where you import everything then just have one import here
import { buttonJSON } from './buttons.js'

// eventually this will depend on the component selected, for now only buttonJSON
const componentJSON = buttonJSON

// have 2 attributes - name and type
const features = componentJSON.filter(key => key.feature)
const styles = componentJSON.filter(key => key.style)
const states = componentJSON.filter(key => key.state)

let componentNameHTML = document.getElementById('componentName')
componentNameHTML.innerText = componentJSON[0].componentName


const buildPropertyControls = (properties) => {
  const propertyHTML = properties.map((property) => {

    if (!property.properties[0].label) {
      const propertyName = Object.values(property)[0]
      const selectors = JSON.stringify(property.properties[0].selectorValues)

      const switchHTML = `<div class="flex-between" style="height: 40px">
            <p class="text-small text-secondary font-weight-medium mb-0 ml-2">${propertyName}</p>
            <div class="custom-control custom-switch">
              <input type="checkbox" class="custom-control-input" id="property-${propertyName}" data-selector-values="${encodeURI(selectors)}" onchange="getControlValues()">
              <label class="custom-control-label" for="property-${propertyName}"></label>
            </div>
          </div>`

      return switchHTML

    } else {
      const propertyName = Object.values(property)[0]

      const selectOptions = property.properties.map((property) => {
        return `<option value="${property.label}" data-value="${encodeURI(JSON.stringify(property.selectorValues))}" ${('default' in property) ? "selected" : ""}>${property.label}</option>`
      }).join("")

      const selectInput = `<select class="form-control text-right" style="background-color: unset"  id="property-${propertyName}" onchange="getControlValues()">
            ${selectOptions}
        </select>`

      const selectHTML = `<article class="flex-between" style="height: 40px">
            <div class="input-group">
              <div class="input-group-prepend input-group-merged">
                <span class="text-secondary font-weight-medium text-small">${propertyName}</span>
              </div>
              ${selectInput}
            </div>
          </article>`

      return selectHTML

    }
  }).join("")

  return propertyHTML
}


let featureControls = document.getElementById('featureControls')
let styleControls = document.getElementById('styleControls')
let stateControls = document.getElementById('stateControls')
console.log(stateControls)

if (styles.length !== 0) { styleControls.innerHTML = buildPropertyControls(styles) }
if (features.length !== 0) { featureControls.innerHTML = buildPropertyControls(features) }
if (states.length !== 0) { stateControls.innerHTML = buildPropertyControls(states) }

// ["featureControls", "styleControls", "stateControls"].forEach(control => {
//   if (control.length !== 0) { control.innerHTML = buildPropertyControls(styles) }
// })

window.getControlValues = function () {

  let controlsObject = []

  const defaultHTML = componentJSON[1].defaultHTML

  const defaultSelectorsOrigin = componentJSON[2].selectors
  const defaultSelectors = { ...defaultSelectorsOrigin }


  const loadedControls = document.querySelectorAll(`[id^="property-"]`)

  // this function gets all of the controls/values and decodes/puts them into a string
  loadedControls.forEach(control => {
    if (control.tagName == 'SELECT') {
      controlsObject.push(decodeURI(control.options[control.selectedIndex].dataset.value))

    } else if (control.checked == true) {
      controlsObject.push(decodeURI(control.dataset.selectorValues))
    }
  })


  //not sure how this works but this reduce function formats the JSON correctly from the last function
  const selectorsFromControls = controlsObject.reduce((obj, json) => {
    Object.assign(obj, JSON.parse(json));
    return obj;
  }, {});


  const selectorsOrigin = Object.assign(defaultSelectors, selectorsFromControls)
  const selectors = { ...selectorsOrigin }

  // This function recursivley replaces the template strings, as some templates might have nested sections
  function buildPreviewHTML(string) {
    var matched = false;
    string = string.replace(/\$\{(.*?)\}/g, function (match, key) {
      if (match) {
        matched = true;
      }
      const sl = selectors[key]
      delete selectors[key]

      return sl
    });
    if (matched) {
      string = buildPreviewHTML(string);
    }
    return string;
  }

  let previewContainer = document.getElementById('previewContainer')
  previewContainer.innerHTML = buildPreviewHTML(defaultHTML)
}

getControlValues()
