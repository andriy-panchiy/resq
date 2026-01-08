import { filterNodesBy, findSelectorInTree, buildNodeTree } from './utils'
import type { RESQNode, FilterOptions, FiberNode } from './types'

/**
 * Array of RESQNode with filtering methods
 */
export class ReactSelectorQueryNodes extends Array<RESQNode> {
    constructor(nodes?: RESQNode[]) {
        super(...(nodes || []))
        // Restore prototype chain for extended Array
        Object.setPrototypeOf(this, ReactSelectorQueryNodes.prototype)
    }

    /**
     * Filter nodes by props
     * @param props - Props to match
     * @param options - Filter options (exact: boolean)
     * @returns New ReactSelectorQueryNodes with filtered results
     */
    byProps(
        props: Record<string, unknown>,
        options: FilterOptions = { exact: false }
    ): ReactSelectorQueryNodes {
        const filtered = filterNodesBy(this, 'props', props, options.exact)
        return new ReactSelectorQueryNodes(filtered)
    }

    /**
     * Filter nodes by state
     * @param state - State to match
     * @param options - Filter options (exact: boolean)
     * @returns New ReactSelectorQueryNodes with filtered results
     */
    byState(
        state: unknown,
        options: FilterOptions = { exact: false }
    ): ReactSelectorQueryNodes {
        const filtered = filterNodesBy(this, 'state', state, options.exact)
        return new ReactSelectorQueryNodes(filtered)
    }
}

/**
 * Single RESQNode with filtering methods
 */
export class ReactSelectorQueryNode implements RESQNode {
    name: RESQNode['name']
    node: RESQNode['node']
    isFragment?: boolean
    state: unknown
    props: Record<string, unknown> | string
    children: RESQNode[]
    private _nodes: RESQNode[]

    constructor(item: RESQNode | undefined, nodes: RESQNode[]) {
        this._nodes = nodes

        if (item) {
            this.name = item.name
            this.node = item.node
            this.isFragment = item.isFragment
            this.state = item.state
            this.props = item.props
            this.children = item.children
        } else {
            // Handle undefined item gracefully
            this.name = undefined
            this.node = null
            this.state = undefined
            this.props = {}
            this.children = []
        }
    }

    /**
     * Filter by props and return first matching node
     * @param props - Props to match
     * @param options - Filter options (exact: boolean)
     * @returns New ReactSelectorQueryNode with filtered result
     */
    byProps(
        props: Record<string, unknown>,
        options: FilterOptions = { exact: false }
    ): ReactSelectorQueryNode {
        const filtered = filterNodesBy(this._nodes, 'props', props, options.exact)[0]
        return new ReactSelectorQueryNode(filtered, this._nodes)
    }

    /**
     * Filter by state and return first matching node
     * @param state - State to match
     * @param options - Filter options (exact: boolean)
     * @returns New ReactSelectorQueryNode with filtered result
     */
    byState(
        state: unknown,
        options: FilterOptions = { exact: false }
    ): ReactSelectorQueryNode {
        const filtered = filterNodesBy(this._nodes, 'state', state, options.exact)[0]
        return new ReactSelectorQueryNode(filtered, this._nodes)
    }
}

/**
 * Main query class for searching React component tree
 */
export default class ReactSelectorQuery {
    selectors: string[]
    rootComponent: FiberNode
    tree: RESQNode
    nodes?: ReactSelectorQueryNodes

    /**
     * Create a new query
     * @param selector - Space-separated selector string
     * @param root - React Fiber root node
     */
    constructor(selector: string, root: FiberNode) {
        this.selectors = selector
            .split(' ')
            .filter(el => !!el)
            .map(el => el.trim())
        this.rootComponent = root
        this.tree = buildNodeTree(this.rootComponent)
    }

    /**
     * Find first matching node
     * @returns ReactSelectorQueryNode wrapping the first match
     */
    find(): ReactSelectorQueryNode {
        this.nodes = new ReactSelectorQueryNodes(
            findSelectorInTree(this.selectors, this.tree, true)
        )
        return new ReactSelectorQueryNode(this.nodes[0], [...this.nodes])
    }

    /**
     * Find all matching nodes
     * @returns ReactSelectorQueryNodes with all matches
     */
    findAll(): ReactSelectorQueryNodes {
        return new ReactSelectorQueryNodes(
            findSelectorInTree(this.selectors, this.tree)
        )
    }
}
