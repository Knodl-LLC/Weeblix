import ElementPlus from 'element-plus'
import ru from 'element-plus/es/locale/lang/ru'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(ElementPlus, {
    locale: ru,
  })
})
