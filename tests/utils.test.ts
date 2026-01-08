import {
    buildFragmentNodeArray,
    buildNodeTree,
    filterNodesBy,
    findInTree,
    findSelectorInTree,
    verifyIfArraysMatch,
    verifyIfObjectsMatch,
    findReactInstance,
    matchSelector,
    stripHoCFromName,
} from '../src/utils'

import {
    tree,
    vdom,
    fragmentVDOM,
    treeWithNonObjectState,
    treeWithStyledComponents,
    treeForWildcards,
} from './__mocks__/vdom'
import type { RESQNode } from '../src/types'

beforeAll(() => {
    global.isReactLoaded = true
})

describe('utils', () => {
    describe('buildNodeTree', () => {
        it('should return empty tree', () => {
            const result = buildNodeTree(null)
            expect(result.children).toEqual([])
        })

        it('should build tree', () => {
            const result = buildNodeTree(vdom)
            expect(result.children.length).toBe(1)
            expect(result.children[0].name).toBe('TestWrapper')
            expect(result.children[0].props).toEqual({ myProps: 'test prop' })
        })

        it('should build tree for fragments', () => {
            const result = buildNodeTree(fragmentVDOM)
            expect(result.children.length).toBe(1)
            expect(result.children[0].name).toBe('FragmentComponent')
            expect(result.children[0].isFragment).toBe(true)
        })
    })

    test('findInTree', () => {
        let results: RESQNode[] = [tree]
        const selectors = ['TestWrapper', 'div']

        selectors.forEach((selector) => {
            results = findInTree(results, child => child.name === selector)
        })

        expect(results.length).toBe(2)
        expect(results[0].name).toBe('div')
        expect(results[1].name).toBe('div')
        expect(results[1].state).toEqual({ testState: true, otherState: 'foo' })
    })

    describe('findSelectorInTree', () => {
        it('should return all instances of nested selectors', () => {
            const results = findSelectorInTree('TestWrapper span'.split(' '), tree)

            expect(results.length).toBe(2)
            expect(results[0].name).toBe('span')
            expect(results[0].props).toEqual({ testProp: 'some prop' })
            expect(results[1].name).toBe('span')
            expect(results[1].state).toEqual({ testState: true })
        })

        it('should correctly use a custom search fn', () => {
            // Custom searchFn finds all matching descendants, not just selector matches
            const results = findSelectorInTree(
                ['TestWrapper'],
                tree,
                false,
                (child) => child.name === 'span',
            )

            // Should find both span elements
            expect(results.length).toBe(2)
            expect(results[0].name).toBe('span')
            expect(results[1].name).toBe('span')
        })

        it('should correctly find a styled component', () => {
            const results = findSelectorInTree(
                ['styled__Button'],
                treeWithStyledComponents,
            )

            expect(results.length).toBe(1)
            const name = results[0].name as { displayName: string }
            expect(name.displayName).toBe('styled__Button')
        })

        it('should correctly not find a node', () => {
            const results = findSelectorInTree(
                ['AnyComponentDoesnotExist'],
                treeWithStyledComponents,
            )

            expect(results.length).toBe(0)
        })
    })

    describe('matchSelector', () => {
        const testCases = [
            { selector: 'simpleNodeName', nodeName: 'simpleNodeName', match: true },
            { selector: 'simpleNode', nodeName: 'simpleNodeName', match: false },
            { selector: 'simpleWildcardNode*', nodeName: 'simpleWildcardNodeName', match: true },
            { selector: 'simple*Node*', nodeName: 'simpleWildcardNodeName', match: true },
            { selector: '*Node*', nodeName: 'simpleWildcardNodeName', match: true },
            { selector: 'special_characters', nodeName: 'node_with(special_characters)', match: true },
            { selector: '*', nodeName: 'anyNode', match: true },
        ]

        testCases.forEach(({ match, nodeName, selector }) => {
            it(`Should${match ? '' : "n't"} match "${nodeName}" to "${selector}"`, () => {
                expect(matchSelector(selector, nodeName)).toBe(match)
            })
        })
    })

    describe('findSelectorInTree with wildcards', () => {
        it('should correctly find nodes by wildcard', () => {
            const results = findSelectorInTree(
                ['TestWrapper', 'Test*'],
                treeForWildcards,
            )

            expect(results.length).toBe(2)
            expect(results[0].name).toBe('TestName')
            expect(results[1].name).toBe('TestName-2')
        })

        it('should correctly find all nodes by *', () => {
            const results = findSelectorInTree(
                ['TestWrapper', '*'],
                treeForWildcards,
            )

            expect(results.length).toBe(5)
        })
    })

    describe('filterNodesBy', () => {
        it('should non-strictly match objects', () => {
            const nodes = findSelectorInTree(['TestWrapper'], tree)
            const results = filterNodesBy(nodes, 'props', { myProps: 'test prop' })

            expect(results.length).toBe(1)
            expect(results[0].name).toBe('TestWrapper')
        })

        it('should strictly match objects when exact flag is true', () => {
            const nodes = findSelectorInTree(['TestWrapper', 'div'], tree)
            const results = filterNodesBy(
                nodes,
                'state',
                { testState: true, otherState: 'foo' },
                true,
            )

            expect(results.length).toBe(1)
            expect(results[0].name).toBe('div')
            expect(results[0].state).toEqual({ testState: true, otherState: 'foo' })
        })

        it('should work for any type of state', () => {
            const nodes = findSelectorInTree(['TestWrapper', 'div'], treeWithNonObjectState)
            const arrayState = filterNodesBy(nodes, 'state', [1, 2, 3])
            const numberState = filterNodesBy(nodes, 'state', 123)
            const stringState = filterNodesBy(nodes, 'state', 'some state')
            const booleanState = filterNodesBy(nodes, 'state', true)

            expect(booleanState.length).toBe(1)
            expect(arrayState.length).toBe(2)
            expect(numberState.length).toBe(1)
            expect(stringState.length).toBe(1)
        })

        it('should not match functions', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
            const nodes = findSelectorInTree(['TestWrapper', 'div'], treeWithNonObjectState)

            expect(filterNodesBy(nodes, 'state', () => {})).toEqual([])
            expect(consoleSpy).toHaveBeenCalled()

            consoleSpy.mockRestore()
        })
    })

    describe('verifyIfArraysMatch', () => {
        it('should return false if not arrays', () => {
            expect(verifyIfArraysMatch(1 as unknown as unknown[], [2])).toBeFalsy()
            expect(verifyIfArraysMatch([1], 2 as unknown as unknown[])).toBeFalsy()
        })

        it('should return true if arrays have equal values', () => {
            expect(verifyIfArraysMatch(['a'], ['a', 'b'])).toBeTruthy()
            expect(verifyIfArraysMatch([5], [1, 2, 3, 4, 5])).toBeTruthy()
        })

        it('should exactly match arrays', () => {
            expect(verifyIfArraysMatch([1, 2, 3], [1, 2, 3], true)).toBeTruthy()
            expect(verifyIfArraysMatch([1, 2, 3], [1, 2, 4], true)).toBeFalsy()
        })
    })

    describe('verifyIfObjectsMatch', () => {
        it('should return false if objects do not match', () => {
            expect(verifyIfObjectsMatch({ bar: true }, { bar: false })).toBeFalsy()
            expect(verifyIfObjectsMatch({ a: 1 }, {})).toBeFalsy()
            expect(verifyIfObjectsMatch({}, { a: 1 })).toBeTruthy()
        })

        it('should return false if verify is null', () => {
            expect(verifyIfObjectsMatch({ bar: true }, null as unknown as Record<string, unknown>)).toBeFalsy()
            expect(verifyIfObjectsMatch({ bar: true }, { bar: true })).toBeTruthy()
        })

        it('should work for deep values', () => {
            const o1 = { foo: { bar: { deep: true } } }
            const o2 = { foo: { bar: { deep: false } } }
            const o3 = { foo: { bar: { deep: true } } }

            expect(verifyIfObjectsMatch(o1, o2)).toBeFalsy()
            expect(verifyIfObjectsMatch(o1, o3)).toBeTruthy()
        })
    })

    describe('buildFragmentNodeArray', () => {
        it('should return array of nodes for fragment elements', () => {
            const fragmentTree: RESQNode = {
                isFragment: true,
                name: 'MyFragmentComponent',
                props: {},
                state: {},
                node: null,
                children: [
                    { node: document.createElement('div'), name: 'div', props: {}, state: {}, children: [] },
                    { node: document.createElement('div'), name: 'div', props: {}, state: {}, children: [] },
                    { node: document.createElement('div'), name: 'div', props: {}, state: {}, children: [] },
                ],
            }

            const result = buildFragmentNodeArray(fragmentTree)
            expect(result.length).toBe(3)
            result.forEach(node => expect(node).toBeInstanceOf(HTMLDivElement))
        })
    })

    describe('findReactInstance', () => {
        it('should return instance of passed HTML has one', () => {
            const element = {
                __reactInternalInstance$test1234: true,
            } as unknown as HTMLElement

            expect(findReactInstance(element)).toBeTruthy()
        })

        it('should work with React 17', () => {
            const element = {
                __reactFiber$test1234: true,
            } as unknown as HTMLElement

            expect(findReactInstance(element)).toBeTruthy()
        })

        it('should work with React 18', () => {
            const element = {
                __reactContainer$test1234: true,
            } as unknown as HTMLElement

            expect(findReactInstance(element)).toBeTruthy()
        })

        it('should return undefined if no instance is found', () => {
            expect(findReactInstance(document.createElement('div'))).toBeFalsy()
        })
    })

    describe('stripHoCFromName', () => {
        it('should not do anything if component name is missing', () => {
            expect(stripHoCFromName(undefined)).toBe(undefined)
        })

        it('should strip HoC wrapper', () => {
            expect(stripHoCFromName('withRouter(MyComponent)')).toBe('MyComponent')
        })
    })
})
