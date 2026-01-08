/**
 * React Fiber Node structure (simplified for resq needs)
 * Note: Fiber nodes have circular references (element.return points to parent)
 */
export interface FiberNode {
    type: string | FunctionComponent | null;
    child: FiberNode | null;
    sibling: FiberNode | null;
    return: FiberNode | null;
    memoizedProps: Record<string, unknown> | string | null;
    memoizedState: MemoizedState | null;
    stateNode: HTMLElement | Text | null;
    constructor?: { name?: string };
}

export interface FunctionComponent {
    (...args: unknown[]): unknown;
    displayName?: string;
    name?: string;
}

export interface MemoizedState {
    baseState?: unknown;
    [key: string]: unknown;
}

/**
 * Processed tree node (safe, no circular references)
 */
export interface RESQNode {
    name: string | StyledComponentName | undefined;
    node: HTMLElement | Text | (HTMLElement | Text)[] | null;
    isFragment?: boolean;
    state: unknown;
    props: Record<string, unknown> | string;
    children: RESQNode[];
}

/**
 * Styled-components support
 */
export interface StyledComponentName {
    displayName?: string;
    componentStyle?: {
        rules: unknown[];
        isStatic: boolean;
        componentId: string;
    };
    styledComponentId?: string;
}

/**
 * Filter options for byProps/byState methods
 */
export interface FilterOptions {
    exact?: boolean;
}

/**
 * Traversal safety options to prevent stack overflow
 */
export interface TraversalOptions {
    /** Maximum depth of tree traversal (default: 1000) */
    maxDepth?: number;
    /** WeakSet for tracking visited nodes (prevents cycles) */
    visited?: WeakSet<object>;
}

/**
 * Type helper to exclude functions
 */
export type NotFunc<T> = Exclude<T, (...args: unknown[]) => unknown>;

/**
 * Matcher type for filtering
 */
export type Matcher = Record<string, unknown> | unknown[] | unknown;

/**
 * React root container interface
 */
export interface ReactRootContainer extends Element {
    _reactRootContainer?: {
        _internalRoot: {
            current: FiberNode;
        };
    };
}

/**
 * Extended HTMLElement with React internal properties
 */
export interface ReactElement extends HTMLElement {
    _reactRootContainer?: {
        _internalRoot: {
            current: FiberNode;
        };
    };
    [key: `__reactInternalInstance${string}`]: FiberNode;
    [key: `__reactFiber${string}`]: FiberNode;
    [key: `__reactContainer${string}`]: FiberNode;
}

/**
 * Global declarations for resq
 */
declare global {
    // eslint-disable-next-line no-var
    var isReactLoaded: boolean | undefined;
    // eslint-disable-next-line no-var
    var rootReactElement: FiberNode | undefined;
}
