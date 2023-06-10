import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import axios from 'axios'


function App() {
  const [data, setData] = useState([])

  useEffect(() => {
    axios.get('/data').then(res => res.data).then(data => setData(data))
  }, [])

  return (
    <>
      <p>You need to pay me before you can edit, add, or delete contents</p>
      {
        data.map(d => {
          return (
            <div key={d.id} style={{backgroundColor: '#aaa', width: '60rem'}}>
                <h2>Title: <input type='text' value={d.title} placeholder='title'/> </h2>
              {
                d.data.map(t => {
                  return (
                    <div key={t.id}  style={{backgroundColor: '#eee', width: '40rem', marginLeft: 'auto', marginRight: 'auto'}}>
                       <h4>Subtitle: <input type='text' value={t.subtitle} placeholder='subtitle'/></h4>
                       {
                        t.content.map(c => {
                          return (
                            <div key={c.id} style={{backgroundColor: '#fff', width: '30rem', marginLeft: 'auto', marginRight: 'auto', position: 'relative', padding: '2rem', margin: '2rem'}}>
                              <p>item id: <input type='text' value={c.item_id} placeholder='item id'/></p>
                              <p>amount: <input type='text' value={c.amount} placeholder='amount'/></p>
                              <p>description: <input type='text' value={c.description} placeholder='description'/></p>
                              <p>quantity: <input type='text' value={c.quantity} placeholder='quantity'/></p>
                              <p>unit: <input type='text' value={c.unit} placeholder='unit'/></p>
                              <p>rate: <input type='text' value={c.rate} placeholder='rate'/></p>
                              <button style={{backgroundColor: 'green', margin: '1rem'}}>ADD NEW ITEM</button>
                              <button style={{backgroundColor: 'red', margin: '1rem'}}>DELETE THIS ITEM</button>
                            </div>
                          )
                        })
                       }
                        <button style={{backgroundColor: '#5f5', margin: '1rem'}}>ADD NEW SUBSECTION</button>
                        <button style={{backgroundColor: '#f55', margin: '1rem'}}>DELETE THIS SUBSECTION</button>
                    </div>
                  )
                })
              }
              <button style={{backgroundColor: '#afa', margin: '1rem'}}>ADD NEW SECTION</button>
              <button style={{backgroundColor: '#faa', margin: '1rem'}}>DELETE THIS SECTION</button>
            </div>
            
          )
        }
        )
      }
      <button style={{backgroundColor: '#0f0', margin: '1rem'}}>SAVE CHANGES</button>
    </>
  )
}

export default App
