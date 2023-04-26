import './App.css'
import { useState, useRef, useEffect } from "react"
import axios from "axios"

export default function App() {

  const generateId = () => {
    const list = "ABCDEFJHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyz"
    let str = ""
    for (let i = 0; i < 10; i++) {
      const p = Math.floor(Math.random() * list.length)
      str += list.charAt(p)
    }
    return str
  }

  const [list, setList] = useState(null)
  const [newTodoInput, setNewTodoInput] = useState("")

  const dragItem = useRef();
  const dragOverItem = useRef();

  const dragStart = (e, position) => {
    dragItem.current = position;
  };

  const dragEnter = (e, position) => {
    dragOverItem.current = position;
  };

  const drop = () => {
    const copyListItems = [...list];
    const dragItemContent = copyListItems[dragItem.current];
    copyListItems.splice(dragItem.current, 1);
    copyListItems.splice(dragOverItem.current, 0, dragItemContent);
    dragItem.current = null;
    dragOverItem.current = null;
    rearrangeTodos(copyListItems)
  };

  const fetchTodos = async () => {
    const result = await axios.get("https://dotodo-back.saheelraj.repl.co/todos")
    setList(result.data)
  }

  const addTodo = async (task) => {
    if (task) {
      setNewTodoInput("")
      const newTodo = { _id: generateId(), rank: list.length + 1, task }
      setList([...list, newTodo])
      await axios.post("https://dotodo-back.saheelraj.repl.co/todos/add", newTodo)
    } else alert("Todo is empty. Try again")
  }

  const deleteTodo = async (ind) => {
    const item = list[ind]
    const newList = list.filter((item, index) => { if (index != ind) return item })
    rearrangeTodos(newList)
    await axios.delete(`https://dotodo-back.saheelraj.repl.co/todos/delete/${item._id}`)
  }

  const rearrangeTodos = async (l) => {
    console.log(list)
    for (let i = 0; i < l.length; i++) {
      l[i].rank = i + 1
    }
    setList(l)
    for (let i = 0; i < l.length; i++) {
      await axios.put(`https://dotodo-back.saheelraj.repl.co/todos/${l[i]._id}`, { rank: l[i].rank })
    }
  }


  useEffect(() => {
    fetchTodos()
  }, [])

  return (
    <main>
      <div className={"add-todo"}>
        <h1>{"Do-Todo App"}</h1>
        <textarea placeholder={"Add new task here"} type="text" name="input" onChange={(e) => setNewTodoInput(e.target.value)} value={newTodoInput} cols="50" rows="5" /><br />
        <button id="add-btn" onClick={(e) => {
          addTodo(newTodoInput)
        }}>Add</button>
      </div>
      <div id="line"></div>
      <div className={"todos"}>
        {list ? (list.length === 0) ?
          <h1>No Todos found</h1> :
          list.map((item, index) =>
            < div className={"card"} key={index} id={"card" + index} onDragStart={(e) => dragStart(e, index)}
              onDragEnter={(e) => dragEnter(e, index)}
              onDragEnd={drop} draggable>{item.rank + " " + item.task}
              <button className='delete-btn' onClick={() => {
                deleteTodo(index)
              }}>delete</button></div>
          )
          :
          <h1>Loading Todos</h1>}
      </div>
    </main >
  )
}
