import { useState, useEffect } from 'react'
import './index.css'
import Example from './Example'
import { defaultExample } from './md-examples'

const examples = ['Default']
const pathList = examples.map((e) => e.toLocaleLowerCase().replace(' ', '-'))

function App() {
  useEffect(() => {
    const result = pathList.find((x) => x === window.location.pathname.slice(1))
    if (result) setSelected(examples[pathList.indexOf(result)])
    else setSelected(examples[0])
  }, [])

  const [selected, setSelected] = useState()
  return (
    <>
      <div className="mx-6 pt-12 lg:pl-12 mb-12">
        <h1 className="text-4xl font-bold">Remark Webembed</h1>
        <div className="mt-8 space-x-4 space-y-2">
          {examples.map((x) => (
            <button
              key={x}
              onClick={() => {
                window.history.pushState({}, '', x.toLowerCase().replace(' ', '-'))
                setSelected(x)
              }}
              className={`${
                selected === x && 'bg-gradient-to-r from-purple-400 to-yellow-400'
              } px-4 py-2 text-sm font-bold bg-indigo-100 rounded`}
            >
              {x}
            </button>
          ))}
        </div>
        {selected === examples[0] && <Example markdown={defaultExample} />}
      </div>
    </>
  )
}

export default App
