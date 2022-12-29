import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';

const Context = React.createContext(null) 

const createStore = (reducer, initialState) => {
  let currentState = initialState
  let listeners = []

  const getState = () => currentState
  
  const dispatch = action => {
    currentState = reducer(currentState, action)
    listeners.forEach(listener => listener())
  }

  const subscribe = (listener) => {
    listeners.push(listener)

    return () => {
      const intex = listeners.indexOf(listener)
      listeners.splice(intex, 1)
    }
  }

  return { getState, dispatch, subscribe }
}

const useSelector = (selector, isEqual) => {
  const { store } = React.useContext(Context)

  const [selectedStore, setSelectedStore] = useState(selector(store.getState()))

  const onUpdateStore = () => {
    const currentSelectedStore = selector(store.getState())
    const prevSelectedStore = selectedStore

    const shouldUpdate = isEqual ? !isEqual(currentSelectedStore, prevSelectedStore) : true

    if(shouldUpdate) {
      setSelectedStore(currentSelectedStore)
    }
  }

  useEffect(() => {
    const unsubscribe = store.subscribe(onUpdateStore)
    return () => unsubscribe()
  }, [selectedStore])

  return selectedStore
}
const useDispatch = () => {
  const { store } = React.useContext(Context)
  return store.dispatch
}

const Provider = ({ store, children }) => {
  return <Context.Provider value={{ store }}>{children}</Context.Provider>
}

const UPDATE_COUNTER = 'UPDATE_COUNTER'
const CHANGE_STEP_SIZE = 'CHANGE_STEP_SIZE'

const updateCounter = value => ({
  type: UPDATE_COUNTER,
  payload: value,
})

const changeStepSize = value => ({
  type: CHANGE_STEP_SIZE,
  payload: value,
})


const defaultState = {
  counter: 1,
  stepSize: 1,
}

const reducer = (state = defaultState, action) => {
  switch(action.type) {
    case UPDATE_COUNTER:
      return { ...state, counter: state.counter + action.payload }
    case CHANGE_STEP_SIZE:
      return { ...state, stepSize: action.payload }
    default:
      return state
  }
}

const Counter = () => {
  const counter = useSelector(state => state.counter)
  const stepSize = useSelector(state => state.stepSize, (current, prev) => current === prev)
  const dispatch = useDispatch()

  return (
    <div>
      <button onClick={() => dispatch(updateCounter(-stepSize))}>-</button>
      <span> {counter} </span>
      <button onClick={() => dispatch(updateCounter(stepSize))}>+</button>
    </div>
  )
}

const Step = () => {
  const stepSize = useSelector(state => state.stepSize, (current, prev) => current === prev)
  const dispatch = useDispatch()

  return (
    <div>
      <div>Значение счётчика должно увеличиваться или уменьшаться на заданную величину шага</div>
      <div>Текущая величина шага: {stepSize}</div>
      <input
        type="range"
        min="1"
        max="5"
        value={stepSize}
        onChange={({ target }) => dispatch(changeStepSize(Number(target.value)))}
      />
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={createStore(reducer, defaultState)}>
    <Step />
    <Counter />
  </Provider>,
);