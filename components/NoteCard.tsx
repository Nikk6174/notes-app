interface Note {
  id: string
  title: string
  content: string
  createdAt: string
  user: { email: string }
}

interface NoteCardProps {
  note: Note
  onDelete: (id: string) => void
}

export default function NoteCard({ note, onDelete }: NoteCardProps) {
  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this note?')) {
      onDelete(note.id)
    }
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-medium text-gray-900 truncate">{note.title}</h3>
        <button
          onClick={handleDelete}
          className="text-red-500 hover:text-red-700 text-sm"
        >
          Delete
        </button>
      </div>
      <p className="text-gray-700 mb-4">{note.content}</p>
      <div className="text-sm text-gray-500">
        <p>Created by: {note.user.email}</p>
        <p>Created: {new Date(note.createdAt).toLocaleDateString()}</p>
      </div>
    </div>
  )
}