import * as fs from 'fs'

import { Page, Locator } from 'playwright'

export { expandTopic } from './expandTopic'

let fast = false
export function setFast() {
  fast = true
}

export function sleep(ms: number, required = false) {
  return new Promise(resolve => {
    if (required) {
      setTimeout(resolve, ms)
    } else {
      setTimeout(resolve, fast ? 0 : ms)
    }
  })
}

export async function writeText(text: string, element: Locator, delay = 0) {
  return element.fill(text)
  if (fast) {
    return element.fill(text)
  }

  for (const c of text.split('')) {
    await element.press(c)
    await sleep(delay)
  }
}

export async function deleteTextWithBackspaces(element: Locator, delay = 0, count = 0) {
  // @ts-ignore
  const length = count > 0 ? count : (await element.textContent()).length
  for (let i = 0; i < length; i += 1) {
    await element.press('Backspace')
    await sleep(delay)
  }
}

export async function setInputText(input: Locator, text: string, browser: Page) {
  await clickOn(input, 1)
  await deleteTextWithBackspaces(input)
  await input.fill(text)
}

export async function setTextInInput(name: string, text: string, browser: Page) {
  const input = await browser.locator(`//label[contains(text(), "${name}")]/..//input`)
  await clickOn(input, 1)
  await browser.locator(`//label[contains(text(), "${name}")]/..//input`)

  await deleteTextWithBackspaces(input)
  await input.fill(text)
}

export async function moveToCenterOfElement(element: Locator, browser: Page) {
  // @ts-ignore
  const { x, y } = element
  // @ts-ignore
  const { width, height } = element

  const targetX = x + width / 2
  const targetY = y + height / 2

  const duration = fast ? 1 : 500

  const js = `window.demo.moveMouse(${targetX}, ${targetY}, ${duration});`
  await runJavascript(js, browser)
  await sleep(duration)
  await sleep(250, true)
}

export async function runJavascript(js: string, browser: Page) {
  await browser.evaluate(_js => eval(_js), js)
}

export async function clickOnHistory(browser: Page) {
  const messageHistory = await browser.locator('//span/*[contains(text(), "History")]').first()
  await clickOn(messageHistory)
}

export async function clickOn(element: Locator, clicks = 1, force = false) {
  await moveToCenterOfElement(element, element.page())
  for (let i = 0; i < clicks; i += 1) {
    if (force) {
      await element.dispatchEvent('click')
    } else {
      await element.click()
    }

    await sleep(50)
  }
}

export async function createFakeMousePointer(browser: Page) {
  const js = 'window.demo.enableMouse();'

  await runJavascript(js, browser)
}

export async function showText(
  text: string,
  duration: number = 0,
  browser: Page,
  location: 'top' | 'bottom' | 'middle' = 'bottom',
  keys = []
) {
  const js = `window.demo.showMessage('${text}', '${location}', ${duration});`

  await runJavascript(js, browser)
}

type HeapDump = any

export async function getHeapDump(browser: Page): Promise<HeapDump> {
  const filename = 'heapdump.json'
  const js = `window.demo.writeHeapdump('${filename}');`
  await runJavascript(js, browser)
  const buffer = fs.readFileSync(filename)
  fs.unlinkSync(filename)

  return JSON.parse(buffer.toString())
}

export enum ClassNameMapping {
  TreeNode = 'TreeNode_TreeNode',
  TreeNodeComponent = 'TreeNode_TreeNodeComponent',
  Tree = 'Tree_Tree',
}

export async function countInstancesOf(heapDump: HeapDump, className: ClassNameMapping): Promise<number> {
  return heapDump.nodes.map((idx: number) => heapDump.strings[idx]).filter((s: string) => s === className).length
}

export async function showKeys(
  text: string,
  duration: number = 0,
  browser: Page,
  location: 'top' | 'bottom' | 'middle' = 'bottom',
  keys: Array<string> = []
) {
  const js = `window.demo.showMessage('${text}', '${location}', ${duration}, ${JSON.stringify(keys)});`

  await runJavascript(js, browser)
}

export async function hideText(browser: Page) {
  const js = 'window.demo.hideMessage();'
  await runJavascript(js, browser)
  await sleep(600)
}
