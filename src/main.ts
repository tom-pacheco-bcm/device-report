import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'
import AppError from './AppError.svelte'

let app

if (import.meta.env.DEV) {

  await import('./lib/client.mock')
  app = mount(App, {
    target: document.getElementById('app')!,
  })

} else {

  let script = document.createElement("script")
  script.src = "/publicweb/client_api.js"

  script.addEventListener("load", () => {
    app = mount(App, {
      target: document.getElementById('app')!,
    })
  })

  script.addEventListener("error", (e) => {
    app = mount(AppError, {
      target: document.getElementById('app')!,
    })
  })

  document.documentElement.appendChild(script)

}

export default app
