export function AccountPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col pb-20">
      <div className="bg-zinc-900 border-b border-zinc-800 px-5 py-4">
        <h1 className="text-white text-xl font-medium">Conta</h1>
        <p className="text-zinc-500 text-sm">Fechar mesa e gerar conta</p>
      </div>

      <div className="flex-1 flex items-center justify-center flex-col gap-3">
        <i className="ti ti-receipt text-zinc-600 text-5xl" />
        <p className="text-zinc-500 text-lg">Selecione uma mesa</p>
        <p className="text-zinc-600 text-sm">Vá até Mesas e selecione uma mesa ocupada</p>
      </div>
    </div>
  )
}