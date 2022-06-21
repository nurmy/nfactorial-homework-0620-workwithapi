import { useEffect, useState } from 'react'
import './App.css'
import axios from 'axios'

const BACKEND_URL = 'http://10.65.132.54:3000'
const API_KEY = '39fbb2ea2fb32fc929b20314bf2c5654592af3cf'

/*
 * Plan:
 *   1. Define backend url
 *   2. Get items and show them +
 *   3. Toggle item done +
 *   4. Handle item add +
 *   5. Delete +
 *   6. Filter
 *
 * */

function App() {
    const [itemToAdd, setItemToAdd] = useState('')
    const [items, setItems] = useState([])
    const [searchValue, setSearchValue] = useState('')

    useEffect(() => {
        axios
            .get('https://api.todoist.com/rest/v1/tasks', {
                headers: {
                    Authorization: `Bearer ${API_KEY}`,
                },
            })
            .then((responseActive) => {
                let dataActive = responseActive.data
                axios
                    .get('https://api.todoist.com/sync/v8/completed/get_all', {
                        headers: {
                            Authorization: `Bearer ${API_KEY}`,
                        },
                    })
                    .then((responseCompleted) => {
                        let dataCompleted = responseCompleted.data

                        setItems([
                            ...dataActive.map((item) => {
                                return {
                                    id: item.id,
                                    label: item.content,
                                    done: false,
                                }
                            }),
                            ...dataCompleted.items.map((itemCompleted) => {
                                return {
                                    id: itemCompleted.task_id,
                                    label: itemCompleted.content,
                                    done: true,
                                }
                            }),
                        ])
                    })
            })
    }, [])

    const handleChangeItem = (event) => {
        setItemToAdd(event.target.value)
    }

    const handleAddItem = () => {
        axios
            .post(
                `https://api.todoist.com/rest/v1/tasks`,
                {
                    content: itemToAdd,
                    completed: false,
                },
                {
                    headers: {
                        Authorization: `Bearer ${API_KEY}`,
                    },
                }
            )
            .then(({ data }) => {
                setItems([
                    ...items,
                    {
                        id: data.id,
                        label: data.content,
                        done: data.completed,
                    },
                ])
            })
        setItemToAdd('')
    }

    const toggleItemDone = ({ id, done }) => {
        const url = !done
            ? `https://api.todoist.com/rest/v1/tasks/${id}/close`
            : `https://api.todoist.com/rest/v1/tasks/${id}/reopen`
        axios.post(
            url,
            {},
            {
                headers: {
                    Authorization: `Bearer ${API_KEY}`,
                },
            }
        )
        setItems((items) => {
            return items.map((item) =>
                item.id === id ? { ...item, done: !done } : item
            )
        })
    }

    // N => map => N
    // N => filter => 0...N
    const handleItemDelete = (id) => {
        axios.delete(`${BACKEND_URL}/todos/${id}`).then((response) => {
            const deletedItem = response.data
            console.log('Было:', items)
            const newItems = items.filter((item) => {
                return deletedItem.id !== item.id
            })
            console.log('Осталось:', newItems)
            setItems(newItems)
        })
    }

    // useEffect(() => {
    //     console.log(searchValue)
    //     axios
    //         .get(`${BACKEND_URL}/todos/?filter=${searchValue}`)
    //         .then((response) => {
    //             setItems(response.data)
    //         })
    // }, [searchValue])

    return (
        <div className="todo-app">
            {/* App-header */}
            <div className="app-header d-flex">
                <h1>Todo List</h1>
            </div>

            <div className="top-panel d-flex">
                {/* Search-panel */}
                <input
                    type="text"
                    className="form-control search-input"
                    placeholder="type to search"
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                />
            </div>

            {/* List-group */}
            <ul className="list-group todo-list">
                {items.length > 0 ? (
                    items.map((item) => (
                        <li key={item.id} className="list-group-item">
                            <span
                                className={`todo-list-item${
                                    item.done ? ' done' : ''
                                }`}
                            >
                                <span
                                    className="todo-list-item-label"
                                    onClick={() => toggleItemDone(item)}
                                >
                                    {item.label}
                                </span>

                                <button
                                    type="button"
                                    className="btn btn-outline-success btn-sm float-right"
                                >
                                    <i className="fa fa-exclamation" />
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-outline-danger btn-sm float-right"
                                    onClick={() => handleItemDelete(item.id)}
                                >
                                    <i className="fa fa-trash-o" />
                                </button>
                            </span>
                        </li>
                    ))
                ) : (
                    <div>No todos🤤</div>
                )}
            </ul>

            {/* Add form */}
            <div className="item-add-form d-flex">
                <input
                    value={itemToAdd}
                    type="text"
                    className="form-control"
                    placeholder="What needs to be done"
                    onChange={handleChangeItem}
                />
                <button
                    className="btn btn-outline-secondary"
                    onClick={handleAddItem}
                >
                    Add item
                </button>
            </div>
        </div>
    )
}

export default App
