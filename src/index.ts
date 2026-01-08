import ReactSelectorQuery, {
    ReactSelectorQueryNode,
    ReactSelectorQueryNodes,
} from './resq'
import { waitToLoadReact } from './waitToLoadReact'
import { findReactInstance } from './utils'
import type { FiberNode, RESQNode, FilterOptions } from './types'

// Re-export types for consumers
export type { RESQNode, FilterOptions, FiberNode }
export { ReactSelectorQueryNode, ReactSelectorQueryNodes }

/**
 * Internal query executor
 */
function doQuery(
    selector: string,
    method: 'find' | 'findAll',
    element?: HTMLElement
): ReactSelectorQueryNode | ReactSelectorQueryNodes {
    if (!element && !globalThis.isReactLoaded) {
        throw new Error('Could not find the root element of your application')
    }

    let reactInstance: FiberNode | undefined = globalThis.rootReactElement

    if (element instanceof HTMLElement) {
        reactInstance = findReactInstance(element)
    }

    if (!reactInstance) {
        throw new Error('Could not find instance of React in given element')
    }

    return new ReactSelectorQuery(selector, reactInstance)[method]()
}

/**
 * Find first matching React component
 *
 * @param selector - Component name or space-separated selector chain
 * @param element - Optional root element to search from
 * @returns ReactSelectorQueryNode with the first match
 *
 * @example
 * const header = resq$('Header', document.getElementById('root'))
 *
 * @example
 * // With async loading
 * await waitToLoadReact(2000)
 * const button = resq$('Button')
 *
 * @example
 * // Nested selector
 * const submitBtn = resq$('Form Button', root)
 *
 * @example
 * // With filtering
 * const activeTab = resq$('Tab', root).byProps({ isActive: true })
 */
export function resq$(
    selector: string,
    element?: HTMLElement
): ReactSelectorQueryNode {
    return doQuery(selector, 'find', element) as ReactSelectorQueryNode
}

/**
 * Find all matching React components
 *
 * @param selector - Component name or space-separated selector chain
 * @param element - Optional root element to search from
 * @returns ReactSelectorQueryNodes array with all matches
 *
 * @example
 * const buttons = resq$$('Button', document.getElementById('root'))
 *
 * @example
 * // Wildcard selector
 * const allStyled = resq$$('Styled*', root)
 *
 * @example
 * // With filtering
 * const activeItems = resq$$('ListItem', root).byProps({ isActive: true })
 */
export function resq$$(
    selector: string,
    element?: HTMLElement
): ReactSelectorQueryNodes {
    return doQuery(selector, 'findAll', element) as ReactSelectorQueryNodes
}

export { waitToLoadReact }
