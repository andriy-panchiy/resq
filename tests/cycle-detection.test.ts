import {
    buildNodeTree,
    verifyIfObjectsMatch,
    findInTree,
} from '../src/utils'
import type { FiberNode, RESQNode } from '../src/types'
import {
    createCircularFiber,
    createCircularSiblingFiber,
    createDeepFiber,
} from './__mocks__/vdom'

describe('Cycle Detection', () => {
    describe('buildNodeTree', () => {
        it('should handle circular parent references (element.return)', () => {
            const circularFiber = createCircularFiber()

            // Should not throw stack overflow
            expect(() => {
                const result = buildNodeTree(circularFiber)
                expect(result.children.length).toBe(1)
            }).not.toThrow()
        })

        it('should handle circular sibling references', () => {
            const circularSiblingFiber = createCircularSiblingFiber()

            // Should not throw, should stop at cycle
            expect(() => {
                const result = buildNodeTree(circularSiblingFiber)
                expect(result).toBeDefined()
                expect(result.name).toBe('root')
            }).not.toThrow()
        })

        it('should respect max depth limit', () => {
            // Create deeply nested structure (2000 levels, beyond default 1000)
            const deepFiber = createDeepFiber(2000)

            // Should not throw, should stop at max depth
            expect(() => {
                const result = buildNodeTree(deepFiber)
                expect(result).toBeDefined()
            }).not.toThrow()
        })

        it('should allow custom max depth', () => {
            const deepFiber = createDeepFiber(200)

            const result = buildNodeTree(deepFiber, { maxDepth: 50 })
            expect(result).toBeDefined()

            // Count actual depth
            let depth = 0
            let node: RESQNode | undefined = result
            while (node && node.children.length > 0) {
                depth++
                node = node.children[0]
            }

            // Depth should be limited to maxDepth
            expect(depth).toBeLessThanOrEqual(50)
        })

        it('should return empty tree for null element', () => {
            const result = buildNodeTree(null)

            expect(result).toEqual({
                name: undefined,
                props: {},
                state: undefined,
                children: [],
                node: null,
            })
        })

        it('should handle element with no children', () => {
            const fiber: FiberNode = {
                type: 'div',
                child: null,
                sibling: null,
                return: null,
                memoizedProps: { className: 'test' },
                memoizedState: null,
                stateNode: document.createElement('div'),
            }

            const result = buildNodeTree(fiber)

            expect(result.name).toBe('div')
            expect(result.props).toEqual({ className: 'test' })
            expect(result.children).toEqual([])
        })

        it('should use shared visited set across recursive calls', () => {
            // Create a tree where same node could be reached multiple times
            const sharedChild: FiberNode = {
                type: 'shared',
                child: null,
                sibling: null,
                return: null,
                memoizedProps: {},
                memoizedState: null,
                stateNode: null,
            }

            const parent: FiberNode = {
                type: 'parent',
                child: sharedChild,
                sibling: null,
                return: null,
                memoizedProps: {},
                memoizedState: null,
                stateNode: null,
            }

            // Manually create scenario where child.sibling points back
            sharedChild.sibling = sharedChild // Self-reference

            expect(() => {
                const result = buildNodeTree(parent)
                expect(result).toBeDefined()
            }).not.toThrow()
        })
    })

    describe('verifyIfObjectsMatch', () => {
        it('should handle circular object references', () => {
            const obj1: Record<string, unknown> = { a: 1 }
            obj1.self = obj1 // Circular reference

            const obj2: Record<string, unknown> = { a: 1 }
            obj2.self = obj2 // Circular reference

            // Should not throw
            expect(() => {
                const result = verifyIfObjectsMatch({ a: 1 }, obj1)
                expect(result).toBe(true)
            }).not.toThrow()
        })

        it('should handle deeply nested circular references', () => {
            const obj: Record<string, unknown> = {
                level1: {
                    level2: {
                        level3: {},
                    },
                },
            }
            // Create circular reference at deep level
            ;(obj.level1 as Record<string, unknown>).level2 = obj

            expect(() => {
                const result = verifyIfObjectsMatch({ level1: {} }, obj)
                expect(typeof result).toBe('boolean')
            }).not.toThrow()
        })

        it('should match objects without circular refs normally', () => {
            const matcher = { name: 'John', age: 25 }
            const verify = { name: 'John', age: 25, extra: 'data' }

            expect(verifyIfObjectsMatch(matcher, verify)).toBe(true)
        })

        it('should return false for non-matching objects', () => {
            const matcher = { name: 'John' }
            const verify = { name: 'Jane' }

            expect(verifyIfObjectsMatch(matcher, verify)).toBe(false)
        })

        it('should handle exact matching', () => {
            const matcher = { name: 'John' }
            const verify = { name: 'John', extra: 'data' }

            expect(verifyIfObjectsMatch(matcher, verify, false)).toBe(true)
            expect(verifyIfObjectsMatch(matcher, verify, true)).toBe(false)
        })

        it('should handle empty matcher', () => {
            expect(verifyIfObjectsMatch({}, { a: 1 })).toBe(true)
        })

        it('should handle null verify object', () => {
            expect(verifyIfObjectsMatch({ a: 1 }, null as unknown as Record<string, unknown>)).toBe(false)
        })
    })

    describe('findInTree', () => {
        it('should handle circular tree references', () => {
            const node1: RESQNode = {
                name: 'node1',
                node: null,
                state: {},
                props: {},
                children: [],
            }

            const node2: RESQNode = {
                name: 'node2',
                node: null,
                state: {},
                props: {},
                children: [node1],
            }

            // Create circular reference
            node1.children = [node2]

            const root: RESQNode = {
                name: 'root',
                node: null,
                state: {},
                props: {},
                children: [node1],
            }

            // Should not throw, should handle cycle
            expect(() => {
                const result = findInTree([root], (n) => n.name === 'node2')
                expect(result).toBeDefined()
            }).not.toThrow()
        })

        it('should find nodes in normal tree', () => {
            const tree: RESQNode = {
                name: 'root',
                node: null,
                state: {},
                props: {},
                children: [
                    {
                        name: 'child1',
                        node: document.createElement('div'),
                        state: {},
                        props: {},
                        children: [],
                    },
                    {
                        name: 'child2',
                        node: document.createElement('span'),
                        state: {},
                        props: {},
                        children: [],
                    },
                ],
            }

            const result = findInTree([tree], (n) => n.name === 'child2')

            expect(result).toHaveLength(1)
            expect(result[0].name).toBe('child2')
        })

        it('should return empty array when no matches', () => {
            const tree: RESQNode = {
                name: 'root',
                node: null,
                state: {},
                props: {},
                children: [],
            }

            const result = findInTree([tree], (n) => n.name === 'nonexistent')

            expect(result).toHaveLength(0)
        })

        it('should handle deeply nested trees without stack overflow', () => {
            // Create deeply nested tree
            let deepTree: RESQNode = {
                name: 'leaf',
                node: null,
                state: {},
                props: {},
                children: [],
            }

            for (let i = 0; i < 1000; i++) {
                deepTree = {
                    name: `level-${i}`,
                    node: null,
                    state: {},
                    props: {},
                    children: [deepTree],
                }
            }

            expect(() => {
                const result = findInTree([deepTree], (n) => n.name === 'leaf')
                expect(result).toBeDefined()
            }).not.toThrow()
        })

        it('should not revisit already visited nodes', () => {
            const visitCount: Record<string, number> = {}

            const node: RESQNode = {
                name: 'test',
                node: null,
                state: {},
                props: {},
                children: [],
            }

            // Self-referencing children
            node.children = [node]

            const root: RESQNode = {
                name: 'root',
                node: null,
                state: {},
                props: {},
                children: [node],
            }

            findInTree([root], (n) => {
                const name = n.name as string
                visitCount[name] = (visitCount[name] || 0) + 1
                return false
            })

            // Each node should only be visited once
            expect(visitCount['test']).toBe(1)
        })
    })

    describe('Integration: Stack overflow prevention', () => {
        it('should handle real-world React-like fiber with circular return refs', () => {
            // Simulate actual React Fiber structure with return pointers
            const grandchild: FiberNode = {
                type: 'span',
                child: null,
                sibling: null,
                return: null, // Will be set below
                memoizedProps: { className: 'grandchild' },
                memoizedState: null,
                stateNode: document.createElement('span'),
            }

            const child: FiberNode = {
                type: 'div',
                child: grandchild,
                sibling: null,
                return: null, // Will be set below
                memoizedProps: { className: 'child' },
                memoizedState: null,
                stateNode: document.createElement('div'),
            }

            const root: FiberNode = {
                type: 'main',
                child: child,
                sibling: null,
                return: null,
                memoizedProps: { className: 'root' },
                memoizedState: null,
                stateNode: document.createElement('main'),
            }

            // Set circular return pointers (as React does)
            child.return = root
            grandchild.return = child

            expect(() => {
                const tree = buildNodeTree(root)
                expect(tree.name).toBe('main')
                expect(tree.children.length).toBe(1)
                expect(tree.children[0].name).toBe('div')
            }).not.toThrow()
        })

        it('should prevent infinite loops with reasonable iteration limits', () => {
            // This test ensures the MAX_SEARCH_ITERATIONS limit works
            const nodes: RESQNode[] = []

            // Create a chain of 1000 nodes
            for (let i = 0; i < 1000; i++) {
                nodes.push({
                    name: `node-${i}`,
                    node: null,
                    state: {},
                    props: {},
                    children: [],
                })
            }

            // Link them
            for (let i = 0; i < nodes.length - 1; i++) {
                nodes[i].children = [nodes[i + 1]]
            }

            const root: RESQNode = {
                name: 'root',
                node: null,
                state: {},
                props: {},
                children: [nodes[0]],
            }

            const startTime = Date.now()
            const result = findInTree([root], (n) => n.name === 'node-999')
            const elapsed = Date.now() - startTime

            expect(result).toHaveLength(1)
            expect(elapsed).toBeLessThan(5000) // Should complete quickly
        })
    })
})
