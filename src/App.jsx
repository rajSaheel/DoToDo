import './App.css'
import { useState, useRef, useEffect } from "react"
import axios from "axios"

export default function App() {

  const [list, setList] = useState(null)
  const [newTodo, setNewTodo] = useState("")

  const dragItem = useRef();
  const dragOverItem = useRef();

  const dragStart = (e, position) => {
    dragItem.current = position;
  };

  const dragEnter = (e, position) => {
    dragOverItem.current = position;
  };

  const drop = (e) => {
    const copyListItems = [...list];
    const dragItemContent = copyListItems[dragItem.current];
    copyListItems.splice(dragItem.current, 1);
    copyListItems.splice(dragOverItem.current, 0, dragItemContent);
    dragItem.current = null;
    dragOverItem.current = null;
    setList(copyListItems)
    rearrangeTodos(copyListItems)

  };

  const fetchTodos = async () => {
    const result = await axios.get("https://dotodo-back.saheelraj.repl.co/todos")
    setList(result.data)
  }

  const addTodo = async (task) => {
    if (task) {
      setNewTodo("")
      setList([...list, { rank: list.length + 1, task }])
      const newId = await axios.post("https://dotodo-back.saheelraj.repl.co/todos/add", { task })
    } else alert("Todo is empty. Try again")
  }

  const deleteTodo = async (ind) => {
    const item = list[ind]
    const newList = list.filter((item, index) => { if (index != ind) return item })
    setList(newList)
    rearrangeTodos(newList)
    await axios.delete(`https://dotodo-back.saheelraj.repl.co/todos/delete/${item._id}`)
  }

  const rearrangeTodos = async (l) => {
    for (let i = 0; i < l.length; i++) {
      l[i].rank = i + 1
    }

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
        <textarea placeholder={"Add new task here"} type="text" name="input" onChange={(e) => setNewTodo(e.target.value)} value={newTodo} cols="50" rows="5" /><br />
        <button id="add-btn" onClick={(e) => {
          addTodo(newTodo)
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
