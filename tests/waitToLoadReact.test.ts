import { waitToLoadReact } from '../src/waitToLoadReact'

import { vdom } from './__mocks__/vdom'

// Store original document methods
const originalCreateTreeWalker = document.createTreeWalker.bind(document)
const originalQuerySelector = document.querySelector.bind(document)

afterEach(() => {
    global.isReactLoaded = false
    global.rootReactElement = undefined

    // Reset document mocks
    document.createTreeWalker = originalCreateTreeWalker
    ;(document as { querySelector: typeof document.querySelector }).querySelector = originalQuerySelector
})

describe('waitToLoadReact', () => {
    it('should return if react is already loaded', async () => {
        global.isReactLoaded = true

        const res = await waitToLoadReact(10)
        expect(res).toBe('React already loaded')
    })

    it('should find react root element', async () => {
        let callCount = 0
        const mockCurrentNode = {
            _reactRootContainer: { _internalRoot: { current: vdom } },
        }

        document.createTreeWalker = jest.fn().mockReturnValue({
            currentNode: mockCurrentNode,
            nextNode: () => {
                callCount++
                return callCount === 1
            },
        })

        await waitToLoadReact(1000)

        expect(global.rootReactElement).toBeDefined()
        // vdom root has type: null, child has the actual component
        expect(global.rootReactElement?.child?.type).toBeDefined()
    })

    it('should find react root element if user pases selector', async () => {
        const mockElement = {
            _reactRootContainer: { _internalRoot: { current: vdom } },
        }
        const mockQuerySelector = jest.fn().mockReturnValue(mockElement)
        ;(document as { querySelector: typeof document.querySelector }).querySelector = mockQuerySelector

        await waitToLoadReact(1000, '#test')

        expect(mockQuerySelector).toHaveBeenCalledWith('#test')
        expect(global.rootReactElement).toBeDefined()
        // vdom root has type: null, child has the actual component
        expect(global.rootReactElement?.child?.type).toBeDefined()
    })

    it('should timeout if React app is not found', async () => {
        document.createTreeWalker = jest.fn().mockReturnValue({
            currentNode: {},
            nextNode: () => false,
        })
        ;(document as { querySelector: typeof document.querySelector }).querySelector = jest.fn().mockReturnValue(null)

        await expect(waitToLoadReact(10)).rejects.toMatch('Timed out')
    })
})
