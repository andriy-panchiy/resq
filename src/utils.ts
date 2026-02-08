import deepEqual from 'fast-deep-equal'

import type {
    FiberNode,
    RESQNode,
    StyledComponentName,
    TraversalOptions,
    MemoizedState,
    Matcher,
    ReactElement,
    FunctionComponent,
} from './types'

// Safety constants to prevent stack overflow
export const DEFAULT_MAX_DEPTH = 1000
export const MAX_SIBLINGS = 10000
export const MAX_SEARCH_ITERATIONS = 100000

const { isArray } = Array
const { keys } = Object

// Type guards
function isFunction(type: unknown): type is FunctionComponent {
    return typeof type === 'function'
}

function isHTMLOrText(node: unknown): node is HTMLElement | Text {
    return node instanceof HTMLElement || node instanceof Text
}

function isNativeObject(obj: unknown): obj is Record<string, unknown> {
    return typeof obj === 'object' && obj !== null && !isArray(obj)
}

function isFragmentInstance(element: RESQNode): boolean {
    return element.children.length > 1
}

/**
 * Get element name from Fiber node
 */
export function getElementName(node: FiberNode): string | StyledComponentName | undefined {
    // First check if type is a function (component)
    if (isFunction(node.type)) {
        return node.type.displayName || node.type.name
    }

    // Then check for string type (HTML elements)
    if (typeof node.type === 'string') {
        return node.type
    }

    // Check for object type (styled-components, etc.)
    if (node.type && typeof node.type === 'object') {
        return node.type as unknown as StyledComponentName
    }

    // Finally, check constructor name for class instances
    // but exclude base Object/Function constructors
    if (
        node.constructor &&
        node.constructor.name &&
        node.constructor.name !== 'Object' &&
        node.constructor.name !== 'Function'
    ) {
        return node.constructor.name
    }

    return node.type as unknown as string | undefined
}

/**
 * Find state node (DOM element) from Fiber node
 */
function findStateNode(element: FiberNode): HTMLElement | Text | null {
    if (element.stateNode && isHTMLOrText(element.stateNode)) {
        return element.stateNode
    }

    if (element.child && element.child.stateNode && isHTMLOrText(element.child.stateNode)) {
        return element.child.stateNode
    }

    return null
}

/**
 * Strip Higher-Order Component wrapper from component name
 * Example: "withRouter(MyComponent)" -> "MyComponent"
 */
export function stripHoCFromName(componentName: string | undefined): string | undefined {
    if (!componentName) {
        return undefined
    }

    const splitName = componentName.split('(')

    if (splitName.length === 1) {
        return componentName
    }

    return splitName.find(e => e.includes(')'))?.replace(/\)*/g, '')
}

/**
 * Remove children from props object
 */
function removeChildrenFromProps(
    props: Record<string, unknown> | string | null
): Record<string, unknown> | string {
    if (!props || typeof props === 'string') {
        return props || {}
    }

    const returnProps = { ...props }
    delete returnProps.children

    return returnProps
}

/**
 * Get element state from memoizedState
 * Class components: memoizedState directly
 * Functional components with hooks: memoizedState.baseState
 */
function getElementState(elementState: MemoizedState | null): unknown {
    if (!elementState) {
        return undefined
    }

    const { baseState } = elementState

    if (baseState !== undefined) {
        return baseState
    }

    return elementState
}

/**
 * Verify if two arrays match
 * @param arr1 - First array (matcher)
 * @param arr2 - Second array (to verify against)
 * @param exact - If true, arrays must match exactly
 */
export function verifyIfArraysMatch(
    arr1: unknown[],
    arr2: unknown[],
    exact = false
): boolean {
    if (!isArray(arr1) || !isArray(arr2)) {
        return false
    }

    if (exact) {
        if (arr1.length !== arr2.length) {
            return false
        }

        return !arr1.find(item => !arr2.includes(item))
    }

    return arr1.some(item => arr2.includes(item))
}

/**
 * Verify if two objects match (with cycle detection)
 * @param matcher - Object with properties to match
 * @param verify - Object to verify against
 * @param exact - If true, objects must match exactly
 * @param visited - WeakSet for tracking visited objects (prevents infinite recursion)
 */
export function verifyIfObjectsMatch(
    matcher: Record<string, unknown> = {},
    verify: Record<string, unknown> = {},
    exact = false,
    visited: WeakSet<object> = new WeakSet()
): boolean {
    // Prevent infinite recursion from circular references
    if (isNativeObject(verify) && visited.has(verify)) {
        return false
    }

    if (isNativeObject(verify)) {
        visited.add(verify)
    }

    const matcherKeys = keys(matcher)

    if (!matcherKeys.length) {
        return true
    }

    if (verify === null || !keys(verify).length) {
        return false
    }

    if (exact) {
        return deepEqual(matcher, verify)
    }

    const matchingKeys = matcherKeys.filter(key => keys(verify).includes(key))
    const results: unknown[] = []

    matchingKeys.forEach((key) => {
        const matcherVal = matcher[key]
        const verifyVal = verify[key]

        if (isNativeObject(matcherVal) && isNativeObject(verifyVal)) {
            // Pass visited set to prevent cycles
            const matches = verifyIfObjectsMatch(
                matcherVal as Record<string, unknown>,
                verifyVal as Record<string, unknown>,
                false,
                visited
            )
            if (matches) {
                results.push(verifyVal)
            }
        } else if (
            matcherVal === verifyVal ||
            verifyIfArraysMatch(matcherVal as unknown[], verifyVal as unknown[])
        ) {
            results.push(verifyVal)
        }
    })

    return results.length > 0 && results.filter(el => el !== undefined).length === matchingKeys.length
}

/**
 * Build array of HTML nodes from fragment children
 */
export function buildFragmentNodeArray(tree: RESQNode): (HTMLElement | Text)[] {
    return tree.children
        .map(child => child.node)
        .filter((node): node is HTMLElement | Text => node !== null && !isArray(node))
}

/**
 * Build a node tree from React Fiber node (with cycle detection and depth limit)
 *
 * @param element - React Fiber node
 * @param options - Traversal options (maxDepth, visited set)
 * @returns Processed tree node
 *
 * @example
 * {
 *   name: 'MyComponent',
 *   props: { hello: 'world' },
 *   children: [],
 *   state: { init: true },
 *   isFragment: false,
 *   node: HTMLElement
 * }
 */
export function buildNodeTree(
    element: FiberNode | null | undefined,
    options: TraversalOptions = {}
): RESQNode {
    const {
        maxDepth = DEFAULT_MAX_DEPTH,
        visited = new WeakSet()
    } = options

    const emptyTree: RESQNode = {
        name: undefined,
        props: {},
        state: undefined,
        children: [],
        node: null
    }

    if (!element) {
        return emptyTree
    }

    // Cycle detection: check if we've seen this element before
    if (visited.has(element)) {
        return emptyTree
    }

    // Depth limit check
    if (maxDepth <= 0) {
        return emptyTree
    }

    visited.add(element)

    const tree: RESQNode = {
        name: getElementName(element),
        props: removeChildrenFromProps(element.memoizedProps),
        state: getElementState(element.memoizedState),
        children: [],
        node: null
    }

    let child = element.child
    const childElements: FiberNode[] = []

    if (child) {
        // Check cycle before adding first child
        if (!visited.has(child)) {
            childElements.push(child)
        }

        // Collect siblings with cycle detection and limit
        let siblingCount = 0
        while (child.sibling && siblingCount < MAX_SIBLINGS) {
            // Check if sibling was already visited (circular sibling refs)
            if (visited.has(child.sibling)) {
                break
            }
            childElements.push(child.sibling)
            child = child.sibling
            siblingCount++
        }
    }

    // Recursively build with decremented depth and shared visited set
    tree.children = childElements.map(childEl =>
        buildNodeTree(childEl, {
            maxDepth: maxDepth - 1,
            visited
        })
    )

    if (isFunction(element.type) && isFragmentInstance(tree)) {
        tree.node = buildFragmentNodeArray(tree)
        tree.isFragment = true
    } else {
        tree.node = findStateNode(element)
    }

    return tree
}

/**
 * Find a node in tree children (for fragments without direct node)
 */
function findNode(children: RESQNode[]): HTMLElement | Text | null {
    const stack = [...children]

    while (stack.length) {
        const child = stack.shift()!

        if (child.node && !isArray(child.node)) {
            return child.node
        }

        if (child.children && isArray(child.children)) {
            stack.push(...child.children)
        }
    }

    return null
}

/**
 * Find nodes in tree matching search function (with iteration limit)
 *
 * @param stack - Initial stack of nodes to search
 * @param searchFn - Function to match nodes
 * @returns Array of matching nodes
 */
export function findInTree(
    stack: RESQNode[],
    searchFn: (node: RESQNode) => boolean
): RESQNode[] {
    const returnArray: RESQNode[] = []
    const visited = new WeakSet<object>()
    let iterations = 0

    while (stack.length && iterations < MAX_SEARCH_ITERATIONS) {
        iterations++
        const current = stack.shift()!

        // Skip if already visited (handles circular refs in processed tree)
        if (visited.has(current)) {
            continue
        }
        visited.add(current)

        const { children } = current

        if (children && isArray(children)) {
            children.forEach((child) => {
                // Skip already visited children
                if (visited.has(child)) {
                    return
                }

                if (searchFn(child)) {
                    if (!child.node && isArray(child.children)) {
                        child.node = findNode([...child.children])
                    }
                    returnArray.push(child)
                }

                stack.push(child)
            })
        }
    }

    return returnArray
}

/**
 * Match selector against node name (supports wildcards)
 *
 * @param selector - Selector string (can contain * wildcards)
 * @param nodeName - Node name to match against
 * @returns true if matches
 *
 * @example
 * matchSelector('My*', 'MyComponent') // true
 * matchSelector('*Button', 'SubmitButton') // true
 */
export function matchSelector(selector: string, nodeName: string | undefined): boolean {
    // Wildcard-only selector '*' matches everything including empty/unnamed components
    if (selector === '*') {
        return true
    }

    if (!nodeName) {
        return false
    }

    const strippedName = stripHoCFromName(nodeName)

    if (!strippedName) {
        return false
    }

    const escapeRegex = (str: string): string => str.replace(/([.*+?^=!:${}()|[\]/\\])/g, '\\$1')

    const pattern = '^' + selector.split('*').map(escapeRegex).join('.+') + '$'

    return new RegExp(pattern).test(strippedName)
}

/**
 * Find selector in tree (main iterator function)
 *
 * @param selectors - Array of selector strings
 * @param tree - Root tree node
 * @param selectFirst - If true, return only first match
 * @param searchFn - Optional custom search function
 * @returns Array of matching nodes
 */
export function findSelectorInTree(
    selectors: string[],
    tree: RESQNode,
    _selectFirst = false,
    searchFn?: (child: RESQNode) => boolean
): RESQNode[] {
    return selectors.reduce<RESQNode[]>((res, selector) => {
        return res.concat(findInTree(
            res.length ? res : [tree],
            searchFn && typeof searchFn === 'function' ? searchFn : (child: RESQNode): boolean => {
                const { name } = child

                if (typeof name === 'string') {
                    return matchSelector(selector, name)
                }

                if (name !== null && typeof name === 'object') {
                    const styledName = name as StyledComponentName
                    return matchSelector(selector, styledName.displayName)
                }

                if (child.constructor && typeof child.constructor.name === 'string') {
                    return matchSelector(selector, child.constructor.name)
                }

                return false
            }
        ))
    }, [])
}

/**
 * Filter nodes by props or state
 *
 * @param nodes - Array of nodes to filter
 * @param key - 'props' or 'state'
 * @param matcher - Value to match against
 * @param exact - If true, require exact match
 * @returns Filtered array of nodes
 */
export function filterNodesBy(
    nodes: RESQNode[],
    key: 'props' | 'state',
    matcher: Matcher,
    exact = false
): RESQNode[] {
    if (isFunction(matcher)) {
        console.warn('Functions are not supported as filter matchers')
        return []
    }

    return nodes.filter(node => {
        const nodeValue = node[key]

        if (isNativeObject(matcher) && isNativeObject(nodeValue)) {
            return verifyIfObjectsMatch(
                matcher as Record<string, unknown>,
                nodeValue as Record<string, unknown>,
                exact
            )
        }

        if (isArray(matcher) && isArray(nodeValue)) {
            return verifyIfArraysMatch(matcher, nodeValue as unknown[], exact)
        }

        return nodeValue === matcher
    })
}

/**
 * Find React instance (Fiber node) from DOM element
 *
 * @param element - DOM element
 * @returns React Fiber node or undefined
 */
export function findReactInstance(element: HTMLElement): FiberNode | undefined {
    const reactElement = element as ReactElement

    // React 18 root container
    if (Object.prototype.hasOwnProperty.call(reactElement, '_reactRootContainer')) {
        return reactElement._reactRootContainer?._internalRoot.current
    }

    // React 16/17 internal instance or fiber
    const instanceKey = Object.keys(reactElement).find(
        key =>
            key.startsWith('__reactInternalInstance') ||
            key.startsWith('__reactFiber') ||
            key.startsWith('__reactContainer')
    )

    if (instanceKey) {
        return reactElement[instanceKey as keyof ReactElement] as FiberNode
    }

    return undefined
}
