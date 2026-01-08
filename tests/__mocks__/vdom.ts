import type { FiberNode, RESQNode, StyledComponentName } from '../../src/types'

// Helper function type
type MockFunction = {
    (): void
    displayName?: string
    name: string
}

function createMockFunction(name: string): MockFunction {
    const fn = function() {} as MockFunction
    Object.defineProperty(fn, 'name', { value: name })
    return fn
}

export const vdom: FiberNode = {
    type: null,
    child: {
        type: createMockFunction('TestWrapper'),
        memoizedProps: {
            myProps: 'test prop',
        },
        memoizedState: {
            baseState: {
                initialized: true,
            },
        },
        child: {
            type: 'div',
            memoizedProps: {},
            memoizedState: {},
            stateNode: document.createElement('div'),
            child: {
                type: 'span',
                memoizedProps: {
                    testProp: 'some prop',
                },
                memoizedState: {},
                stateNode: document.createElement('span'),
                sibling: {
                    type: 'span',
                    memoizedProps: {
                        testProp: 'some prop',
                        children: [{}],
                    },
                    memoizedState: { testState: true },
                    stateNode: document.createElement('span'),
                    sibling: {
                        type: 'div',
                        memoizedProps: {},
                        memoizedState: { testState: true, otherState: 'foo' },
                        stateNode: document.createElement('div'),
                        sibling: {
                            type: null,
                            memoizedProps: 'Foo bar',
                            memoizedState: { testState: true },
                            stateNode: null,
                            child: null,
                            sibling: null,
                            return: null,
                        },
                        child: null,
                        return: null,
                    },
                    child: null,
                    return: null,
                },
                child: null,
                return: null,
            },
            sibling: null,
            return: null,
        },
        sibling: null,
        return: null,
        stateNode: null,
    },
    sibling: null,
    return: null,
    memoizedProps: null,
    memoizedState: null,
    stateNode: null,
}

export const tree: RESQNode = {
    name: undefined,
    children: [
        {
            name: 'TestWrapper',
            props: { myProps: 'test prop' },
            state: { initialized: true },
            children: [
                {
                    name: 'div',
                    props: {},
                    state: {},
                    node: document.createElement('div'),
                    children: [
                        {
                            name: 'span',
                            props: { testProp: 'some prop' },
                            state: {},
                            node: document.createElement('span'),
                            children: [],
                        },
                        {
                            name: 'span',
                            props: { testProp: 'some prop' },
                            state: { testState: true },
                            node: document.createElement('span'),
                            children: [],
                        },
                        {
                            name: 'div',
                            props: {},
                            state: { testState: true, otherState: 'foo' },
                            node: document.createElement('div'),
                            children: [],
                        },
                        {
                            name: undefined,
                            props: 'Foo bar',
                            state: { testState: true },
                            node: document.createTextNode('Foo bar'),
                            children: [],
                        },
                    ],
                },
            ],
            node: document.createElement('div'),
        },
    ],
    props: {},
    state: {},
    node: null,
}

export const treeForWildcards: RESQNode = {
    name: undefined,
    children: [
        {
            name: 'TestWrapper',
            props: { myProps: 'test prop' },
            state: { initialized: true },
            children: [
                {
                    name: 'TestName',
                    props: { testProp: 'some prop' },
                    state: {},
                    node: document.createElement('span'),
                    children: [],
                },
                {
                    name: 'TestName-2',
                    props: { testProp: 'some prop 1' },
                    state: {},
                    node: document.createElement('span'),
                    children: [],
                },
                {
                    name: 'NameTest',
                    props: { testProp: 'some prop 2' },
                    state: { testState: true },
                    node: document.createElement('span'),
                    children: [],
                },
                {
                    name: 'Nested',
                    props: { testProp: 'some prop 3' },
                    state: {},
                    node: document.createElement('div'),
                    children: [
                        {
                            name: 'div',
                            props: { testProp: 'some prop 4' },
                            state: {},
                            node: document.createElement('div'),
                            children: [],
                        },
                    ],
                },
            ],
            node: document.createElement('div'),
        },
    ],
    props: {},
    state: {},
    node: null,
}

const styledButtonName: StyledComponentName = {
    componentStyle: {
        rules: [],
        isStatic: false,
        componentId: 'styled__Button-sc-1fuu6r1-1',
    },
    displayName: 'styled__Button',
    styledComponentId: 'styled__Button-sc-1fuu6r1-1',
}

const styledDivName: StyledComponentName = {
    componentStyle: {
        rules: [],
        isStatic: false,
        componentId: 'styled__Div-sc-1fuu6r1-1',
    },
    displayName: 'styled__Div',
    styledComponentId: 'styled__Div-sc-1fuu6r1-1',
}

export const treeWithStyledComponents: RESQNode = {
    name: undefined,
    children: [
        {
            name: 'TestWrapper',
            props: { myProps: 'test prop' },
            state: { initialized: true },
            children: [
                {
                    name: styledButtonName,
                    props: { testProp: 'some prop' },
                    state: {},
                    node: null,
                    children: [
                        {
                            name: 'button',
                            props: {},
                            state: {},
                            node: document.createElement('button'),
                            children: [],
                        },
                    ],
                },
                {
                    name: styledDivName,
                    props: { testProp: 'another prop' },
                    state: {},
                    node: null,
                    children: [
                        {
                            name: 'wrapper',
                            props: {},
                            state: {},
                            node: null,
                            children: [
                                {
                                    name: 'div',
                                    props: {},
                                    state: {},
                                    node: document.createElement('div'),
                                    children: [
                                        {
                                            name: 'MyButton',
                                            props: { someProp: 'some prop value' },
                                            state: {},
                                            node: document.createElement('button'),
                                            children: [],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
            node: document.createElement('div'),
        },
    ],
    props: {},
    state: {},
    node: null,
}

export const fragmentVDOM: FiberNode = {
    type: null,
    child: {
        type: createMockFunction('FragmentComponent'),
        child: {
            type: 'div',
            memoizedProps: {},
            memoizedState: {},
            stateNode: document.createElement('div'),
            sibling: {
                type: 'span',
                memoizedProps: {
                    testProp: 'some prop',
                },
                memoizedState: {},
                stateNode: document.createElement('span'),
                sibling: {
                    type: 'span',
                    memoizedProps: {
                        testProp: 'some prop',
                        children: [{}],
                    },
                    memoizedState: { testState: true },
                    stateNode: document.createElement('span'),
                    sibling: {
                        type: null,
                        memoizedProps: {},
                        memoizedState: {},
                        stateNode: document.createTextNode('text'),
                        sibling: {
                            type: createMockFunction('NestedFragmentComponent'),
                            child: {
                                type: 'div',
                                memoizedProps: {},
                                memoizedState: {},
                                stateNode: document.createElement('div'),
                                sibling: {
                                    type: 'div',
                                    memoizedProps: {},
                                    memoizedState: {},
                                    stateNode: document.createElement('div'),
                                    child: null,
                                    sibling: null,
                                    return: null,
                                },
                                child: null,
                                return: null,
                            },
                            sibling: null,
                            return: null,
                            memoizedProps: null,
                            memoizedState: null,
                            stateNode: null,
                        },
                        child: null,
                        return: null,
                    },
                    child: null,
                    return: null,
                },
                child: null,
                return: null,
            },
            child: null,
            return: null,
        },
        sibling: null,
        return: null,
        memoizedProps: null,
        memoizedState: null,
        stateNode: null,
    },
    sibling: null,
    return: null,
    memoizedProps: null,
    memoizedState: null,
    stateNode: null,
}

export const fragmentTree: RESQNode = {
    name: undefined,
    children: [
        {
            name: 'FragmentComponent',
            isFragment: true,
            node: [
                document.createElement('div'),
                document.createElement('span'),
                document.createElement('span'),
            ],
            props: {},
            state: {},
            children: [
                {
                    name: 'div',
                    props: {},
                    state: {},
                    node: document.createElement('div'),
                    children: [],
                },
                {
                    name: 'span',
                    props: { testProp: 'some prop' },
                    state: {},
                    node: document.createElement('span'),
                    children: [],
                },
                {
                    name: 'span',
                    props: { testProp: 'some prop' },
                    state: { testState: true },
                    node: document.createElement('span'),
                    children: [],
                },
                {
                    name: undefined,
                    props: {},
                    state: {},
                    node: document.createTextNode('text'),
                    children: [],
                },
                {
                    name: 'NestedFragmentComponent',
                    isFragment: true,
                    node: [
                        document.createElement('div'),
                        document.createElement('div'),
                    ],
                    props: {},
                    state: {},
                    children: [
                        {
                            name: 'div',
                            props: {},
                            state: {},
                            node: document.createElement('div'),
                            children: [],
                        },
                        {
                            name: 'div',
                            props: {},
                            state: {},
                            node: document.createElement('div'),
                            children: [],
                        },
                    ],
                },
            ],
        },
    ],
    props: {},
    state: {},
    node: null,
}

export const treeWithNonObjectState: RESQNode = {
    name: undefined,
    children: [
        {
            name: 'TestWrapper',
            props: { myProps: 'test prop' },
            state: { initialized: true },
            children: [
                {
                    name: 'div',
                    props: {},
                    state: {},
                    node: document.createElement('div'),
                    children: [
                        {
                            name: 'div',
                            props: { testProp: 'some prop' },
                            state: 'some state',
                            node: document.createElement('div'),
                            children: [],
                        },
                        {
                            name: 'div',
                            props: { testProp: 'some prop' },
                            state: true,
                            node: document.createElement('div'),
                            children: [],
                        },
                        {
                            name: 'div',
                            props: {},
                            state: [1, 2, 3],
                            node: document.createElement('div'),
                            children: [],
                        },
                        {
                            name: 'div',
                            props: {},
                            state: [1, 2, 3, 4, 5],
                            node: document.createElement('div'),
                            children: [],
                        },
                        {
                            name: 'div',
                            props: {},
                            state: 123,
                            node: document.createElement('div'),
                            children: [],
                        },
                    ],
                },
            ],
            node: document.createElement('div'),
        },
    ],
    props: {},
    state: {},
    node: null,
}

// Circular reference test fixtures
export function createCircularFiber(): FiberNode {
    const parent: FiberNode = {
        type: 'div',
        child: null,
        sibling: null,
        return: null,
        memoizedProps: {},
        memoizedState: null,
        stateNode: document.createElement('div'),
    }

    const child: FiberNode = {
        type: 'span',
        child: null,
        sibling: null,
        return: parent, // Circular reference to parent
        memoizedProps: {},
        memoizedState: null,
        stateNode: document.createElement('span'),
    }

    parent.child = child

    return parent
}

export function createCircularSiblingFiber(): FiberNode {
    const sibling1: Partial<FiberNode> = {
        type: 'div',
        memoizedProps: {},
        memoizedState: null,
        stateNode: document.createElement('div'),
        child: null,
        return: null,
    }

    const sibling2: Partial<FiberNode> = {
        type: 'span',
        memoizedProps: {},
        memoizedState: null,
        stateNode: document.createElement('span'),
        child: null,
        return: null,
    }

    // Create circular sibling chain
    sibling1.sibling = sibling2 as FiberNode
    sibling2.sibling = sibling1 as FiberNode

    const root: FiberNode = {
        type: 'root',
        child: sibling1 as FiberNode,
        sibling: null,
        return: null,
        memoizedProps: {},
        memoizedState: null,
        stateNode: null,
    }

    return root
}

export function createDeepFiber(depth: number): FiberNode {
    let current: FiberNode = {
        type: 'leaf',
        child: null,
        sibling: null,
        return: null,
        memoizedProps: {},
        memoizedState: null,
        stateNode: null,
    }

    for (let i = 0; i < depth; i++) {
        current = {
            type: `level-${i}`,
            child: current,
            sibling: null,
            return: null,
            memoizedProps: {},
            memoizedState: null,
            stateNode: null,
        }
    }

    return current
}
