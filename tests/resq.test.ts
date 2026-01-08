import ReactSelectorQuery from '../src/resq'

import { vdom } from './__mocks__/vdom'

describe('ReactSelectorQuery', () => {
    it('should build', () => {
        const resq = new ReactSelectorQuery('TestWrapper', vdom)

        expect(resq).toBeTruthy()
    })

    it('should select one element', () => {
        const resq = new ReactSelectorQuery('TestWrapper span', vdom)
        const $ = resq.find()

        expect($.name).toBe('span')
        expect($.props).toEqual({ testProp: 'some prop' })
        expect($.state).toEqual({})
        expect($.node).toBeInstanceOf(HTMLSpanElement)
    })

    it('should select multiple elements', () => {
        const resq = new ReactSelectorQuery('TestWrapper div', vdom)
        const $$ = resq.findAll()

        expect($$.length).toBe(2)
        expect($$[0].name).toBe('div')
        expect($$[0].props).toEqual({})
        expect($$[1].name).toBe('div')
        expect($$[1].state).toEqual({ testState: true, otherState: 'foo' })
    })

    describe('byProps', () => {
        it('should return the first instance of component filtered by prop', () => {
            const resq = new ReactSelectorQuery('TestWrapper span', vdom)
            const $ = resq.find()
            const result = $.byProps({ testProp: 'some prop' })

            expect(result.name).toBe('span')
            expect(result.props).toEqual({ testProp: 'some prop' })
            expect(result.state).toEqual({})
            expect(result.node).toBeInstanceOf(HTMLSpanElement)
        })

        it('should return all components filtered by prop', () => {
            const resq = new ReactSelectorQuery('TestWrapper span', vdom)
            const $$ = resq.findAll()
            const result = $$.byProps({ testProp: 'some prop' })

            expect(result.length).toBe(2)
            expect(result[0].name).toBe('span')
            expect(result[0].props).toEqual({ testProp: 'some prop' })
            expect(result[1].name).toBe('span')
            expect(result[1].state).toEqual({ testState: true })
        })
    })

    describe('byState', () => {
        it('should return the first instance of component filtered by state', () => {
            const resq = new ReactSelectorQuery('TestWrapper div', vdom)
            const $ = resq.find()
            const result = $.byState({ testState: true })

            expect(result.name).toBe('div')
            expect(result.props).toEqual({})
            expect(result.state).toMatchObject({ testState: true })
            expect(result.node).toBeInstanceOf(HTMLDivElement)
        })

        it('should return all components filtered by state', () => {
            const resq = new ReactSelectorQuery('TestWrapper div', vdom)
            const $$ = resq.findAll()
            const result = $$.byState({ testState: true })

            expect(result.length).toBe(1)
            expect(result[0].name).toBe('div')
            expect(result[0].state).toMatchObject({ testState: true })
        })
    })

    describe('should be able to use both filtering functions', () => {
        it('should filter for one instance', () => {
            const resq = new ReactSelectorQuery('TestWrapper div', vdom)
            const $ = resq.find()
            const result = $.byProps({}).byState({ testState: true })

            expect(result.name).toBe('div')
            expect(result.props).toEqual({})
            expect(result.state).toMatchObject({ testState: true })
        })

        it('should filter for multiple instances', () => {
            const resq = new ReactSelectorQuery('TestWrapper div', vdom)
            const $$ = resq.findAll()
            const result = $$.byState({ testState: true }).byProps({})

            expect(result.length).toBe(1)
            expect(result[0].name).toBe('div')
            expect(result[0].state).toMatchObject({ testState: true })
        })
    })
})
