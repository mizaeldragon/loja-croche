import { useState } from 'react'
import { Plus, Pencil, Trash2, Users as UsersIcon } from 'lucide-react'
import usePageHeader from '../../lib/usePageHeader'
import { useUserStore } from '../../store/useUserStore'
import { useAuthStore } from '../../store/useAuthStore'
import { notifySuccess, notifyError } from '../../store/useToastStore'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import EmptyState from '../../components/ui/EmptyState'
import StatusBadge from '../../components/ui/StatusBadge'
import { TextField, SelectField } from '../../components/ui/Field'

const emptyUser = { name: '', email: '', password: '', role: 'editor', status: 'ativo' }

export default function Users() {
  usePageHeader('Usuários', 'Gerencie quem tem acesso ao painel administrativo')

  const users = useUserStore((s) => s.users)
  const addUser = useUserStore((s) => s.addUser)
  const updateUser = useUserStore((s) => s.updateUser)
  const deleteUser = useUserStore((s) => s.deleteUser)
  const currentUser = useAuthStore((s) => s.currentUser)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyUser)
  const [toDelete, setToDelete] = useState(null)

  const openNew = () => { setEditing(null); setForm(emptyUser); setModalOpen(true) }
  const openEdit = (u) => { setEditing(u); setForm({ ...u, password: '' }); setModalOpen(true) }

  const save = (e) => {
    e.preventDefault()
    if (!form.name?.trim() || !form.email?.trim()) return
    if (editing) {
      const payload = { ...form }
      if (!payload.password) delete payload.password
      updateUser(editing.id, payload)
      notifySuccess('Usuário atualizado.')
    } else {
      if (!form.password) { notifyError('Defina uma senha para o novo usuário.'); return }
      addUser(form)
      notifySuccess('Usuário criado com sucesso.')
    }
    setModalOpen(false)
  }

  const requestDelete = (u) => {
    if (u.id === currentUser?.id) { notifyError('Você não pode excluir seu próprio usuário.'); return }
    setToDelete(u)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-espresso-500">{users.length} usuários com acesso ao painel</p>
        <button onClick={openNew} className="btn-primary btn-md">
          <Plus size={16} /> Novo usuário
        </button>
      </div>

      <div className="card-surface overflow-hidden">
        {users.length === 0 ? (
          <EmptyState icon={UsersIcon} title="Nenhum usuário cadastrado" description="Adicione usuários para colaborar na gestão do ateliê." />
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[600px] text-left">
              <thead>
                <tr className="border-b border-espresso-700/8 text-xs uppercase tracking-wide text-espresso-400">
                  <th className="px-5 py-3.5 font-semibold">Usuário</th>
                  <th className="px-5 py-3.5 font-semibold">Função</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 text-right font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-espresso-700/6">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-sand-50/60">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img src={u.avatar} alt={u.name} className="h-10 w-10 rounded-full object-cover" />
                        <div>
                          <p className="text-sm font-semibold text-espresso-800">{u.name}</p>
                          <p className="text-xs text-espresso-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm capitalize text-espresso-600">{u.role}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={u.status} /></td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(u)} className="flex h-8 w-8 items-center justify-center rounded-lg text-espresso-400 hover:bg-sand-100 hover:text-espresso-700">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => requestDelete(u)} className="flex h-8 w-8 items-center justify-center rounded-lg text-espresso-400 hover:bg-terracotta-600/10 hover:text-terracotta-600">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar usuário' : 'Novo usuário'}>
        <form onSubmit={save} className="space-y-4">
          <TextField label="Nome completo" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextField label="E-mail" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <TextField
            label={editing ? 'Nova senha (opcional)' : 'Senha'}
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            hint={editing ? 'Deixe em branco para manter a senha atual' : undefined}
          />
          <div className="grid grid-cols-2 gap-4">
            <SelectField label="Função" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="admin">Administrador</option>
              <option value="editor">Editor</option>
            </SelectField>
            <SelectField label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </SelectField>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary btn-md flex-1">Cancelar</button>
            <button type="submit" className="btn-primary btn-md flex-1">Salvar</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Excluir usuário?"
        description={`Deseja remover o acesso de "${toDelete?.name}"?`}
        confirmLabel="Excluir"
        onConfirm={() => { deleteUser(toDelete.id); notifySuccess('Usuário removido.') }}
      />
    </div>
  )
}
