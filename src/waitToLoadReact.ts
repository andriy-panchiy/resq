import { findReactInstance } from './utils'
import type { ReactRootContainer } from './types'

/**
 * Wait for React application to load
 *
 * @param timeout - Maximum time to wait in milliseconds (default: 5000)
 * @param rootElSelector - Optional CSS selector for root element
 * @returns Promise that resolves when React is loaded
 *
 * @example
 * await waitToLoadReact(2000)
 * const component = resq$('MyComponent')
 *
 * @example
 * await waitToLoadReact(5000, '#app')
 */
export function waitToLoadReact(
    timeout = 5000,
    rootElSelector?: string
): Promise<string | void> {
    if (global.isReactLoaded) {
        return Promise.resolve('React already loaded')
    }

    const findReactRoot = (): (Element & ReactRootContainer) | null => {
        if (rootElSelector) {
            return document.querySelector(rootElSelector) as (Element & ReactRootContainer) | null
        }

        const walker = document.createTreeWalker(document)

        while (walker.nextNode()) {
            const node = walker.currentNode as Element & ReactRootContainer
            if (Object.prototype.hasOwnProperty.call(node, '_reactRootContainer')) {
                return node
            }
        }

        return null
    }

    return new Promise((resolve, reject) => {
        let timedout = false
        let timeoutHandler: ReturnType<typeof setTimeout> | null = null

        const tryToFindApp = (): void => {
            const reactRoot = findReactRoot()

            if (reactRoot) {
                global.isReactLoaded = true
                global.rootReactElement = findReactInstance(reactRoot as unknown as HTMLElement)

                if (global.rootReactElement) {
                    if (timeoutHandler) {
                        clearTimeout(timeoutHandler)
                    }
                    return resolve()
                }
            }

            if (timedout) {
                return
            }

            setTimeout(tryToFindApp, 200)
        }

        tryToFindApp()

        timeoutHandler = setTimeout(() => {
            timedout = true
            reject('Timed out')
        }, timeout)
    })
}
