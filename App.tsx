import React from 'react'
import RootStackNav from './src/navigation/RootStackNav'
import { Provider } from 'react-redux'
import store from './src/redux/store'

const App = () => {
  return (
    <Provider store={store}>
      <RootStackNav />
    </Provider>
  )
}

export default App