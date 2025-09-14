'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import NoteCard from '@/components/NoteCard'
const { user, token, logout, loading } = useAuth()

interface Note {
  id: string
  title: string
  content: string
  createdAt: string
  user: { email: string }
}

export default function Dashboard() {
  const { user, token, logout } = useAuth()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newNote, setNewNote] = useState({ title: '', content: '' })
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // useEffect(() => {
    
  //   if (!user || !token) {
  //     router.push('/')
  //     return
  //   }
  //   fetchNotes()
  // }, [user, token, router])

  useEffect(() => {
  if (loading) {
    return;
  }
  if (!user || !token) {
    router.push('/');
  } else {
    fetchNotes();
  }
}, [user, token, loading, router]); 

  const fetchNotes = async () => {
    try {
      const response = await fetch('/api/notes', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setNotes(data)
      }
    } catch (error) {
      console.error('Error fetching notes:', error)
    } finally {
      setLoading(false)
    }
  }

  const createNote = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setError('')

    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newNote),
      })

      if (response.ok) {
        const note = await response.json()
        setNotes([note, ...notes])
        setNewNote({ title: '', content: '' })
        setShowForm(false)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to create note')
      }
    } catch (error) {
      setError('Network error')
    } finally {
      setCreating(false)
    }
  }

  const deleteNote = async (id: string) => {
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setNotes(notes.filter(note => note.id !== id))
      }
    } catch (error) {
      console.error('Error deleting note:', error)
    }
  }

  const upgradeTenant = async () => {
    try {
      const response = await fetch('/api/tenants/upgrade', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        alert('Successfully upgraded to Pro plan!')
        window.location.reload()
      }
    } catch (error) {
      console.error('Error upgrading tenant:', error)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const canUpgrade = user?.role === 'admin' && user?.tenant?.subscription === 'free'
  const showUpgradeButton = canUpgrade && notes.length >= 3

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notes Dashboard</h1>
              <p className="text-sm text-gray-500">
                {user?.email} ({user?.role}) - {user?.tenant?.name} ({user?.tenant?.subscription} plan)
              </p>
            </div>
            <div className="flex space-x-4">
              {showUpgradeButton && (
                <button
                  onClick={upgradeTenant}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Upgrade to Pro
                </button>
              )}
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                New Note
              </button>
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showForm && (
          <div className="mb-8 bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Create New Note</h2>
            <form onSubmit={createNote} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  required
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
                />
              </div>
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                  Content
                </label>
                <textarea
                  id="content"
                  rows={4}
                  required
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
                />
              </div>
              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={creating}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Note'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {notes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No notes yet. Create your first note!</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onDelete={deleteNote}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}