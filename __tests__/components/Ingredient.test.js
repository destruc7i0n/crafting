import React, { Component } from 'react'
import { mount, shallow } from 'enzyme'
import configureStore from 'redux-mock-store'

import { DragDropContext } from 'react-dnd'
import TestBackend from 'react-dnd-test-backend'

import Ingredient from '../../src/components/ingredient/Ingredient'

const middlewares = []
const mockStore = configureStore(middlewares)

function wrapInTestContext (DecoratedComponent) {
  return DragDropContext(TestBackend)(
    class extends Component {
      render () {
        return (
          <DecoratedComponent {...this.props} />
        )
      }
    }
  )
}

describe('<Ingredient />', () => {
  let store

  const stone = {
    'readable': 'Stone',
    'id': 'minecraft:stone',
    'texture': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAALVBMVEUAAAA7OztAQEBWVlZeXl50dHR/f39qampISEiPj49NTU00NDRoaGiAgIBBQUFWXyGYAAAAAXRSTlMAQObYZgAAAUdJREFUeF51jjFrwzAUhP0XniZDJmkSGLpIIPAqgaG7DIasfmBwJxkE2azJ0FkB7YZCx0yFzs3vqkQIJENuu093T1e9Eo7PfopDfPSpP89DenjHDzyOw3D31/ForR3Ge2vsx+zTbPv5r3iL1k4Rj4hxwD4DbW3OXCc72YgkAyNSLqQ42IRAM3j3HaLtp5gwBJZB1/oTJjuc8XPjpAAj3GLHOPOVwGcGyu3KC0TYarqFDJwWi9wl3SDU6++tInSnGVyA8JIwGShhGgbkQnlJOLV8eclXILQuCa2ENOrE84WftQDjpN7dN30DEkgZtjtncqumpOGh7NDat517Dw009W2pMK1UC1/rQ4Ct3GhFp5ynsOXtJSG0Ucti2Mrqw8qqrFYI1xnGADhkm+VlK04XYOXTm0xnJK2h+DvRntOtepCQDKonGahe6B/7Hmuy2OXaXQAAAABJRU5ErkJggg=='
  }

  beforeEach(() => {
    store = mockStore({
      Private: {
        showingContextMenu: false
      }
    })
  })

  it('renders without exploding', () => {
    expect(shallow(<Ingredient store={store} />)).toHaveLength(1)
  })

  it('displays tooltip on mouse over', () => {
    const IngredientComponent = Ingredient.DecoratedComponent

    // Stub the React DnD connector functions with an identity function
    const identity = jest.fn()

    const wrapper = shallow(<IngredientComponent store={store} ingredient={stone} connectDragSource={identity} connectDragPreview={identity} />)

    // on mouse move
    wrapper.simulate('mousemove', {
      clientX: 0,
      clientY: 0
    })

    // check that the tooltip will display
    expect(wrapper.state().mouse.display).toEqual('block')
  })

  it('hides tooltip on mouse out', () => {
    const IngredientComponent = Ingredient.DecoratedComponent

    // Stub the React DnD connector functions with an identity function
    const identity = jest.fn()

    const wrapper = shallow(<IngredientComponent store={store} ingredient={stone} connectDragSource={identity} connectDragPreview={identity} />)

    // on mouse move
    wrapper.simulate('mousemove', {
      clientX: 0,
      clientY: 0
    })

    // check that the tooltip will display
    expect(wrapper.state().mouse.display).toEqual('block')

    // on mouse out
    wrapper.simulate('mouseout')

    // check that tooltip is hidden
    expect(wrapper.state().mouse.display).toEqual('none')
  })

  it('drags', () => {
    const IngredientContent = wrapInTestContext(Ingredient)
    const wrapper = mount(<IngredientContent store={store} ingredient={stone} />)

    // get react-dnd backend
    const backend = wrapper.instance().getManager().getBackend()

    // I could export the pure component, but then I'd need to export all the components for OCD...
    // this line took forever to make to, as I had to mod redux too, look at connect in src/components/Ingredient.js
    const draggable = wrapper.find(Ingredient).instance().wrappedInstance

    // now I need to do this hack to get the props
    let draggableProps = draggable.decoratedComponentInstance.props

    // expect it to not be dragging
    expect(draggableProps.isDragging).toEqual(false)

    // simulate a drag
    backend.simulateBeginDrag([draggable.getHandlerId()])

    // now to do the hack again
    draggableProps = draggable.decoratedComponentInstance.props

    // expect it to be dragging
    expect(draggableProps.isDragging).toEqual(true)
  })
})
