import React from 'react';
import './Taskmanager.css';
import { useState, useRef, useEffect } from 'react';
import { IoMdDoneAll } from "react-icons/io";
import { FiEdit } from "react-icons/fi";
import { MdDelete } from "react-icons/md";

function Taskmanager() {
  const [todo, setTodo] = useState('');
  const [todos, setTodos] = useState([]);
  const [editId, setEditID] = useState(null);
  const [filter, setFilter] = useState('All'); // State for filtering

  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    addTodo();
  };

  const addTodo = () => {
    if (editId) {
      const updatedTodos = todos.map((to) =>
        to.id === editId ? { ...to, list: todo } : to
      );
      setTodos(updatedTodos);
      setEditID(null);
    } else {
      if (todo.trim() !== '') {
        setTodos([...todos, { list: todo, id: Date.now(), status: 'In Progress' }]);
      }
    }
    setTodo('');
  };

  const onDelete = (id) => {
    setTodos(todos.filter((to) => to.id !== id));
  };

  const onComplete = (id) => {
    setTodos(todos.map((list) =>
      list.id === id ? { ...list, status: list.status === 'Complete' ? 'In Progress' : 'Complete' } : list
    ));
  };

  const onEdit = (id) => {
    const editTodo = todos.find((to) => to.id === id);
    if (editTodo) {
      setTodo(editTodo.list);
      setEditID(id);
    }
  };

  const filteredTodos = todos.filter((to) => {
    if (filter === 'All') return true;
    return to.status === filter;
  });

  return (
    <div className='container'>
      <h2>Task Manager App</h2>
      <form className='form-group' onSubmit={handleSubmit}>
        <input
          type="text"
          value={todo}
          ref={inputRef}
          placeholder='Enter your Task'
          className='form-control1'
          onChange={(event) => setTodo(event.target.value)}
        />
        <button type="submit">{editId ? 'EDIT' : 'ADD'}</button>
      </form>

  
      <div className="filter-buttons">
        <button onClick={() => setFilter('All')}>All</button>
        <button onClick={() => setFilter('In Progress')}>In Progress</button>
        <button onClick={() => setFilter('Complete')}>Complete</button>
      </div>

      <div className='list'>
        <ul>
          {filteredTodos.map((to) => (
            <li key={to.id} className="list-items">
              <div className="list-item-list" id={to.status === 'Complete' ? 'list-item' : ''}>
                {to.list}
              </div>
              <span>
                <IoMdDoneAll
                  className="list-item-icons"
                  id='complete'
                  title="Complete"
                  onClick={() => onComplete(to.id)}
                />
                <FiEdit
                  className="list-item-icons"
                  id='edit'
                  title="Edit"
                  onClick={() => onEdit(to.id)}
                />
                <MdDelete
                  className="list-item-icons"
                  id='delete'
                  title="Delete"
                  onClick={() => onDelete(to.id)}
                />
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Taskmanager;
